-- Script para verificar qué datos existen actualmente

-- 1. Ver cuántas genéticas hay y si tienen code
SELECT 
  id, 
  name, 
  code,
  CASE WHEN code IS NULL THEN '❌ SIN CÓDIGO' ELSE '✅ CON CÓDIGO' END as status
FROM genetics 
ORDER BY name
LIMIT 10;

-- 2. Ver cuántos items de inventario hay
SELECT COUNT(*) as total_inventory_items FROM inventory_items;

-- 3. Ver algunos items de inventario si existen
SELECT id, name, category, inventory_type, location_id 
FROM inventory_items 
LIMIT 5;

-- 4. Ver las locations principales
SELECT id, name, parent_id FROM locations WHERE parent_id IS NULL;
