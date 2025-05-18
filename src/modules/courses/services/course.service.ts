import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Course } from '../entities/course.entity';
import { CreateCourseDto } from '../dto/create-course.dto';
import { UpdateCourseDto } from '../dto/update-course.dto';
import { User } from '../../users/entities/user.entity';
import { Category } from '../../categories/entities/category.entity';
import { CourseCategory } from '../../categories/entities/course-category.entity';
import { Transaction } from 'sequelize';
import { CloudinaryService } from 'src/modules/cloudinary/cloudinary.service';
import { CategoryType } from '../../categories/entities/category.entity';

interface FindAllOptions {
  category?: string; // slug or ID
  type?: CategoryType;
}

@Injectable()
export class CourseService {
  constructor(
    @InjectModel(Course)
    private courseModel: typeof Course,
    private cloudinaryService: CloudinaryService,
    @InjectModel(User)
    private userModel: typeof User,
    @InjectModel(Category)
    private categoryModel: typeof Category,
    @InjectModel(CourseCategory)
    private courseCategoryModel: typeof CourseCategory,
  ) {}

  async create(
    createCourseDto: CreateCourseDto,
    userId: string, // From token
    featuredImage?: Express.Multer.File,
  ): Promise<Course> {
    const user = await this.userModel.findByPk(userId);
  
    if (!createCourseDto) {
      throw new BadRequestException('Missing course data in request body');
    }
  
    if (!user) {
      throw new NotFoundException('User (from token) not found');
    }
  
    let instructorId: string;
  
    if (user.role === 'instructor') {
      if (user.instructorStatus !== 'approved') {
        throw new ForbiddenException('Instructor (from token) is not approved');
      }
      instructorId = user.id;
    } else if (user.role === 'admin') {
      const instructorEmail = createCourseDto.instructorEmail;
      if (!instructorEmail) {
        throw new BadRequestException('Instructor email is required for admin-created courses');
      }
  
      const instructor = await this.userModel.findOne({
        where: { email: instructorEmail, role: 'instructor' },
      });
  
      if (!instructor) {
        throw new NotFoundException('Instructor with provided email not found');
      }
  
      instructorId = instructor.id;
    } else {
      throw new ForbiddenException('Only admins or approved instructors can create courses');
    }
  
    // Extract categoryIds from DTO
    const { categoryIds, ...courseData } = createCourseDto;
  
    if (!this.courseModel.sequelize) {
      throw new InternalServerErrorException('Database connection not available');
    }
  
    if (featuredImage) {
      try {
        const uploadResult = await this.cloudinaryService.uploadImage(
          featuredImage,
          'phm/course_images'
        );
        createCourseDto.featuredImage = uploadResult.secure_url;
        createCourseDto.imagePublicId = uploadResult.public_id;
      } catch (error) {
        console.error('Cloudinary Upload Error:', error);
        throw new InternalServerErrorException('Image upload failed');
      }
    }
  
    const result = await this.courseModel.sequelize.transaction(async (t: Transaction) => {
      const course = await this.courseModel.create(
        {
          ...courseData,
          instructorId,
          featuredImage: createCourseDto.featuredImage,
          imagePublicId: createCourseDto.imagePublicId,
        } as any,
        { transaction: t }
      );
  
      if (categoryIds?.length) {
        const categories = await this.categoryModel.findAll({
          where: { id: categoryIds },
          transaction: t,
        });
  
        if (categories.length !== categoryIds.length) {
          throw new BadRequestException('One or more category IDs are invalid');
        }
  
        await Promise.all(
          categoryIds.map((categoryId) =>
            this.courseCategoryModel.create(
              {
                courseId: course.id,
                categoryId,
              } as any,
              { transaction: t }
            )
          )
        );
      }
  
      return course;
    });
  
    return result;
  }
  

  async findAll(options: FindAllOptions = {}): Promise<Course[]> {
    const { category, type } = options;
    const where: any = {};

    // If type is provided, add it to the where clause
    if (type) {
      where['$categories.type$'] = type;
    }

    // If category is provided, check if it's a UUID or slug
    if (category) {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(category);
      
      if (isUUID) {
        where['$categories.id$'] = category;
      } else {
        where['$categories.slug$'] = category;
      }
    }

    return this.courseModel.findAll({
      where,
      include: [
        {
          model: User,
          as: 'instructor',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
        {
          model: Category,
          as: 'categories',
          through: { attributes: [] },
          attributes: ['id', 'name', 'type', 'slug'],
          required: category !== undefined || type !== undefined,
        },
      ],
      order: [['createdAt', 'DESC']],
    });
  }

  async findOne(id: string): Promise<Course> {
    const course = await this.courseModel.findByPk(id, {
      include: [
        {
          model: User,
          as: 'instructor',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
        {
          model: Category,
          as: 'categories',
          through: { attributes: [] },
          attributes: ['id', 'name', 'type', 'slug'],
        },
      ],
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return course;
  }

  async update(
    id: string,
    updateCourseDto: UpdateCourseDto,
    currentUserId: string,
  ): Promise<Course> {
    const course = await this.findOne(id);

    // Check if current user is the course instructor
    if (course.instructorId !== currentUserId) {
      throw new ForbiddenException('Only the course instructor can update this course');
    }

    // Extract categoryIds from DTO
    const { categoryIds, ...courseData } = updateCourseDto;

    if (!this.courseModel.sequelize) {
      throw new InternalServerErrorException('Database connection not available');
    }

    // Update course and handle category associations in a transaction
    const result = await this.courseModel.sequelize.transaction(async (t: Transaction) => {
      // Update the course data
      await course.update(courseData, { transaction: t });

      // If categoryIds are provided, update the associations
      if (categoryIds !== undefined) {
        // Verify all categories exist
        const categories = await this.categoryModel.findAll({
          where: { id: categoryIds },
          transaction: t,
        });

        if (categories.length !== categoryIds.length) {
          throw new BadRequestException('One or more category IDs are invalid');
        }

        // Remove existing associations
        await this.courseCategoryModel.destroy({
          where: { courseId: id },
          transaction: t,
        });

        // Create new associations
        if (categoryIds.length > 0) {
          await Promise.all(
            categoryIds.map((categoryId) =>
              this.courseCategoryModel.create(
                {
                  courseId: id,
                  categoryId,
                } as any,
                { transaction: t }
              )
            )
          );
        }
      }

      // Return the updated course with its categories
      return this.findOne(id);
    });

    return result;
  }

  async remove(id: string): Promise<void> {
    const course = await this.findOne(id);
    await course.destroy();
  }

  async findByInstructor(instructorId: string): Promise<Course[]> {
    return this.courseModel.findAll({
      where: { instructorId },
      include: [
        {
          model: User,
          as: 'instructor',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
        {
          model: Category,
          as: 'categories',
          through: { attributes: [] },
          attributes: ['id', 'name', 'type', 'slug'],
        },
      ],
    });
  }
}
