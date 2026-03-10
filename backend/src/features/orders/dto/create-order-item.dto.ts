import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, IsUUID, IsOptional, IsString } from 'class-validator';

export class CreateOrderItemDto {
  @ApiProperty({ 
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID del pedido'
  })
  @IsUUID()
  orderId: string;

  @ApiProperty({ 
    example: '987e6543-e89b-12d3-a456-426614174000',
    description: 'ID del producto'
  })
  @IsUUID()
  productId: string;

  @ApiProperty({ 
    example: 2.5,
    description: 'Cantidad solicitada'
  })
  @IsNumber()
  @IsPositive()
  qtyRequested: number;

  @ApiProperty({ 
    example: 'Para practica del martes',
    description: 'Notas adicionales del item',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
