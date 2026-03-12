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
