import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from '../services/user.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { CreateStudentDto } from '../dto/create-student.dto';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  const mockUser = {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    role: 'student',
    instructorStatus: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            create: jest.fn().mockResolvedValue(mockUser),
            findAll: jest.fn().mockResolvedValue([mockUser]),
            findOne: jest.fn().mockResolvedValue(mockUser),
            update: jest.fn().mockResolvedValue(mockUser),
            remove: jest.fn().mockResolvedValue(undefined),
            findByEmail: jest.fn().mockResolvedValue(mockUser),
            validateUser: jest.fn().mockResolvedValue(mockUser),
            approveInstructor: jest.fn().mockResolvedValue(mockUser),
            signupStudent: jest.fn().mockResolvedValue(mockUser),
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const createDto: CreateStudentDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      const result = await controller.signupStudent(createDto);

      expect(result).toEqual(mockUser);
      expect(service.signupStudent).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const result = await controller.findAll();

      expect(result).toEqual([mockUser]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const result = await controller.findOne('1');

      expect(result).toEqual(mockUser);
      expect(service.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateDto = {
        firstName: 'Jane',
      };

      const result = await controller.update('1', updateDto);

      expect(result).toEqual(mockUser);
      expect(service.update).toHaveBeenCalledWith('1', updateDto);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      await controller.remove('1');

      expect(service.remove).toHaveBeenCalledWith('1');
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      const result = await controller.findByEmail('john@example.com');

      expect(result).toEqual(mockUser);
      expect(service.findByEmail).toHaveBeenCalledWith('john@example.com');
    });
  });

  // describe('validateUser', () => {
  //   it('should validate user credentials', async () => {
  //     const email = 'john@example.com';
  //     const password = 'password123';

  //     const result = await controller.validateUser(email, password);

  //     expect(result).toEqual(mockUser);
  //     expect(service.validateUser).toHaveBeenCalledWith(email, password);
  //   });
  // });

  describe('updateInstructorStatus', () => {
    it('should update instructor status', async () => {
      const userId = '1';
      const adminId = '2';

      const result = await controller.approveInstructor(userId, adminId);

      expect(result).toEqual(mockUser);
      expect(service.approveInstructor).toHaveBeenCalledWith(userId, adminId);
    });
  });
});
