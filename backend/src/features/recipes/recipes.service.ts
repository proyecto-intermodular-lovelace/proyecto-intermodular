import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Recipe } from './entities/recipe.entity';
import { RecipeItem } from './entities/recipe-item.entity';
import { RecipeAllergen } from './entities/recipe-allergen.entity';
import { Product, ProductType } from '../products/entities/product.entity';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { CreateRecipeItemDto } from './dto/create-recipe-item.dto';

@Injectable()
export class RecipesService {
  constructor(
    @InjectRepository(Recipe)
    private readonly recipesRepo: Repository<Recipe>,
    @InjectRepository(RecipeItem)
    private readonly itemsRepo: Repository<RecipeItem>,
    @InjectRepository(RecipeAllergen)
    private readonly allergensRepo: Repository<RecipeAllergen>,
    @InjectRepository(Product)
    private readonly productsRepo: Repository<Product>,
  ) {}

  async getIngredients(): Promise<Product[]> {
    // Obtener solo ingredientes (productos tipo INGREDIENT)
    // Sin usar PaginationService para evitar errores de columna supplier_id
    return this.productsRepo.find({
      where: { 
        productType: ProductType.INGREDIENT,
      },
      order: { name: 'ASC' },
      take: 1000,
    });
  }

  async findAll(): Promise<Recipe[]> {
    return this.recipesRepo
      .createQueryBuilder('recipe')
      .leftJoinAndSelect('recipe.items', 'items')
      .leftJoinAndSelect('recipe.allergens', 'allergens')
      .orderBy('recipe.createdAt', 'DESC')
      .getMany();
  }

  async findOne(id: string): Promise<Recipe> {
    const recipe = await this.recipesRepo
      .createQueryBuilder('recipe')
      .where('recipe.id = :id', { id })
      .leftJoinAndSelect('recipe.items', 'items')
      .leftJoinAndSelect('recipe.allergens', 'allergens')
      .getOne();
    
    if (!recipe) {
      throw new NotFoundException(`Receta con ID ${id} no encontrada`);
    }
    
    // Cargar los productos asociados a cada item
    if (recipe.items && recipe.items.length > 0) {
      for (const item of recipe.items) {
        const product = await this.productsRepo.findOne({
          where: { id: item.productId },
        });
        if (product) {
          item.product = product;
        }
      }
    }
    
    return recipe;
  }

  async create(dto: CreateRecipeDto): Promise<Recipe> {
    if (!dto.name || dto.name.length < 2) {
      throw new BadRequestException('Nombre requerido (mínimo 2 caracteres)');
    }
    if (!['FACIL', 'MEDIA', 'DIFICIL'].includes(dto.difficulty)) {
      throw new BadRequestException('Dificultad inválida');
    }

    const code = `REC-${Date.now()}`;
    const recipe = this.recipesRepo.create({
      ...dto,
      code,
    });

    return this.recipesRepo.save(recipe);
  }

  async update(id: string, dto: UpdateRecipeDto): Promise<Recipe> {
    await this.findOne(id);

    if (dto.difficulty && !['FACIL', 'MEDIA', 'DIFICIL'].includes(dto.difficulty)) {
      throw new BadRequestException('Dificultad inválida');
    }

    if (dto.name && dto.name.length < 2) {
      throw new BadRequestException('Nombre debe tener mínimo 2 caracteres');
    }

    await this.recipesRepo.update(id, dto);
    return this.findOne(id);
  }

  async delete(id: string): Promise<void> {
    await this.findOne(id);
    await this.recipesRepo.delete(id);
  }

  async addItem(recipeId: string, dto: CreateRecipeItemDto): Promise<RecipeItem> {
    const recipe = await this.findOne(recipeId);

    const product = await this.productsRepo.findOne({
      where: { id: dto.productId },
    });

    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    const item = this.itemsRepo.create({
      recipeId,
      productId: dto.productId,
      quantity: dto.quantity,
      unitPrice: product.unitPrice,
    });

    return this.itemsRepo.save(item);
  }

  async removeItem(recipeId: string, itemId: string): Promise<void> {
    const item = await this.itemsRepo.findOne({
      where: { id: itemId, recipeId },
    });

    if (!item) {
      throw new NotFoundException('Item no encontrado');
    }

    await this.itemsRepo.delete(itemId);
  }

  async syncAllergens(recipeId: string): Promise<RecipeAllergen[]> {
    const recipe = await this.findOne(recipeId);

    // Borrar alérgenos existentes
    await this.allergensRepo.delete({ recipeId });

    // Por ahora, solo retornar vacío
    // La lógica de detección de alérgenos se implementaría aquí
    return [];
  }
}
