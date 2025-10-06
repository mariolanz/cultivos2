-- SQL Script para actualizar el esquema de Supabase 
-- y hacerlo compatible con el frontend de Torus Ac.
-- EJECUTAR ESTE SCRIPT EN SUPABASE SQL EDITOR

-- ==========================================
-- 1. ACTUALIZAR TABLA GENETICS
-- ==========================================
-- Agregar columna 'code' que falta
ALTER TABLE genetics ADD COLUMN IF NOT EXISTS code TEXT;

-- Eliminar columnas que NO usa el frontend
ALTER TABLE genetics DROP COLUMN IF EXISTS type;
ALTER TABLE genetics DROP COLUMN IF EXISTS thc_content;
ALTER TABLE genetics DROP COLUMN IF EXISTS cbd_content;
ALTER TABLE genetics DROP COLUMN IF EXISTS flowering_days;
ALTER TABLE genetics DROP COLUMN IF EXISTS image;

-- ==========================================
-- 2. ACTUALIZAR TABLA EQUIPMENT
-- ==========================================
-- Renombrar y agregar columnas para coincidir con el frontend
ALTER TABLE equipment RENAME COLUMN type TO equipment_type_old;
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS room_id UUID REFERENCES locations(id) ON DELETE SET NULL;
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS lifespan_hours INTEGER;

-- Renombrar fechas para coincidir con frontend
ALTER TABLE equipment RENAME COLUMN installation_date TO purchase_date;
ALTER TABLE equipment RENAME COLUMN warranty_expiry_date TO warranty_end_date;

-- Eliminar columnas que NO usa el frontend
ALTER TABLE equipment DROP COLUMN IF EXISTS maintenance_interval_days;
ALTER TABLE equipment DROP COLUMN IF EXISTS last_maintenance_date;
ALTER TABLE equipment DROP COLUMN IF EXISTS notes;
ALTER TABLE equipment DROP COLUMN IF EXISTS equipment_type_old;

-- ==========================================
-- 3. ACTUALIZAR TABLA TASKS
-- ==========================================
-- Eliminar la tabla tasks actual y recrearla con el esquema correcto
DROP TABLE IF EXISTS tasks CASCADE;

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  recurrence_type TEXT NOT NULL, -- 'daily', 'weekly', 'monthly', 'single', 'bimonthly', 'quarterly', 'semiannually'
  day_of_week INTEGER, -- 0=Sun, 1=Mon, ..., 6=Sat (for weekly)
  day_of_month INTEGER, -- 1-31 (for monthly)
  date DATE, -- For 'single' type
  assignee_roles TEXT[] NOT NULL DEFAULT '{}', -- Array of UserRole values
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  category TEXT, -- 'HVAC', 'Riego', 'Iluminación', 'Sensores', 'General', 'Ventilación'
  equipment_type TEXT,
  required_tools TEXT[] DEFAULT '{}',
  required_parts JSONB DEFAULT '[]', -- [{ inventoryItemId, quantity }]
  sop JSONB, -- { title, steps: [...] }
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 4. ACTUALIZAR TABLA INVENTORY_ITEMS
-- ==========================================
-- Agregar columnas que faltan
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS inventory_type TEXT; -- 'Cultivo' o 'Mantenimiento'
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES locations(id) ON DELETE SET NULL;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS min_stock_level NUMERIC;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS part_number TEXT;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS purchase_unit TEXT;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS purchase_unit_conversion NUMERIC;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS reuse_count INTEGER;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS average_cost_per_unit NUMERIC;

-- Renombrar columnas para coincidir con frontend
ALTER TABLE inventory_items RENAME COLUMN quantity TO current_stock;
ALTER TABLE inventory_items RENAME COLUMN purchase_history TO purchases;

-- ==========================================
-- 5. ACTUALIZAR TABLA LOCATIONS
-- ==========================================
-- Agregar columnas que faltan
ALTER TABLE locations ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS light_on_time TEXT; -- "HH:MM"
ALTER TABLE locations ADD COLUMN IF NOT EXISTS light_off_time TEXT; -- "HH:MM"

-- ==========================================
-- 6. ACTUALIZAR TABLA FORMULAS
-- ==========================================
-- Renombrar y actualizar
ALTER TABLE formulas DROP COLUMN IF EXISTS type;
ALTER TABLE formulas ADD COLUMN IF NOT EXISTS target_ppm NUMERIC;

-- Eliminar columnas no usadas
ALTER TABLE formulas DROP COLUMN IF EXISTS ec;

-- ==========================================
-- Mensajes de confirmación
-- ==========================================
DO $$
BEGIN
  RAISE NOTICE '✅ Esquema actualizado exitosamente';
  RAISE NOTICE 'Ahora puedes guardar genéticas, equipos, tareas e inventario desde el frontend';
END $$;
