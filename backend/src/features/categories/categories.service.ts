import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ProductType } from './entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly repo: Repository<Category>,
  ) {}

  async findAll(type?: string): Promise<Category[]> {
    const where: any = {};
    if (type) {
      const upper = type.toUpperCase();
      if (upper === 'INGREDIENT' || upper === 'MATERIAL') {
        where.productType = upper as ProductType;
      }
    }
    return this.repo.find({ where, order: { name: 'ASC' } });
  }

  async findOne(id: string): Promise<Category> {
    const cat = await this.repo.findOne({ where: { id } });
    if (!cat) throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    return cat;
  }

  async create(dto: CreateCategoryDto): Promise<Category> {
    const exists = await this.repo.findOne({
      where: { name: dto.name, productType: dto.productType },
    });
    if (exists) throw new ConflictException(`La categoría "${dto.name}" ya existe para ese tipo`);
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    const cat = await this.findOne(id);
    if (dto.name || dto.productType) {
      const checkName = dto.name ?? cat.name;
      const checkType = dto.productType ?? cat.productType;
      const dup = await this.repo.findOne({
        where: { name: checkName, productType: checkType },
      });
      if (dup && dup.id !== id) {
        throw new ConflictException(`La categoría "${checkName}" ya existe para ese tipo`);
      }
    }
    Object.assign(cat, dto);
    return this.repo.save(cat);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.repo.delete(id);
  }
}
