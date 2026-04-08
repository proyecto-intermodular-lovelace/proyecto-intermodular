// Tests unitarios para AuthService — autenticación JWT, validación de usuarios y refresh token
import { Test, TestingModule } from '@nestjs/testing'
import { UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { AuthService } from './auth.service'
import { UsersService } from '../users/users.service'
import MailService from '../../common/mail/mail.service'
import * as bcrypt from 'bcryptjs'

describe('AuthService', () => {
  let service: AuthService

  const mockUsersService = {
    findByEmail: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    updatePasswordByEmail: jest.fn(),
  }

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-token'),
    verify: jest.fn(),
  }

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const map: Record<string, string> = {
        JWT_REFRESH_SECRET: 'test-refresh-secret',
        JWT_REFRESH_EXPIRES_IN: '7d',
      }
      return map[key]
    }),
  }

  const mockMailService = {
    sendMail: jest.fn().mockResolvedValue(undefined),
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    mockJwtService.sign.mockReturnValue('mock-token')

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: MailService, useValue: mockMailService },
      ],
    }).compile()

    service = module.get<AuthService>(AuthService)
  })

  describe('validateUser', () => {
    it('debe devolver null si el usuario no existe', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null)

      const result = await service.validateUser('noexiste@test.com', 'pass')

      expect(result).toBeNull()
    })

    it('debe devolver null si el usuario existe pero isActive es false', async () => {
      mockUsersService.findByEmail.mockResolvedValue({
        id: '1',
        email: 'user@test.com',
        passwordHash: 'hash',
        isActive: false,
      })

      const result = await service.validateUser('user@test.com', 'pass')

      expect(result).toBeNull()
    })

    it('debe devolver el usuario sin passwordHash si las credenciales son correctas', async () => {
      const hash = await bcrypt.hash('correcta', 10)
      mockUsersService.findByEmail.mockResolvedValue({
        id: '1',
        email: 'user@test.com',
        passwordHash: hash,
        isActive: true,
        role: 'USER',
      })

      const result = await service.validateUser('user@test.com', 'correcta')

      expect(result).not.toBeNull()
      expect(result.passwordHash).toBeUndefined()
      expect(result.email).toBe('user@test.com')
    })

    it('debe devolver null si la contraseña no coincide', async () => {
      const hash = await bcrypt.hash('correcta', 10)
      mockUsersService.findByEmail.mockResolvedValue({
        id: '1',
        email: 'user@test.com',
        passwordHash: hash,
        isActive: true,
      })

      const result = await service.validateUser('user@test.com', 'incorrecta')

      expect(result).toBeNull()
    })
  })

  describe('login', () => {
    it('debe lanzar UnauthorizedException si validateUser devuelve null', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null)

      await expect(
        service.login({ email: 'bad@test.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException)
    })

    it('debe devolver accessToken si las credenciales son válidas', async () => {
      const hash = await bcrypt.hash('correcta', 10)
      mockUsersService.findByEmail.mockResolvedValue({
        id: 'uuid-1',
        email: 'user@test.com',
        passwordHash: hash,
        isActive: true,
        role: 'USER',
      })
      mockJwtService.sign.mockReturnValue('access-token')

      const result = await service.login({ email: 'user@test.com', password: 'correcta' })

      expect(result).toHaveProperty('accessToken')
    })
  })

  describe('getMe', () => {
    it('debe llamar a usersService.findOne con el userId y devolver el resultado', async () => {
      const fakeUser = { id: 'uuid-1', email: 'user@test.com' }
      mockUsersService.findOne.mockResolvedValue(fakeUser)

      const result = await service.getMe('uuid-1')

      expect(mockUsersService.findOne).toHaveBeenCalledWith('uuid-1')
      expect(result).toEqual(fakeUser)
    })
  })

})
