import { ProductModel } from './product.model';

export const PRODUCT_REPOSITORY = Symbol('PRODUCT_REPOSITORY');

export interface Options {
  filter?: {
    price?: { min?: number; max?: number };
    inStock?: boolean;
    stockQuantity?: { min?: number; max?: number };
    name?: string;
  };
  pagination?: {
    limit?: number;
    offset?: number;
  };
}

export interface IProductRepository {
  findAll(options?: Options): Promise<ProductModel[]>;
  findById(id: string): Promise<ProductModel>;

  create(product: ProductModel): Promise<ProductModel>;
  update(product: ProductModel): Promise<void>;
  delete(id: string): Promise<void>;
}
