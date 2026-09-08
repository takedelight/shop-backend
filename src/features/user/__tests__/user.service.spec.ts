import { Test, TestingModule } from '@nestjs/testing';
import * as argon2 from 'argon2';
import { USER_REPOSITORY } from '../core/user.repository.interface';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserService } from '../user.service';

jest
  .spyOn(argon2, 'hash')
  .mockImplementation(() => Promise.resolve('hashedpassword'));

describe('UserService', () => {
  const mockUserRepository = {
    findAll: jest.fn(),
    findById: jest.fn(),
    findByEmail: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  let target: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: USER_REPOSITORY, useValue: mockUserRepository },
      ],
    }).compile();

    target = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return mapped users', async () => {
      const mockUsers = [
        { id: '1', username: 'user1', email: 'a@test.com', avatarKey: null },
        { id: '2', username: 'user2', email: 'b@test.com', avatarKey: 'key' },
      ];
      mockUserRepository.findAll.mockResolvedValue(mockUsers);

      const result = await target.findAll();

      expect(result).toEqual([
        { id: '1', username: 'user1', email: 'a@test.com', avatarKey: null },
        { id: '2', username: 'user2', email: 'b@test.com', avatarKey: 'key' },
      ]);
      expect(mockUserRepository.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no users exist', async () => {
      mockUserRepository.findAll.mockResolvedValue([]);

      const result = await target.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should return mapped user by id', async () => {
      const mockUser = {
        id: 'user-123',
        username: 'testuser',
        email: 'test@test.com',
        avatarKey: null,
      };
      mockUserRepository.findById.mockResolvedValue(mockUser);

      const result = await target.findById('user-123');

      expect(result).toEqual({
        id: 'user-123',
        username: 'testuser',
        email: 'test@test.com',
        avatarKey: null,
      });
      expect(mockUserRepository.findById).toHaveBeenCalledWith('user-123');
    });
  });

  describe('findByEmail', () => {
    it('should return mapped user by email', async () => {
      const mockUser = {
        id: 'user-123',
        username: 'testuser',
        email: 'test@test.com',
        avatarKey: 'key',
      };
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      const result = await target.findByEmail('test@test.com');

      expect(result).toEqual({
        id: 'user-123',
        username: 'testuser',
        email: 'test@test.com',
        avatarKey: 'key',
      });
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        'test@test.com',
      );
    });
  });

  describe('create', () => {
    it('should create user and return result', async () => {
      const dto: CreateUserDto = {
        username: 'newuser',
        email: 'new@test.com',
        password: 'password123',
      };
      mockUserRepository.create.mockResolvedValue(undefined);

      await target.create(dto);

      expect(mockUserRepository.create).toHaveBeenCalledTimes(1);
      const createdModel = mockUserRepository.create.mock.calls[0][0];
      expect(createdModel.username).toBe('newuser');
      expect(createdModel.email).toBe('new@test.com');
      expect(createdModel.password).toBe('hashedpassword');
    });

    it('should pass all fields to UserModel.create', async () => {
      const dto: CreateUserDto = {
        username: 'alice',
        email: 'alice@test.com',
        password: 'secret123',
      };

      await target.create(dto);

      const createdModel = mockUserRepository.create.mock.calls[0][0];
      expect(createdModel).toHaveProperty('id');
      expect(createdModel.username).toBe('alice');
      expect(createdModel.email).toBe('alice@test.com');
    });
  });

  describe('update', () => {
    const existingUser = {
      id: 'user-123',
      username: 'olduser',
      email: 'old@test.com',
      password: 'oldhash',
      avatarKey: null,
      role: 'user',
      provider: 'local',
      providerId: null,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    };

    beforeEach(() => {
      mockUserRepository.findById.mockResolvedValue(existingUser);
      mockUserRepository.update.mockResolvedValue(undefined);
    });

    it('should update user with merged data', async () => {
      const dto: UpdateUserDto = { username: 'newname' };

      await target.update('user-123', dto);

      expect(mockUserRepository.update).toHaveBeenCalledTimes(1);
      const updatedModel = mockUserRepository.update.mock.calls[0][0];
      expect(updatedModel.username).toBe('newname');
      expect(updatedModel.email).toBe('old@test.com');
    });

    it('should hash password with argon2 when provided', async () => {
      const dto: UpdateUserDto = { password: 'newpassword' };
      (argon2.hash as jest.Mock).mockResolvedValue('hashedpassword');

      await target.update('user-123', dto);

      expect(argon2.hash).toHaveBeenCalledWith('newpassword');
      const updatedModel = mockUserRepository.update.mock.calls[0][0];
      expect(updatedModel.password).toBe('hashedpassword');
    });

    it('should not call argon2.hash when password is not provided', async () => {
      const dto: UpdateUserDto = { username: 'newname' };

      await target.update('user-123', dto);

      expect(argon2.hash).not.toHaveBeenCalled();
      const updatedModel = mockUserRepository.update.mock.calls[0][0];
      expect(updatedModel.password).toBe('oldhash');
    });

    it('should merge partial dto with existing user data', async () => {
      const dto: UpdateUserDto = { email: 'new@test.com' };

      await target.update('user-123', dto);

      const updatedModel = mockUserRepository.update.mock.calls[0][0];
      expect(updatedModel.username).toBe('olduser');
      expect(updatedModel.email).toBe('new@test.com');
      expect(updatedModel.password).toBe('oldhash');
      expect(updatedModel.avatarKey).toBeNull();
      expect(updatedModel.role).toBe('user');
    });
  });

  describe('delete', () => {
    it('should delete user by id', async () => {
      mockUserRepository.delete.mockResolvedValue(undefined);

      await target.delete('user-123');

      expect(mockUserRepository.delete).toHaveBeenCalledWith('user-123');
      expect(mockUserRepository.delete).toHaveBeenCalledTimes(1);
    });
  });
});
