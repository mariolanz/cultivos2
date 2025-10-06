-- Script para inicializar solo el usuario administrador
-- Este script limpia todos los datos y crea solo el admin con acceso completo

BEGIN;

-- Limpiar todos los datos en orden de dependencias
DELETE FROM trimming_sessions;
DELETE FROM expenses;
DELETE FROM maintenance_logs;
DELETE FROM tasks;
DELETE FROM equipment;
DELETE FROM inventory_items;
DELETE FROM formula_schedules;
DELETE FROM formulas;
DELETE FROM log_entries;
DELETE FROM crop_plant_counts;
DELETE FROM crops;
DELETE FROM plant_batches;
DELETE FROM mother_plants;
DELETE FROM notifications;
DELETE FROM announcements;
DELETE FROM pno_procedures;
DELETE FROM infographics;
DELETE FROM genetics;
DELETE FROM locations;
DELETE FROM users;

-- Crear usuario administrador único
-- Usuario: ADMIN
-- Password: admin123
INSERT INTO users (id, username, password_hash, roles, location_id, maintenance_location_ids, permissions) 
VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'ADMIN',
  '$2b$10$S0OIfqL5Or7QopHyxHvAqOQWzo12yEHbocMCyPkDs9U0WBSeUDFre',
  ARRAY['ADMINISTRADOR'],
  NULL,
  '{}',
  '{
    "dashboard": true,
    "schedule": true,
    "notifications": true,
    "batches": true,
    "setup": true,
    "log": true,
    "motherPlants": true,
    "pnoLibrary": true,
    "infographics": true,
    "aiDiagnosis": true,
    "reports": true,
    "trimming": true,
    "harvest": true,
    "archive": true,
    "maintenanceCalendar": true,
    "maintenanceReports": true,
    "expenses": true,
    "settings": true
  }'::jsonb
);

-- Crear location central por defecto
INSERT INTO locations (id, name, type) 
VALUES (
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'Central',
  'site'
);

COMMIT;

-- Confirmar creación
SELECT 'Usuario ADMIN creado exitosamente. Password: admin123' as status;
SELECT 'Location Central creada por defecto' as status;
