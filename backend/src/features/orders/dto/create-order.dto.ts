import { IsString, IsOptional, IsUUID, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({
    example: '2025-01-06',
    description: 'Fecha de inicio de la semana del pedido (lunes)',
  })
  @IsDateString()
  weekStart: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'UUID de la clase que genera el pedido',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  classId?: string;

  @ApiProperty({
    example: 'Necesitamos los ingredientes para la práctica de pastelería',
    description: 'Notas adicionales del pedido',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
