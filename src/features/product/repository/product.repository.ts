import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE } from 'src/infrastructure/database/database.module';
import { ProductModel } from '../core/product.model';
import {
  IProductRepository,
  Options,
} from '../core/product.repository.interface';
import { products } from '../entities/product.entity';
import { ProductMapper } from '../mappers/product.mapper';

@Injectable()
export class ProductRepository implements IProductRepository {
  constructor(@Inject(DRIZZLE) private readonly db: NodePgDatabase) {}

  async findAll(options?: Options): Promise<ProductModel[]> {
    const rows = await this.db
      .select()
      .from(products)
      .orderBy(products.createdAt)
      .limit(options?.pagination?.limit ?? 1000)
      .offset(options?.pagination?.offset ?? 0);

    return rows.map((row) => ProductMapper.toDomain(row));
  }

  async findById(id: string): Promise<ProductModel> {
    const [row] = await this.db
      .select()
      .from(products)
      .where(eq(products.id, id));

    if (!row) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return ProductMapper.toDomain(row);
  }

  async create(product: ProductModel): Promise<ProductModel> {
    const [row] = await this.db
      .insert(products)
      .values(ProductMapper.toPersistence(product))
      .returning();

    return ProductMapper.toDomain(row);
  }

  async update(product: ProductModel): Promise<void> {
    await this.db
      .update(products)
      .set(ProductMapper.toPersistence(product))
      .where(eq(products.id, product.id));
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(products).where(eq(products.id, id));
  }
}
