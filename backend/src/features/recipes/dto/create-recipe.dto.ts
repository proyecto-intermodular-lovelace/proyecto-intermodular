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
