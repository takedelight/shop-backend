import { Inject, Injectable, Logger } from '@nestjs/common';
import type Redis from 'ioredis';
import { REDIS_CLIENT } from 'src/infrastructure/redis/redis.module';
import { ProductModel } from './core/product.model';
import {
  type IProductRepository,
  PRODUCT_REPOSITORY,
} from './core/product.repository.interface';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductMapper } from './mappers/product.mapper';

const CACHE_TTL = 5 * 60;
const PRODUCTS_KEY = 'products:all';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepo: IProductRepository,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  async findAll() {
    const cached = await this.redis.get(PRODUCTS_KEY);
    if (cached) {
      return JSON.parse(cached);
    }

    const products = await this.productRepo.findAll();
    const response = products.map(ProductMapper.toResponse);

    await this.redis.set(
      PRODUCTS_KEY,
      JSON.stringify(response),
      'EX',
      CACHE_TTL,
    );

    return response;
  }

  async findById(id: string) {
    const cacheKey = `product:${id}`;

    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const product = await this.productRepo.findById(id);
    const response = ProductMapper.toResponse(product);

    await this.redis.set(cacheKey, JSON.stringify(response), 'EX', CACHE_TTL);

    return response;
  }

  async create(dto: CreateProductDto) {
    this.logger.log(`Creating product: ${dto.name}`);
    const data = ProductModel.create(dto);
    const product = await this.productRepo.create(data);
    const response = ProductMapper.toResponse(product);

    await this.invalidateCache(response.id);

    return response;
  }

  async update(id: string, dto: UpdateProductDto) {
    this.logger.log(`Updating product: ${id}`);
    const existing = await this.productRepo.findById(id);

    const updated = ProductModel.restore({
      id: existing.id,
      name: dto.name ?? existing.name,
      description: dto.description ?? existing.description,
      price: dto.price ?? existing.price,
      imageKeys: dto.imageKeys ?? existing.imageKeys,
      inStock: dto.inStock ?? existing.inStock,
      stockQuantity: dto.stockQuantity ?? existing.stockQuantity,
      createdAt: existing.createdAt,
      updatedAt: new Date(),
    });

    await this.productRepo.update(updated);
    await this.invalidateCache(id);

    return ProductMapper.toResponse(updated);
  }

  async delete(id: string) {
    this.logger.log(`Deleting product: ${id}`);
    await this.productRepo.delete(id);
    await this.invalidateCache(id);
  }

  private async invalidateCache(id: string) {
    await Promise.all([
      this.redis.del(PRODUCTS_KEY),
      this.redis.del(`product:${id}`),
    ]);
  }
}
