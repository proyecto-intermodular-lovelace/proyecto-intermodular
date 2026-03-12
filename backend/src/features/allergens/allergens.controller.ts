import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AllergensService } from './allergens.service';
import { Allergen } from './entities/allergen.entity';

@ApiTags('Allergens')
@Controller('allergens')
export class AllergensController {
  constructor(private readonly allergensService: AllergensService) {}

  @ApiOperation({ summary: 'Obtener todos los alérgenos' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @Get()
  async findAll(@Query('limit') limit?: number): Promise<Allergen[]> {
    return this.allergensService.findAll();
  }
}
