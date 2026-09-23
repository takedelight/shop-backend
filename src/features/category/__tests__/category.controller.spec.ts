import { Test, TestingModule } from '@nestjs/testing';
import { CategoryController } from '../category.controller';
import { CategoryService } from '../category.service';

describe('CategoryController', () => {
  const mockCategoryService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    findBySlug: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  let target: CategoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [{ provide: CategoryService, useValue: mockCategoryService }],
    }).compile();

    target = module.get<CategoryController>(CategoryController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all categories', async () => {
      const categories = [
        { id: '1', name: 'Electronics', icon: 'cpu' },
        { id: '2', name: 'Books', icon: 'book' },
      ];
      mockCategoryService.findAll.mockResolvedValue(categories);

      const result = await target.findAll({});

      expect(result).toEqual(categories);
      expect(mockCategoryService.findAll).toHaveBeenCalledWith({});
      expect(mockCategoryService.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findById', () => {
    it('should return category by id', async () => {
      const category = {
        id: 'cat-123',
        name: 'Electronics',
        icon: 'cpu',
      };
      mockCategoryService.findById.mockResolvedValue(category);

      const result = await target.findById('cat-123');

      expect(result).toEqual(category);
      expect(mockCategoryService.findById).toHaveBeenCalledWith('cat-123');
    });
  });

  describe('findBySlug', () => {
    it('should return category by slug', async () => {
      const category = {
        id: 'cat-123',
        name: 'Electronics',
        slug: 'electronics',
      };
      mockCategoryService.findBySlug.mockResolvedValue(category);

      const result = await target.findBySlug('electronics');

      expect(result).toEqual(category);
      expect(mockCategoryService.findBySlug).toHaveBeenCalledWith(
        'electronics',
      );
    });
  });

  describe('create', () => {
    it('should create category and return result', async () => {
      const dto = {
        name: 'Electronics',
        icon: 'cpu',
      };
      const created = {
        id: 'new-123',
        name: 'Electronics',
        icon: 'cpu',
      };
      mockCategoryService.create.mockResolvedValue(created);

      const result = await target.create(dto);

      expect(result).toEqual(created);
      expect(mockCategoryService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('should update category and return result', async () => {
      const dto = { name: 'Updated' };
      const updated = {
        id: 'cat-123',
        name: 'Updated',
        icon: 'cpu',
      };
      mockCategoryService.update.mockResolvedValue(updated);

      const result = await target.update('cat-123', dto);

      expect(result).toEqual(updated);
      expect(mockCategoryService.update).toHaveBeenCalledWith('cat-123', dto);
    });
  });

  describe('delete', () => {
    it('should delete category by id', async () => {
      mockCategoryService.delete.mockResolvedValue(undefined);

      await target.delete('cat-123');

      expect(mockCategoryService.delete).toHaveBeenCalledWith('cat-123');
      expect(mockCategoryService.delete).toHaveBeenCalledTimes(1);
    });
  });
});
