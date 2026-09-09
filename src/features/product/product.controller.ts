import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductService } from './product.service';

@ApiTags('Product')
@Controller('product')
export class ProductController {
  private readonly logger = new Logger(ProductController.name);

  constructor(private readonly productService: ProductService) {}

  @Get()
  findAll() {
    this.logger.log('GET /product');
    return this.productService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    this.logger.log(`GET /product/${id}`);
    return this.productService.findById(id);
  }

  @Post()
  create(@Body() dto: CreateProductDto) {
    this.logger.log('POST /product');
    return this.productService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    this.logger.log(`PATCH /product/${id}`);
    return this.productService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    this.logger.log(`DELETE /product/${id}`);
    return this.productService.delete(id);
  }
}
