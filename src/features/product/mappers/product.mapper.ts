import { ProductModel } from '../core/product.model';
import { ProductResponseDto } from '../dto/product-response.dto';
import { NewProduct, Product } from '../entities/product.entity';

export class ProductMapper {
  static toDomain(row: Product): ProductModel {
    return ProductModel.restore({
      ...row,
    });
  }

  static toPersistence(product: ProductModel): NewProduct {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      imageKeys: product.imageKeys,
      inStock: product.inStock,
      stockQuantity: product.stockQuantity,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  static toResponse(product: ProductModel): ProductResponseDto {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      imageKeys: product.imageKeys,
      inStock: product.inStock,
      stockQuantity: product.stockQuantity,
    };
  }
}
