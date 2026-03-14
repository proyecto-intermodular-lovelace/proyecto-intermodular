import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Patch,
  Delete,
  Query,
  ParseUUIDPipe,
  UseInterceptors,
  ClassSerializerInterceptor,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/role.enum';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { PaginatedResponse } from '../../common/dto/paginated-response.interface';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@ApiTags('Products')
@Controller('products')
@UseInterceptors(ClassSerializerInterceptor)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  @ApiOperation({ summary: 'Obtener todos los productos con paginación' })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de productos',
  })
  @Get()
  async findAll(
    @Query() paginationDto: PaginationQueryDto,
    @Query('type') type?: string,
  ): Promise<PaginatedResponse<Product>> {
    return this.productsService.findAllPaginated(paginationDto, type);
  }

  @ApiOperation({ summary: 'Obtener producto por ID' })
  @ApiResponse({
    status: 200,
    description: 'Producto encontrado',
    type: Product,
  })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  @Get(':id')
  async findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<Product> {
    return this.productsService.findOne(id);
  }

  @ApiOperation({ summary: 'Obtener producto por SKU' })
  @Get('sku/:sku')
  async findBySku(@Param('sku') sku: string): Promise<Product | null> {
    return this.productsService.findBySku(sku);
  }

  @ApiOperation({ summary: 'Crear nuevo producto (ADMIN)' })
  @ApiResponse({
    status: 201,
    description: 'Producto creado',
    type: Product,
  })
  @ApiBearerAuth('jwt')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @Post()
  async createProduct(@Req() req: any, @Body() createProductDto: CreateProductDto): Promise<Product> {
    // Attach authenticated user as creator if available
    try {
      const userId = req?.user?.userId
      if (userId) {
        createProductDto.createdBy = userId
      }
    } catch (e) {
      // ignore
    }
    return this.productsService.create(createProductDto);
  }

  @ApiOperation({ summary: 'Actualizar producto (ADMIN)' })
  @ApiResponse({
    status: 200,
    description: 'Producto actualizado',
    type: Product,
  })
  @ApiBearerAuth('jwt')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @Put(':id')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    return this.productsService.update(id, updateProductDto);
  }

  @ApiOperation({ summary: 'Actualizar stock del producto (ADMIN)' })
  @ApiBearerAuth('jwt')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @Patch(':id/stock')
  async updateStock(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: { cantidad: number },
  ): Promise<Product> {
    return this.productsService.updateStock(id, body.cantidad);
  }

  @ApiOperation({ summary: 'Desactivar producto (ADMIN)' })
  @ApiBearerAuth('jwt')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @Patch(':id/deactivate')
  async deactivate(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<Product> {
    return this.productsService.deactivate(id);
  }

  @ApiOperation({ summary: 'Eliminar producto (SUPERADMIN)' })
  @ApiBearerAuth('jwt')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPERADMIN)
  @Delete(':id')
  async delete(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return this.productsService.delete(id);
  }
}
