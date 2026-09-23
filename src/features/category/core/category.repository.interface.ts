import { CategoryModel } from './category.model';

export const CATEGORY_REPOSITORY = Symbol('CATEGORY_REPOSITORY');

export interface Options {
  name?: string;
  slug?: string;
  isActive?: boolean;
  limit?: number;
  page?: number;
}

export interface ICategoryRepository {
  findAll(options?: Options): Promise<CategoryModel[]>;
  count(options?: Omit<Options, 'limit' | 'page'>): Promise<number>;
  findById(id: string): Promise<CategoryModel>;
  findBySlug(slug: string): Promise<CategoryModel>;
  countProductsByCategoryId(categoryId: string): Promise<number>;

  create(category: CategoryModel): Promise<CategoryModel>;
  update(category: CategoryModel): Promise<void>;
  delete(id: string): Promise<void>;
}
