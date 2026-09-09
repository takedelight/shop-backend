import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsString({ each: true })
  imageKeys?: string[];

  @IsOptional()
  @IsBoolean()
  inStock?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  stockQuantity?: number;
}
