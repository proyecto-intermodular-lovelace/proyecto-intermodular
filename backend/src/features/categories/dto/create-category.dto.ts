import { IsNotEmpty, IsString, MaxLength, IsEnum } from 'class-validator';
import { ProductType } from '../entities/category.entity';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  @IsEnum(ProductType)
  @IsNotEmpty()
  productType: ProductType;
}
