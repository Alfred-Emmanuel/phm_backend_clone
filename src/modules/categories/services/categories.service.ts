import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Category } from '../entities/category.entity';
import { Course } from '../../courses/entities/course.entity';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { AdminActionLog } from '../../admin/entities/admin-action-log.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category)
    private categoryModel: typeof Category,
    @InjectModel(AdminActionLog)
    private adminActionLogModel: typeof AdminActionLog,
  ) {}

  async create(createCategoryDto: CreateCategoryDto, adminUserId: string): Promise<Category> {
    // Start a transaction
    const transaction = await this.categoryModel.sequelize?.transaction();

    try {
      // Create category within transaction
      const category = await this.categoryModel.create(createCategoryDto as any, {
        transaction
      });
      
      // Log the action within the same transaction
      await this.logAction(adminUserId, 'create_category', 'category', category.id, {
        name: category.name,
        type: category.type,
        slug: category.slug,
      }, transaction);

      // If everything is successful, commit the transaction
      await transaction?.commit();

      return category;
    } catch (error) {
      // If anything fails, rollback the transaction
      await transaction?.rollback();

      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new BadRequestException('Category name or slug already exists');
      }
      throw error;
    }
  }

  async findAll(): Promise<Category[]> {
    return this.categoryModel.findAll({
      include: [
        {
          model: Course,
          as: 'courses',
          attributes: ['id', 'title', 'description'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoryModel.findByPk(id, {
      include: [
        {
          model: Course,
          as: 'courses',
          attributes: ['id', 'title', 'description'],
        },
      ],
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto, adminUserId: string): Promise<Category> {
    const category = await this.findOne(id);

    try {
      const previousData = {
        name: category.name,
        type: category.type,
        description: category.description,
        slug: category.slug,
      };

      await category.update(updateCategoryDto as any);

      // Log the action
      await this.logAction(adminUserId, 'update_category', 'category', category.id, {
        previousData,
        newData: {
          name: category.name,
          type: category.type,
          description: category.description,
          slug: category.slug,
        },
      });

      return category;
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new BadRequestException('Category name or slug already exists');
      }
      throw error;
    }
  }

  async remove(id: string, adminUserId: string): Promise<void> {
    const category = await this.findOne(id);

    // Log the action before deletion
    await this.logAction(adminUserId, 'delete_category', 'category', category.id, {
      name: category.name,
      type: category.type,
      slug: category.slug,
    });

    await category.destroy();
  }

  async findOneBySlug(slug: string): Promise<Category> {
    const category = await this.categoryModel.findOne({
      where: { slug },
      include: [
        {
          model: Course,
          as: 'courses',
          attributes: ['id', 'title', 'description'],
        },
      ],
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  private async logAction(
    adminUserId: string,
    actionType: string,
    targetType: string,
    targetId: string,
    details: object,
    transaction?: any,
  ): Promise<void> {
    await this.adminActionLogModel.create({
      adminUserId,
      actionType,
      targetType,
      targetId,
      details,
    } as any, { transaction });
  }
} 