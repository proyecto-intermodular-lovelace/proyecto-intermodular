-- Crear enum
DO $$ BEGIN
  CREATE TYPE inventory_movement_type AS ENUM ('ENTRY', 'EXIT', 'ADJUSTMENT', 'LOSS');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Crear tabla inventory_movements
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

CREATE INDEX IF NOT EXISTS idx_inv_mov_producto ON inventory_movements(producto_id);
CREATE INDEX IF NOT EXISTS idx_inv_mov_tipo ON inventory_movements(tipo);
CREATE INDEX IF NOT EXISTS idx_inv_mov_created ON inventory_movements(created_at);