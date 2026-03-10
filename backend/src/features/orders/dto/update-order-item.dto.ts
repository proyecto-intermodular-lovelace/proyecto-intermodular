import { IsNumber, IsPositive, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateOrderItemDto {
  @ApiProperty({ required: false, example: 3.0 })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  qtyApproved?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
