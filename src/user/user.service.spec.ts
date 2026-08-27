import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { Role } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

// We create a mock object for the Prisma methods used by our service
const mockPrismaService = {
  user: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('UserService', () => {
  let service: UserService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: mockPrismaService, // We inject the mock instead of the real database
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clearing call history after each test
  });

  describe('createUser', () => {
    it('should correctly create a new user', async () => {
      // Arrange
      const dto = { email: 'test@example.com', name: 'John', role: Role.USER };
      const expectedResult = { id: 1, ...dto };
      mockPrismaService.user.create.mockResolvedValue(expectedResult);

      // Act
      const result = await service.createUser(dto);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(prisma.user.create).toHaveBeenCalledWith({ data: dto });
    });
  });

  describe('getUserById', () => {
    it('should return a user and convert null in the name to an empty string', async () => {
      // Arrange
      const mockUser = { id: 1, email: 'test@example.com', name: null };
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      // Act
      const result = await service.getUserById(1);

      // Assert
      expect(result?.name).toBe('');
      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });

  describe('getUsers', () => {
    it('should return a list of users with fixed empty names', async () => {
      // Arrange
      const mockUsers = [
        { id: 1, email: 'a@test.com', name: 'Thomas' },
        { id: 2, email: 'b@test.com', name: null },
      ];
      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);

      // Act
      const result = await service.getUsers();

      // Assert
      expect(result).toHaveLength(2);
      expect(result[1].name).toBe('');
    });
  });

  describe('updateUser', () => {
    it('should update and return the user data', async () => {
      // Arrange
      const updateDto = { name: 'New Name' };
      const updatedUser = {
        id: 1,
        email: 'test@example.com',
        name: 'New Name',
      };
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      // Act
      const result = await service.updateUser(1, updateDto);

      // Assert
      expect(result).toEqual(updatedUser);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateDto,
      });
    });
  });

  describe('deleteUser', () => {
    it('should delete the user and return their old data', async () => {
      // Arrange
      const deletedUser = { id: 1, email: 'test@example.com', name: 'John' };
      mockPrismaService.user.delete.mockResolvedValue(deletedUser);

      // Act
      const result = await service.deleteUser(1);

      // Assert
      expect(result).toEqual(deletedUser);
      expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });
});
