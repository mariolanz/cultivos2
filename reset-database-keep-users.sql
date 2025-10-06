-- ============================================
-- LIMPIAR BASE DE DATOS - MANTENER SOLO USUARIOS
-- ============================================
-- Ejecuta este SQL en Supabase Dashboard (SQL Editor)
-- Esto eliminará TODOS los datos excepto la tabla users

-- IMPORTANTE: Deshabilitar temporalmente las restricciones de FK para evitar errores
SET session_replication_role = 'replica';

-- Eliminar datos en orden inverso de dependencias (hijos primero, padres después)

-- Nivel 5: Tablas que dependen de múltiples tablas
TRUNCATE TABLE maintenance_logs CASCADE;
TRUNCATE TABLE crop_plant_counts CASCADE;
TRUNCATE TABLE formula_schedules CASCADE;

-- Nivel 4: Tablas que dependen de crops/batches/tasks
TRUNCATE TABLE log_entries CASCADE;
TRUNCATE TABLE trimming_sessions CASCADE;
TRUNCATE TABLE expenses CASCADE;

-- Nivel 3: Tablas principales de negocio
TRUNCATE TABLE tasks CASCADE;
TRUNCATE TABLE plant_batches CASCADE;
TRUNCATE TABLE crops CASCADE;
TRUNCATE TABLE mother_plants CASCADE;

-- Nivel 2: Tablas de configuración y catálogos
TRUNCATE TABLE equipment CASCADE;
TRUNCATE TABLE inventory_items CASCADE;
TRUNCATE TABLE formulas CASCADE;
TRUNCATE TABLE notifications CASCADE;
TRUNCATE TABLE announcements CASCADE;
TRUNCATE TABLE pno_procedures CASCADE;
TRUNCATE TABLE infographics CASCADE;

-- Nivel 1: Tablas de referencia base (NO tocar users)
TRUNCATE TABLE genetics CASCADE;
TRUNCATE TABLE locations CASCADE;

-- MANTENER: users (NO se trunca)

-- Rehabilitar restricciones FK
SET session_replication_role = 'origin';

-- Mensaje de confirmación
SELECT 'Base de datos limpiada exitosamente. Solo usuarios permanecen.' AS status;
