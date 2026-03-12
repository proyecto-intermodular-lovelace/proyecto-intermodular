import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  ParseUUIDPipe,
  UseInterceptors,
  ClassSerializerInterceptor,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/role.enum';
import { RecipesService } from './recipes.service';
import { Recipe } from './entities/recipe.entity';
import { RecipeItem } from './entities/recipe-item.entity';
import { RecipeAllergen } from './entities/recipe-allergen.entity';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { CreateRecipeItemDto } from './dto/create-recipe-item.dto';
import { Product } from '../products/entities/product.entity';

@ApiTags('Recipes')
@ApiBearerAuth('jwt')
@Controller('recipes')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthGuard)
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @ApiOperation({ summary: 'Obtener ingredientes disponibles para recetas' })
  @Get('ingredients')
  async getIngredients(): Promise<Product[]> {
    return this.recipesService.getIngredients();
  }

  @ApiOperation({ summary: 'Obtener todas las recetas' })
  @Get()
  async findAll(): Promise<Recipe[]> {
    return this.recipesService.findAll();
  }

  @ApiOperation({ summary: 'Obtener receta por ID' })
  @Get(':id')
  async findOne(@Param('id', new ParseUUIDPipe()) id: string): Promise<Recipe> {
    return this.recipesService.findOne(id);
  }

  @ApiOperation({ summary: 'Crear receta (ADMIN+)' })
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @Post()
  async create(@Body() createDto: CreateRecipeDto): Promise<Recipe> {
    return this.recipesService.create(createDto);
  }

  @ApiOperation({ summary: 'Actualizar receta (ADMIN+)' })
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @Put(':id')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateDto: UpdateRecipeDto,
  ): Promise<Recipe> {
    return this.recipesService.update(id, updateDto);
  }

  @ApiOperation({ summary: 'Eliminar receta (SUPERADMIN)' })
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPERADMIN)
  @Delete(':id')
  async delete(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return this.recipesService.delete(id);
  }

  @ApiOperation({ summary: 'Agregar ingrediente a receta (ADMIN+)' })
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @Post(':id/items')
  async addItem(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() createItemDto: CreateRecipeItemDto,
  ): Promise<RecipeItem> {
    return this.recipesService.addItem(id, createItemDto);
  }

  @ApiOperation({ summary: 'Eliminar ingrediente de receta (ADMIN+)' })
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @Delete(':id/items/:itemId')
  async removeItem(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('itemId', new ParseUUIDPipe()) itemId: string,
  ): Promise<void> {
    return this.recipesService.removeItem(id, itemId);
  }

  @ApiOperation({ summary: 'Sincronizar alérgenos (ADMIN+)' })
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @Post(':id/sync-allergens')
  async syncAllergens(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<RecipeAllergen[]> {
    return this.recipesService.syncAllergens(id);
  }

  @ApiOperation({ summary: 'Agregar alérgeno a receta (ADMIN+)' })
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @Post(':id/allergens')
  async addAllergen(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: { allergenId: string },
  ): Promise<RecipeAllergen> {
    return this.recipesService.addAllergen(id, body.allergenId);
  }

  @ApiOperation({ summary: 'Eliminar alérgeno de receta (ADMIN+)' })
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @Delete(':id/allergens/:allergenId')
  async removeAllergen(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('allergenId', new ParseUUIDPipe()) allergenId: string,
  ): Promise<void> {
    return this.recipesService.removeAllergen(id, allergenId);
  }
}
