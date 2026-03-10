import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthModule } from './features/health/health.module';
import { AuthModule } from './features/auth/auth.module';
import { ProductsModule } from './features/products/products.module';
import { OrdersModule } from './features/orders/orders.module';
import { DeliveryNotesModule } from './features/delivery-notes/delivery-notes.module';
import { IncidentsModule } from './features/incidents/incidents.module';
import { InventoryModule } from './features/inventory/inventory.module';
import { SuppliersModule } from './features/suppliers/suppliers.module';
import { ScaleModule } from './features/scale/scale.module';
import { HttpLoggingMiddleware } from './common/logger/http-logging.middleware';
import { CustomLogger } from './common/logger/custom.logger';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: Number(config.get<string>('DB_PORT')),
        username: config.get<string>('DB_USER'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: false, // NO tocar schema
        logging: false,
      }),
    }),
    HealthModule,
    AuthModule,
    ProductsModule,
    OrdersModule,
    DeliveryNotesModule,
    IncidentsModule,
    InventoryModule,
    SuppliersModule,
    ScaleModule,
  ],
  providers: [CustomLogger],
  exports: [CustomLogger],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpLoggingMiddleware).forRoutes({ path: '*path', method: RequestMethod.ALL });
  }
}
