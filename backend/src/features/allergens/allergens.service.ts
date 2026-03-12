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
    return this.allergensRepo.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
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
