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
import { Public } from 'src/common/decorators/is-public.decorator';
import { SetRoles } from 'src/common/decorators/set-role.decorator';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryService } from './category.service';

@ApiTags('Category')
@Controller('category')
export class CategoryController {
  private readonly logger = new Logger(CategoryController.name);

  constructor(private readonly categoryService: CategoryService) {}

  @Public()
  @Get()
  findAll() {
    this.logger.log('GET /category');
    return this.categoryService.findAll();
  }

  @SetRoles('admin')
  @Get(':id')
  findById(@Param('id') id: string) {
    this.logger.log(`GET /category/${id}`);
    return this.categoryService.findById(id);
  }

  @SetRoles('admin')
  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    this.logger.log(`GET /category/slug/${slug}`);
    return this.categoryService.findBySlug(slug);
  }

  @SetRoles('admin')
  @Post()
  create(@Body() dto: CreateCategoryDto) {
    this.logger.log('POST /category');
    return this.categoryService.create(dto);
  }

  @SetRoles('admin')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    this.logger.log(`PATCH /category/${id}`);
    return this.categoryService.update(id, dto);
  }

  @SetRoles('admin')
  @Delete(':id')
  delete(@Param('id') id: string) {
    this.logger.log(`DELETE /category/${id}`);
    return this.categoryService.delete(id);
  }
}
