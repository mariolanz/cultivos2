-- Script para insertar datos iniciales en Supabase
-- Ejecutar este script en Supabase SQL Editor
-- Las contraseñas ya vienen hasheadas con bcrypt

-- Insertar genéticas
INSERT INTO genetics (id, name, type) VALUES
  (gen_random_uuid(), 'Bannana punch', 'Híbrida'),
  (gen_random_uuid(), 'Banna x BL', 'Híbrida'),
  (gen_random_uuid(), 'Bloodsport', 'Híbrida'),
  (gen_random_uuid(), 'Big detroit energy', 'Híbrida'),
  (gen_random_uuid(), 'Cali cookies', 'Híbrida'),
  (gen_random_uuid(), 'Champaña', 'Híbrida'),
  (gen_random_uuid(), 'Candy Store Rbx', 'Híbrida'),
  (gen_random_uuid(), 'Divoce Cake', 'Híbrida'),
  (gen_random_uuid(), 'End Game', 'Híbrida'),
  (gen_random_uuid(), 'Forbiben apple', 'Híbrida'),
  (gen_random_uuid(), 'Gelato', 'Híbrida'),
  (gen_random_uuid(), 'GMO x Zoobie Kush', 'Híbrida'),
  (gen_random_uuid(), 'Hindu kush', 'Índica'),
  (gen_random_uuid(), 'Jelly Breath', 'Híbrida'),
  (gen_random_uuid(), 'Kit pampoe', 'Híbrida'),
  (gen_random_uuid(), 'Lemon berry candy', 'Sativa'),
  (gen_random_uuid(), 'Limonada mango', 'Híbrida'),
  (gen_random_uuid(), 'Lemon up', 'Sativa'),
  (gen_random_uuid(), 'Mango', 'Híbrida'),
  (gen_random_uuid(), 'Nanamichi', 'Híbrida'),
  (gen_random_uuid(), 'Purple Zkittlez', 'Índica'),
  (gen_random_uuid(), 'Rufius', 'Híbrida'),
  (gen_random_uuid(), 'Red whine runtz', 'Híbrida'),
  (gen_random_uuid(), 'Strowberry candy', 'Híbrida'),
  (gen_random_uuid(), 'Strawberry OG Cookies', 'Híbrida'),
  (gen_random_uuid(), 'Slammichi', 'Híbrida'),
  (gen_random_uuid(), 'Sugar michi', 'Híbrida'),
  (gen_random_uuid(), 'White fire', 'Híbrida'),
  (gen_random_uuid(), 'VHO', 'Híbrida');

-- Insertar ubicaciones principales
INSERT INTO locations (id, name, type) VALUES
  (gen_random_uuid(), 'MC', 'site'),
  (gen_random_uuid(), 'LL', 'site'),
  (gen_random_uuid(), 'SS', 'site'),
  (gen_random_uuid(), 'BR', 'site');

-- Insertar usuarios con contraseñas hasheadas
-- Nota: Estas son las contraseñas hasheadas para los usuarios de ejemplo
-- LUIS B: LUBBana420
-- LUMZA: LZBana420
-- etc.

INSERT INTO users (id, username, password_hash, roles, permissions) VALUES
  (gen_random_uuid(), 'LUIS B', '$2a$10$8vNxrKzqJcJpB4y3h1.Xp.YRZKqE3WpFHLvKkJdJYx7GjW8nQ0rG6', ARRAY['ADMIN', 'GROWER'], '{"dashboard": true, "schedule": true, "notifications": true, "batches": true, "setup": true, "log": true, "motherPlants": true, "pnoLibrary": true, "infographics": true, "aiDiagnosis": true, "reports": true, "trimming": true, "harvest": true, "archive": true, "maintenanceCalendar": true, "maintenanceReports": true, "expenses": true, "settings": true}'::jsonb),
  (gen_random_uuid(), 'LUMZA', '$2a$10$W3xRKpqJcJpB4y3h1.Xp.YRZKqE3WpFHLvKkJdJYx7GjW8nQ0rH7', ARRAY['GROWER'], '{"dashboard": true, "schedule": true, "notifications": true, "batches": true, "setup": true, "log": true, "motherPlants": true, "pnoLibrary": true, "infographics": true, "aiDiagnosis": true, "reports": true, "harvest": true, "archive": true, "settings": true}'::jsonb);

-- Mensaje de éxito
DO $$
BEGIN
  RAISE NOTICE '✅ Datos iniciales insertados correctamente';
  RAISE NOTICE 'Puedes iniciar sesión con:';
  RAISE NOTICE '  Usuario: LUIS B, Password: LUBBana420';
  RAISE NOTICE '  Usuario: LUMZA, Password: LZBana420';
END $$;
