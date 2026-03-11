import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeliveryNote } from './entities/delivery-note.entity';
import { DeliveryNoteItem } from './entities/delivery-note-item.entity';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { PaginatedResponse } from '../../common/dto/paginated-response.interface';
import { PaginationService } from '../../common/services/pagination.service';
import { CreateDeliveryNoteDto } from './dto/create-delivery-note.dto';
import { UpdateDeliveryNoteDto } from './dto/update-delivery-note.dto';

@Injectable()
export class DeliveryNotesService {
  constructor(
    @InjectRepository(DeliveryNote)
    private readonly deliveryNotesRepository: Repository<DeliveryNote>,
    @InjectRepository(DeliveryNoteItem)
    private readonly itemsRepository: Repository<DeliveryNoteItem>,
    private readonly paginationService: PaginationService,
  ) {}

  async findAllPaginated(
    paginationDto: PaginationQueryDto,
  ): Promise<PaginatedResponse<DeliveryNote>> {
    return this.paginationService.paginateRepository(
      this.deliveryNotesRepository,
      paginationDto,
    );
  }

  async findAll(): Promise<DeliveryNote[]> {
    return this.deliveryNotesRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<DeliveryNote> {
    const note = await this.deliveryNotesRepository.findOne({ where: { id } });
    if (!note) {
      throw new NotFoundException(`Albarán con ID ${id} no encontrado`);
    }
    return note;
  }

  async create(dto: CreateDeliveryNoteDto, receivedBy: string): Promise<DeliveryNote> {
    const { items, ...header } = dto;
    const note = this.deliveryNotesRepository.create({ ...header, receivedBy });
    try {
      const saved = await this.deliveryNotesRepository.save(note);
      if (items?.length) {
        const itemEntities = items.map(i =>
          this.itemsRepository.create({ ...i, deliveryNoteId: saved.id }),
        );
        await this.itemsRepository.save(itemEntities);
      }
      return this.findOne(saved.id);
    } catch (err) {
      if (err instanceof QueryFailedError || (err && (err as any).code)) {
        const code = (err as any).code || (err as any).driverError?.code;
        if (code === '23505') {
          throw new ConflictException('El código de albarán ya existe');
        }
      }
      throw err;
    }
  }

  async update(id: string, dto: UpdateDeliveryNoteDto): Promise<DeliveryNote> {
    await this.findOne(id);
    const { items, ...header } = dto;
    if (Object.keys(header).length) {
      await this.deliveryNotesRepository.update(id, header);
    }
    if (items) {
      await this.itemsRepository.delete({ deliveryNoteId: id });
      if (items.length) {
        const itemEntities = items.map(i =>
          this.itemsRepository.create({ ...i, deliveryNoteId: id }),
        );
        await this.itemsRepository.save(itemEntities);
      }
    }
    return this.findOne(id);
  }

  async delete(id: string): Promise<void> {
    await this.findOne(id);
    await this.deliveryNotesRepository.delete(id);
  }
}
