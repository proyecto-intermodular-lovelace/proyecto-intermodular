import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

// Schema: id | name | contact_email | phone | notes | is_active | created_at
@Entity('suppliers')
export class Supplier {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'name', type: 'varchar', length: 200, unique: true })
  nombre: string;

  @Column({ name: 'contact_email', type: 'varchar', length: 255, nullable: true })
  email: string | null;

  @Column({ name: 'phone', type: 'varchar', length: 50, nullable: true })
  telefono: string | null;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notas: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  activo: boolean;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;
}
