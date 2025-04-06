import { Test, TestingModule } from '@nestjs/testing';
import { AssignmentService } from './assignment.service';
import { getModelToken } from '@nestjs/sequelize';
import { Assignment } from '../entities/assignment.entity';
import { Course } from '../../courses/entities/course.entity';
import { NotFoundException } from '@nestjs/common';
import { CreateAssignmentDto } from '../dto/create-assignment.dto';

describe('AssignmentService', () => {
  let service: AssignmentService;
  let assignmentModel: any;
  let courseModel: any;

  const mockAssignment = {
    id: '1',
    courseId: '1',
    title: 'Test Assignment',
    description: 'Test Description',
    dueDate: new Date().toISOString(),
    course: {
      id: '1',
      title: 'Test Course',
    },
    update: jest.fn().mockImplementation(async (dto) => {
      Object.assign(mockAssignment, dto);
      return mockAssignment;
    }),
    destroy: jest.fn().mockResolvedValue(true),
  };

  const mockCourse = {
    id: '1',
    title: 'Test Course',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssignmentService,
        {
          provide: getModelToken(Assignment),
          useValue: {
            create: jest.fn().mockResolvedValue(mockAssignment),
            findAll: jest.fn().mockResolvedValue([mockAssignment]),
            findByPk: jest.fn().mockResolvedValue(mockAssignment),
            update: jest.fn().mockResolvedValue(mockAssignment),
            destroy: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: getModelToken(Course),
          useValue: {
            findByPk: jest.fn().mockResolvedValue(mockCourse),
          },
        },
      ],
    }).compile();

    service = module.get<AssignmentService>(AssignmentService);
    assignmentModel = module.get(getModelToken(Assignment));
    courseModel = module.get(getModelToken(Course));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an assignment', async () => {
      const createDto = {
        courseId: '1',
        title: 'Test Assignment',
        description: 'Test Description',
        dueDate: new Date().toISOString(),
      };

      const result = await service.create(createDto);

      expect(result).toEqual(mockAssignment);
      expect(courseModel.findByPk).toHaveBeenCalledWith(createDto.courseId);
      expect(assignmentModel.create).toHaveBeenCalledWith(createDto);
    });

    it('should throw NotFoundException if course not found', async () => {
      const createDto = {
        courseId: '1',
        title: 'Test Assignment',
      };

      jest.spyOn(courseModel, 'findByPk').mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all assignments', async () => {
      const result = await service.findAll();

      expect(result).toEqual([mockAssignment]);
      expect(assignmentModel.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return an assignment by id', async () => {
      jest.spyOn(assignmentModel, 'findByPk').mockResolvedValue(mockAssignment);

      const result = await service.findOne('1');

      expect(result).toEqual(mockAssignment);
      expect(assignmentModel.findByPk).toHaveBeenCalledWith('1', {
        include: [
          {
            model: Course,
            as: 'course',
            attributes: ['id', 'title'],
          },
        ],
      });
    });

    it('should throw NotFoundException if assignment not found', async () => {
      jest.spyOn(assignmentModel, 'findByPk').mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  it('should update an assignment', async () => {
    const updateDto: CreateAssignmentDto = {
      courseId: '2',
      title: 'Updated Assignment',
      description: 'Updated Description',
      dueDate: new Date().toISOString(),
    };

    const updatedAssignment = {
      ...mockAssignment,
      ...updateDto,
    };

    jest.spyOn(assignmentModel, 'findByPk').mockResolvedValue(mockAssignment);
    const courseFindByPkSpy = jest
      .spyOn(courseModel, 'findByPk')
      .mockResolvedValue(mockCourse);
    mockAssignment.update.mockImplementation(async (dto) => {
      Object.assign(mockAssignment, dto);
      return mockAssignment;
    });

    const result = await service.update('1', updateDto);

    expect(result).toEqual(updatedAssignment);
    expect(assignmentModel.findByPk).toHaveBeenCalledWith('1', {
      include: [{ model: Course, as: 'course', attributes: ['id', 'title'] }],
    });
    expect(courseModel.findByPk).toHaveBeenCalledWith('2');
    expect(mockAssignment.update).toHaveBeenCalledWith(updateDto);
  });

  it('should not check course if courseId is not changed', async () => {
    const updateDto: Partial<CreateAssignmentDto> = {
      title: 'Updated Assignment',
      description: 'Updated Description',
      dueDate: new Date().toISOString(),
    };

    const updatedAssignment = {
      ...mockAssignment,
      ...updateDto,
    };

    jest.spyOn(assignmentModel, 'findByPk').mockResolvedValue(mockAssignment);
    const courseFindByPkSpy = jest
      .spyOn(courseModel, 'findByPk')
      .mockResolvedValue(mockCourse);
    mockAssignment.update.mockImplementation(async (dto) => {
      Object.assign(mockAssignment, dto);
      return mockAssignment;
    });

    const result = await service.update('1', updateDto);

    expect(result).toEqual(updatedAssignment);
    expect(assignmentModel.findByPk).toHaveBeenCalledWith('1', {
      include: [{ model: Course, as: 'course', attributes: ['id', 'title'] }],
    });
    expect(courseModel.findByPk).not.toHaveBeenCalled();
    expect(mockAssignment.update).toHaveBeenCalledWith(updateDto);
  });

  describe('remove', () => {
    it('should remove an assignment', async () => {
      jest.spyOn(assignmentModel, 'findByPk').mockResolvedValue(mockAssignment);

      await service.remove('1');

      expect(assignmentModel.findByPk).toHaveBeenCalledWith('1', {
        include: [
          {
            model: Course,
            as: 'course',
            attributes: ['id', 'title'],
          },
        ],
      });
      expect(mockAssignment.destroy).toHaveBeenCalled();
    });
  });

  describe('findByCourse', () => {
    it('should return assignments for a course', async () => {
      const result = await service.findByCourse('1');

      expect(result).toEqual([mockAssignment]);
      expect(assignmentModel.findAll).toHaveBeenCalledWith({
        where: { courseId: '1' },
        order: [['createdAt', 'DESC']],
      });
    });
  });
});
