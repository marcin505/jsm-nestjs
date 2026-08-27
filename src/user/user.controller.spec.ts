import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { Role } from '@prisma/client';

const mockUserService = {
  createUser: jest.fn(),
  getUsers: jest.fn(),
  getUserById: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
};

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // === TUTAJ DOPISZ TEN BLOK Z TESTEM ===
  describe('createUser', () => {
    it('should call the service and return user data', async () => {
      // Arrange
      const dto = {
        email: 'controller@test.com',
        name: 'Anna',
        role: Role.USER,
      };
      const expectedResult = { id: 1, ...dto };
      mockUserService.createUser.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.createUser(dto);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(service.createUser).toHaveBeenCalledWith(dto);
    });
  });
});
