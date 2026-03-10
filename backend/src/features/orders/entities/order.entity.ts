import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { OrderItem } from './order-item.entity';

export enum OrderStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  MERGED = 'MERGED',
  ORDERED = 'ORDERED',
  RECEIVED = 'RECEIVED',
  CANCELLED = 'CANCELLED',
}

@Entity('orders')
@Index(['createdAt'])
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'created_by' })
  createdBy: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT', eager: false })
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @Column({ type: 'uuid', name: 'class_id', nullable: true })
  classId: string | null;

  @Column({ type: 'uuid', name: 'supplier_id', nullable: true })
  supplierId: string | null;

  @Column({ type: 'varchar', length: 20, name: 'status', default: 'DRAFT' })
  status: OrderStatus;

  @Column({ type: 'date', name: 'week_start' })
  weekStart: string;

  @Column({ type: 'uuid', name: 'merged_into_order_id', nullable: true })
  mergedIntoOrderId: string | null;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: false })
  items: OrderItem[];

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
