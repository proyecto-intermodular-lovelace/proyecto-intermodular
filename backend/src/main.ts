import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { CustomLogger } from './common/logger/custom.logger';

async function bootstrap() {
  // Crear instancia del logger personalizado
  const customLogger = new CustomLogger();

  const app = await NestFactory.create(AppModule, {
    logger: customLogger,
  });

  // Configurar CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || ['http://localhost:3001', 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 3600,
  });

  // Establecer prefijo global para todas las rutas
  app.setGlobalPrefix('api');

  // Registrar filtro de excepciones global
  app.useGlobalFilters(new AllExceptionsFilter());

  // Configurar Swagger
  const config = new DocumentBuilder()
    .setTitle('Proyecto Intermodular API')
    .setDescription('API backend para gestión de inventario y pedidos')
    .setVersion('1.0.0')
    .addTag('Auth', 'Autenticación y autorización')
    .addTag('Health', 'Estado de la aplicación')
    .addTag('Users', 'Gestión de usuarios')
    .addTag('Products', 'Gestión de productos')
    .addTag('Orders', 'Gestión de pedidos')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Token JWT para autenticación',
      },
      'jwt',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    useGlobalPrefix: true,
  });

  // Activamos el Pipe de validación global CON transformación
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,       // Elimina propiedades del body que no estén en el DTO
      forbidNonWhitelisted: false, // CAMBIAR A FALSE para permitir validación sin error
      transform: true,       // Transforma los tipos automáticamente (ej. string a number)
      transformOptions: { 
        enableImplicitConversion: true,
        exposeDefaultValues: true,
      }, // Conversión implícita de tipos
    }),
  );

  // Agregar interceptor de serialización global
  const reflector = app.get(Reflector);
  app.useGlobalInterceptors(new ClassSerializerInterceptor(reflector));

  const port = process.env.APP_PORT || 3000;
  await app.listen(port);
  // expose app ref globally for dynamic access from controllers (used by import worker enqueue)
  (global as any).__nestAppRef = app;
  console.log(JSON.stringify({
    level: 'INFO',
    timestamp: new Date().toISOString(),
    context: 'Bootstrap',
    message: `Application is running on: http://localhost:${port}/api`,
  }));
  console.log(JSON.stringify({
    level: 'INFO',
    timestamp: new Date().toISOString(),
    context: 'Bootstrap',
    message: `Swagger documentation available at: http://localhost:${port}/api/docs`,
  }));
}
bootstrap();