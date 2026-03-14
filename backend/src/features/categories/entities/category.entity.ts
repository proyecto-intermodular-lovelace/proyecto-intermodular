import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';

export enum ProductType {
  INGREDIENT = 'INGREDIENT',
  MATERIAL = 'MATERIAL',
}

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 120 })
  name: string;

  @Column({ type: 'enum', enum: ProductType, enumName: 'product_type', name: 'product_type' })
  productType: ProductType;
}
