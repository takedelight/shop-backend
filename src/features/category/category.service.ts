import { Inject, Injectable, Logger } from '@nestjs/common';
import type Redis from 'ioredis';
import { REDIS_CLIENT } from 'src/infrastructure/redis/redis.module';
import { CategoryModel } from './core/category.model';
import {
  type ICategoryRepository,
  CATEGORY_REPOSITORY,
} from './core/category.repository.interface';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryMapper } from './mappers/category.mapper';

const CACHE_TTL = 5 * 60;
const CATEGORIES_KEY = 'categories:all';

@Injectable()
export class CategoryService {
  private readonly logger = new Logger(CategoryService.name);

  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepo: ICategoryRepository,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  async findAll() {
    const cached = await this.redis.get(CATEGORIES_KEY);
    if (cached) {
      return JSON.parse(cached);
    }

    const categories = await this.categoryRepo.findAll();
    const response = categories.map(CategoryMapper.toResponse);

    await this.redis.set(
      CATEGORIES_KEY,
      JSON.stringify(response),
      'EX',
      CACHE_TTL,
    );

    return response;
  }

  async findById(id: string) {
    const cacheKey = `category:${id}`;

    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const category = await this.categoryRepo.findById(id);
    const response = CategoryMapper.toResponse(category);

    await this.redis.set(cacheKey, JSON.stringify(response), 'EX', CACHE_TTL);

    return response;
  }

  async findBySlug(slug: string) {
    const category = await this.categoryRepo.findBySlug(slug);
    return CategoryMapper.toResponse(category);
  }

  async create(dto: CreateCategoryDto) {
    this.logger.log(`Creating category: ${dto.name}`);
    const data = CategoryModel.create(dto);
    const category = await this.categoryRepo.create(data);
    const response = CategoryMapper.toResponse(category);

    await this.invalidateCache(response.id);

    return response;
  }

  async update(id: string, dto: UpdateCategoryDto) {
    this.logger.log(`Updating category: ${id}`);
    const existing = await this.categoryRepo.findById(id);

    const updated = CategoryModel.restore({
      id: existing.id,
      name: dto.name ?? existing.name,
      icon: dto.icon ?? existing.icon,
      slug: dto.slug ?? existing.slug,
      isActive: dto.isActive ?? existing.isActive,
      createdAt: existing.createdAt,
      updatedAt: new Date(),
    });

    await this.categoryRepo.update(updated);
    await this.invalidateCache(id);

    return CategoryMapper.toResponse(updated);
  }

  async delete(id: string) {
    this.logger.log(`Deleting category: ${id}`);
    await this.categoryRepo.delete(id);
    await this.invalidateCache(id);
  }

  private async invalidateCache(id: string) {
    await Promise.all([
      this.redis.del(CATEGORIES_KEY),
      this.redis.del(`category:${id}`),
    ]);
  }
}
