import { Module } from '@nestjs/common';
import { PRODUCT_REPOSITORY } from './core/product.repository.interface';
import { ProductRepository } from './repository/product.repository';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';

@Module({
  controllers: [ProductController],
  providers: [
    ProductService,
    {
      provide: PRODUCT_REPOSITORY,
      useClass: ProductRepository,
    },
  ],
  exports: [PRODUCT_REPOSITORY],
})
export class ProductModule {}
