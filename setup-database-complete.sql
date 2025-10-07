-- ============================================
-- TORUS AC. - SCRIPT MAESTRO DE BASE DE DATOS
-- Ejecutar en DESARROLLO y PRODUCCIÓN
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. CREAR TODAS LAS TABLAS
-- ============================================

-- Genetics table (no dependencies)
CREATE TABLE IF NOT EXISTS genetics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT,
  type TEXT,
  thc_content NUMERIC,
  cbd_content NUMERIC,
  flowering_days INTEGER,
  description TEXT,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Locations table (self-referencing only)
CREATE TABLE IF NOT EXISTS locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT,
  parent_id UUID REFERENCES locations(id) ON DELETE CASCADE,
  light_on_time TIME,
  light_off_time TIME,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table (depends on locations)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  roles TEXT[] NOT NULL DEFAULT '{}',
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  maintenance_location_ids UUID[] DEFAULT '{}',
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Equipment table
CREATE TABLE IF NOT EXISTS equipment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  installation_date DATE,
  warranty_expiry_date DATE,
  maintenance_interval_days INTEGER,
  last_maintenance_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mother Plants table
CREATE TABLE IF NOT EXISTS mother_plants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  genetics_id UUID REFERENCES genetics(id) ON DELETE CASCADE,
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  sowing_date TIMESTAMP WITH TIME ZONE,
  clone_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Plant Batches table
CREATE TABLE IF NOT EXISTS plant_batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  genetics_id UUID REFERENCES genetics(id) ON DELETE CASCADE,
  creation_date TIMESTAMP WITH TIME ZONE NOT NULL,
  initial_plant_count INTEGER NOT NULL,
  available_plant_count INTEGER NOT NULL,
  source_location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL,
  creator_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crops table
CREATE TABLE IF NOT EXISTS crops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  genetics_id UUID REFERENCES genetics(id) ON DELETE CASCADE,
  location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  cloning_date TIMESTAMP WITH TIME ZONE,
  pre_veg_date TIMESTAMP WITH TIME ZONE,
  veg_date TIMESTAMP WITH TIME ZONE,
  flower_date TIMESTAMP WITH TIME ZONE,
  harvest_date TIMESTAMP WITH TIME ZONE,
  light_hours JSONB DEFAULT '{"veg": 18, "flower": 12}',
  status TEXT DEFAULT 'active',
  archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crop Plant Counts
CREATE TABLE IF NOT EXISTS crop_plant_counts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  crop_id UUID REFERENCES crops(id) ON DELETE CASCADE,
  batch_id TEXT NOT NULL,
  count INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Log Entries table
CREATE TABLE IF NOT EXISTS log_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  crop_id UUID REFERENCES crops(id) ON DELETE CASCADE,
  batch_id TEXT,
  mother_plant_id UUID REFERENCES mother_plants(id) ON DELETE CASCADE,
  stage TEXT,
  temperature NUMERIC,
  humidity NUMERIC,
  co2 NUMERIC,
  vpd NUMERIC,
  ec NUMERIC,
  ph NUMERIC,
  irrigation_ml NUMERIC,
  plant_health TEXT,
  foliar_products TEXT[] DEFAULT '{}',
  supplement_products TEXT[] DEFAULT '{}',
  observations TEXT,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Formulas table
CREATE TABLE IF NOT EXISTS formulas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  tank_liters NUMERIC NOT NULL,
  stage TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Formula Schedules table
CREATE TABLE IF NOT EXISTS formula_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  formula_id UUID REFERENCES formulas(id) ON DELETE CASCADE,
  week INTEGER NOT NULL,
  nutrients JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inventory Items table
CREATE TABLE IF NOT EXISTS inventory_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  inventory_type TEXT NOT NULL,
  unit TEXT NOT NULL,
  purchase_unit TEXT,
  purchase_unit_conversion NUMERIC,
  current_stock NUMERIC DEFAULT 0,
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  average_cost_per_unit NUMERIC DEFAULT 0,
  description TEXT,
  part_number TEXT,
  supplier TEXT,
  min_stock_level NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  priority TEXT DEFAULT 'media',
  status TEXT DEFAULT 'pendiente',
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  crop_id UUID REFERENCES crops(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  due_date DATE,
  completed_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Maintenance Logs table
CREATE TABLE IF NOT EXISTS maintenance_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  performed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  cost NUMERIC,
  next_maintenance_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  crop_id UUID REFERENCES crops(id) ON DELETE SET NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trimming Sessions table
CREATE TABLE IF NOT EXISTS trimming_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  crop_id UUID REFERENCES crops(id) ON DELETE CASCADE,
  trimmer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  hours_worked NUMERIC NOT NULL,
  grams_trimmed NUMERIC NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- PNO Procedures table
CREATE TABLE IF NOT EXISTS pno_procedures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  steps JSONB DEFAULT '[]',
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Infographics table
CREATE TABLE IF NOT EXISTS infographics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. CORREGIR ROLES DE USUARIOS (si existen)
-- ============================================
UPDATE users SET roles = 
  ARRAY(
    SELECT CASE 
      WHEN unnest = 'ADMIN' THEN 'ADMINISTRADOR'
      WHEN unnest = 'GROWER' THEN 'CULTIVADOR'
      WHEN unnest = 'MAINTENANCE' THEN 'MANTENIMIENTO'
      WHEN unnest = 'TRIMMER' THEN 'TRIMEADOR'
      ELSE unnest
    END
    FROM unnest(roles)
  )
WHERE roles && ARRAY['ADMIN', 'GROWER', 'MAINTENANCE', 'TRIMMER']::text[];

-- ============================================
-- 3. VERIFICAR TABLAS CREADAS
-- ============================================
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name AND table_schema = 'public') as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
