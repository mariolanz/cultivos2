-- Script para insertar nutrientes usando la location "Central" existente
-- EJECUTAR ESTE en lugar de migrate-nutrients-to-supabase.sql

DO $$
DECLARE
  loc_central UUID;
BEGIN
  -- Obtener el UUID de la location Central
  SELECT id INTO loc_central FROM locations WHERE name = 'Central' AND parent_id IS NULL LIMIT 1;

  IF loc_central IS NULL THEN
    RAISE EXCEPTION 'No se encontró la location Central';
  END IF;

  RAISE NOTICE 'Location Central encontrada: %', loc_central;

  -- ==========================================
  -- INSERTAR NUTRIENTES DE CULTIVO
  -- ==========================================
  INSERT INTO inventory_items (name, category, inventory_type, unit, purchase_unit, purchase_unit_conversion, current_stock, location_id, average_cost_per_unit) VALUES
    ('Silicato de Potasio', 'Nutriente Base', 'Cultivo', 'ml', 'L', 1000, 0, loc_central, 0),
    ('Yara Calcinit', 'Nutriente Base', 'Cultivo', 'g', 'kg', 1000, 0, loc_central, 0),
    ('Sulfato de Magnesio', 'Nutriente Base', 'Cultivo', 'g', 'kg', 1000, 0, loc_central, 0),
    ('Ultrasol Desarrollo', 'Nutriente Base', 'Cultivo', 'g', 'kg', 1000, 0, loc_central, 0),
    ('Ultrasol Inicial', 'Nutriente Base', 'Cultivo', 'g', 'kg', 1000, 0, loc_central, 0),
    ('Micros Rexene BSP', 'Nutriente Base', 'Cultivo', 'g', 'kg', 1000, 0, loc_central, 0),
    ('Ultrasol MKP', 'Nutriente Base', 'Cultivo', 'g', 'kg', 1000, 0, loc_central, 0),
    ('Melaza', 'Suplemento/Bioestimulante', 'Cultivo', 'ml', 'L', 1000, 0, loc_central, 0),
    ('Tricodermas', 'Microorganismos/Biológicos', 'Cultivo', 'g', 'kg', 1000, 0, loc_central, 0),
    ('Aminoacidos', 'Suplemento/Bioestimulante', 'Cultivo', 'ml', 'L', 1000, 0, loc_central, 0),
    ('Anibac con cobre', 'Control de Plagas/Enfermedades', 'Cultivo', 'ml', 'L', 1000, 0, loc_central, 0),
    ('Bacillus subtilis', 'Microorganismos/Biológicos', 'Cultivo', 'ml', 'L', 1000, 0, loc_central, 0),
    ('Rootex', 'Suplemento/Bioestimulante', 'Cultivo', 'ml', 'L', 1000, 0, loc_central, 0)
  ON CONFLICT DO NOTHING;

  -- ==========================================
  -- ITEMS DE MANTENIMIENTO
  -- ==========================================
  INSERT INTO inventory_items (name, category, inventory_type, unit, current_stock, location_id, average_cost_per_unit, description, part_number, supplier, min_stock_level) VALUES
    ('Filtro de carbón activado (AC)', 'Refacciones', 'Mantenimiento', 'pieza', 0, loc_central, 0, 'Filtro para aire acondicionado Mirage 2 Ton. Modelo XYZ.', 'AC-F-12345', 'Grainger', 2),
    ('Filtro para deshumidificador', 'Refacciones', 'Mantenimiento', 'pieza', 0, loc_central, 0, NULL, NULL, NULL, NULL),
    ('Foam cleaner para serpentines', 'Limpieza y Sanitización', 'Mantenimiento', 'lata', 0, loc_central, 0, NULL, NULL, NULL, 5),
    ('Solución calibración pH 7', 'Herramientas y Equipo', 'Mantenimiento', 'ml', 0, loc_central, 0, NULL, NULL, NULL, NULL),
    ('Solución calibración pH 4', 'Herramientas y Equipo', 'Mantenimiento', 'ml', 0, loc_central, 0, NULL, NULL, NULL, NULL),
    ('Solución calibración EC', 'Herramientas y Equipo', 'Mantenimiento', 'ml', 0, loc_central, 0, NULL, NULL, NULL, NULL),
    ('Lámpara UV para filtro de agua', 'Refacciones', 'Mantenimiento', 'pieza', 0, loc_central, 0, NULL, NULL, NULL, NULL),
    ('Cartucho de filtro de sedimentos', 'Refacciones', 'Mantenimiento', 'pieza', 0, loc_central, 0, 'Cartucho estándar de 10 pulgadas, 5 micras.', NULL, NULL, 4),
    ('Cartucho de filtro de carbón', 'Refacciones', 'Mantenimiento', 'pieza', 0, loc_central, 0, 'Cartucho estándar de 10 pulgadas, carbón activado.', NULL, NULL, 4)
  ON CONFLICT DO NOTHING;

  -- Contar cuántos items se insertaron
  RAISE NOTICE '✅ Nutrientes insertados para location Central';
  RAISE NOTICE 'Total de items en inventario: %', (SELECT COUNT(*) FROM inventory_items);
END $$;
