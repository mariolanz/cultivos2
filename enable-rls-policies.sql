-- ============================================
-- HABILITAR RLS Y CREAR POLÍTICAS PARA TODAS LAS TABLAS
-- Ejecutar en PRODUCCIÓN (Supabase)
-- ============================================

-- 1. HABILITAR RLS en todas las tablas
ALTER TABLE genetics ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE mother_plants ENABLE ROW LEVEL SECURITY;
ALTER TABLE plant_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_plant_counts ENABLE ROW LEVEL SECURITY;
ALTER TABLE log_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE formulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE formula_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE trimming_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE pno_procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE infographics ENABLE ROW LEVEL SECURITY;

-- 2. ELIMINAR políticas existentes (si las hay)
DROP POLICY IF EXISTS "Allow all for anon" ON genetics;
DROP POLICY IF EXISTS "Allow all for anon" ON locations;
DROP POLICY IF EXISTS "Allow all for anon" ON users;
DROP POLICY IF EXISTS "Allow all for anon" ON equipment;
DROP POLICY IF EXISTS "Allow all for anon" ON mother_plants;
DROP POLICY IF EXISTS "Allow all for anon" ON plant_batches;
DROP POLICY IF EXISTS "Allow all for anon" ON crops;
DROP POLICY IF EXISTS "Allow all for anon" ON crop_plant_counts;
DROP POLICY IF EXISTS "Allow all for anon" ON log_entries;
DROP POLICY IF EXISTS "Allow all for anon" ON formulas;
DROP POLICY IF EXISTS "Allow all for anon" ON formula_schedules;
DROP POLICY IF EXISTS "Allow all for anon" ON inventory_items;
DROP POLICY IF EXISTS "Allow all for anon" ON tasks;
DROP POLICY IF EXISTS "Allow all for anon" ON maintenance_logs;
DROP POLICY IF EXISTS "Allow all for anon" ON expenses;
DROP POLICY IF EXISTS "Allow all for anon" ON trimming_sessions;
DROP POLICY IF EXISTS "Allow all for anon" ON notifications;
DROP POLICY IF EXISTS "Allow all for anon" ON announcements;
DROP POLICY IF EXISTS "Allow all for anon" ON pno_procedures;
DROP POLICY IF EXISTS "Allow all for anon" ON infographics;

-- 3. CREAR políticas que permitan TODO para el rol ANON (SUPABASE_ANON_KEY)
-- IMPORTANTE: Esto permite acceso completo. Para producción real, deberías usar políticas más restrictivas.

-- Genetics
CREATE POLICY "Allow all for anon" ON genetics FOR ALL USING (true) WITH CHECK (true);

-- Locations
CREATE POLICY "Allow all for anon" ON locations FOR ALL USING (true) WITH CHECK (true);

-- Users
CREATE POLICY "Allow all for anon" ON users FOR ALL USING (true) WITH CHECK (true);

-- Equipment
CREATE POLICY "Allow all for anon" ON equipment FOR ALL USING (true) WITH CHECK (true);

-- Mother Plants
CREATE POLICY "Allow all for anon" ON mother_plants FOR ALL USING (true) WITH CHECK (true);

-- Plant Batches
CREATE POLICY "Allow all for anon" ON plant_batches FOR ALL USING (true) WITH CHECK (true);

-- Crops
CREATE POLICY "Allow all for anon" ON crops FOR ALL USING (true) WITH CHECK (true);

-- Crop Plant Counts
CREATE POLICY "Allow all for anon" ON crop_plant_counts FOR ALL USING (true) WITH CHECK (true);

-- Log Entries
CREATE POLICY "Allow all for anon" ON log_entries FOR ALL USING (true) WITH CHECK (true);

-- Formulas
CREATE POLICY "Allow all for anon" ON formulas FOR ALL USING (true) WITH CHECK (true);

-- Formula Schedules
CREATE POLICY "Allow all for anon" ON formula_schedules FOR ALL USING (true) WITH CHECK (true);

-- Inventory Items
CREATE POLICY "Allow all for anon" ON inventory_items FOR ALL USING (true) WITH CHECK (true);

-- Tasks
CREATE POLICY "Allow all for anon" ON tasks FOR ALL USING (true) WITH CHECK (true);

-- Maintenance Logs
CREATE POLICY "Allow all for anon" ON maintenance_logs FOR ALL USING (true) WITH CHECK (true);

-- Expenses
CREATE POLICY "Allow all for anon" ON expenses FOR ALL USING (true) WITH CHECK (true);

-- Trimming Sessions
CREATE POLICY "Allow all for anon" ON trimming_sessions FOR ALL USING (true) WITH CHECK (true);

-- Notifications
CREATE POLICY "Allow all for anon" ON notifications FOR ALL USING (true) WITH CHECK (true);

-- Announcements
CREATE POLICY "Allow all for anon" ON announcements FOR ALL USING (true) WITH CHECK (true);

-- PNO Procedures
CREATE POLICY "Allow all for anon" ON pno_procedures FOR ALL USING (true) WITH CHECK (true);

-- Infographics
CREATE POLICY "Allow all for anon" ON infographics FOR ALL USING (true) WITH CHECK (true);

-- 4. VERIFICAR políticas creadas
SELECT 
  tablename, 
  policyname, 
  cmd as operations,
  (qual IS NOT NULL) as has_using_clause,
  (with_check IS NOT NULL) as has_with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename;
