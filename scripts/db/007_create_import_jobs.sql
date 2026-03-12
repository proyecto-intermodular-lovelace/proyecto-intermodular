-- Create import_jobs table used by background import worker
CREATE TABLE IF NOT EXISTS import_jobs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  filename varchar(255) NOT NULL,
  content text NOT NULL,
  status varchar(32) NOT NULL,
  total_rows integer DEFAULT 0,
  processed integer DEFAULT 0,
  created_count integer DEFAULT 0,
  updated_count integer DEFAULT 0,
  errors jsonb,
  result_path varchar(500),
  created_by uuid,
  created_at timestamptz DEFAULT now()
);
