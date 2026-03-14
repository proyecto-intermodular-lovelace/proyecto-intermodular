import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';

@Entity('recipes')
@Index(['code'], { unique: true })
export class Recipe {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 30, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true, name: 'dish_image_url' })
  dishImageUrl: string;

  @Column({ type: 'text', nullable: true, name: 'elaboration' })
  elaboration: string;

  @Column({ type: 'text', nullable: true, name: 'presentation' })
  presentation: string;

  @Column({ type: 'text', nullable: true, name: 'required_equipment' })
  requiredEquipment: string;

  @Column({ type: 'varchar', length: 200, nullable: true, name: 'restaurant_name' })
  restaurantName: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'category_name' })
  categoryName: string;

  @Column({ type: 'date', nullable: true, name: 'prepared_at' })
  preparedAt: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'portion_size' })
  portionSize: string;

  @Column({ type: 'int', nullable: true, name: 'servings_count' })
  servingsCount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'public_sale_price' })
  publicSalePrice: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true, name: 'tax_percent' })
  taxPercent: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'net_sale_price' })
  netSalePrice: number;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'service_temperature' })
  serviceTemperature: string;

  @Column({ type: 'enum', enum: ['FACIL', 'MEDIA', 'DIFICIL'] })
  difficulty: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'yield_quantity' })
  yieldQuantity: number;

  @Column({ type: 'varchar', length: 50, name: 'yield_unit' })
  yieldUnit: string;

  @Column({ type: 'int', name: 'prep_time' })
  prepTime: number;

  @Column({ type: 'int', name: 'cook_time' })
  cookTime: number;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => RecipeItem, (item) => item.recipe, { cascade: true })
  items: RecipeItem[];

  @OneToMany(() => RecipeAllergen, (allergen) => allergen.recipe, { cascade: true })
  allergens: RecipeAllergen[];
}

import { RecipeItem } from './recipe-item.entity';
import { RecipeAllergen } from './recipe-allergen.entity';
