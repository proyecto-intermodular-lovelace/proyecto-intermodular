import {
  IsString,
  MinLength,
  MaxLength,
  IsEnum,
  IsNumber,
  Min,
  IsOptional,
} from 'class-validator';

export class UpdateRecipeDto {
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  @IsOptional()
  name?: string;

  @IsString()
  @MaxLength(2000)
  @IsOptional()
  description?: string;

  @IsString()
  @MaxLength(600000)
  @IsOptional()
  dishImageUrl?: string;

  @IsString()
  @MaxLength(8000)
  @IsOptional()
  elaboration?: string;

  @IsString()
  @MaxLength(4000)
  @IsOptional()
  presentation?: string;

  @IsString()
  @MaxLength(4000)
  @IsOptional()
  requiredEquipment?: string;

  @IsString()
  @MaxLength(200)
  @IsOptional()
  restaurantName?: string;

  @IsString()
  @MaxLength(100)
  @IsOptional()
  categoryName?: string;

  @IsString()
  @IsOptional()
  preparedAt?: string;

  @IsString()
  @MaxLength(100)
  @IsOptional()
  portionSize?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  servingsCount?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  publicSalePrice?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  taxPercent?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  netSalePrice?: number;

  @IsString()
  @MaxLength(100)
  @IsOptional()
  serviceTemperature?: string;

  @IsEnum(['FACIL', 'MEDIA', 'DIFICIL'])
  @IsOptional()
  difficulty?: string;

  @IsNumber()
  @Min(0.1)
  @IsOptional()
  yieldQuantity?: number;

  @IsString()
  @IsOptional()
  yieldUnit?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  prepTime?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  cookTime?: number;
}
