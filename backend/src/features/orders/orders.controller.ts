import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
  Req,
  ParseUUIDPipe,
  UseInterceptors,
  ClassSerializerInterceptor,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import type { Request } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/role.enum';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { OrdersService } from './orders.service';
import { Order, OrderStatus } from './entities/order.entity';
import { CreateOrderWithItemsDto } from './dto/create-order-with-items.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@ApiTags('Orders')
@ApiBearerAuth('jwt')
@Controller('orders')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /**
   * GET /orders
   * SUPERADMIN/ADMIN: todos los pedidos (opcionalmente filtrados por status)
   * USER: solo sus propios pedidos
   */
  @ApiOperation({ summary: 'Listar pedidos (filtrados por rol)' })
  @Get()
  async findAll(
    @Query() paginationDto: PaginationQueryDto,
    @Query('status') status: OrderStatus | undefined,
    @Req() req: Request,
  ) {
    const user = req.user as { userId: string; role: UserRole };

    if (user.role === UserRole.USER) {
      return this.ordersService.findByCreator(user.userId, paginationDto);
    }

    return this.ordersService.findAllPaginated(paginationDto, status);
  }

  /**
   * GET /orders/:id
   */
  @ApiOperation({ summary: 'Obtener pedido por ID' })
  @Get(':id')
  async findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: Request,
  ): Promise<Order> {
    const order = await this.ordersService.findOne(id);
    const user = req.user as { userId: string; role: UserRole };

    // Users can only see their own orders
    if (user.role === UserRole.USER && order.createdBy !== user.userId) {
      throw new ForbiddenException('No tienes permiso para ver este pedido');
    }

    return order;
  }

  /**
   * POST /orders
   * Crea un pedido con items (DRAFT)
   */
  @ApiOperation({ summary: 'Crear nuevo pedido con items' })
  @Post()
  async create(
    @Body() dto: CreateOrderWithItemsDto,
    @Req() req: Request,
  ): Promise<Order> {
    const user = req.user as { userId: string; role: UserRole };
    const { items, ...orderData } = dto;

    if (items && items.length > 0) {
      return this.ordersService.createWithItems(orderData, items, user.userId);
    }
    return this.ordersService.create(orderData, user.userId);
  }

  /**
   * PATCH /orders/:id/submit
   * Alumno envía su pedido al profesor (DRAFT → SUBMITTED)
   */
  @ApiOperation({ summary: 'Enviar pedido al profesor' })
  @Patch(':id/submit')
  async submit(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: Request,
  ): Promise<Order> {
    const user = req.user as { userId: string; role: UserRole };
    return this.ordersService.submit(id, user.userId);
  }

  /**
   * PATCH /orders/:id/approve
   * Profesor aprueba el pedido (SUBMITTED → APPROVED)
   */
  @ApiOperation({ summary: 'Aprobar pedido (ADMIN)' })
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @Patch(':id/approve')
  async approve(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<Order> {
    return this.ordersService.approve(id);
  }

  /**
   * PATCH /orders/:id/reject
   * Profesor rechaza el pedido (SUBMITTED → CANCELLED)
   */
  @ApiOperation({ summary: 'Rechazar pedido (ADMIN)' })
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @Patch(':id/reject')
  async reject(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<Order> {
    return this.ordersService.reject(id);
  }

  /**
   * POST /orders/consolidate
   * SUPERADMIN consolida pedidos APPROVED en un pedido unificado
   */
  @ApiOperation({ summary: 'Consolidar pedidos aprobados (SUPERADMIN)' })
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPERADMIN)
  @Post('consolidate')
  async consolidate(
    @Body() body: { orderIds: string[]; weekStart: string; supplierId?: string },
    @Req() req: Request,
  ): Promise<Order> {
    const user = req.user as { userId: string; role: UserRole };
    return this.ordersService.consolidate(
      body.orderIds,
      body.weekStart,
      body.supplierId,
      user.userId,
    );
  }

  /**
   * PATCH /orders/:id/cancel
   * Alumno cancela su propio pedido en DRAFT
   */
  @ApiOperation({ summary: 'Cancelar pedido propio' })
  @Patch(':id/cancel')
  async cancel(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: Request,
  ): Promise<Order> {
    const user = req.user as { userId: string; role: UserRole };
    return this.ordersService.cancel(id, user.userId);
  }

  /**
   * PATCH /orders/:id
   * SUPERADMIN edita libremente cualquier pedido (estado, semana, items)
   */
  @ApiOperation({ summary: 'Editar pedido completo (ADMIN+)' })
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @Patch(':id')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateOrderDto,
  ): Promise<Order> {
    return this.ordersService.updateForEconomato(id, dto);
  }

  /**
   * DELETE /orders/:id (SUPERADMIN)
   */
  @ApiOperation({ summary: 'Eliminar pedido (SUPERADMIN)' })
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPERADMIN)
  @Delete(':id')
  async delete(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return this.ordersService.delete(id);
  }
}
