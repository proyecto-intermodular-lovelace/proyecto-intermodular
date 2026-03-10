-- scripts/db/004_fix_suppliers_inventory.sql
-- Las columnas y tablas aquí referenciadas ya no son necesarias con el nuevo esquema.
-- Este script se mantiene como no-op.

BEGIN;

-- (no-op)

/*
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS nombre varchar(255);
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS contacto varchar(255);
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS email varchar(255);
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS telefono varchar(50);
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS direccion text;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS ciudad varchar(100);
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS pais varchar(100) DEFAULT 'España';
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS cif varchar(20);
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS categorias_suministro varchar(500);
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS notas text;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS activo boolean DEFAULT true;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

DO $$ BEGIN
  CREATE TYPE inventory_movement_type AS ENUM ('ENTRY', 'EXIT', 'ADJUSTMENT', 'LOSS');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS inventory_movements (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  producto_id   uuid NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  tipo          inventory_movement_type NOT NULL,
  cantidad      int NOT NULL,
  motivo        text,
  usuario_id    uuid REFERENCES users(id) ON DELETE SET NULL,
  observaciones text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
*/

COMMIT;
