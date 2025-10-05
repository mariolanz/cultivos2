-- Torus Ac. Cannabis Cultivation Management System
-- Supabase Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES WITHOUT DEPENDENCIES (create first)
-- ============================================

-- Genetics table (no dependencies)
CREATE TABLE IF NOT EXISTS genetics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'Índica', 'Sativa', 'Híbrida'
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
  type TEXT NOT NULL, -- 'site', 'room'
  parent_id UUID REFERENCES locations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLES DEPENDENT ON LOCATIONS
-- ============================================

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

-- Equipment table (depends on locations)
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

-- ============================================
-- TABLES DEPENDENT ON GENETICS AND LOCATIONS
-- ============================================

-- Mother Plants table (depends on genetics, locations)
CREATE TABLE IF NOT EXISTS mother_plants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  genetics_id UUID REFERENCES genetics(id) ON DELETE CASCADE,
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  sowing_date DATE NOT NULL,
  clone_count INTEGER DEFAULT 0,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crops table (depends on genetics, locations, users)
CREATE TABLE IF NOT EXISTS crops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  genetics_id UUID REFERENCES genetics(id) ON DELETE CASCADE,
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  cloning_date DATE NOT NULL,
  pre_veg_date DATE,
  veg_date DATE,
  flower_date DATE,
  drying_curing_date DATE,
  harvest_date DATE,
  light_hours_veg INTEGER DEFAULT 18,
  light_hours_flower INTEGER DEFAULT 12,
  is_archived BOOLEAN DEFAULT FALSE,
  harvest_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLES DEPENDENT ON MULTIPLE ENTITIES
-- ============================================

-- Plant Batches table (depends on genetics, locations, users, mother_plants)
CREATE TABLE IF NOT EXISTS plant_batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  genetics_id UUID REFERENCES genetics(id) ON DELETE CASCADE,
  creation_date DATE NOT NULL,
  initial_plant_count INTEGER NOT NULL,
  rooted_plant_count INTEGER,
  available_plant_count INTEGER NOT NULL,
  source_location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  type TEXT NOT NULL, -- 'seed' or 'clone'
  status TEXT NOT NULL, -- PlantBatchStatus enum values
  creator_id UUID REFERENCES users(id) ON DELETE SET NULL,
  mother_plant_id UUID REFERENCES mother_plants(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crop Plant Counts (junction table for crops and batches)
CREATE TABLE IF NOT EXISTS crop_plant_counts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  crop_id UUID REFERENCES crops(id) ON DELETE CASCADE,
  batch_id UUID REFERENCES plant_batches(id) ON DELETE CASCADE,
  count INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Log Entries table (for crops, batches, and mother plants)
CREATE TABLE IF NOT EXISTS log_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  crop_id UUID REFERENCES crops(id) ON DELETE CASCADE,
  batch_id UUID REFERENCES plant_batches(id) ON DELETE CASCADE,
  mother_plant_id UUID REFERENCES mother_plants(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  environmental JSONB,
  irrigation JSONB,
  ipm JSONB,
  observations TEXT,
  photos TEXT[],
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT log_entry_belongs_to_one CHECK (
    (crop_id IS NOT NULL)::INTEGER + 
    (batch_id IS NOT NULL)::INTEGER + 
    (mother_plant_id IS NOT NULL)::INTEGER = 1
  )
);

-- ============================================
-- STANDALONE TABLES (no foreign keys)
-- ============================================

-- Formulas table
CREATE TABLE IF NOT EXISTS formulas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'Vegetación', 'Floración', etc.
  nutrients JSONB NOT NULL,
  ec NUMERIC,
  ph NUMERIC,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Formula Schedule table
CREATE TABLE IF NOT EXISTS formula_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  schedules JSONB NOT NULL, -- { veg: [...], flower: [...] }
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inventory Items table
CREATE TABLE IF NOT EXISTS inventory_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 0,
  unit TEXT NOT NULL,
  cost_per_unit NUMERIC DEFAULT 0,
  supplier TEXT,
  purchase_history JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Infographics table
CREATE TABLE IF NOT EXISTS infographics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TASK AND MAINTENANCE TABLES
-- ============================================

-- Tasks table (depends on users, crops, equipment)
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL, -- 'cultivation', 'maintenance'
  priority TEXT DEFAULT 'medium',
  due_date DATE,
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  crop_id UUID REFERENCES crops(id) ON DELETE CASCADE,
  equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE,
  completed_for_crops TEXT[] DEFAULT '{}',
  is_completed BOOLEAN DEFAULT FALSE,
  recurring TEXT, -- 'daily', 'weekly', 'monthly', null
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Maintenance Logs table (depends on tasks, equipment, users)
CREATE TABLE IF NOT EXISTS maintenance_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE,
  performed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  performed_date DATE NOT NULL,
  notes TEXT,
  photo TEXT,
  parts_used JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- FINANCIAL AND OPERATIONAL TABLES
-- ============================================

-- Expenses table (depends on locations, crops, users)
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

-- Trimming Sessions table (depends on crops, users)
CREATE TABLE IF NOT EXISTS trimming_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  crop_id UUID REFERENCES crops(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  trimmer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  weight_before NUMERIC NOT NULL,
  weight_after NUMERIC NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- COMMUNICATION TABLES
-- ============================================

-- Notifications table (depends on users)
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info', -- 'info', 'warning', 'success', 'error'
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Announcements table (depends on locations, users)
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message TEXT NOT NULL,
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  read_by TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PNO Procedures table (depends on users)
CREATE TABLE IF NOT EXISTS pno_procedures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  version TEXT DEFAULT '1.0',
  content JSONB NOT NULL,
  attachments TEXT[],
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_crops_owner ON crops(owner_id);
CREATE INDEX IF NOT EXISTS idx_crops_genetics ON crops(genetics_id);
CREATE INDEX IF NOT EXISTS idx_crops_location ON crops(location_id);
CREATE INDEX IF NOT EXISTS idx_crops_archived ON crops(is_archived);
CREATE INDEX IF NOT EXISTS idx_log_entries_crop ON log_entries(crop_id);
CREATE INDEX IF NOT EXISTS idx_log_entries_batch ON log_entries(batch_id);
CREATE INDEX IF NOT EXISTS idx_log_entries_mother ON log_entries(mother_plant_id);
CREATE INDEX IF NOT EXISTS idx_log_entries_date ON log_entries(date);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_crop ON tasks(crop_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE plant_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE mother_plants ENABLE ROW LEVEL SECURITY;
ALTER TABLE log_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- ============================================

-- Users can read their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can view crops they own or are assigned to their location
CREATE POLICY "Users can view accessible crops" ON crops
  FOR SELECT USING (
    owner_id = auth.uid() OR
    location_id IN (
      SELECT location_id FROM users WHERE id = auth.uid()
    )
  );

-- Users can insert their own crops
CREATE POLICY "Users can insert own crops" ON crops
  FOR INSERT WITH CHECK (owner_id = auth.uid());

-- Users can update their own crops
CREATE POLICY "Users can update own crops" ON crops
  FOR UPDATE USING (owner_id = auth.uid());

-- Similar policies for other tables...
-- (Add more policies as needed for your security requirements)
