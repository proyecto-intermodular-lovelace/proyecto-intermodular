import { IsArray, IsOptional, IsString, IsDateString, IsUUID, ValidateNested, IsNumber, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class OrderItemInput {
  @ApiProperty({ example: '987e6543-e89b-12d3-a456-426614174000' })
  @IsUUID()
  productId: string;

  @ApiProperty({ example: 2.5 })
  @IsNumber()
  @IsPositive()
  qtyRequested: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateOrderWithItemsDto {
  @ApiProperty({ example: '2025-01-06', description: 'Fecha de inicio de la semana (lunes)' })
  @IsDateString()
  weekStart: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', required: false })
  @IsOptional()
  @IsUUID()
  classId?: string;

  @ApiProperty({ example: 'Pedido semanal de repostería', required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ 
    type: [OrderItemInput],
    description: 'Items del pedido'
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => OrderItemInput)
  items?: OrderItemInput[];
}
