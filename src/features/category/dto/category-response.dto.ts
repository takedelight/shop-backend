import { ProductResponseDto } from 'src/features/product/dto/product-response.dto';

export class CategoryResponseDto {
  id: string;
  name: string;
  icon: string;
  slug: string | null;
  isActive: boolean;
  products?: ProductResponseDto[];
  totalProducts: number;
  createdAt: Date;
}
