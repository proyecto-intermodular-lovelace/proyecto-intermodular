import { IsString, IsOptional, IsUUID, IsDateString, IsArray, ValidateNested, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDeliveryNoteItemDto {
  @ApiProperty({ description: 'UUID del producto' })
  @IsUUID()
  productId: string;

  @ApiProperty({ description: 'Cantidad recibida', example: 10 })
  @IsNumber()
  @Min(0.001)
  qtyReceived: number;

  @ApiProperty({ description: 'Precio unitario', required: false })
  @IsOptional()
  @IsNumber()
  unitPrice?: number;
}

export class CreateDeliveryNoteDto {
  @ApiProperty({ example: 'ALB-2026-001', description: 'Código único del albarán', required: false })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({ description: 'UUID del pedido asociado', required: false })
  @IsOptional()
  @IsUUID()
  orderId?: string;

  @ApiProperty({ description: 'UUID del proveedor' })
  @IsUUID()
  supplierId: string;

  @ApiProperty({ description: 'Fecha/hora de recepción', example: '2026-03-11T10:00:00Z' })
  @IsDateString()
  receivedAt: string;

  @ApiProperty({ description: 'Líneas del albarán', type: [CreateDeliveryNoteItemDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDeliveryNoteItemDto)
  items?: CreateDeliveryNoteItemDto[];
}
