import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Allergen } from './entities/allergen.entity';

@Injectable()
export class AllergensService {
  constructor(
    @InjectRepository(Allergen)
    private readonly allergensRepo: Repository<Allergen>,
  ) {}

  async findAll(): Promise<Allergen[]> {
    const allergens = await this.allergensRepo.query(`
      SELECT 
        id,
        name,
        description,
        category,
        is_active as "isActive",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM public.allergens
      WHERE is_active = true
      ORDER BY name ASC
    `);
    
    return allergens;
  }

  async findOne(id: string): Promise<Allergen | null> {
    return this.allergensRepo.findOne({
      where: { id },
    });
  }

  async create(name: string, description?: string): Promise<Allergen> {
    const allergen = this.allergensRepo.create({
      name,
      description,
      isActive: true,
    });
    return this.allergensRepo.save(allergen);
  }

  async update(id: string, name?: string, description?: string): Promise<Allergen | null> {
    const allergen = await this.findOne(id);
    if (!allergen) return null;

    if (name) allergen.name = name;
    if (description !== undefined) allergen.description = description;

    return this.allergensRepo.save(allergen);
  }

  async delete(id: string): Promise<void> {
    await this.allergensRepo.update(id, { isActive: false });
  }
}
