import { randomUUID } from 'crypto';

interface ProductProps {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageKeys: string[];
  inStock: boolean;
  stockQuantity: number;
  createdAt: Date;
  updatedAt: Date;
}

interface CreateProductProps {
  name: string;
  description?: string | null;
  price: number;
  imageKeys?: string[];
  inStock?: boolean;
  stockQuantity?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class ProductModel {
  constructor(private readonly product: ProductProps) {}

  static create(props: CreateProductProps): ProductModel {
    const date = new Date();

    return new ProductModel({
      id: randomUUID(),
      name: props.name,
      description: props.description ?? null,
      price: props.price,
      imageKeys: props.imageKeys ?? [],
      inStock: props.inStock ?? true,
      stockQuantity: props.stockQuantity ?? 0,
      createdAt: date,
      updatedAt: date,
    });
  }

  static restore(product: ProductProps): ProductModel {
    return new ProductModel(product);
  }

  get id(): string {
    return this.product.id;
  }

  get name(): string {
    return this.product.name;
  }

  get description(): string | null {
    return this.product.description;
  }

  get price(): number {
    return this.product.price;
  }

  get imageKeys(): string[] {
    return this.product.imageKeys;
  }

  get inStock(): boolean {
    return this.product.inStock;
  }

  get stockQuantity(): number {
    return this.product.stockQuantity;
  }

  get createdAt(): Date {
    return this.product.createdAt;
  }

  get updatedAt(): Date {
    return this.product.updatedAt;
  }
}
