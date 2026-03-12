import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum ImportJobStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  DONE = 'DONE',
  FAILED = 'FAILED',
}

@Entity('import_jobs')
export class ImportJob {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  filename: string;

  @Column({ type: 'text' })
  content: string; // base64 encoded or raw text

  @Column({ type: 'enum', enum: ImportJobStatus, name: 'status' })
  status: ImportJobStatus;

  @Column({ type: 'integer', name: 'total_rows', default: 0 })
  totalRows: number;

  @Column({ type: 'integer', name: 'processed', default: 0 })
  processed: number;

  @Column({ type: 'integer', name: 'created_count', default: 0 })
  createdCount: number;

  @Column({ type: 'integer', name: 'updated_count', default: 0 })
  updatedCount: number;

  @Column({ type: 'jsonb', nullable: true })
  errors: any[] | null;

  @Column({ type: 'varchar', length: 500, name: 'result_path', nullable: true })
  resultPath: string | null;

  @Column({ type: 'uuid', name: 'created_by', nullable: true })
  createdBy: string | null;

  @Column({ type: 'varchar', length: 20, name: 'default_product_type', nullable: true })
  defaultProductType: string | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;
}
