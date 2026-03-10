import {
  IsString,
  IsOptional,
  IsEmail,
  IsBoolean,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSupplierDto {
  @ApiProperty({ example: 'Distribuciones García S.L.', description: 'Nombre del proveedor' })
  @IsString({ message: 'El nombre debe ser texto' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(200, { message: 'El nombre no puede superar 200 caracteres' })
  nombre: string;

  @ApiProperty({ example: 'contacto@garcia.es', description: 'Email de contacto', required: false })
  @IsOptional()
  @IsEmail({}, { message: 'El email no es válido' })
  @MaxLength(255)
  email?: string;

  @ApiProperty({ example: '+34 612 345 678', description: 'Teléfono', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  telefono?: string;

  @ApiProperty({ example: 'Proveedor de confianza desde 2019', description: 'Notas internas', required: false })
  @IsOptional()
  @IsString()
  notas?: string;

  @ApiProperty({ example: true, description: 'Estado activo', required: false })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
