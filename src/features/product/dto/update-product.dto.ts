export class UpdateProductDto {
  name?: string;
  description?: string | null;
  price?: number;
  imageKeys?: string[];
  inStock?: boolean;
  stockQuantity?: number;
}
