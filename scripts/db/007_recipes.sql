-- scripts/db/007_recipes.sql
-- Tablas para gestión de recetas y alérgenos
-- Autor: Sistema de Recetas
-- Fecha: 2026-03-12

BEGIN;

-- =========================
-- ENUMS FOR RECIPES
-- =========================
DO $$ BEGIN
  CREATE TYPE public.difficulty_level AS ENUM ('FACIL', 'MEDIA', 'DIFICIL');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =========================
-- RECIPES TABLE
-- =========================
CREATE TABLE IF NOT EXISTS public.recipes (
  id                uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  code              varchar(30) UNIQUE NOT NULL,
  name              varchar(200) NOT NULL,
  restaurant_name   varchar(200),
  category_name     varchar(100),
  prepared_at       date,
  portion_size      varchar(100),
  servings_count    integer,
  public_sale_price numeric(10, 2),
  tax_percent       numeric(5, 2),
  net_sale_price    numeric(10, 2),
  service_temperature varchar(100),
  description       text,
  dish_image_url    text,
  elaboration       text,
  presentation      text,
  required_equipment text,
  difficulty        public.difficulty_level NOT NULL,
  yield_quantity    decimal(10, 2) NOT NULL,
  yield_unit        varchar(50) NOT NULL,
  prep_time         integer NOT NULL DEFAULT 0,
  cook_time         integer NOT NULL DEFAULT 0,
  is_active         boolean NOT NULL DEFAULT true,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS recipes_code_idx ON public.recipes(code);

-- =========================
-- RECIPE_ITEMS TABLE (Escandallo - Ingredientes)
-- =========================
CREATE TABLE IF NOT EXISTS public.recipe_items (
  id                uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id         uuid NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  product_id        uuid NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity          decimal(12, 4) NOT NULL,
  unit_price        decimal(12, 2) NOT NULL,
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS recipe_items_recipe_id_idx ON public.recipe_items(recipe_id);
CREATE INDEX IF NOT EXISTS recipe_items_product_id_idx ON public.recipe_items(product_id);

-- =========================
-- ALLERGENS TABLE
-- =========================
CREATE TABLE IF NOT EXISTS public.allergens (
  id                uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name              varchar(100) NOT NULL UNIQUE,
  description       text,
  category          varchar(100) NOT NULL DEFAULT 'Alimentos',
  is_active         boolean NOT NULL DEFAULT true,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- =========================
-- RECIPE_ALLERGENS TABLE (Alérgenos de la receta)
-- =========================
CREATE TABLE IF NOT EXISTS public.recipe_allergens (
  id                uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id         uuid NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  allergen_name     varchar(100) NOT NULL,
  is_present        boolean NOT NULL DEFAULT true,
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS recipe_allergens_recipe_id_idx ON public.recipe_allergens(recipe_id);

-- =========================
-- SEED DATA - ALLERGENS
-- =========================
INSERT INTO public.allergens (name, description) VALUES
  ('Gluten', 'Contiene gluten'),
  ('Lácteos', 'Contiene leche y derivados'),
  ('Huevo', 'Contiene huevo'),
  ('Cacahuetes', 'Contiene cacahuetes'),
  ('Frutos secos', 'Contiene frutos secos'),
  ('Soja', 'Contiene soja'),
  ('Pescado', 'Contiene pescado'),
  ('Marisco', 'Contiene marisco'),
  ('Sésamo', 'Contiene sésamo')
ON CONFLICT (name) DO NOTHING;

-- =========================
-- SEED DATA - SAMPLE RECIPES
-- =========================
INSERT INTO public.recipes (code, name, description, difficulty, yield_quantity, yield_unit, prep_time, cook_time, is_active) VALUES
  ('REC001', 'Pasta Carbonara', 'Pasta italiana clásica con huevo y jamón', 'MEDIA', 4, 'porciones', 10, 20, true),
  ('REC002', 'Ensalada Mixta', 'Ensalada fresca con verduras de temporada', 'FACIL', 2, 'porciones', 15, 0, true),
  ('REC003', 'Paella de Marisco', 'Paella traditional con mariscos variados', 'DIFICIL', 6, 'porciones', 30, 45, true)
ON CONFLICT (code) DO NOTHING;

COMMIT;
