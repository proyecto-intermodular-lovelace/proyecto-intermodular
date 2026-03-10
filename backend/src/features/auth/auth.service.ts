import { Injectable, UnauthorizedException, NotFoundException, Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RecoverDto } from './dto/recover.dto';
import MailService from '../../common/mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  /**
   * Valida que el usuario existe y la contraseña coincide
   */
  async validateUser(email: string, pass: string): Promise<any> {
    const logger = new Logger('AuthService')
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      logger.warn(`validateUser: user not found for email=${email}`)
      return null
    }

    if (!user.isActive) {
      logger.warn(`validateUser: user found but inactive email=${email}`)
      return null
    }

    // Comparación real con bcryptjs
    try {
      const isMatch = await bcrypt.compare(pass, user.passwordHash);
      logger.log(`validateUser: bcrypt.compare result=${isMatch} for email=${email}`)
      if (isMatch) {
        // Extraemos passwordHash para no devolverlo jamás
        const { passwordHash, ...result } = user;
        return result;
      }
    } catch (err) {
      logger.error(`validateUser: bcrypt.compare error for email=${email} - ${err?.message || err}`)
    }

    return null;
  }

  /**
   * Genera el token JWT tras un login exitoso
   */
  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = { 
      sub: user.id, 
      email: user.email, 
      role: user.role 
    };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  /**
   * Devuelve el perfil completo del usuario autenticado (nombre, apellidos, etc.)
   */
  async getMe(userId: string) {
    return this.usersService.findOne(userId);
  }

  /**
   * Registro de nuevos usuarios (opcional, si quieres centralizarlo aquí)
   */
  async register(registrationData: RegisterDto) {
    return this.usersService.create(registrationData);
  }

  /**
   * Cambia la contraseña del usuario autenticado tras verificar la actual
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.usersService.findOne(userId)
    // findOne doesn't select passwordHash — re-fetch with it
    const full = await this.usersService.findByEmail(user.email)
    if (!full) throw new UnauthorizedException('Usuario no encontrado')

    const match = await bcrypt.compare(currentPassword, full.passwordHash)
    if (!match) throw new UnauthorizedException('La contraseña actual es incorrecta')

    const salt = await bcrypt.genSalt(10)
    const newHash = await bcrypt.hash(newPassword, salt)
    await this.usersService.updatePasswordByEmail(user.email, newHash)
  }

  /**
   * Genera una clave provisional, la guarda (hash) y simula el envío por correo
   */
  async recover(recoverDto: RecoverDto) {
    const { email } = recoverDto

    const user = await this.usersService.findByEmail(email)
    if (!user) {
      // No revelar si el email no existe en la respuesta pública
      throw new NotFoundException('No se encontró el email')
    }

    // Generar contraseña provisional aleatoria
    const provisional = Math.random().toString(36).slice(-10)
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(provisional, salt)

    // Actualizar el hash en la base de datos
    await this.usersService.updatePasswordByEmail(email, hash)

    // Intentar enviar correo real; si falla, hacemos log para desarrollo
    try {
      const subject = 'Recuperación de cuenta - Lovelace'
      const text = `Hola,\n\nSe ha solicitado la recuperación de la cuenta.\nUsuario: ${user.email}\nClave provisional: ${provisional}\n\nPor favor, inicia sesión y cambia tu contraseña.`
      const html = `<p>Hola,</p><p>Se ha solicitado la recuperación de la cuenta.</p><ul><li><strong>Usuario:</strong> ${user.email}</li><li><strong>Clave provisional:</strong> ${provisional}</li></ul><p>Por favor, inicia sesión y cambia tu contraseña.</p>`

      await this.mailService.sendMail(user.email, subject, text, html)
    } catch (err) {
      // Si el envío falla, lo registramos para revisión
      const logger = new Logger('AuthService')
      logger.warn('Envío de correo falló: ' + (err?.message || err))
    }

    return { message: 'Si el email existe, se ha enviado un correo con instrucciones' }
  }
}