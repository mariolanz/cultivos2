-- ========================================
-- SCRIPT: Limpiar e insertar datos desde cero
-- EJECUTAR EN SUPABASE SQL EDITOR
-- ========================================

-- ==========================================
-- LIMPIAR DATOS EXISTENTES
-- ==========================================
TRUNCATE TABLE inventory_items CASCADE;
TRUNCATE TABLE locations CASCADE;
TRUNCATE TABLE genetics CASCADE;

-- ==========================================
-- 1. INSERTAR GENÉTICAS (30)
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
  ('Limonada mango SLM', 'SLM', NULL);

-- ==========================================
-- 2. INSERTAR LOCATIONS PRINCIPALES (4)
-- ==========================================
INSERT INTO locations (name, type, parent_id) VALUES
  ('MC', 'site', NULL),
  ('LL', 'site', NULL),
  ('SS', 'site', NULL),
  ('BR', 'site', NULL);

-- ==========================================
-- 3. INSERTAR SALAS (20 rooms)
-- ==========================================
DO $$
DECLARE
  loc_mc UUID;
  loc_ll UUID;
  loc_ss UUID;
  loc_br UUID;
BEGIN
  -- Obtener IDs
  SELECT id INTO loc_mc FROM locations WHERE name = 'MC' AND parent_id IS NULL;
  SELECT id INTO loc_ll FROM locations WHERE name = 'LL' AND parent_id IS NULL;
  SELECT id INTO loc_ss FROM locations WHERE name = 'SS' AND parent_id IS NULL;
  SELECT id INTO loc_br FROM locations WHERE name = 'BR' AND parent_id IS NULL;

  -- Rooms MC
  INSERT INTO locations (name, type, parent_id, light_on_time, light_off_time) VALUES
    ('MCPREV', 'VEGETACION', loc_mc, '06:00', '23:50'),
    ('MC PLANTAS MADRE', 'VEGETACION', loc_mc, '06:00', '23:50'),
    ('MC1', 'ciclo completo', loc_mc, '06:00', '18:00'),
    ('MC2', 'ciclo completo', loc_mc, '06:00', '23:50'),
    ('MC3', 'ciclo completo', loc_mc, '06:00', '23:50'),
    ('MC4', 'ciclo completo', loc_mc, '06:00', '23:50'),
    ('MC5', 'ciclo completo', loc_mc, '06:00', '23:50');

  -- Rooms LL
  INSERT INTO locations (name, type, parent_id, light_on_time, light_off_time) VALUES
    ('LLVEG', 'VEGETACION', loc_ll, '06:00', '23:50'),
    ('LLPREV', 'VEGETACION', loc_ll, '06:00', '23:50'),
    ('LL PLANTAS MADRE', 'VEGETACION', loc_ll, '06:00', '23:50'),
    ('LL1', 'FLORACION', loc_ll, '06:00', '18:00'),
    ('LL2', 'FLORACION', loc_ll, '06:00', '18:00'),
    ('LL3', 'FLORACION', loc_ll, '06:00', '18:00');

  -- Rooms SS
  INSERT INTO locations (name, type, parent_id, light_on_time, light_off_time) VALUES
    ('SS1', 'ciclo completo', loc_ss, '06:00', '18:00'),
    ('SS2', 'ciclo completo', loc_ss, '06:00', '18:00');

  -- Rooms BR
  INSERT INTO locations (name, type, parent_id, light_on_time, light_off_time) VALUES
    ('BR1', 'ciclo completo', loc_br, '06:00', '18:00'),
    ('BR2', 'ciclo completo', loc_br, '06:00', '18:00'),
    ('BR3', 'ciclo completo', loc_br, '06:00', '18:00'),
    ('BR4', 'ciclo completo', loc_br, '06:00', '18:00'),
    ('BR5', 'ciclo completo', loc_br, '06:00', '18:00');
END $$;

-- ==========================================
-- 4. INSERTAR NUTRIENTES (52 items)
-- ==========================================
DO $$
DECLARE
  loc_mc UUID;
  loc_ll UUID;
  loc_ss UUID;
  loc_br UUID;
BEGIN
  SELECT id INTO loc_mc FROM locations WHERE name = 'MC' AND parent_id IS NULL;
  SELECT id INTO loc_ll FROM locations WHERE name = 'LL' AND parent_id IS NULL;
  SELECT id INTO loc_ss FROM locations WHERE name = 'SS' AND parent_id IS NULL;
  SELECT id INTO loc_br FROM locations WHERE name = 'BR' AND parent_id IS NULL;

  -- Nutrientes MC
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
    ('Rootex', 'Suplemento/Bioestimulante', 'Cultivo', 'ml', 'L', 1000, 0, loc_mc, 0);

  -- Nutrientes LL
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
    ('Rootex', 'Suplemento/Bioestimulante', 'Cultivo', 'ml', 'L', 1000, 0, loc_ll, 0);

  -- Nutrientes SS
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
    ('Rootex', 'Suplemento/Bioestimulante', 'Cultivo', 'ml', 'L', 1000, 0, loc_ss, 0);

  -- Nutrientes BR
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
    ('Rootex', 'Suplemento/Bioestimulante', 'Cultivo', 'ml', 'L', 1000, 0, loc_br, 0);
END $$;

-- ==========================================
-- RESUMEN
-- ==========================================
DO $$
BEGIN
  RAISE NOTICE '================================================';
  RAISE NOTICE '✅✅✅ DATOS INSERTADOS EXITOSAMENTE ✅✅✅';
  RAISE NOTICE '================================================';
  RAISE NOTICE 'Genéticas: %', (SELECT COUNT(*) FROM genetics);
  RAISE NOTICE 'Locations: %', (SELECT COUNT(*) FROM locations);
  RAISE NOTICE 'Inventario: %', (SELECT COUNT(*) FROM inventory_items);
  RAISE NOTICE '================================================';
END $$;
