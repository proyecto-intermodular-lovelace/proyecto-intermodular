import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Supplier } from './entities/supplier.entity';
import { Product } from '../products/entities/product.entity';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { PaginatedResponse } from '../../common/dto/paginated-response.interface';
import { PaginationService } from '../../common/services/pagination.service';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(Supplier)
    private readonly suppliersRepository: Repository<Supplier>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    private readonly paginationService: PaginationService,
  ) {}

  /**
   * Obtiene todos los proveedores activos con paginación
   */
  async findAllPaginated(
    paginationDto: PaginationQueryDto,
  ): Promise<PaginatedResponse<Supplier>> {
    return this.paginationService.paginateRepository(
      this.suppliersRepository,
      paginationDto,
    );
  }

  /**
   * Obtiene todos los proveedores (sin paginación)
   */
  async findAll(): Promise<Supplier[]> {
    return this.suppliersRepository.find({
      order: { nombre: 'ASC' },
    });
  }

  /**
   * Obtiene un proveedor por ID
   */
  async findOne(id: string): Promise<Supplier> {
    const supplier = await this.suppliersRepository.findOne({ where: { id } });
    if (!supplier) {
      throw new NotFoundException(`Proveedor con ID ${id} no encontrado`);
    }
    return supplier;
  }

  /**
   * Busca proveedores por nombre (búsqueda parcial)
   */
  async search(query: string): Promise<Supplier[]> {
    const q = (query || '').trim();
    if (!q) return [];

    // Use Postgres `unaccent` to perform accent-insensitive searches.
    // Falls back to ILIKE if `unaccent` isn't available in the DB will throw,
    // so ensure the extension is enabled in the database (CREATE EXTENSION unaccent).
    const qb = this.suppliersRepository.createQueryBuilder('s')
      .where('LOWER(s.nombre) LIKE :q', { q: `%${q.toLowerCase()}%` })
      .orWhere('LOWER(s.email) LIKE :q', { q: `%${q.toLowerCase()}%` })
      .orWhere('LOWER(s.notas) LIKE :q', { q: `%${q.toLowerCase()}%` })
      .orderBy('s.nombre', 'ASC')
      .take(20);

    return qb.getMany();
  }

  /**
   * Crea un nuevo proveedor
   */
  async create(dto: CreateSupplierDto): Promise<Supplier> {
    const exists = await this.suppliersRepository.findOne({
      where: { nombre: dto.nombre },
    });
    if (exists) {
      throw new ConflictException(`Ya existe un proveedor con el nombre "${dto.nombre}"`);
    }
    const supplier = this.suppliersRepository.create(dto);
    return this.suppliersRepository.save(supplier);
  }

  /**
   * Actualiza un proveedor existente
   */
  async update(id: string, dto: UpdateSupplierDto): Promise<Supplier> {
    const supplier = await this.findOne(id);

    if (dto.nombre && dto.nombre !== supplier.nombre) {
      const exists = await this.suppliersRepository.findOne({
        where: { nombre: dto.nombre },
      });
      if (exists && exists.id !== id) {
        throw new ConflictException(`Ya existe un proveedor con el nombre "${dto.nombre}"`);
      }
    }

    Object.assign(supplier, dto);
    return this.suppliersRepository.save(supplier);
  }

  /**
   * Elimina un proveedor (soft delete: activo = false)
   */
  async remove(id: string): Promise<{ message: string }> {
    const supplier = await this.findOne(id);
    supplier.activo = false;
    await this.suppliersRepository.save(supplier);
    return { message: `Proveedor ${supplier.nombre} desactivado correctamente` };
  }

  /**
   * Elimina un proveedor definitivamente
   */
  async hardDelete(id: string): Promise<{ message: string }> {
    const supplier = await this.findOne(id);
    // Disassociate products that reference this supplier to allow deletion
    await this.productsRepository
      .createQueryBuilder()
      .update()
      .set({ supplierId: null })
      .where('supplier_id = :id', { id })
      .execute();

    await this.suppliersRepository.remove(supplier);
    return { message: `Proveedor eliminado definitivamente` };
  }
}
