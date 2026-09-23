import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SQL, and, count, eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE } from 'src/infrastructure/database/database.module';
import { CategoryModel } from '../core/category.model';
import {
  ICategoryRepository,
  Options,
} from '../core/category.repository.interface';
import { categories } from '../entities/category.entity';
import { products } from 'src/features/product/entities/product.entity';
import { CategoryMapper } from '../mappers/category.mapper';

@Injectable()
export class CategoryRepository implements ICategoryRepository {
  private readonly logger = new Logger(CategoryRepository.name);

  constructor(@Inject(DRIZZLE) private readonly db: NodePgDatabase) {}

  private buildConditions(
    options?: Pick<Options, 'name' | 'slug' | 'isActive'>,
  ): SQL<unknown>[] {
    const conditions: SQL<unknown>[] = [];

    if (options?.name) {
      conditions.push(eq(categories.name, options.name));
    }

    if (options?.slug) {
      conditions.push(eq(categories.slug, options.slug));
    }

    if (options?.isActive !== undefined) {
      conditions.push(eq(categories.isActive, options.isActive));
    }

    return conditions;
  }

  async findAll(options?: Options): Promise<CategoryModel[]> {
    this.logger.log('findAll');
    const conditions = this.buildConditions(options);
    const whereCondition =
      conditions.length > 0 ? and(...conditions) : undefined;

    const rows = await this.db
      .select()
      .from(categories)
      .where(whereCondition)
      .orderBy(categories.createdAt)
      .limit(options?.limit ?? 1000)
      .offset(options?.page ?? 0);

    return rows.map((row) => CategoryMapper.toDomain(row));
  }

  async count(options?: Omit<Options, 'limit' | 'page'>): Promise<number> {
    this.logger.log('count');
    const conditions = this.buildConditions(options);
    const whereCondition =
      conditions.length > 0 ? and(...conditions) : undefined;

    const [row] = await this.db
      .select({ value: count() })
      .from(categories)
      .where(whereCondition);

    return Number(row?.value ?? 0);
  }

  async countProductsByCategoryId(categoryId: string): Promise<number> {
    this.logger.log(`countProductsByCategoryId: ${categoryId}`);
    const [row] = await this.db
      .select({ value: count() })
      .from(products)
      .where(eq(products.categoryId, categoryId));

    return Number(row?.value ?? 0);
  }

  async findById(id: string): Promise<CategoryModel> {
    this.logger.log(`findById: ${id}`);
    const [row] = await this.db
      .select()
      .from(categories)
      .where(eq(categories.id, id));

    if (!row) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return CategoryMapper.toDomain(row);
  }

  async findBySlug(slug: string): Promise<CategoryModel> {
    this.logger.log(`findBySlug: ${slug}`);
    const [row] = await this.db
      .select()
      .from(categories)
      .where(eq(categories.slug, slug));

    if (!row) {
      throw new NotFoundException(`Category with slug "${slug}" not found`);
    }

    return CategoryMapper.toDomain(row);
  }

  async create(category: CategoryModel): Promise<CategoryModel> {
    this.logger.log(`create: ${category.name}`);
    const [row] = await this.db
      .insert(categories)
      .values(CategoryMapper.toPersistence(category))
      .returning();

    return CategoryMapper.toDomain(row);
  }

  async update(category: CategoryModel): Promise<void> {
    this.logger.log(`update: ${category.id}`);
    await this.db
      .update(categories)
      .set(CategoryMapper.toPersistence(category))
      .where(eq(categories.id, category.id));
  }

  async delete(id: string): Promise<void> {
    this.logger.log(`delete: ${id}`);
    await this.db.delete(categories).where(eq(categories.id, id));
  }
}
