-- scripts/db/001_init.sql
-- Esquema actualizado - Proyecto Intermodular Lovelace
-- Basado en estructura_lovelace.sql (schema real)

BEGIN;

-- =========================
-- EXTENSIONS
-- =========================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================
-- ENUMS
-- =========================
DO $$ BEGIN
  CREATE TYPE public.user_role AS ENUM ('SUPERADMIN', 'ADMIN', 'USER');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.order_status AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'MERGED', 'ORDERED', 'RECEIVED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.product_type AS ENUM ('INGREDIENT', 'MATERIAL');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.movement_type AS ENUM ('IN', 'OUT', 'RETURN', 'WASTE', 'ADJUSTMENT');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.incident_section AS ENUM ('INGREDIENTES', 'MATERIALES', 'USUARIOS', 'PEDIDOS', 'ALBARANES', 'PROVEEDORES', 'OTRO');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =========================
-- USERS
-- =========================
CREATE TABLE IF NOT EXISTS public.users (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email         varchar(255) UNIQUE NOT NULL,
  password_hash text NOT NULL,
  role          public.user_role NOT NULL,
  nombre        varchar(120) NOT NULL,
  apellido1     varchar(120) NOT NULL,
  apellido2     varchar(120),
  is_active     boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- =========================
-- SUPPLIERS
-- =========================
CREATE TABLE IF NOT EXISTS public.suppliers (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          varchar(200) UNIQUE NOT NULL,
  contact_email varchar(255),
  phone         varchar(50),
  notes         text,
  is_active     boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- =========================
-- CATEGORIES
-- =========================
CREATE TABLE IF NOT EXISTS public.categories (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         varchar(120) NOT NULL,
  product_type public.product_type NOT NULL,
  CONSTRAINT uq_category UNIQUE (name, product_type)
);

-- =========================
-- STUDIES
-- =========================
CREATE TABLE IF NOT EXISTS public.studies (
  id   uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name varchar(120) UNIQUE NOT NULL
);

-- =========================
-- CLASSES
-- =========================
CREATE TABLE IF NOT EXISTS public.classes (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  level      varchar(60) NOT NULL,
  group_code varchar(10) NOT NULL,
  study_id   uuid NOT NULL REFERENCES public.studies(id) ON DELETE RESTRICT,
  CONSTRAINT uq_class UNIQUE (level, group_code, study_id)
);

-- =========================
-- PRODUCTS
-- =========================
CREATE TABLE IF NOT EXISTS public.products (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  code          varchar(30) UNIQUE NOT NULL,
  name          varchar(200) NOT NULL,
  product_type  public.product_type NOT NULL,
  unit_type     varchar(30) NOT NULL,
  unit_price    numeric(12,2) NOT NULL CHECK (unit_price >= 0),
  supplier_id   uuid NOT NULL REFERENCES public.suppliers(id) ON DELETE RESTRICT,
  category_id   uuid NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  yield_percent numeric(5,2),
  relation      numeric(10,4),
  expires_at    date,
  created_by    uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  is_active     boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_type ON public.products(product_type);

-- =========================
-- INVENTORY
-- =========================
CREATE TABLE IF NOT EXISTS public.inventory (
  product_id  uuid PRIMARY KEY REFERENCES public.products(id) ON DELETE CASCADE,
  current_qty numeric(12,3) NOT NULL DEFAULT 0,
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- =========================
-- STOCK MOVEMENTS
-- =========================
CREATE TABLE IF NOT EXISTS public.stock_movements (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id    uuid NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  movement_type public.movement_type NOT NULL,
  qty           numeric(12,3) NOT NULL CHECK (qty > 0),
  reason        text,
  created_by    uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON public.stock_movements(product_id);

-- =========================
-- ORDERS
-- =========================
CREATE TABLE IF NOT EXISTS public.orders (
  id                    uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by            uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  class_id              uuid REFERENCES public.classes(id) ON DELETE SET NULL,
  supplier_id           uuid REFERENCES public.suppliers(id) ON DELETE SET NULL,
  status                public.order_status NOT NULL DEFAULT 'DRAFT',
  week_start            date NOT NULL,
  merged_into_order_id  uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_week ON public.orders(week_start);

-- =========================
-- ORDER ITEMS
-- =========================
CREATE TABLE IF NOT EXISTS public.order_items (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id      uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id    uuid NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  qty_requested numeric(12,3) NOT NULL CHECK (qty_requested > 0),
  qty_approved  numeric(12,3),
  notes         text,
  CONSTRAINT uq_order_product UNIQUE (order_id, product_id)
);

-- =========================
-- DELIVERY NOTES
-- =========================
CREATE TABLE IF NOT EXISTS public.delivery_notes (
  code        varchar(60) UNIQUE,
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id    uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  supplier_id uuid NOT NULL REFERENCES public.suppliers(id) ON DELETE RESTRICT,
  received_by uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  received_at timestamptz NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- =========================
-- DELIVERY NOTE ITEMS
-- =========================
CREATE TABLE IF NOT EXISTS public.delivery_note_items (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  delivery_note_id uuid NOT NULL REFERENCES public.delivery_notes(id) ON DELETE CASCADE,
  product_id       uuid NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  qty_received     numeric(12,3) NOT NULL CHECK (qty_received > 0),
  unit_price       numeric(12,2),
  CONSTRAINT uq_dn_product UNIQUE (delivery_note_id, product_id)
);

-- =========================
-- INCIDENTS
-- =========================
CREATE TABLE IF NOT EXISTS public.incidents (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by  uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  section     public.incident_section NOT NULL,
  context     text NOT NULL,
  is_reviewed boolean NOT NULL DEFAULT false,
  reviewed_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- =========================
-- STUDENT PROFILE
-- =========================
CREATE TABLE IF NOT EXISTS public.student_profile (
  user_id  uuid PRIMARY KEY REFERENCES public.users(id) ON DELETE RESTRICT,
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE RESTRICT
);

-- =========================
-- TEACHER CLASS
-- =========================
CREATE TABLE IF NOT EXISTS public.teacher_class (
  teacher_id uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  class_id   uuid NOT NULL REFERENCES public.classes(id) ON DELETE RESTRICT,
  PRIMARY KEY (teacher_id, class_id)
);

COMMIT;
