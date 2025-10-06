-- ========================================
-- SCRIPT MAESTRO: Migrar TODO de constants.ts a Supabase
-- EJECUTAR DESPUÉS de fix-schema-safe.sql
-- ========================================

-- ==========================================
-- 1. INSERTAR GENÉTICAS (30 genetics)
-- ==========================================
INSERT INTO genetics (name, code, description) VALUES
  ('Bannana punch', 'B', NULL),
  ('Banna x BL', 'BXBL', NULL),
  ('Bloodsport', 'BS', NULL),
  ('Big detroit energy', 'BDE', NULL),
  ('Cali cookies', 'CC', NULL),
  ('Champaña', 'CH', NULL),
  ('Candy Store Rbx', 'CS', NULL),
  ('Divoce Cake', 'DC', NULL),
  ('End Game', 'EG', NULL),
  ('Forbiben apple', 'FA', NULL),
  ('Gelato', 'G', NULL),
  ('GMO x Zoobie Kush', 'GMO', NULL),
  ('Hindu kush', 'HK', NULL),
  ('Jelly Breath', 'JB', NULL),
  ('Kit pampoe', 'KP', NULL),
  ('Lemon berry candy', 'LBC', NULL),
  ('Limonada mango', 'LM', NULL),
  ('Lemon up', 'LU', NULL),
  ('Mango', 'MG', NULL),
  ('Nanamichi', 'NN', NULL),
  ('Purple Zkittlez', 'PZ', NULL),
  ('Rufius', 'R', NULL),
  ('Red whine runtz', 'RWR', NULL),
  ('Strowberry candy', 'SBC', NULL),
  ('Strawberry OG Cookies', 'SBOG', NULL),
  ('Slammichi', 'SLAM', NULL),
  ('Sugar michi', 'SU', NULL),
  ('White fire', 'WF', NULL),
  ('VHO', 'VHO', NULL),
  ('Limonada mango SLM', 'SLM', NULL)
ON CONFLICT (name) DO UPDATE SET code = EXCLUDED.code;

-- ==========================================
-- 2. INSERTAR LOCATIONS (24 locations)
-- ==========================================

-- Eliminar location "Central" si existe (creada por init-admin-only.sql)
DELETE FROM locations WHERE name = 'Central' AND parent_id IS NULL;

-- Insertar locations principales
INSERT INTO locations (name, type, parent_id, light_on_time, light_off_time) VALUES
  ('MC', 'site', NULL, NULL, NULL),
  ('LL', 'site', NULL, NULL, NULL),
  ('SS', 'site', NULL, NULL, NULL),
  ('BR', 'site', NULL, NULL, NULL)
ON CONFLICT DO NOTHING;

-- Crear variable para IDs
DO $$
DECLARE
  loc_mc UUID;
  loc_ll UUID;
  loc_ss UUID;
  loc_br UUID;
BEGIN
  -- Obtener IDs de locations principales
  SELECT id INTO loc_mc FROM locations WHERE name = 'MC' AND parent_id IS NULL;
  SELECT id INTO loc_ll FROM locations WHERE name = 'LL' AND parent_id IS NULL;
  SELECT id INTO loc_ss FROM locations WHERE name = 'SS' AND parent_id IS NULL;
  SELECT id INTO loc_br FROM locations WHERE name = 'BR' AND parent_id IS NULL;

  -- Rooms para MC
  INSERT INTO locations (name, type, parent_id, light_on_time, light_off_time) VALUES
    ('MCPREV', 'VEGETACION', loc_mc, '06:00', '23:50'),
    ('MC PLANTAS MADRE', 'VEGETACION', loc_mc, '06:00', '23:50'),
    ('MC1', 'ciclo completo', loc_mc, '06:00', '18:00'),
    ('MC2', 'ciclo completo', loc_mc, '06:00', '23:50'),
    ('MC3', 'ciclo completo', loc_mc, '06:00', '23:50'),
    ('MC4', 'ciclo completo', loc_mc, '06:00', '23:50'),
    ('MC5', 'ciclo completo', loc_mc, '06:00', '23:50')
  ON CONFLICT DO NOTHING;

  -- Rooms para LL
  INSERT INTO locations (name, type, parent_id, light_on_time, light_off_time) VALUES
    ('LLVEG', 'VEGETACION', loc_ll, '06:00', '23:50'),
    ('LLPREV', 'VEGETACION', loc_ll, '06:00', '23:50'),
    ('LL PLANTAS MADRE', 'VEGETACION', loc_ll, '06:00', '23:50'),
    ('LL1', 'FLORACION', loc_ll, '06:00', '18:00'),
    ('LL2', 'FLORACION', loc_ll, '06:00', '18:00'),
    ('LL3', 'FLORACION', loc_ll, '06:00', '18:00')
  ON CONFLICT DO NOTHING;

  -- Rooms para SS
  INSERT INTO locations (name, type, parent_id, light_on_time, light_off_time) VALUES
    ('SS1', 'ciclo completo', loc_ss, '06:00', '18:00'),
    ('SS2', 'ciclo completo', loc_ss, '06:00', '18:00')
  ON CONFLICT DO NOTHING;

  -- Rooms para BR
  INSERT INTO locations (name, type, parent_id, light_on_time, light_off_time) VALUES
    ('BR1', 'ciclo completo', loc_br, '06:00', '18:00'),
    ('BR2', 'ciclo completo', loc_br, '06:00', '18:00'),
    ('BR3', 'ciclo completo', loc_br, '06:00', '18:00'),
    ('BR4', 'ciclo completo', loc_br, '06:00', '18:00'),
    ('BR5', 'ciclo completo', loc_br, '06:00', '18:00')
  ON CONFLICT DO NOTHING;

  RAISE NOTICE '✅ 24 Locations insertadas';
END $$;

-- ==========================================
-- 3. INSERTAR NUTRIENTES E INVENTARIO
-- ==========================================
DO $$
DECLARE
  loc_mc UUID;
  loc_ll UUID;
  loc_ss UUID;
  loc_br UUID;
BEGIN
  -- Obtener IDs de locations
  SELECT id INTO loc_mc FROM locations WHERE name = 'MC' AND parent_id IS NULL;
  SELECT id INTO loc_ll FROM locations WHERE name = 'LL' AND parent_id IS NULL;
  SELECT id INTO loc_ss FROM locations WHERE name = 'SS' AND parent_id IS NULL;
  SELECT id INTO loc_br FROM locations WHERE name = 'BR' AND parent_id IS NULL;

  -- Nutrientes para MC
  INSERT INTO inventory_items (name, category, inventory_type, unit, purchase_unit, purchase_unit_conversion, current_stock, location_id, average_cost_per_unit) VALUES
    ('Silicato de Potasio', 'Nutriente Base', 'Cultivo', 'ml', 'L', 1000, 0, loc_mc, 0),
    ('Yara Calcinit', 'Nutriente Base', 'Cultivo', 'g', 'kg', 1000, 0, loc_mc, 0),
    ('Sulfato de Magnesio', 'Nutriente Base', 'Cultivo', 'g', 'kg', 1000, 0, loc_mc, 0),
    ('Ultrasol Desarrollo', 'Nutriente Base', 'Cultivo', 'g', 'kg', 1000, 0, loc_mc, 0),
    ('Ultrasol Inicial', 'Nutriente Base', 'Cultivo', 'g', 'kg', 1000, 0, loc_mc, 0),
    ('Micros Rexene BSP', 'Nutriente Base', 'Cultivo', 'g', 'kg', 1000, 0, loc_mc, 0),
    ('Ultrasol MKP', 'Nutriente Base', 'Cultivo', 'g', 'kg', 1000, 0, loc_mc, 0),
    ('Melaza', 'Suplemento/Bioestimulante', 'Cultivo', 'ml', 'L', 1000, 0, loc_mc, 0),
    ('Tricodermas', 'Microorganismos/Biológicos', 'Cultivo', 'g', 'kg', 1000, 0, loc_mc, 0),
    ('Aminoacidos', 'Suplemento/Bioestimulante', 'Cultivo', 'ml', 'L', 1000, 0, loc_mc, 0),
    ('Anibac con cobre', 'Control de Plagas/Enfermedades', 'Cultivo', 'ml', 'L', 1000, 0, loc_mc, 0),
    ('Bacillus subtilis', 'Microorganismos/Biológicos', 'Cultivo', 'ml', 'L', 1000, 0, loc_mc, 0),
    ('Rootex', 'Suplemento/Bioestimulante', 'Cultivo', 'ml', 'L', 1000, 0, loc_mc, 0)
  ON CONFLICT DO NOTHING;

  -- Nutrientes para LL
  INSERT INTO inventory_items (name, category, inventory_type, unit, purchase_unit, purchase_unit_conversion, current_stock, location_id, average_cost_per_unit) VALUES
    ('Silicato de Potasio', 'Nutriente Base', 'Cultivo', 'ml', 'L', 1000, 0, loc_ll, 0),
    ('Yara Calcinit', 'Nutriente Base', 'Cultivo', 'g', 'kg', 1000, 0, loc_ll, 0),
    ('Sulfato de Magnesio', 'Nutriente Base', 'Cultivo', 'g', 'kg', 1000, 0, loc_ll, 0),
    ('Ultrasol Desarrollo', 'Nutriente Base', 'Cultivo', 'g', 'kg', 1000, 0, loc_ll, 0),
    ('Ultrasol Inicial', 'Nutriente Base', 'Cultivo', 'g', 'kg', 1000, 0, loc_ll, 0),
    ('Micros Rexene BSP', 'Nutriente Base', 'Cultivo', 'g', 'kg', 1000, 0, loc_ll, 0),
    ('Ultrasol MKP', 'Nutriente Base', 'Cultivo', 'g', 'kg', 1000, 0, loc_ll, 0),
    ('Melaza', 'Suplemento/Bioestimulante', 'Cultivo', 'ml', 'L', 1000, 0, loc_ll, 0),
    ('Tricodermas', 'Microorganismos/Biológicos', 'Cultivo', 'g', 'kg', 1000, 0, loc_ll, 0),
    ('Aminoacidos', 'Suplemento/Bioestimulante', 'Cultivo', 'ml', 'L', 1000, 0, loc_ll, 0),
    ('Anibac con cobre', 'Control de Plagas/Enfermedades', 'Cultivo', 'ml', 'L', 1000, 0, loc_ll, 0),
    ('Bacillus subtilis', 'Microorganismos/Biológicos', 'Cultivo', 'ml', 'L', 1000, 0, loc_ll, 0),
    ('Rootex', 'Suplemento/Bioestimulante', 'Cultivo', 'ml', 'L', 1000, 0, loc_ll, 0)
  ON CONFLICT DO NOTHING;

  -- Nutrientes para SS
  INSERT INTO inventory_items (name, category, inventory_type, unit, purchase_unit, purchase_unit_conversion, current_stock, location_id, average_cost_per_unit) VALUES
    ('Silicato de Potasio', 'Nutriente Base', 'Cultivo', 'ml', 'L', 1000, 0, loc_ss, 0),
    ('Yara Calcinit', 'Nutriente Base', 'Cultivo', 'g', 'kg', 1000, 0, loc_ss, 0),
    ('Sulfato de Magnesio', 'Nutriente Base', 'Cultivo', 'g', 'kg', 1000, 0, loc_ss, 0),
    ('Ultrasol Desarrollo', 'Nutriente Base', 'Cultivo', 'g', 'kg', 1000, 0, loc_ss, 0),
    ('Ultrasol Inicial', 'Nutriente Base', 'Cultivo', 'g', 'kg', 1000, 0, loc_ss, 0),
    ('Micros Rexene BSP', 'Nutriente Base', 'Cultivo', 'g', 'kg', 1000, 0, loc_ss, 0),
    ('Ultrasol MKP', 'Nutriente Base', 'Cultivo', 'g', 'kg', 1000, 0, loc_ss, 0),
    ('Melaza', 'Suplemento/Bioestimulante', 'Cultivo', 'ml', 'L', 1000, 0, loc_ss, 0),
    ('Tricodermas', 'Microorganismos/Biológicos', 'Cultivo', 'g', 'kg', 1000, 0, loc_ss, 0),
    ('Aminoacidos', 'Suplemento/Bioestimulante', 'Cultivo', 'ml', 'L', 1000, 0, loc_ss, 0),
    ('Anibac con cobre', 'Control de Plagas/Enfermedades', 'Cultivo', 'ml', 'L', 1000, 0, loc_ss, 0),
    ('Bacillus subtilis', 'Microorganismos/Biológicos', 'Cultivo', 'ml', 'L', 1000, 0, loc_ss, 0),
    ('Rootex', 'Suplemento/Bioestimulante', 'Cultivo', 'ml', 'L', 1000, 0, loc_ss, 0)
  ON CONFLICT DO NOTHING;

  -- Nutrientes para BR
  INSERT INTO inventory_items (name, category, inventory_type, unit, purchase_unit, purchase_unit_conversion, current_stock, location_id, average_cost_per_unit) VALUES
    ('Silicato de Potasio', 'Nutriente Base', 'Cultivo', 'ml', 'L', 1000, 0, loc_br, 0),
    ('Yara Calcinit', 'Nutriente Base', 'Cultivo', 'g', 'kg', 1000, 0, loc_br, 0),
    ('Sulfato de Magnesio', 'Nutriente Base', 'Cultivo', 'g', 'kg', 1000, 0, loc_br, 0),
    ('Ultrasol Desarrollo', 'Nutriente Base', 'Cultivo', 'g', 'kg', 1000, 0, loc_br, 0),
    ('Ultrasol Inicial', 'Nutriente Base', 'Cultivo', 'g', 'kg', 1000, 0, loc_br, 0),
    ('Micros Rexene BSP', 'Nutriente Base', 'Cultivo', 'g', 'kg', 1000, 0, loc_br, 0),
    ('Ultrasol MKP', 'Nutriente Base', 'Cultivo', 'g', 'kg', 1000, 0, loc_br, 0),
    ('Melaza', 'Suplemento/Bioestimulante', 'Cultivo', 'ml', 'L', 1000, 0, loc_br, 0),
    ('Tricodermas', 'Microorganismos/Biológicos', 'Cultivo', 'g', 'kg', 1000, 0, loc_br, 0),
    ('Aminoacidos', 'Suplemento/Bioestimulante', 'Cultivo', 'ml', 'L', 1000, 0, loc_br, 0),
    ('Anibac con cobre', 'Control de Plagas/Enfermedades', 'Cultivo', 'ml', 'L', 1000, 0, loc_br, 0),
    ('Bacillus subtilis', 'Microorganismos/Biológicos', 'Cultivo', 'ml', 'L', 1000, 0, loc_br, 0),
    ('Rootex', 'Suplemento/Bioestimulante', 'Cultivo', 'ml', 'L', 1000, 0, loc_br, 0)
  ON CONFLICT DO NOTHING;

  RAISE NOTICE '✅ ~52 items de inventario insertados (nutrientes)';
END $$;

-- ==========================================
-- MENSAJE FINAL
-- ==========================================
DO $$
BEGIN
  RAISE NOTICE '================================================';
  RAISE NOTICE '✅✅✅ MIGRACIÓN COMPLETADA ✅✅✅';
  RAISE NOTICE '================================================';
  RAISE NOTICE 'Genéticas: %', (SELECT COUNT(*) FROM genetics);
  RAISE NOTICE 'Locations: %', (SELECT COUNT(*) FROM locations);
  RAISE NOTICE 'Inventario: %', (SELECT COUNT(*) FROM inventory_items);
  RAISE NOTICE '================================================';
  RAISE NOTICE 'Ahora recarga la aplicación frontend';
END $$;
