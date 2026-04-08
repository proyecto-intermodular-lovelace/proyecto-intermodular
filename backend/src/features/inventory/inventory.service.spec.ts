// Tests unitarios para InventoryService — gestión de movimientos de inventario
import { Test, TestingModule } from '@nestjs/testing'
import { NotFoundException } from '@nestjs/common'
import { getRepositoryToken } from '@nestjs/typeorm'
import { InventoryService } from './inventory.service'
import { InventoryMovement, InventoryMovementType } from './entities/inventory-movement.entity'
import { PaginationService } from '../../common/services/pagination.service'

describe('InventoryService', () => {
  let service: InventoryService

  const mockMovementsRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    findAndCount: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  }

  const mockPaginationService = {
    paginate: jest.fn(),
    paginateRepository: jest.fn(),
  }

  beforeEach(async () => {
    jest.clearAllMocks()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        {
          provide: getRepositoryToken(InventoryMovement),
          useValue: mockMovementsRepository,
        },
        { provide: PaginationService, useValue: mockPaginationService },
      ],
    }).compile()

    service = module.get<InventoryService>(InventoryService)
  })

  describe('findOne', () => {
    it('debe lanzar NotFoundException si el movimiento no existe', async () => {
      const id = 'uuid-inexistente'
      mockMovementsRepository.findOne.mockResolvedValue(null)

      await expect(service.findOne(id)).rejects.toThrow(NotFoundException)
      await expect(service.findOne(id)).rejects.toThrow(id)
    })

    it('debe devolver el movimiento si existe', async () => {
      const movement: Partial<InventoryMovement> = {
        id: 'uuid-1',
        tipo: InventoryMovementType.ENTRY,
        cantidad: 10,
      }
      mockMovementsRepository.findOne.mockResolvedValue(movement)

      const result = await service.findOne('uuid-1')

      expect(result).toEqual(movement)
    })
  })

  describe('create', () => {
    it('debe llamar a create y save del repositorio y devolver el resultado', async () => {
      const dto: Partial<InventoryMovement> = {
        productoId: 'prod-1',
        cantidad: 5,
        tipo: InventoryMovementType.ENTRY,
        motivo: 'Reposición',
      }
      const saved = { id: 'uuid-new', ...dto }
      mockMovementsRepository.create.mockReturnValue(dto)
      mockMovementsRepository.save.mockResolvedValue(saved)

      const result = await service.create(dto)

      expect(mockMovementsRepository.create).toHaveBeenCalledWith(dto)
      expect(mockMovementsRepository.save).toHaveBeenCalledWith(dto)
      expect(result).toEqual(saved)
    })
  })

  describe('recordEntry', () => {
    it('debe crear un movimiento con tipo ENTRY y la cantidad positiva recibida', async () => {
      const saved = {
        id: 'uuid-entry',
        productoId: 'prod-1',
        cantidad: 10,
        tipo: InventoryMovementType.ENTRY,
        motivo: 'Entrada de stock',
      }
      mockMovementsRepository.create.mockReturnValue(saved)
      mockMovementsRepository.save.mockResolvedValue(saved)

      const result = await service.recordEntry('prod-1', 10, 'Entrada de stock')

      expect(mockMovementsRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          tipo: InventoryMovementType.ENTRY,
          cantidad: 10,
          productoId: 'prod-1',
        }),
      )
      expect(result.tipo).toBe(InventoryMovementType.ENTRY)
      expect(result.cantidad).toBe(10)
    })
  })

  describe('recordExit', () => {
    it('debe crear un movimiento con tipo EXIT y la cantidad en negativo', async () => {
      const saved = {
        id: 'uuid-exit',
        productoId: 'prod-1',
        cantidad: -5,
        tipo: InventoryMovementType.EXIT,
        motivo: 'Consumo en cocina',
      }
      mockMovementsRepository.create.mockReturnValue(saved)
      mockMovementsRepository.save.mockResolvedValue(saved)

      const result = await service.recordExit('prod-1', 5, 'Consumo en cocina')

      expect(mockMovementsRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          tipo: InventoryMovementType.EXIT,
          cantidad: -5,
          productoId: 'prod-1',
        }),
      )
      expect(result.tipo).toBe(InventoryMovementType.EXIT)
      expect(result.cantidad).toBe(-5)
    })
  })
})
