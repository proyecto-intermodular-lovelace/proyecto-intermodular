import { IsUUID, IsNumber, Min } from 'class-validator';

export class CreateRecipeItemDto {
  @IsUUID()
  productId: string;

  @IsNumber()
  @Min(0.01)
  quantity: number;
}
