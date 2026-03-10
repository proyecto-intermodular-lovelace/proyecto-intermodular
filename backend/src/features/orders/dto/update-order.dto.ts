import {
  IsOptional,
  IsDateString,
  IsUUID,
  IsIn,
  IsArray,
  ValidateNested,
  IsNumber,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from '../entities/order.entity';

const ALL_STATUSES = [
  'DRAFT',
  'SUBMITTED',
  'APPROVED',
  'MERGED',
  'ORDERED',
  'RECEIVED',
  'CANCELLED',
];

export class UpdateOrderItemInput {
  @IsUUID()
  productId: string;

  @IsNumber()
  @Min(0.001)
  qtyRequested: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  qtyApproved?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateOrderDto {
  @IsOptional()
  @IsIn(ALL_STATUSES)
  status?: OrderStatus;

  @IsOptional()
  @IsDateString()
  weekStart?: string;

  @IsOptional()
  @IsUUID()
  supplierId?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  /**
   * Si se provee, reemplaza TODOS los items del pedido con esta lista.
   * Si no se provee, los items no se modifican.
   */
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateOrderItemInput)
  items?: UpdateOrderItemInput[];
}

