import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PRODUCT_REPOSITORY } from '../core/product.repository.interface';
import { ProductService } from '../product.service';

describe('ProductService', () => {
  const mockProductRepository = {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  let target: ProductService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        { provide: PRODUCT_REPOSITORY, useValue: mockProductRepository },
      ],
    }).compile();

    target = module.get<ProductService>(ProductService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return mapped products', async () => {
      const mockProducts = [
        {
          id: '1',
          name: 'Product 1',
          description: 'Desc 1',
          price: 100,
          imageKeys: ['key1'],
          inStock: true,
          stockQuantity: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          name: 'Product 2',
          description: null,
          price: 200,
          imageKeys: [],
          inStock: false,
          stockQuantity: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      mockProductRepository.findAll.mockResolvedValue(mockProducts);

      const result = await target.findAll();

      expect(result).toEqual([
        {
          id: '1',
          name: 'Product 1',
          description: 'Desc 1',
          price: 100,
          imageKeys: ['key1'],
          inStock: true,
          stockQuantity: 10,
        },
        {
          id: '2',
          name: 'Product 2',
          description: null,
          price: 200,
          imageKeys: [],
          inStock: false,
          stockQuantity: 0,
        },
      ]);
      expect(mockProductRepository.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no products exist', async () => {
      mockProductRepository.findAll.mockResolvedValue([]);

      const result = await target.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should return mapped product by id', async () => {
      const mockProduct = {
        id: 'product-123',
        name: 'Test Product',
        description: 'Test Desc',
        price: 50,
        imageKeys: ['img1'],
        inStock: true,
        stockQuantity: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockProductRepository.findById.mockResolvedValue(mockProduct);

      const result = await target.findById('product-123');

      expect(result).toEqual({
        id: 'product-123',
        name: 'Test Product',
        description: 'Test Desc',
        price: 50,
        imageKeys: ['img1'],
        inStock: true,
        stockQuantity: 5,
      });
      expect(mockProductRepository.findById).toHaveBeenCalledWith(
        'product-123',
      );
    });

    it('should propagate NotFoundException when not found', async () => {
      mockProductRepository.findById.mockRejectedValue(new NotFoundException());

      await expect(target.findById('invalid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create product and return result', async () => {
      const dto = {
        name: 'New Product',
        price: 99,
        description: 'New',
        imageKeys: [],
        inStock: true,
        stockQuantity: 1,
      };
      mockProductRepository.create.mockResolvedValue(undefined);

      await target.create(dto);

      expect(mockProductRepository.create).toHaveBeenCalledTimes(1);
      const createdModel = mockProductRepository.create.mock.calls[0][0];
      expect(createdModel.name).toBe('New Product');
      expect(createdModel.price).toBe(99);
    });

    it('should pass all fields to ProductModel.create', async () => {
      const dto = {
        name: 'Full Product',
        price: 150,
        description: 'Full Desc',
        imageKeys: ['k1', 'k2'],
        inStock: false,
        stockQuantity: 0,
      };

      await target.create(dto);

      const createdModel = mockProductRepository.create.mock.calls[0][0];
      expect(createdModel).toHaveProperty('id');
      expect(createdModel).toHaveProperty('createdAt');
      expect(createdModel).toHaveProperty('updatedAt');
      expect(createdModel.name).toBe('Full Product');
      expect(createdModel.price).toBe(150);
      expect(createdModel.description).toBe('Full Desc');
      expect(createdModel.imageKeys).toEqual(['k1', 'k2']);
      expect(createdModel.inStock).toBe(false);
      expect(createdModel.stockQuantity).toBe(0);
    });
  });

  describe('update', () => {
    const existingProduct = {
      id: 'product-123',
      name: 'Old Name',
      description: 'Old Desc',
      price: 100,
      imageKeys: ['old'],
      inStock: true,
      stockQuantity: 10,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    };

    beforeEach(() => {
      mockProductRepository.findById.mockResolvedValue(existingProduct);
      mockProductRepository.update.mockResolvedValue(undefined);
    });

    it('should update product with merged data', async () => {
      const dto = { name: 'New Name' };

      await target.update('product-123', dto);

      expect(mockProductRepository.update).toHaveBeenCalledTimes(1);
      const updatedModel = mockProductRepository.update.mock.calls[0][0];
      expect(updatedModel.name).toBe('New Name');
      expect(updatedModel.price).toBe(100);
    });

    it('should merge partial dto with existing product data', async () => {
      const dto = { price: 200, inStock: false };

      await target.update('product-123', dto);

      const updatedModel = mockProductRepository.update.mock.calls[0][0];
      expect(updatedModel.name).toBe('Old Name');
      expect(updatedModel.description).toBe('Old Desc');
      expect(updatedModel.price).toBe(200);
      expect(updatedModel.imageKeys).toEqual(['old']);
      expect(updatedModel.inStock).toBe(false);
      expect(updatedModel.stockQuantity).toBe(10);
    });
  });

  describe('delete', () => {
    it('should delete product by id', async () => {
      mockProductRepository.delete.mockResolvedValue(undefined);

      await target.delete('product-123');

      expect(mockProductRepository.delete).toHaveBeenCalledWith('product-123');
      expect(mockProductRepository.delete).toHaveBeenCalledTimes(1);
    });
  });
});
