import {
  boolean,
  decimal,
  foreignKey,
  integer,
  pgTable,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { categories } from '../../category/entities/category.entity';

export const products = pgTable(
  'products',
  {
    id: varchar('id').primaryKey(),
    name: varchar('name').notNull(),
    description: varchar('description'),
    price: decimal('price', {
      precision: 10,
      scale: 2,
      mode: 'number',
    }).notNull(),
    imageKeys: varchar('image_keys').array().notNull(),
    inStock: boolean('in_stock').notNull(),
    stockQuantity: integer('stock_quantity').notNull(),
    categoryId: varchar('category_id'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.categoryId],
      foreignColumns: [categories.id],
    }),
  ],
);

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
