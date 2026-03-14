import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  Req,
  ParseUUIDPipe,
  UseInterceptors,
  ClassSerializerInterceptor,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/role.enum';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { PaginatedResponse } from '../../common/dto/paginated-response.interface';
import { DeliveryNotesService } from './delivery-notes.service';
import { DeliveryNote } from './entities/delivery-note.entity';
import { CreateDeliveryNoteDto } from './dto/create-delivery-note.dto';
import { UpdateDeliveryNoteDto } from './dto/update-delivery-note.dto';

@ApiTags('Delivery Notes')
@ApiBearerAuth('jwt')
@Controller('delivery-notes')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthGuard)
export class DeliveryNotesController {
  constructor(private readonly deliveryNotesService: DeliveryNotesService) {}

  @ApiOperation({ summary: 'Obtener todos los albaranes (ADMIN+)' })
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @Get()
  async findAll(
    @Query() paginationDto: PaginationQueryDto,
  ): Promise<PaginatedResponse<DeliveryNote>> {
    return this.deliveryNotesService.findAllPaginated(paginationDto);
  }

  @ApiOperation({ summary: 'Obtener albarán por ID' })
  @Get(':id')
  async findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<DeliveryNote> {
    return this.deliveryNotesService.findOne(id);
  }

  @ApiOperation({ summary: 'Crear albarán (ADMIN+)' })
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @Post()
  async create(
    @Body() createDto: CreateDeliveryNoteDto,
    @Req() req: Request,
  ): Promise<DeliveryNote> {
    const user = req.user as { userId: string; role: UserRole };
    return this.deliveryNotesService.create(createDto, user.userId);
  }

  @ApiOperation({ summary: 'Actualizar albarán (ADMIN+)' })
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @Put(':id')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateDto: UpdateDeliveryNoteDto,
  ): Promise<DeliveryNote> {
    return this.deliveryNotesService.update(id, updateDto);
  }

  @ApiOperation({ summary: 'Eliminar albarán (SUPERADMIN)' })
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPERADMIN)
  @Delete(':id')
  async delete(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return this.deliveryNotesService.delete(id);
  }
}
