import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from '../product.controller';
import { ProductService } from '../product.service';

describe('ProductController', () => {
  const mockProductService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  let target: ProductController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [{ provide: ProductService, useValue: mockProductService }],
    }).compile();

    target = module.get<ProductController>(ProductController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all products', async () => {
      const products = [
        { id: '1', name: 'Product 1', price: 100 },
        { id: '2', name: 'Product 2', price: 200 },
      ];
      mockProductService.findAll.mockResolvedValue(products);

      const result = await target.findAll();

      expect(result).toEqual(products);
      expect(mockProductService.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findById', () => {
    it('should return product by id', async () => {
      const product = {
        id: 'product-123',
        name: 'Test',
        price: 50,
      };
      mockProductService.findById.mockResolvedValue(product);

      const result = await target.findById('product-123');

      expect(result).toEqual(product);
      expect(mockProductService.findById).toHaveBeenCalledWith('product-123');
    });
  });

  describe('create', () => {
    it('should create product and return result', async () => {
      const dto = {
        name: 'New Product',
        price: 99,
      };
      const created = {
        id: 'new-123',
        name: 'New Product',
        price: 99,
      };
      mockProductService.create.mockResolvedValue(created);

      const result = await target.create(dto);

      expect(result).toEqual(created);
      expect(mockProductService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('should update product and return result', async () => {
      const dto = { name: 'Updated' };
      const updated = {
        id: 'product-123',
        name: 'Updated',
        price: 50,
      };
      mockProductService.update.mockResolvedValue(updated);

      const result = await target.update('product-123', dto);

      expect(result).toEqual(updated);
      expect(mockProductService.update).toHaveBeenCalledWith(
        'product-123',
        dto,
      );
    });
  });

  describe('delete', () => {
    it('should delete product by id', async () => {
      mockProductService.delete.mockResolvedValue(undefined);

      await target.delete('product-123');

      expect(mockProductService.delete).toHaveBeenCalledWith('product-123');
      expect(mockProductService.delete).toHaveBeenCalledTimes(1);
    });
  });
});
