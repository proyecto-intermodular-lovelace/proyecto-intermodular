import { Injectable, Logger } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductsService } from './products.service';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { parse } from 'csv-parse/sync';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function isUUID(value?: string) {
  if (!value) return false;
  return UUID_REGEX.test(value);
}

export interface ImportPreviewRow {
  row: number;
  data: Partial<CreateProductDto>;
  errors: string[];
  raw?: Record<string, string>;
}

export interface ImportPreviewResult {
  totalRows: number;
  preview: ImportPreviewRow[];
  errorCount: number;
  headers?: string[];
}

@Injectable()
export class ProductsImportService {
  private readonly logger = new Logger(ProductsImportService.name);

  constructor(
    private readonly productsService: ProductsService,
    private readonly dataSource: DataSource,
    @InjectRepository(
      // lazy require to avoid circular at runtime
      require('./entities/product.entity').Product,
    )
    private readonly productsRepo: Repository<any>,
  ) {}

  // Robust CSV parser using csv-parse/sync. Returns headers (ordered) and rows as arrays aligned to headers.
  parseCsv(buffer: Buffer): { headers: string[]; rows: string[][] } {
    const text = buffer.toString('utf8');
    const records: any[] = parse(text, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      skip_records_with_empty_values: false,
    });
    if (!records || records.length === 0) return { headers: [], rows: [] };
    const headers = Object.keys(records[0]);
    const rows = records.map((rec) => headers.map((h) => (rec[h] === undefined || rec[h] === null ? '' : String(rec[h]).trim())));
    return { headers, rows };
  }

  // Map of normalized header -> canonical field name.
  // Covers English, Spanish, snake_case, camelCase and export-generated headers.
  private static readonly HEADER_MAP: Record<string, string> = {
    // code / sku
    code: 'code', sku: 'code', codigo: 'code', código: 'code',
    // name
    name: 'name', nombre: 'name', product: 'name', producto: 'name',
    // unitType
    unittype: 'unitType', unit_type: 'unitType', unit: 'unitType', unidad: 'unitType',
    // unitPrice
    unitprice: 'unitPrice', unit_price: 'unitPrice', price: 'unitPrice', precio: 'unitPrice', cost: 'unitPrice', coste: 'unitPrice',
    // description
    description: 'description', descripcion: 'description', desc: 'description',
    // stock
    stock: 'stock', cantidad: 'stock', qty: 'stock',
    // stockMinimo
    stockminimo: 'stockMinimo', stock_minimo: 'stockMinimo', minstock: 'stockMinimo', min: 'stockMinimo',
    // supplierId / supplier name
    supplierid: 'supplierId', supplier_id: 'supplierId', supplier: 'supplierRaw', proveedor: 'supplierRaw',
    // categoryId / category name
    categoryid: 'categoryId', category_id: 'categoryId', category: 'categoryRaw', categoria: 'categoryRaw', cat: 'categoryRaw',
    // productType
    producttype: 'productType', product_type: 'productType', type: 'productType', tipo: 'productType',
    // rendimiento (yield) — store but not critical
    rendimiento: 'rendimiento', yield: 'rendimiento',
    // activo — active flag
    activo: 'activo', active: 'activo',
  };

  /** Normalize a header: trim, lower-case, strip accents, remove underscores/spaces for lookup */
  private static normalizeHeader(h: string): string {
    return h.trim().toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // strip diacritics
      .replace(/[\s_-]+/g, '');                          // strip separators
  }

  buildDtoFromRow(headers: string[], row: string[]): Partial<CreateProductDto> {
    const dto: Partial<CreateProductDto> = {};
    (dto as any)._categoryRaw = undefined;
    (dto as any)._supplierRaw = undefined;

    for (let i = 0; i < headers.length; i++) {
      const norm = ProductsImportService.normalizeHeader(headers[i]);
      const field = ProductsImportService.HEADER_MAP[norm];
      const value = row[i] ?? '';
      if (!field || !value) continue;

      switch (field) {
        case 'code':        dto.code = value; break;
        case 'name':        dto.name = value; break;
        case 'unitType':    dto.unitType = value as any; break;
        case 'unitPrice':   dto.unitPrice = parseFloat(value) || 0; break;
        case 'description': dto.description = value; break;
        case 'stock':       dto.stock = parseInt(value) || 0; break;
        case 'stockMinimo': dto.stockMinimo = value ? parseInt(value) : undefined; break;
        case 'supplierId':  dto.supplierId = isUUID(value) ? value : undefined; break;
        case 'supplierRaw': // supplier by name — resolve later
          if (isUUID(value)) dto.supplierId = value;
          else (dto as any)._supplierRaw = value;
          break;
        case 'categoryId':
          if (isUUID(value)) dto.categoryId = value;
          else (dto as any)._categoryRaw = value;
          break;
        case 'categoryRaw': // category by name — resolve later
          if (isUUID(value)) dto.categoryId = value;
          else (dto as any)._categoryRaw = value;
          break;
        case 'productType': dto.productType = value as any; break;
        // non-critical fields — store on dto for potential use
        case 'rendimiento': (dto as any).rendimiento = value; break;
        case 'activo':      (dto as any).activo = value; break;
        default: break;
      }
    }
    return dto;
  }

  async preview(buffer: Buffer, maxPreview = 20): Promise<ImportPreviewResult> {
    const parsed = this.parseCsv(buffer);
    const preview: ImportPreviewRow[] = [];
    let errorCount = 0;
    for (let i = 0; i < Math.min(parsed.rows.length, maxPreview); i++) {
      const row = parsed.rows[i];
      const data = this.buildDtoFromRow(parsed.headers, row);
      // build raw mapping header->value for debugging in UI
      const raw: Record<string, string> = {};
      for (let h = 0; h < parsed.headers.length; h++) raw[parsed.headers[h]] = row[h] ?? '';
      const errors: string[] = [];
      if (!data.code || data.code.length === 0) errors.push('sku/code is required');
      if (!data.name || data.name.length === 0) errors.push('name is required');
      if (!data.unitType || data.unitType.length === 0) errors.push('unitType is required');
      if (typeof data.unitPrice !== 'number' || isNaN(data.unitPrice)) errors.push('unitPrice must be a number');
      if (data.supplierId && !isUUID(data.supplierId)) errors.push('supplierId must be UUID');
      if (data.categoryId && !isUUID(data.categoryId)) errors.push('categoryId must be UUID');
      if (errors.length > 0) errorCount += errors.length;
      preview.push({ row: i + 1, data, errors, raw });
    }
    return { totalRows: parsed.rows.length, preview, errorCount, headers: parsed.headers };
  }

  // Synchronous processing (prototype). Policy: 'skip' = skip existing, 'update' = update existing, 'create' = only create; default 'skip'
  // process in batches using transaction and upsert. createdByUuid will be used for created records when provided, otherwise fallback uuid
  async process(buffer: Buffer, policy: 'skip' | 'update' | 'create' = 'skip', createdByUuid?: string, defaultProductType?: string) {
    const parsed = this.parseCsv(buffer);
    const results = { processed: 0, created: 0, updated: 0, errors: [] as any[] };
    const rows = parsed.rows;
    const fallbackType = defaultProductType === 'MATERIAL' ? 'MATERIAL' : 'INGREDIENT';

    // Normalize rows into DTOs
    const dtos: Array<{ dto: any; rowNumber: number }> = [];
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const data = this.buildDtoFromRow(parsed.headers, row) as any;
      if (!data.code) {
        results.errors.push({ row: i + 1, error: 'missing code' });
        continue;
      }
      data.name = data.name || data.code;
      data.unitType = data.unitType || 'UNIT';
      data.unitPrice = data.unitPrice ?? 0;
      data.description = data.description ?? null;
      data.stock = data.stock ?? 0;
      data.stockMinimo = data.stockMinimo ?? null;
      data.supplierId = data.supplierId ?? null;
      data.categoryId = data.categoryId ?? null;
      data.productType = data.productType || fallbackType;
      dtos.push({ dto: data, rowNumber: i + 1 });
    }

    if (dtos.length === 0) return results;

    const codes = dtos.map((d) => d.dto.code);
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // resolve category lookups for dtos that had non-UUID values
      for (const r of dtos) {
        const raw = (r.dto as any)._categoryRaw;
        if (raw && !r.dto.categoryId) {
          const rawTrim = String(raw).trim();
          if (/^1$/.test(rawTrim)) {
            r.dto.categoryId = 'bbbbbbbb-0000-0000-0000-000000000001';
          } else if (/^2$/.test(rawTrim)) {
            r.dto.categoryId = 'bbbbbbbb-0000-0000-0000-000000000002';
          } else {
            try {
              const found = await queryRunner.manager.query(
                `SELECT id FROM categories WHERE lower(name) = lower($1) LIMIT 1`,
                [rawTrim],
              );
              if (found && found.length > 0) r.dto.categoryId = found[0].id;
            } catch (_) { /* ignore */ }
          }
          if (!r.dto.categoryId) {
            r.dto.categoryId = 'bbbbbbbb-0000-0000-0000-000000000001';
          }
        }
      }

      // resolve supplier lookups for dtos that had supplier name instead of UUID
      for (const r of dtos) {
        const rawSup = (r.dto as any)._supplierRaw;
        if (rawSup && !r.dto.supplierId) {
          const supTrim = String(rawSup).trim();
          try {
            const found = await queryRunner.manager.query(
              `SELECT id FROM suppliers WHERE lower(name) = lower($1) LIMIT 1`,
              [supTrim],
            );
            if (found && found.length > 0) r.dto.supplierId = found[0].id;
          } catch (_) { /* ignore */ }
        }
      }

      // find existing codes
      const existing = await queryRunner.manager.query(`SELECT code FROM products WHERE code = ANY($1)`, [codes]);
      const existingSet = new Set(existing.map((r: any) => r.code));

      const toCreate = dtos.filter((d) => !existingSet.has(d.dto.code));
      const toMaybeUpdate = dtos.filter((d) => existingSet.has(d.dto.code));

      // chunk size
      const chunk = 200;
      // insert new rows in batches
      for (let i = 0; i < toCreate.length; i += chunk) {
        const chunkRows = toCreate.slice(i, i + chunk);
        const values: string[] = [];
        const params: any[] = [];
        let idx = 1;
        for (const r of chunkRows) {
          const c = r.dto;
          values.push(`( $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++} )`);
          // columns: code,name,product_type,unit_type,unit_price,supplier_id,category_id,description,stock,stock_minimo,created_by
          params.push(c.code, c.name, c.productType, c.unitType, c.unitPrice, c.supplierId, c.categoryId, c.description, c.stock, c.stockMinimo, createdByUuid || process.env.IMPORTS_CREATED_BY || '00000000-0000-0000-0000-000000000000');
        }
        // build paramized placeholders adjusted for created_by placement
        // Actually we added 11 params per row, but values constructed had 10 placeholders; fix: rebuild correctly
      }

      // For updates, if policy==='update', perform batch upserts via INSERT ... ON CONFLICT DO UPDATE
      // Simpler approach: perform INSERT ... ON CONFLICT DO UPDATE for all dtos honoring policy: if skip and exists, skip; if update, include all; if create-only, include only toCreate
      const allToInsert = policy === 'update' ? dtos : toCreate.map((d) => d);
      for (let i = 0; i < allToInsert.length; i += chunk) {
        const chunkRows = allToInsert.slice(i, i + chunk);
        const params: any[] = [];
        const valuePlaceholders: string[] = [];
        let idx = 1;
        for (const r of chunkRows) {
          const c = r.dto;
          valuePlaceholders.push(`($${idx++},$${idx++},$${idx++},$${idx++},$${idx++},$${idx++},$${idx++},$${idx++},$${idx++},$${idx++},$${idx++})`);
          params.push(c.code, c.name, c.productType, c.unitType, c.unitPrice, c.supplierId, c.categoryId, c.description, c.stock, c.stockMinimo, createdByUuid || process.env.IMPORTS_CREATED_BY || '00000000-0000-0000-0000-000000000000');
        }
        const sql = `INSERT INTO products (code,name,product_type,unit_type,unit_price,supplier_id,category_id,description,stock,stock_minimo,created_by)
          VALUES ${valuePlaceholders.join(',')}
          ON CONFLICT (code) DO UPDATE SET
            name = EXCLUDED.name,
            product_type = EXCLUDED.product_type,
            unit_type = EXCLUDED.unit_type,
            unit_price = EXCLUDED.unit_price,
            supplier_id = EXCLUDED.supplier_id,
            category_id = EXCLUDED.category_id,
            description = EXCLUDED.description,
            stock = EXCLUDED.stock,
            stock_minimo = EXCLUDED.stock_minimo,
            updated_at = now();`;
        await queryRunner.manager.query(sql, params);
        results.processed += chunkRows.length;
      }

      // compute createdCount and updatedCount approximations
      results.created = toCreate.length;
      results.updated = policy === 'update' ? toMaybeUpdate.length : 0;

      await queryRunner.commitTransaction();
    } catch (e: any) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Import batch failed: ' + (e?.message || e));
      results.errors.push({ error: e?.message || String(e) });
    } finally {
      await queryRunner.release();
    }

    return results;
  }
}
