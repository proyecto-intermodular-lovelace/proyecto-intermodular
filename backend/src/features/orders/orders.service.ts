import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { PaginatedResponse } from '../../common/dto/paginated-response.interface';
import { PaginationService } from '../../common/services/pagination.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemsRepository: Repository<OrderItem>,
    private readonly paginationService: PaginationService,
    private readonly dataSource: DataSource,
  ) {}

  async findAllPaginated(
    paginationDto: PaginationQueryDto,
    statusFilter?: OrderStatus,
  ): Promise<PaginatedResponse<Order>> {
    const qb = this.ordersRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.creator', 'creator')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .orderBy('order.createdAt', 'DESC');

    if (statusFilter) {
      qb.where('order.status = :status', { status: statusFilter });
    }

    return this.paginationService.paginate<Order>(qb, paginationDto);
  }

  async findByCreator(
    userId: string,
    paginationDto: PaginationQueryDto,
  ): Promise<PaginatedResponse<Order>> {
    const qb = this.ordersRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.creator', 'creator')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .where('order.createdBy = :userId', { userId })
      .orderBy('order.createdAt', 'DESC');

    return this.paginationService.paginate<Order>(qb, paginationDto);
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: ['items', 'items.product', 'creator'],
    });

    if (!order) {
      throw new NotFoundException(`Pedido con ID ${id} no encontrado`);
    }

    return order;
  }

  async create(createOrderDto: CreateOrderDto, createdBy: string): Promise<Order> {
    const order = this.ordersRepository.create({
      createdBy,
      classId: createOrderDto.classId ?? null,
      weekStart: createOrderDto.weekStart,
      status: OrderStatus.DRAFT,
    });
    const saved = await this.ordersRepository.save(order);
    return this.findOne(saved.id);
  }

  async createWithItems(
    dto: CreateOrderDto,
    items: Array<{ productId: string; qtyRequested: number; notes?: string }>,
    createdBy: string,
  ): Promise<Order> {
    let savedOrderId: string;

    await this.dataSource.transaction(async (manager) => {
      const order = manager.create(Order, {
        createdBy,
        classId: dto.classId ?? null,
        weekStart: dto.weekStart,
        status: OrderStatus.DRAFT,
      });
      const savedOrder = await manager.save(order);
      savedOrderId = savedOrder.id;

      for (const item of items) {
        const orderItem = manager.create(OrderItem, {
          orderId: savedOrder.id,
          productId: item.productId,
          qtyRequested: item.qtyRequested,
          notes: item.notes ?? null,
        });
        await manager.save(orderItem);
      }
    });

    return this.findOne(savedOrderId!);
  }

  async submit(id: string, requestingUserId: string): Promise<Order> {
    const order = await this.findOne(id);

    if (order.createdBy !== requestingUserId) {
      throw new ForbiddenException('Solo el creador del pedido puede enviarlo');
    }
    if (order.status !== OrderStatus.DRAFT) {
      throw new BadRequestException(`El pedido esta en estado "${order.status}" y no puede ser enviado`);
    }
    if (!order.items || order.items.length === 0) {
      throw new BadRequestException('El pedido no tiene items; anyade al menos un producto');
    }

    await this.ordersRepository.update(id, { status: OrderStatus.SUBMITTED });
    return this.findOne(id);
  }

  async approve(id: string): Promise<Order> {
    const order = await this.findOne(id);

    if (order.status !== OrderStatus.SUBMITTED) {
      throw new BadRequestException(`El pedido esta en estado "${order.status}" y no puede ser aprobado`);
    }

    await this.ordersRepository.update(id, { status: OrderStatus.APPROVED });
    return this.findOne(id);
  }

  async reject(id: string): Promise<Order> {
    const order = await this.findOne(id);

    if (order.status !== OrderStatus.SUBMITTED) {
      throw new BadRequestException(`El pedido esta en estado "${order.status}" y no puede ser rechazado`);
    }

    await this.ordersRepository.update(id, { status: OrderStatus.CANCELLED });
    return this.findOne(id);
  }

  async consolidate(
    orderIds: string[],
    weekStart: string,
    supplierId: string | undefined,
    consolidatedBy: string,
  ): Promise<Order> {
    if (!orderIds.length) {
      throw new BadRequestException('Debes seleccionar al menos un pedido para consolidar');
    }

    let savedConsolidatedId: string;

    await this.dataSource.transaction(async (manager) => {
      const orders = await manager.find(Order, {
        where: { id: In(orderIds) },
        relations: ['items', 'items.product'],
      });

      if (orders.length !== orderIds.length) {
        throw new NotFoundException('Alguno de los pedidos no existe');
      }

      const notApproved = orders.filter((o) => o.status !== OrderStatus.APPROVED);
      if (notApproved.length > 0) {
        throw new BadRequestException(`Pedidos no aprobados: ${notApproved.map((o) => o.id).join(', ')}`);
      }

      const consolidated = manager.create(Order, {
        createdBy: consolidatedBy,
        classId: null,
        supplierId: supplierId ?? null,
        weekStart,
        status: OrderStatus.ORDERED,
      });
      const savedConsolidated = await manager.save(consolidated);
      savedConsolidatedId = savedConsolidated.id;

      const itemMap = new Map<string, { productId: string; qtyRequested: number; notes: string[] }>();
      for (const order of orders) {
        for (const item of order.items) {
          const existing = itemMap.get(item.productId);
          if (existing) {
            existing.qtyRequested += Number(item.qtyRequested);
            if (item.notes) existing.notes.push(item.notes);
          } else {
            itemMap.set(item.productId, {
              productId: item.productId,
              qtyRequested: Number(item.qtyRequested),
              notes: item.notes ? [item.notes] : [],
            });
          }
        }
      }

      for (const [, item] of itemMap) {
        const consolidatedItem = manager.create(OrderItem, {
          orderId: savedConsolidated.id,
          productId: item.productId,
          qtyRequested: item.qtyRequested,
          notes: item.notes.join('; ') || null,
        });
        await manager.save(consolidatedItem);
      }

      await manager.update(Order, { id: In(orderIds) }, {
        status: OrderStatus.MERGED,
        mergedIntoOrderId: savedConsolidated.id,
      });
    });

    return this.findOne(savedConsolidatedId!);
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    await this.findOne(id);
    await this.ordersRepository.update(id, { status });
    return this.findOne(id);
  }

  async cancel(id: string, requestingUserId: string): Promise<Order> {
    const order = await this.findOne(id);

    if (order.createdBy !== requestingUserId) {
      throw new ForbiddenException('Solo el creador puede cancelar su pedido');
    }
    if (order.status !== OrderStatus.DRAFT) {
      throw new BadRequestException(`No se puede cancelar un pedido en estado "${order.status}"`);
    }

    await this.ordersRepository.update(id, { status: OrderStatus.CANCELLED });
    return this.findOne(id);
  }

  async delete(id: string): Promise<void> {
    await this.findOne(id);
    await this.ordersRepository.delete(id);
  }

  async updateForEconomato(id: string, dto: UpdateOrderDto): Promise<Order> {
    await this.findOne(id); // ensure exists

    await this.dataSource.transaction(async (manager) => {
      const updates: Partial<Order> = {};
      if (dto.status !== undefined) updates.status = dto.status;
      if (dto.weekStart !== undefined) updates.weekStart = dto.weekStart;
      if (dto.supplierId !== undefined) updates.supplierId = dto.supplierId;

      if (Object.keys(updates).length > 0) {
        await manager.update(Order, id, updates);
      }

      if (dto.items !== undefined) {
        // Replace all items for this order
        await manager.delete(OrderItem, { orderId: id });
        for (const item of dto.items) {
          const newItem = manager.create(OrderItem, {
            orderId: id,
            productId: item.productId,
            qtyRequested: item.qtyRequested,
            qtyApproved: item.qtyApproved ?? null,
            notes: item.notes ?? null,
          });
          await manager.save(newItem);
        }
      }
    });

    return this.findOne(id);
  }
}
