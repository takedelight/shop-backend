import { CategoryModel } from './category.model';

export const CATEGORY_REPOSITORY = Symbol('CATEGORY_REPOSITORY');

export interface Options {
  filter?: {
    name?: string;
    slug?: string;
    isActive?: boolean;
  };
  pagination?: {
    limit?: number;
    offset?: number;
  };
}

export interface ICategoryRepository {
  findAll(options?: Options): Promise<CategoryModel[]>;
  findById(id: string): Promise<CategoryModel>;
  findBySlug(slug: string): Promise<CategoryModel>;
  countProductsByCategoryId(categoryId: string): Promise<number>;

  create(category: CategoryModel): Promise<CategoryModel>;
  update(category: CategoryModel): Promise<void>;
  delete(id: string): Promise<void>;
}
