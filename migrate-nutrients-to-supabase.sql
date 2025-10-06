-- Script para migrar nutrientes e inventario inicial a Supabase
-- EJECUTAR DESPUÉS de update-schema-frontend-compatibility.sql

-- ==========================================
-- INSERTAR NUTRIENTES PARA CADA LOCATION
-- ==========================================

-- Primero obtenemos los IDs de las locations principales
DO $$
DECLARE
  loc_mc UUID;
  loc_ll UUID;
  loc_ss UUID;
  loc_br UUID;
BEGIN
  -- Obtener UUIDs de locations principales
  SELECT id INTO loc_mc FROM locations WHERE name = 'MC' AND parent_id IS NULL LIMIT 1;
  SELECT id INTO loc_ll FROM locations WHERE name = 'LL' AND parent_id IS NULL LIMIT 1;
  SELECT id INTO loc_ss FROM locations WHERE name = 'SS' AND parent_id IS NULL LIMIT 1;
  SELECT id INTO loc_br FROM locations WHERE name = 'BR' AND parent_id IS NULL LIMIT 1;

  -- ==========================================
  -- NUTRIENTES DE CULTIVO PARA MC
  -- ==========================================
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

  -- ==========================================
  -- NUTRIENTES DE CULTIVO PARA LL
  -- ==========================================
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

  -- ==========================================
  -- NUTRIENTES DE CULTIVO PARA SS
  -- ==========================================
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

  -- ==========================================
  -- NUTRIENTES DE CULTIVO PARA BR
  -- ==========================================
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

  -- ==========================================
  -- ITEMS DE MANTENIMIENTO
  -- ==========================================
  INSERT INTO inventory_items (name, category, inventory_type, unit, current_stock, location_id, average_cost_per_unit, description, part_number, supplier, min_stock_level) VALUES
    ('Filtro de carbón activado (AC)', 'Refacciones', 'Mantenimiento', 'pieza', 0, loc_mc, 0, 'Filtro para aire acondicionado Mirage 2 Ton. Modelo XYZ.', 'AC-F-12345', 'Grainger', 2),
    ('Filtro para deshumidificador', 'Refacciones', 'Mantenimiento', 'pieza', 0, loc_mc, 0, NULL, NULL, NULL, NULL),
    ('Foam cleaner para serpentines', 'Limpieza y Sanitización', 'Mantenimiento', 'lata', 0, loc_mc, 0, NULL, NULL, NULL, 5),
    ('Filtro de carbón activado (AC)', 'Refacciones', 'Mantenimiento', 'pieza', 0, loc_ll, 0, 'Filtro para aire acondicionado Mirage 2 Ton. Modelo XYZ.', 'AC-F-12345', 'Grainger', 2),
    ('Filtro para deshumidificador', 'Refacciones', 'Mantenimiento', 'pieza', 0, loc_ll, 0, NULL, NULL, NULL, NULL),
    ('Foam cleaner para serpentines', 'Limpieza y Sanitización', 'Mantenimiento', 'lata', 0, loc_ll, 0, NULL, NULL, NULL, 5),
    ('Filtro de carbón activado (AC)', 'Refacciones', 'Mantenimiento', 'pieza', 0, loc_ss, 0, 'Filtro para aire acondicionado Mirage 2 Ton. Modelo XYZ.', 'AC-F-12345', 'Grainger', 2),
    ('Filtro para deshumidificador', 'Refacciones', 'Mantenimiento', 'pieza', 0, loc_ss, 0, NULL, NULL, NULL, NULL),
    ('Foam cleaner para serpentines', 'Limpieza y Sanitización', 'Mantenimiento', 'lata', 0, loc_ss, 0, NULL, NULL, NULL, 5),
    ('Filtro de carbón activado (AC)', 'Refacciones', 'Mantenimiento', 'pieza', 0, loc_br, 0, 'Filtro para aire acondicionado Mirage 2 Ton. Modelo XYZ.', 'AC-F-12345', 'Grainger', 2),
    ('Filtro para deshumidificador', 'Refacciones', 'Mantenimiento', 'pieza', 0, loc_br, 0, NULL, NULL, NULL, NULL),
    ('Foam cleaner para serpentines', 'Limpieza y Sanitización', 'Mantenimiento', 'lata', 0, loc_br, 0, NULL, NULL, NULL, 5)
  ON CONFLICT DO NOTHING;

  RAISE NOTICE '✅ Nutrientes e inventario inicial migrados exitosamente';
END $$;
