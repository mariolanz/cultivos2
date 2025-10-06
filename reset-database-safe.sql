-- ============================================
-- RESET SEGURO - MANTENER USUARIOS
-- ============================================
-- Este script limpia la base de datos pero PRESERVA users
-- Usa DELETE en lugar de TRUNCATE CASCADE para evitar borrar users

BEGIN;

-- Paso 1: Limpiar referencias de usuarios hacia locations (para evitar FK errors)
UPDATE users SET location_id = NULL WHERE location_id IS NOT NULL;
UPDATE users SET maintenance_location_ids = '{}' WHERE maintenance_location_ids IS NOT NULL;

-- Paso 2: Eliminar datos en orden de dependencias (hijos primero)
DELETE FROM maintenance_logs;
DELETE FROM crop_plant_counts;
DELETE FROM formula_schedules;
DELETE FROM log_entries;
DELETE FROM trimming_sessions;
DELETE FROM expenses;
DELETE FROM tasks;
DELETE FROM plant_batches;
DELETE FROM crops;
DELETE FROM mother_plants;
DELETE FROM equipment;
DELETE FROM inventory_items;
DELETE FROM formulas;
DELETE FROM notifications;
DELETE FROM announcements;
DELETE FROM pno_procedures;
DELETE FROM infographics;

-- Paso 3: Limpiar tablas de referencia (locations, genetics)
DELETE FROM genetics;
DELETE FROM locations;

-- PASO 4: NO tocar users - quedan intactos

COMMIT;

-- Mensaje de confirmación
SELECT 'Base de datos limpiada. Usuarios preservados exitosamente.' AS status;
SELECT COUNT(*) as users_count FROM users;
