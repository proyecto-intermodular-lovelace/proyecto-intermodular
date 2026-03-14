import {
  IsString,
  MinLength,
  MaxLength,
  IsEnum,
  IsNumber,
  Min,
  IsOptional,
} from 'class-validator';

export class CreateRecipeDto {
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(600000)
  dishImageUrl?: string;

  @IsString()
  @IsOptional()
  @MaxLength(8000)
  elaboration?: string;

  @IsString()
  @IsOptional()
  @MaxLength(4000)
  presentation?: string;

  @IsString()
  @IsOptional()
  @MaxLength(4000)
  requiredEquipment?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  restaurantName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  categoryName?: string;

  @IsString()
  @IsOptional()
  preparedAt?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
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
  @IsOptional()
  @MaxLength(100)
  serviceTemperature?: string;

  @IsEnum(['FACIL', 'MEDIA', 'DIFICIL'])
  difficulty: string;

  @IsNumber()
  @Min(0.1)
  yieldQuantity: number;

  @IsString()
  yieldUnit: string;

  @IsNumber()
  @Min(0)
  prepTime: number;

  @IsNumber()
  @Min(0)
  cookTime: number;
}
