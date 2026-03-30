CREATE TABLE IF NOT EXISTS import_jobs (
  id                   uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  filename             varchar(255) NOT NULL,
  content              text,
  status               varchar(50) NOT NULL DEFAULT 'PENDING',
  total_rows           integer,
  processed            integer DEFAULT 0,
  created_count        integer DEFAULT 0,
  updated_count        integer DEFAULT 0,
  errors               text,
  result_path          varchar(500),
  created_by           uuid REFERENCES users(id) ON DELETE SET NULL,
  default_product_type varchar(50),
  created_at           timestamptz NOT NULL DEFAULT now()
);