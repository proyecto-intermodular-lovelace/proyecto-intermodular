import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderItemDto } from './dto/create-order-item.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';

@Injectable()
export class OrderItemsService {
  constructor(
    @InjectRepository(OrderItem)
    private readonly orderItemsRepository: Repository<OrderItem>,
  ) {}

  async create(createOrderItemDto: CreateOrderItemDto): Promise<OrderItem> {
    const orderItem = this.orderItemsRepository.create(createOrderItemDto);
    return this.orderItemsRepository.save(orderItem);
  }

  async findAll(): Promise<OrderItem[]> {
    return this.orderItemsRepository.find({
      relations: ['product'],
      order: {},
    });
  }

  async findOne(id: string): Promise<OrderItem> {
    const orderItem = await this.orderItemsRepository.findOne({
      where: { id },
      relations: ['product'],
    });

    if (!orderItem) {
      throw new NotFoundException(`OrderItem con ID ${id} no encontrado`);
    }

    return orderItem;
  }

  async findByOrderId(orderId: string): Promise<OrderItem[]> {
    return this.orderItemsRepository.find({
      where: { orderId },
      relations: ['product'],
      order: {},
    });
  }

  async update(id: string, updateOrderItemDto: UpdateOrderItemDto): Promise<OrderItem> {
    await this.findOne(id);
    await this.orderItemsRepository.update(id, updateOrderItemDto);
    return this.findOne(id);
  }

  async delete(id: string): Promise<void> {
    await this.findOne(id);
    await this.orderItemsRepository.delete(id);
  }

  async deleteByOrderId(orderId: string): Promise<void> {
    await this.orderItemsRepository.delete({ orderId });
  }
}
