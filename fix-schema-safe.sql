-- Script SEGURO para actualizar el esquema de Supabase
-- Este script verifica primero qué existe antes de modificar

-- ==========================================
-- 1. GENETICS - Agregar code si no existe
-- ==========================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'genetics' AND column_name = 'code'
  ) THEN
    ALTER TABLE genetics ADD COLUMN code TEXT;
    RAISE NOTICE '✅ Agregada columna code a genetics';
  ELSE
    RAISE NOTICE 'ℹ️  Columna code ya existe en genetics';
  END IF;
END $$;

-- ==========================================
-- 2. EQUIPMENT - Agregar columnas faltantes
-- ==========================================
DO $$
BEGIN
  -- Agregar category
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'equipment' AND column_name = 'category'
  ) THEN
    ALTER TABLE equipment ADD COLUMN category TEXT;
    RAISE NOTICE '✅ Agregada columna category a equipment';
  END IF;

  -- Agregar room_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'equipment' AND column_name = 'room_id'
  ) THEN
    ALTER TABLE equipment ADD COLUMN room_id UUID REFERENCES locations(id) ON DELETE SET NULL;
    RAISE NOTICE '✅ Agregada columna room_id a equipment';
  END IF;

  -- Agregar lifespan_hours
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'equipment' AND column_name = 'lifespan_hours'
  ) THEN
    ALTER TABLE equipment ADD COLUMN lifespan_hours INTEGER;
    RAISE NOTICE '✅ Agregada columna lifespan_hours a equipment';
  END IF;

  -- Renombrar installation_date a purchase_date si existe
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'equipment' AND column_name = 'installation_date'
  ) THEN
    ALTER TABLE equipment RENAME COLUMN installation_date TO purchase_date;
    RAISE NOTICE '✅ Renombrada installation_date a purchase_date';
  END IF;

  -- Renombrar warranty_expiry_date a warranty_end_date si existe
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'equipment' AND column_name = 'warranty_expiry_date'
  ) THEN
    ALTER TABLE equipment RENAME COLUMN warranty_expiry_date TO warranty_end_date;
    RAISE NOTICE '✅ Renombrada warranty_expiry_date a warranty_end_date';
  END IF;
END $$;

-- ==========================================
-- 3. TASKS - Recrear con esquema correcto
-- ==========================================
DROP TABLE IF EXISTS tasks CASCADE;

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  recurrence_type TEXT NOT NULL,
  day_of_week INTEGER,
  day_of_month INTEGER,
  date DATE,
  assignee_roles TEXT[] NOT NULL DEFAULT '{}',
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  category TEXT,
  equipment_type TEXT,
  required_tools TEXT[] DEFAULT '{}',
  required_parts JSONB DEFAULT '[]',
  sop JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 4. INVENTORY_ITEMS - Agregar columnas
-- ==========================================
DO $$
BEGIN
  -- inventory_type
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'inventory_items' AND column_name = 'inventory_type'
  ) THEN
    ALTER TABLE inventory_items ADD COLUMN inventory_type TEXT;
  END IF;

  -- location_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'inventory_items' AND column_name = 'location_id'
  ) THEN
    ALTER TABLE inventory_items ADD COLUMN location_id UUID REFERENCES locations(id) ON DELETE SET NULL;
  END IF;

  -- min_stock_level
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'inventory_items' AND column_name = 'min_stock_level'
  ) THEN
    ALTER TABLE inventory_items ADD COLUMN min_stock_level NUMERIC;
  END IF;

  -- description
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'inventory_items' AND column_name = 'description'
  ) THEN
    ALTER TABLE inventory_items ADD COLUMN description TEXT;
  END IF;

  -- part_number
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'inventory_items' AND column_name = 'part_number'
  ) THEN
    ALTER TABLE inventory_items ADD COLUMN part_number TEXT;
  END IF;

  -- purchase_unit
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'inventory_items' AND column_name = 'purchase_unit'
  ) THEN
    ALTER TABLE inventory_items ADD COLUMN purchase_unit TEXT;
  END IF;

  -- purchase_unit_conversion
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'inventory_items' AND column_name = 'purchase_unit_conversion'
  ) THEN
    ALTER TABLE inventory_items ADD COLUMN purchase_unit_conversion NUMERIC;
  END IF;

  -- reuse_count
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'inventory_items' AND column_name = 'reuse_count'
  ) THEN
    ALTER TABLE inventory_items ADD COLUMN reuse_count INTEGER;
  END IF;

  -- average_cost_per_unit
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'inventory_items' AND column_name = 'average_cost_per_unit'
  ) THEN
    ALTER TABLE inventory_items ADD COLUMN average_cost_per_unit NUMERIC;
  END IF;

  -- Renombrar quantity a current_stock si existe
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'inventory_items' AND column_name = 'quantity'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'inventory_items' AND column_name = 'current_stock'
  ) THEN
    ALTER TABLE inventory_items RENAME COLUMN quantity TO current_stock;
  END IF;

  -- Renombrar purchase_history a purchases si existe
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'inventory_items' AND column_name = 'purchase_history'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'inventory_items' AND column_name = 'purchases'
  ) THEN
    ALTER TABLE inventory_items RENAME COLUMN purchase_history TO purchases;
  END IF;

  RAISE NOTICE '✅ Tabla inventory_items actualizada';
END $$;

-- ==========================================
-- 5. LOCATIONS - Agregar columnas
-- ==========================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'locations' AND column_name = 'owner_id'
  ) THEN
    ALTER TABLE locations ADD COLUMN owner_id UUID REFERENCES users(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'locations' AND column_name = 'light_on_time'
  ) THEN
    ALTER TABLE locations ADD COLUMN light_on_time TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'locations' AND column_name = 'light_off_time'
  ) THEN
    ALTER TABLE locations ADD COLUMN light_off_time TEXT;
  END IF;

  RAISE NOTICE '✅ Tabla locations actualizada';
END $$;

-- ==========================================
-- 6. FORMULAS - Agregar target_ppm
-- ==========================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'formulas' AND column_name = 'target_ppm'
  ) THEN
    ALTER TABLE formulas ADD COLUMN target_ppm NUMERIC;
    RAISE NOTICE '✅ Agregada columna target_ppm a formulas';
  END IF;
END $$;

-- ==========================================
-- Mensaje final
-- ==========================================
DO $$
BEGIN
  RAISE NOTICE '✅✅✅ ESQUEMA ACTUALIZADO EXITOSAMENTE ✅✅✅';
  RAISE NOTICE 'Ahora puedes ejecutar: update-genetics-codes.sql';
END $$;
