import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Recipe } from './recipe.entity';

@Entity('recipe_allergens')
export class RecipeAllergen {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'recipe_id' })
  recipeId: string;

  @ManyToOne(() => Recipe, (recipe) => recipe.allergens, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'recipe_id' })
  recipe: Recipe;

  @Column({ type: 'varchar', length: 100, name: 'allergen_name' })
  allergenName: string;

  @Column({ type: 'boolean', default: true, name: 'is_present' })
  isPresent: boolean;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;
}
