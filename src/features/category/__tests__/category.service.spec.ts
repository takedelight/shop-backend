import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CATEGORY_REPOSITORY } from '../core/category.repository.interface';
import { REDIS_CLIENT } from 'src/infrastructure/redis/redis.module';
import { CategoryService } from '../category.service';

describe('CategoryService', () => {
  const mockCategoryRepository = {
    findAll: jest.fn(),
    findById: jest.fn(),
    findBySlug: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockRedis = {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1),
  };

  let target: CategoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        { provide: CATEGORY_REPOSITORY, useValue: mockCategoryRepository },
        { provide: REDIS_CLIENT, useValue: mockRedis },
      ],
    }).compile();

    target = module.get<CategoryService>(CategoryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    mockRedis.get.mockResolvedValue(null);
  });

  describe('findAll', () => {
    it('should return mapped categories', async () => {
      const mockCategories = [
        {
          id: '1',
          name: 'Electronics',
          icon: 'cpu',
          slug: 'electronics',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          name: 'Books',
          icon: 'book',
          slug: 'books',
          isActive: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      mockCategoryRepository.findAll.mockResolvedValue(mockCategories);

      const result = await target.findAll();

      expect(result).toEqual([
        {
          id: '1',
          name: 'Electronics',
          icon: 'cpu',
          slug: 'electronics',
          isActive: true,
        },
        {
          id: '2',
          name: 'Books',
          icon: 'book',
          slug: 'books',
          isActive: false,
        },
      ]);
      expect(mockCategoryRepository.findAll).toHaveBeenCalledTimes(1);
      expect(mockRedis.set).toHaveBeenCalledWith(
        'categories:all',
        expect.any(String),
        'EX',
        300,
      );
    });

    it('should return empty array when no categories exist', async () => {
      mockCategoryRepository.findAll.mockResolvedValue([]);

      const result = await target.findAll();

      expect(result).toEqual([]);
    });

    it('should return cached categories when available', async () => {
      const cachedCategories = [
        {
          id: '1',
          name: 'Cached Category',
          icon: 'tag',
        },
      ];
      mockRedis.get.mockResolvedValue(JSON.stringify(cachedCategories));

      const result = await target.findAll();

      expect(result).toEqual(cachedCategories);
      expect(mockCategoryRepository.findAll).not.toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return mapped category by id', async () => {
      const mockCategory = {
        id: 'cat-123',
        name: 'Electronics',
        icon: 'cpu',
        slug: 'electronics',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockCategoryRepository.findById.mockResolvedValue(mockCategory);

      const result = await target.findById('cat-123');

      expect(result).toEqual({
        id: 'cat-123',
        name: 'Electronics',
        icon: 'cpu',
        slug: 'electronics',
        isActive: true,
      });
      expect(mockCategoryRepository.findById).toHaveBeenCalledWith('cat-123');
      expect(mockRedis.set).toHaveBeenCalledWith(
        'category:cat-123',
        expect.any(String),
        'EX',
        300,
      );
    });

    it('should return cached category when available', async () => {
      const cachedCategory = {
        id: 'cat-123',
        name: 'Cached Category',
        icon: 'tag',
      };
      mockRedis.get.mockResolvedValue(JSON.stringify(cachedCategory));

      const result = await target.findById('cat-123');

      expect(result).toEqual(cachedCategory);
      expect(mockCategoryRepository.findById).not.toHaveBeenCalled();
    });

    it('should propagate NotFoundException when not found', async () => {
      mockCategoryRepository.findById.mockRejectedValue(
        new NotFoundException(),
      );

      await expect(target.findById('invalid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findBySlug', () => {
    it('should return mapped category by slug', async () => {
      const mockCategory = {
        id: 'cat-123',
        name: 'Electronics',
        icon: 'cpu',
        slug: 'electronics',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockCategoryRepository.findBySlug.mockResolvedValue(mockCategory);

      const result = await target.findBySlug('electronics');

      expect(result).toEqual({
        id: 'cat-123',
        name: 'Electronics',
        icon: 'cpu',
        slug: 'electronics',
        isActive: true,
      });
      expect(mockCategoryRepository.findBySlug).toHaveBeenCalledWith(
        'electronics',
      );
    });

    it('should propagate NotFoundException when slug not found', async () => {
      mockCategoryRepository.findBySlug.mockRejectedValue(
        new NotFoundException(),
      );

      await expect(target.findBySlug('invalid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create category and return result', async () => {
      const dto = {
        name: 'Electronics',
        icon: 'cpu',
        slug: 'electronics',
      };
      const createdCategory = {
        id: 'new-123',
        name: 'Electronics',
        icon: 'cpu',
        slug: 'electronics',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockCategoryRepository.create.mockResolvedValue(createdCategory);

      const result = await target.create(dto);

      expect(result).toEqual({
        id: 'new-123',
        name: 'Electronics',
        icon: 'cpu',
        slug: 'electronics',
        isActive: true,
      });
      expect(mockCategoryRepository.create).toHaveBeenCalledTimes(1);
      const createdModel = mockCategoryRepository.create.mock.calls[0][0];
      expect(createdModel.name).toBe('Electronics');
      expect(createdModel.icon).toBe('cpu');
      expect(mockRedis.del).toHaveBeenCalledWith('categories:all');
      expect(mockRedis.del).toHaveBeenCalledWith('category:new-123');
    });

    it('should pass all fields to CategoryModel.create', async () => {
      const dto = {
        name: 'Books',
        icon: 'book',
        slug: 'books',
        isActive: false,
      };
      const createdCategory = {
        id: 'full-123',
        name: 'Books',
        icon: 'book',
        slug: 'books',
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockCategoryRepository.create.mockResolvedValue(createdCategory);

      await target.create(dto);

      const createdModel = mockCategoryRepository.create.mock.calls[0][0];
      expect(createdModel).toHaveProperty('id');
      expect(createdModel).toHaveProperty('createdAt');
      expect(createdModel).toHaveProperty('updatedAt');
      expect(createdModel.name).toBe('Books');
      expect(createdModel.icon).toBe('book');
      expect(createdModel.slug).toBe('books');
      expect(createdModel.isActive).toBe(false);
    });
  });

  describe('update', () => {
    const existingCategory = {
      id: 'cat-123',
      name: 'Old Name',
      icon: 'old-icon',
      slug: 'old-slug',
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    };

    beforeEach(() => {
      mockCategoryRepository.findById.mockResolvedValue(existingCategory);
      mockCategoryRepository.update.mockResolvedValue(undefined);
    });

    it('should update category with merged data', async () => {
      const dto = { name: 'New Name' };

      await target.update('cat-123', dto);

      expect(mockCategoryRepository.update).toHaveBeenCalledTimes(1);
      const updatedModel = mockCategoryRepository.update.mock.calls[0][0];
      expect(updatedModel.name).toBe('New Name');
      expect(updatedModel.icon).toBe('old-icon');
      expect(mockRedis.del).toHaveBeenCalledWith('categories:all');
      expect(mockRedis.del).toHaveBeenCalledWith('category:cat-123');
    });

    it('should merge partial dto with existing category data', async () => {
      const dto = { icon: 'new-icon', isActive: false };

      await target.update('cat-123', dto);

      const updatedModel = mockCategoryRepository.update.mock.calls[0][0];
      expect(updatedModel.name).toBe('Old Name');
      expect(updatedModel.slug).toBe('old-slug');
      expect(updatedModel.icon).toBe('new-icon');
      expect(updatedModel.isActive).toBe(false);
    });
  });

  describe('delete', () => {
    it('should delete category by id', async () => {
      mockCategoryRepository.delete.mockResolvedValue(undefined);

      await target.delete('cat-123');

      expect(mockCategoryRepository.delete).toHaveBeenCalledWith('cat-123');
      expect(mockCategoryRepository.delete).toHaveBeenCalledTimes(1);
      expect(mockRedis.del).toHaveBeenCalledWith('categories:all');
      expect(mockRedis.del).toHaveBeenCalledWith('category:cat-123');
    });
  });
});
