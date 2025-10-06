-- ============================================
-- RESTAURAR USUARIOS CON CONTRASEÑAS ORIGINALES
-- ============================================

BEGIN;

-- Limpiar usuarios existentes
DELETE FROM users;

-- Insertar usuarios con contraseñas bcrypt-hasheadas y permisos en formato objeto
INSERT INTO users (id, username, password_hash, roles, location_id, maintenance_location_ids, permissions) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'LUIS B', '$2b$10$0TwniBmFIvr7Mwf9xazRVeqWHGgs3qzbNNucWqlOHVIAr6cnNYTDu', ARRAY['admin','tech','cultivation','trimming','maintenance'], NULL, '{}', '{"dashboard":true,"schedule":true,"notifications":true,"batches":true,"setup":true,"log":true,"motherPlants":true,"pnoLibrary":true,"infographics":true,"aiDiagnosis":true,"reports":true,"trimming":true,"harvest":true,"archive":true,"maintenanceCalendar":true,"maintenanceReports":true,"expenses":true,"settings":true}'::jsonb),
  ('550e8400-e29b-41d4-a716-446655440002', 'LUMZA', '$2b$10$RuB4MPgIalqncwgQ/9Zdzu9k3tUXPg.JBtvsDLnycvl6NtLT1tGz.', ARRAY['tech','cultivation'], NULL, '{}', '{"dashboard":true,"schedule":true,"notifications":true,"batches":true,"setup":true,"log":true,"motherPlants":true,"pnoLibrary":true,"infographics":true,"aiDiagnosis":true,"reports":true,"archive":true,"maintenanceReports":true,"expenses":true,"settings":true}'::jsonb),
  ('550e8400-e29b-41d4-a716-446655440003', 'LUIS T', '$2b$10$uYglRCxWCfI9dVzz2FRUne8bUhqXRRLcv/UEZbe1Ae8uvYIhXhake', ARRAY['cultivation'], NULL, '{}', '{"dashboard":true,"schedule":true,"notifications":true,"batches":true,"setup":true,"log":true,"motherPlants":true}'::jsonb),
  ('550e8400-e29b-41d4-a716-446655440004', 'FERMIN', '$2b$10$EfHaJCGVbQeEI0PMcKFioel9k.eJhGZ27QnpNu8RRKsXykJFKzuVK', ARRAY['cultivation','maintenance'], NULL, '{}', '{"dashboard":true,"schedule":true,"notifications":true,"batches":true,"setup":true,"log":true,"motherPlants":true,"maintenanceCalendar":true,"maintenanceReports":true}'::jsonb),
  ('550e8400-e29b-41d4-a716-446655440005', 'CRISTIAN', '$2b$10$MwR5ee35jrMGhQKg2loooe28oonCsSehD27h1TSEbLM2c4gteXKNC', ARRAY['cultivation','maintenance'], NULL, '{}', '{"dashboard":true,"schedule":true,"notifications":true,"batches":true,"setup":true,"log":true,"motherPlants":true,"maintenanceCalendar":true,"maintenanceReports":true}'::jsonb),
  ('550e8400-e29b-41d4-a716-446655440006', 'TOMY', '$2b$10$UJvJKDH6I3nvv.A0FrLARu3m44fGQwmUUu2TRI/SaWXvsm0x0uZUC', ARRAY['cultivation','trimming'], NULL, '{}', '{"dashboard":true,"schedule":true,"notifications":true,"batches":true,"setup":true,"log":true,"motherPlants":true,"trimming":true,"harvest":true}'::jsonb),
  ('550e8400-e29b-41d4-a716-446655440007', 'DAYANA', '$2b$10$HZA0NCWCkVLJfutKKrv0BO4SFelMm2gw4k7Q37lAslT1aEhaPyvdK', ARRAY['cultivation'], NULL, '{}', '{"dashboard":true,"schedule":true,"notifications":true,"batches":true,"setup":true,"log":true,"motherPlants":true}'::jsonb),
  ('550e8400-e29b-41d4-a716-446655440008', 'ARTURO', '$2b$10$O2uYtj2Pfe73HbhrL24PnOsqqVBwPjjABfGxs2fjI.FpQt.08Q2Aa', ARRAY['cultivation','maintenance'], NULL, '{}', '{"dashboard":true,"schedule":true,"notifications":true,"batches":true,"setup":true,"log":true,"motherPlants":true,"maintenanceCalendar":true,"maintenanceReports":true}'::jsonb),
  ('550e8400-e29b-41d4-a716-446655440009', 'EDUARDO', '$2b$10$mGk.mZ7UyxR7.moQs9FnIe1WTjctoz/sdSVK/XIu474pzeEXuTxL.', ARRAY['cultivation'], NULL, '{}', '{"dashboard":true,"schedule":true,"notifications":true,"batches":true,"setup":true,"log":true,"motherPlants":true}'::jsonb),
  ('550e8400-e29b-41d4-a716-446655440010', 'GUSTAVO', '$2b$10$zTyAtjAHpbFaucTkluiQAOzqRUlETYwmudaOqZkoYRjfLqv9C3Cha', ARRAY['cultivation'], NULL, '{}', '{"dashboard":true,"schedule":true,"notifications":true,"batches":true,"setup":true,"log":true,"motherPlants":true}'::jsonb),
  ('550e8400-e29b-41d4-a716-446655440011', 'PACO', '$2b$10$3t0mEiZiopax3UzrQLc2quCp6e3muB4Kv5fqCbRBOzLu1ea/LSNDi', ARRAY['cultivation'], NULL, '{}', '{"dashboard":true,"schedule":true,"notifications":true,"batches":true,"setup":true,"log":true,"motherPlants":true}'::jsonb),
  ('550e8400-e29b-41d4-a716-446655440012', 'DEYSI', '$2b$10$LOrc9W850GUj61XpSauVfumVIWSQcce37.EeMjIHi2i9iQV3YuwN2', ARRAY['trimming','maintenance'], NULL, '{}', '{"dashboard":true,"notifications":true,"trimming":true,"harvest":true,"maintenanceCalendar":true,"maintenanceReports":true}'::jsonb),
  ('550e8400-e29b-41d4-a716-446655440013', 'SEBASTIAN', '$2b$10$ngB6O9TQu6CH4OubKe4H6.oUgP9MQ/0EJjLukqaIcs/QEm3eM2ojK', ARRAY['trimming','maintenance'], NULL, '{}', '{"dashboard":true,"notifications":true,"trimming":true,"harvest":true,"maintenanceCalendar":true,"maintenanceReports":true}'::jsonb);

COMMIT;

-- Confirmar usuarios restaurados
SELECT COUNT(*) as users_count FROM users;
SELECT username, roles FROM users ORDER BY username;


-- ✅ USUARIOS Y CONTRASEÑAS:
--    LUIS B / LUBBana420
--    LUMZA / LZBana420
--    LUIS T / LUBana420
--    FERMIN / FEBana420
--    CRISTIAN / CRBana420
--    TOMY / TOBana420
--    DAYANA / DABana420
--    ARTURO / ARBana420
--    EDUARDO / EDBana420
--    GUSTAVO / GUBana420
--    PACO / PABana420
--    DEYSI / DEBana420
--    SEBASTIAN / SEBana420
