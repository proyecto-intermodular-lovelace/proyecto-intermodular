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
