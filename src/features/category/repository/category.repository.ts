import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { SQL, and, eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE } from 'src/infrastructure/database/database.module';
import { CategoryModel } from '../core/category.model';
import {
  ICategoryRepository,
  Options,
} from '../core/category.repository.interface';
import { categories } from '../entities/category.entity';
import { CategoryMapper } from '../mappers/category.mapper';

@Injectable()
export class CategoryRepository implements ICategoryRepository {
  constructor(@Inject(DRIZZLE) private readonly db: NodePgDatabase) {}

  async findAll(options?: Options): Promise<CategoryModel[]> {
    const conditions: SQL<unknown>[] = [];

    if (options?.filter?.name) {
      conditions.push(eq(categories.name, options.filter.name));
    }

    if (options?.filter?.slug) {
      conditions.push(eq(categories.slug, options.filter.slug));
    }

    if (options?.filter?.isActive !== undefined) {
      conditions.push(eq(categories.isActive, options.filter.isActive));
    }

    const whereCondition =
      conditions.length > 0 ? and(...conditions) : undefined;

    const rows = await this.db
      .select()
      .from(categories)
      .where(whereCondition)
      .orderBy(categories.createdAt)
      .limit(options?.pagination?.limit ?? 1000)
      .offset(options?.pagination?.offset ?? 0);

    return rows.map((row) => CategoryMapper.toDomain(row));
  }

  async findById(id: string): Promise<CategoryModel> {
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
    const [row] = await this.db
      .insert(categories)
      .values(CategoryMapper.toPersistence(category))
      .returning();

    return CategoryMapper.toDomain(row);
  }

  async update(category: CategoryModel): Promise<void> {
    await this.db
      .update(categories)
      .set(CategoryMapper.toPersistence(category))
      .where(eq(categories.id, category.id));
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(categories).where(eq(categories.id, id));
  }
}
