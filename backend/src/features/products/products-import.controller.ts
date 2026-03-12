import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  BadRequestException,
  UseGuards,
  Req,
  Get,
  Param,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ProductsImportService } from './products-import.service';
import { ImportWorkerService } from './products-import.worker';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/role.enum';

@ApiTags('Products')
@Controller('products/import')
export class ProductsImportController {
  constructor(private readonly importService: ProductsImportService) {}

  @ApiBearerAuth('jwt')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @Post('preview')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async preview(@UploadedFile() file: any) {
    if (!file || !file.buffer) throw new BadRequestException('file is required');
    return this.importService.preview(file.buffer);
  }

  @ApiBearerAuth('jwt')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @Post('process')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async process(@Req() req: any, @UploadedFile() file: any, @Body('policy') policy?: string, @Body('defaultProductType') defaultProductType?: string) {
    if (!file || !file.buffer) throw new BadRequestException('file is required');
    const pol = (policy as any) === 'update' ? 'update' : (policy as any) === 'create' ? 'create' : 'skip';
    const prodType = defaultProductType === 'MATERIAL' ? 'MATERIAL' : defaultProductType === 'INGREDIENT' ? 'INGREDIENT' : undefined;
    // enqueue background job when worker available; otherwise fall back to synchronous processing
    try {
      const appModule = (global as any).__nestAppRef;
      if (appModule && appModule.get) {
        // use require at runtime to avoid TS module resolution issues
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const workerModule: any = require('./products-import.worker');
        const worker = appModule.get(workerModule?.ImportWorkerService as any, { strict: false });
        if (worker && worker.enqueue) {
          const content = file.buffer.toString('utf8');
          const createdBy = req?.user?.userId || null;
          const job = await worker.enqueue(file.originalname || 'import.csv', content, createdBy, prodType);
          return { jobId: job.id };
        }
      }
    } catch (e) {
      // continue to fallback
    }

    // fallback: synchronous processing
    const createdBy = req?.user?.userId || undefined;
    return this.importService.process(file.buffer, pol as any, createdBy, prodType);
  }

  @ApiBearerAuth('jwt')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @Get('jobs/:id')
  async getJob(@Param('id') id: string) {
    const appModule = (global as any).__nestAppRef;
    if (appModule && appModule.get) {
      try {
        const worker = appModule.get(ImportWorkerService as any, { strict: false });
        if (worker && worker.getJob) return worker.getJob(id);
      } catch (e) {
        // fallthrough
      }
    }
    return { error: 'worker unavailable' };
  }

  @ApiBearerAuth('jwt')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @Get('jobs/:id/report')
  async getReport(@Param('id') id: string, @Res() res: Response) {
    const appModule = (global as any).__nestAppRef;
    if (appModule && appModule.get) {
      try {
        const worker = appModule.get(ImportWorkerService as any, { strict: false });
        if (worker && worker.getJob) {
          const job = await worker.getJob(id);
          if (!job) return res.status(404).json({ message: 'job not found' });
          if (!job.resultPath) return res.status(404).json({ message: 'no report available' });
          return res.sendFile(job.resultPath, { root: '/' });
        }
      } catch (e) {
        // fallthrough
      }
    }
    return res.status(503).json({ message: 'worker unavailable' });
  }
}
