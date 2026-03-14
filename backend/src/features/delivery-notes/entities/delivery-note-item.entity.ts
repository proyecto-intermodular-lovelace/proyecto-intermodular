import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('delivery_note_items')
export class DeliveryNoteItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'delivery_note_id' })
  deliveryNoteId: string;

  @ManyToOne('DeliveryNote', 'items', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'delivery_note_id' })
  deliveryNote: any;

  @Column({ type: 'uuid', name: 'product_id' })
  productId: string;

  @Column({ type: 'numeric', precision: 12, scale: 3, name: 'qty_received' })
  qtyReceived: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, name: 'unit_price', nullable: true })
  unitPrice: number | null;
}
