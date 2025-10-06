-- Script para verificar el estado actual del esquema
-- EJECUTAR ESTE PRIMERO para ver qué ya existe

-- Ver columnas de GENETICS
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'genetics' 
ORDER BY ordinal_position;

-- Ver columnas de EQUIPMENT
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'equipment' 
ORDER BY ordinal_position;

-- Ver columnas de TASKS
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'tasks' 
ORDER BY ordinal_position;

-- Ver columnas de INVENTORY_ITEMS
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'inventory_items' 
ORDER BY ordinal_position;

-- Ver columnas de FORMULAS
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'formulas' 
ORDER BY ordinal_position;

-- Ver columnas de LOCATIONS
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'locations' 
ORDER BY ordinal_position;
