import { 
  Controller, 
  Request, 
  Post, 
  UseGuards, 
  Get, 
  Body, 
  UseInterceptors, 
  ClassSerializerInterceptor,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RecoverDto } from './dto/recover.dto';

@ApiTags('Auth')
@Controller('auth')
// Este interceptor es clave para que NO se vea el passwordHash en la respuesta
@UseInterceptors(ClassSerializerInterceptor) 
export class AuthController {
    constructor(private authService: AuthService) { }

    @ApiOperation({ summary: 'Login de usuario' })
    @ApiResponse({
      status: 200,
      description: 'Login exitoso, devuelve JWT token',
      schema: {
        example: {
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    })
    @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @ApiOperation({ summary: 'Registrar nuevo usuario' })
    @ApiResponse({
      status: 201,
      description: 'Usuario registrado exitosamente',
    })
    @ApiResponse({ status: 400, description: 'Email ya existe' })
    @Post('register')
    async register(@Body() registerDto: RegisterDto) {
      return this.authService.register(registerDto);
    }

    @ApiOperation({ summary: 'Recuperar cuenta por email' })
    @ApiResponse({ status: 200, description: 'Se ha enviado email de recuperación (si existe)' })
    @Post('recover')
    async recover(@Body() recoverDto: RecoverDto) {
      return this.authService.recover(recoverDto)
    }

    @ApiBearerAuth('jwt')
    @ApiOperation({ summary: 'Obtener perfil del usuario actual' })
    @ApiResponse({
      status: 200,
      description: 'Datos del usuario autenticado',
    })
    @ApiResponse({ status: 401, description: 'No autorizado' })
    @UseGuards(JwtAuthGuard)
    @Get('me')
    getProfile(@Request() req) {
        return this.authService.getMe(req.user.userId);
    }

    @ApiBearerAuth('jwt')
    @ApiOperation({ summary: 'Cambiar contraseña del usuario autenticado' })
    @ApiResponse({ status: 204, description: 'Contraseña cambiada correctamente' })
    @ApiResponse({ status: 401, description: 'Contraseña actual incorrecta' })
    @UseGuards(JwtAuthGuard)
    @Post('change-password')
    @HttpCode(HttpStatus.NO_CONTENT)
    async changePassword(
      @Request() req,
      @Body() body: { currentPassword: string; newPassword: string },
    ): Promise<void> {
      return this.authService.changePassword(req.user.userId, body.currentPassword, body.newPassword)
    }
}