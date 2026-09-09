import { Inject, Injectable, Logger } from '@nestjs/common';
import { ProductModel } from './core/product.model';
import {
  type IProductRepository,
  PRODUCT_REPOSITORY,
} from './core/product.repository.interface';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductMapper } from './mappers/product.mapper';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepo: IProductRepository,
  ) {}

  async findAll() {
    const products = await this.productRepo.findAll();
    return products.map(ProductMapper.toResponse);
  }

  async findById(id: string) {
    const product = await this.productRepo.findById(id);
    return ProductMapper.toResponse(product);
  }

  async create(dto: CreateProductDto) {
    this.logger.log(`Creating product: ${dto.name}`);
    const data = ProductModel.create(dto);
    return this.productRepo.create(data);
  }

  async update(id: string, dto: UpdateProductDto) {
    this.logger.log(`Updating product: ${id}`);
    const existing = await this.productRepo.findById(id);

    const updated = ProductModel.restore({
      id: existing.id,
      name: dto.name ?? existing.name,
      description: dto.description ?? existing.description,
      price: dto.price ?? existing.price,
      imageKeys: dto.imageKeys ?? existing.imageKeys,
      inStock: dto.inStock ?? existing.inStock,
      stockQuantity: dto.stockQuantity ?? existing.stockQuantity,
      createdAt: existing.createdAt,
      updatedAt: new Date(),
    });

    return this.productRepo.update(updated);
  }

  async delete(id: string) {
    this.logger.log(`Deleting product: ${id}`);
    return this.productRepo.delete(id);
  }
}
