import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';
import { PaginationService } from '../../common/services/pagination.service';
import { ProductsImportController } from './products-import.controller';
import { ProductsImportService } from './products-import.service';
import { ImportJob } from './entities/import-job.entity';
import { ImportWorkerService } from './products-import.worker';

@Module({
  imports: [TypeOrmModule.forFeature([Product, ImportJob])],
  controllers: [ProductsController, ProductsImportController],
  providers: [ProductsService, PaginationService, ProductsImportService, ImportWorkerService],
  exports: [ProductsService],
})
export class ProductsModule {}
