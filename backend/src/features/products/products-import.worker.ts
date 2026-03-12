import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ImportJob, ImportJobStatus } from './entities/import-job.entity';
import { ProductsImportService } from './products-import.service';
import { join } from 'path';
import { writeFileSync, mkdirSync, existsSync } from 'fs';

@Injectable()
export class ImportWorkerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ImportWorkerService.name);
  private running = true;

  constructor(
    @InjectRepository(ImportJob)
    private readonly jobsRepo: Repository<ImportJob>,
    private readonly importService: ProductsImportService,
  ) {}

  onModuleInit() {
    this.logger.log('Starting import worker polling');
    this.poll();
  }

  onModuleDestroy() {
    this.running = false;
  }

  private async poll() {
    while (this.running) {
      try {
        const job = await this.jobsRepo.findOne({ where: { status: ImportJobStatus.PENDING } });
        if (job) {
          await this.processJob(job);
        } else {
          // no job, sleep
          await this.sleep(1000);
        }
      } catch (e) {
        this.logger.warn('Polling error: ' + (e as any).message);
        await this.sleep(2000);
      }
    }
  }

  private sleep(ms: number) {
    return new Promise((res) => setTimeout(res, ms));
  }

  private async processJob(job: ImportJob) {
    this.logger.log(`Processing import job ${job.id}`);
    job.status = ImportJobStatus.PROCESSING;
    await this.jobsRepo.save(job);
    try {
      const buffer = Buffer.from(job.content, 'utf8');
      // use importService.process but capture errors per row
      const res = await this.importService.process(buffer, 'update', job.createdBy || undefined);
      job.processed = res.processed;
      job.createdCount = res.created || 0;
      job.updatedCount = res.updated || 0;
      job.errors = res.errors || [];

      // write error report if any
      if (job.errors && job.errors.length > 0) {
        const dir = join(process.cwd(), 'data', 'imports');
        if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
        const path = join(dir, `import_errors_${job.id}.json`);
        writeFileSync(path, JSON.stringify(job.errors, null, 2), 'utf8');
        job.resultPath = path;
      }

      job.status = ImportJobStatus.DONE;
      await this.jobsRepo.save(job);
      this.logger.log(`Import job ${job.id} done`);
    } catch (e: any) {
      this.logger.error(`Import job ${job.id} failed: ${e?.message || e}`);
      job.status = ImportJobStatus.FAILED;
      job.errors = job.errors || [];
      job.errors.push({ message: e?.message || String(e) });
      await this.jobsRepo.save(job);
    }
  }

  // Public helper: enqueue job
  async enqueue(filename: string, content: string, createdBy?: string) {
    const job = this.jobsRepo.create({
      filename,
      content,
      status: ImportJobStatus.PENDING,
      totalRows: 0,
      processed: 0,
      createdCount: 0,
      updatedCount: 0,
      errors: [],
      resultPath: null,
      createdBy: createdBy || null,
    });
    return this.jobsRepo.save(job);
  }

  async getJob(id: string) {
    return this.jobsRepo.findOne({ where: { id } });
  }
}
