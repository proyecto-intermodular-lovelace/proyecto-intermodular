-- scripts/db/003_suppliers.sql
-- Tabla de proveedores - Proyecto Intermodular Lovelace

BEGIN;

-- =========================
-- SUPPLIERS
-- =========================
CREATE TABLE IF NOT EXISTS suppliers (
  id                    uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre                varchar(255) NOT NULL,
  contacto              varchar(255),
  email                 varchar(255) UNIQUE,
  telefono              varchar(50),
  direccion             text,
  ciudad                varchar(100),
  pais                  varchar(100) DEFAULT 'España',
  cif                   varchar(20) UNIQUE,
  categorias_suministro varchar(500),
  notas                 text,
  activo                boolean NOT NULL DEFAULT true,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_suppliers_nombre  ON suppliers(nombre);
CREATE INDEX IF NOT EXISTS idx_suppliers_activo  ON suppliers(activo);
CREATE INDEX IF NOT EXISTS idx_suppliers_ciudad  ON suppliers(ciudad);

-- =========================
-- SEED: proveedores de ejemplo
-- =========================
INSERT INTO suppliers (nombre, contacto, email, telefono, direccion, ciudad, pais, cif, categorias_suministro, notas, activo)
VALUES
  ('Lácteos del Norte S.L.',      'Ana Fernández',   'ana@lacteosnorte.es',    '+34 600 111 222', 'Polígono Industrial Norte, Nave 3', 'Santander',  'España', 'B11111111', 'Lácteos,Quesos,Mantequilla',           'Proveedor principal de lácteos',         true),
  ('Carnicería Hermanos Pérez',   'José Pérez',      'jose@hnospecee.es',      '+34 600 333 444', 'C/ Carnicería 5',                  'Valencia',   'España', 'B22222222', 'Carnes,Embutidos',                       'Entrega martes y jueves',                true),
  ('Verduras Eco S.A.',           'Laura Gómez',     'ventas@verdecas.es',     '+34 600 555 666', 'Mercamadrid, Puerta 12',           'Madrid',     'España', 'A33333333', 'Verduras,Frutas,Legumbres',              'Certificado ecológico BIO-ES',           true),
  ('Distribuciones Ibéricas S.A.','Carlos Moreno',   'cmoreno@dibeeri.com',    '+34 600 777 888', 'Av. Distribución 22',              'Sevilla',    'España', 'A44444444', 'Aceites,Conservas,Especias',             NULL,                                      true),
  ('Pescados del Atlántico S.L.', 'María Castro',    'mcastro@pescatlant.es',  '+34 600 999 000', 'Puerto Pesquero, Local 7',         'A Coruña',   'España', 'B55555555', 'Pescados,Mariscos,Congelados',           'Entrega los lunes antes de las 8h',      true),
  ('Suministros de Cocina S.L.',  'Roberto Sanz',    'rsanz@sumicocina.es',    '+34 600 101 202', 'C/ Industrial 8',                  'Barcelona',  'España', 'B66666666', 'Utensilios,Equipamiento,Vajilla',        'Proveedor de material de cocina',        true),
  ('Embalajes Express S.A.',      'Pilar Ruiz',      'pilar@emblajes.es',      '+34 600 303 404', 'Polígono Sur, Nave 15',            'Zaragoza',   'España', 'A77777777', 'Packaging,Embalaje,Bolsas',              'Plazo de entrega 48h',                   true),
  ('Import Food International',   'Kenji Nakamura',  'kenji@importfood.com',   '+34 600 505 606', 'Zona Franca, Edificio B',          'Barcelona',  'España', 'W88888888', 'Asiáticos,Exóticos,Especias',            'Importador especializado en productos asiáticos', false)
ON CONFLICT DO NOTHING;

COMMIT;
