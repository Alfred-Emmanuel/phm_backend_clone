import { Test, TestingModule } from '@nestjs/testing';
import { AssignmentController } from './assignment.controller';
import { AssignmentService } from '../services/assignment.service';
import { CreateAssignmentDto } from '../dto/create-assignment.dto';

describe('AssignmentController', () => {
  let controller: AssignmentController;
  let service: AssignmentService;

  const mockAssignment = {
    id: '1',
    courseId: '1',
    title: 'Test Assignment',
    description: 'Test Description',
    dueDate: new Date(),
    course: {
      id: '1',
      title: 'Test Course',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssignmentController],
      providers: [
        {
          provide: AssignmentService,
          useValue: {
            create: jest.fn().mockResolvedValue(mockAssignment),
            findAll: jest.fn().mockResolvedValue([mockAssignment]),
            findOne: jest.fn().mockResolvedValue(mockAssignment),
            update: jest.fn().mockResolvedValue(mockAssignment),
            remove: jest.fn().mockResolvedValue(undefined),
            findByCourse: jest.fn().mockResolvedValue([mockAssignment]),
          },
        },
      ],
    }).compile();

    controller = module.get<AssignmentController>(AssignmentController);
    service = module.get<AssignmentService>(AssignmentService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an assignment', async () => {
      const createDto: CreateAssignmentDto = {
        courseId: '1',
        title: 'Test Assignment',
        description: 'Test Description',
        dueDate: new Date().toISOString(),
      };

      const result = await controller.create(createDto);

      expect(result).toEqual(mockAssignment);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return all assignments', async () => {
      const result = await controller.findAll();

      expect(result).toEqual([mockAssignment]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return an assignment by id', async () => {
      const result = await controller.findOne('1');

      expect(result).toEqual(mockAssignment);
      expect(service.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('update', () => {
    it('should update an assignment', async () => {
      const updateDto: Partial<CreateAssignmentDto> = {
        title: 'Updated Title',
      };

      const result = await controller.update('1', updateDto);

      expect(result).toEqual(mockAssignment);
      expect(service.update).toHaveBeenCalledWith('1', updateDto);
    });
  });

  describe('remove', () => {
    it('should remove an assignment', async () => {
      await controller.remove('1');

      expect(service.remove).toHaveBeenCalledWith('1');
    });
  });

  describe('findByCourse', () => {
    it('should return assignments for a course', async () => {
      const result = await controller.findByCourse('1');

      expect(result).toEqual([mockAssignment]);
      expect(service.findByCourse).toHaveBeenCalledWith('1');
    });
  });
});
