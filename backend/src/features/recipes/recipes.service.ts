import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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

  async getIngredients(): Promise<any[]> {
    const products = await this.productsRepo
      .createQueryBuilder('product')
      .where('product.productType = :productType', { productType: ProductType.INGREDIENT })
      .andWhere('product.isActive = :isActive', { isActive: true })
      .orderBy('product.name', 'ASC')
      .limit(1000)
      .getMany();

    return products.map((product) => ({
      id: product.id,
      code: product.code,
      name: product.name,
      description: product.description,
      unitType: product.unitType,
      unitPrice: Number(product.unitPrice),
    }));
  }

  async getMaterials(): Promise<any[]> {
    const products = await this.productsRepo
      .createQueryBuilder('product')
      .where('product.productType = :productType', { productType: ProductType.MATERIAL })
      .andWhere('product.isActive = :isActive', { isActive: true })
      .orderBy('product.name', 'ASC')
      .limit(1000)
      .getMany();

    return products.map((product) => ({
      id: product.id,
      code: product.code,
      name: product.name,
      unitType: product.unitType,
      unitPrice: Number(product.unitPrice),
    }));
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
    // Get recipe using raw query to avoid TypeORM column mapping issues
    const recipes = await this.recipesRepo.query(
      `SELECT 
        id,
        code,
        name,
        description,
        dish_image_url as "dishImageUrl",
        elaboration,
        presentation,
        required_equipment as "requiredEquipment",
        restaurant_name as "restaurantName",
        category_name as "categoryName",
        prepared_at as "preparedAt",
        portion_size as "portionSize",
        servings_count as "servingsCount",
        public_sale_price as "publicSalePrice",
        tax_percent as "taxPercent",
        net_sale_price as "netSalePrice",
        service_temperature as "serviceTemperature",
        difficulty,
        yield_quantity as "yieldQuantity",
        yield_unit as "yieldUnit",
        prep_time as "prepTime",
        cook_time as "cookTime",
        is_active as "isActive",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM public.recipes WHERE id = $1`,
      [id]
    );

    if (!recipes || recipes.length === 0) {
      throw new NotFoundException(`Receta con ID ${id} no encontrada`);
    }

    const recipe = recipes[0];

    // Get items for this recipe
    const itemsRaw = await this.itemsRepo.query(
      `SELECT id, recipe_id, product_id, quantity, unit_price FROM public.recipe_items WHERE recipe_id = $1`,
      [id]
    );
    
    // Map snake_case to camelCase
    const items = itemsRaw.map(item => ({
      id: item.id,
      recipeId: item.recipe_id,
      productId: item.product_id,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unit_price),
      product: null,
    }));

    // Get allergens for this recipe
    const allergens = await this.allergensRepo.query(
      `SELECT id, recipe_id, allergen_name, is_present, created_at FROM public.recipe_allergens WHERE recipe_id = $1`,
      [id]
    );

    const normalizedAllergens = allergens.map((allergen) => ({
      id: allergen.id,
      recipeId: allergen.recipe_id,
      allergenName: allergen.allergen_name,
      name: allergen.allergen_name,
      isPresent: allergen.is_present,
      createdAt: allergen.created_at,
    }));

    // Load products for each item
    if (items && items.length > 0) {
      for (const item of items) {
        const product = await this.productsRepo.findOne({
          where: { id: item.productId },
        });
        if (product) {
          item.product = {
            id: product.id,
            code: product.code,
            name: product.name,
            description: product.description,
            unitType: product.unitType,
            unitPrice: Number(product.unitPrice),
            productType: product.productType,
          };
        }
      }
    }

    recipe.items = items;
    recipe.allergens = normalizedAllergens;

    return recipe as Recipe;
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
    await this.findOne(recipeId);

    const product = await this.productsRepo.findOne({
      where: { id: dto.productId },
    });

    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    const unitPrice = Number(product.unitPrice);

    const item = this.itemsRepo.create({
      recipeId,
      productId: dto.productId,
      quantity: dto.quantity,
      unitPrice: unitPrice,
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
    await this.findOne(recipeId);

    // Borrar alérgenos existentes
    await this.allergensRepo.delete({ recipeId });

    // Por ahora, solo retornar vacío
    // La lógica de detección de alérgenos se implementaría aquí
    return [];
  }

  async addAllergen(recipeId: string, allergenId: string): Promise<RecipeAllergen> {
    await this.findOne(recipeId);

    // Get allergen name from allergens table
    const allergenResult = await this.allergensRepo.query(
      'SELECT name FROM public.allergens WHERE id = $1',
      [allergenId]
    );

    if (!allergenResult || allergenResult.length === 0) {
      throw new NotFoundException('Alérgeno no encontrado');
    }

    const allergenName = allergenResult[0].name;

    const allergen = this.allergensRepo.create({
      recipeId,
      allergenName,
    });

    return this.allergensRepo.save(allergen);
  }

  async removeAllergen(recipeId: string, allergenId: string): Promise<void> {
    await this.allergensRepo.delete({ id: allergenId, recipeId });
  }
}
