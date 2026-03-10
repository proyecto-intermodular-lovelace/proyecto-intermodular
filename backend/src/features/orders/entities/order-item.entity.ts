import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Order } from './order.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('order_items')
@Index(['orderId'])
@Index(['productId'])
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'order_id' })
  orderId: string;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ type: 'uuid', name: 'product_id' })
  productId: string;

  @ManyToOne(() => Product, { onDelete: 'RESTRICT', eager: false })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'decimal', precision: 12, scale: 3, name: 'qty_requested' })
  qtyRequested: number;

  @Column({ type: 'decimal', precision: 12, scale: 3, name: 'qty_approved', nullable: true })
  qtyApproved: number | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;
}
