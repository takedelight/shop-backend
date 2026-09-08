import { Test, TestingModule } from '@nestjs/testing';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserController } from '../user.controller';
import { UserService } from '../user.service';

describe('UserController', () => {
  const mockUserService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  let target: UserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: mockUserService }],
    }).compile();

    target = module.get<UserController>(UserController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const users = [
        { id: '1', username: 'user1', email: 'a@test.com', avatarKey: null },
      ];
      mockUserService.findAll.mockResolvedValue(users);

      const result = await target.findAll();

      expect(result).toEqual(users);
      expect(mockUserService.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findById', () => {
    it('should return user by id', async () => {
      const user = {
        id: 'user-123',
        username: 'test',
        email: 't@test.com',
        avatarKey: null,
      };
      mockUserService.findById.mockResolvedValue(user);

      const result = await target.findById('user-123');

      expect(result).toEqual(user);
      expect(mockUserService.findById).toHaveBeenCalledWith('user-123');
    });
  });

  describe('update', () => {
    it('should update user and return result', async () => {
      const dto: UpdateUserDto = { username: 'updated' };
      const updatedUser = {
        id: 'user-123',
        username: 'updated',
        email: 't@test.com',
        avatarKey: null,
      };
      mockUserService.update.mockResolvedValue(updatedUser);

      const result = await target.update('user-123', dto);

      expect(result).toEqual(updatedUser);
      expect(mockUserService.update).toHaveBeenCalledWith('user-123', dto);
    });
  });

  describe('delete', () => {
    it('should delete user by id', async () => {
      mockUserService.delete.mockResolvedValue(undefined);

      await target.delete('user-123');

      expect(mockUserService.delete).toHaveBeenCalledWith('user-123');
      expect(mockUserService.delete).toHaveBeenCalledTimes(1);
    });
  });
});
