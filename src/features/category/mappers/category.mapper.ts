import { CategoryModel } from '../core/category.model';
import { CategoryResponseDto } from '../dto/category-response.dto';
import { Category, NewCategory } from '../entities/category.entity';

export class CategoryMapper {
  static toDomain(row: Category): CategoryModel {
    return CategoryModel.restore({
      ...row,
    });
  }

  static toPersistence(category: CategoryModel): NewCategory {
    return {
      id: category.id,
      name: category.name,
      icon: category.icon,
      slug: category.slug,
      isActive: category.isActive,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }

  static toResponse(category: CategoryModel): CategoryResponseDto {
    return {
      id: category.id,
      name: category.name,
      icon: category.icon,
      slug: category.slug,
      isActive: category.isActive,
    };
  }
}
