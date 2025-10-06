-- ============================================
-- POLÍTICAS RLS PARA TABLAS SIN POLÍTICAS
-- ============================================
-- Ejecuta este SQL en Supabase Dashboard (SQL Editor)
-- Esto permite que la app pueda leer y escribir datos en todas las tablas

-- ============================================
-- TASKS
-- ============================================
CREATE POLICY "Allow all to read tasks" ON tasks
  FOR SELECT USING (true);

CREATE POLICY "Allow all to manage tasks" ON tasks
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- PLANT_BATCHES
-- ============================================
CREATE POLICY "Allow all to read plant_batches" ON plant_batches
  FOR SELECT USING (true);

CREATE POLICY "Allow all to manage plant_batches" ON plant_batches
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- MOTHER_PLANTS
-- ============================================
CREATE POLICY "Allow all to read mother_plants" ON mother_plants
  FOR SELECT USING (true);

CREATE POLICY "Allow all to manage mother_plants" ON mother_plants
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- LOG_ENTRIES
-- ============================================
CREATE POLICY "Allow all to read log_entries" ON log_entries
  FOR SELECT USING (true);

CREATE POLICY "Allow all to manage log_entries" ON log_entries
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- NOTIFICATIONS
-- ============================================
CREATE POLICY "Allow all to read notifications" ON notifications
  FOR SELECT USING (true);

CREATE POLICY "Allow all to manage notifications" ON notifications
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- TABLAS ADICIONALES QUE PODRÍAN NECESITAR POLÍTICAS
-- ============================================

-- GENETICS
CREATE POLICY "Allow all to read genetics" ON genetics
  FOR SELECT USING (true);

CREATE POLICY "Allow all to manage genetics" ON genetics
  FOR ALL USING (true) WITH CHECK (true);

-- LOCATIONS
CREATE POLICY "Allow all to read locations" ON locations
  FOR SELECT USING (true);

CREATE POLICY "Allow all to manage locations" ON locations
  FOR ALL USING (true) WITH CHECK (true);

-- FORMULAS
CREATE POLICY "Allow all to read formulas" ON formulas
  FOR SELECT USING (true);

CREATE POLICY "Allow all to manage formulas" ON formulas
  FOR ALL USING (true) WITH CHECK (true);

-- FORMULA_SCHEDULES
CREATE POLICY "Allow all to read formula_schedules" ON formula_schedules
  FOR SELECT USING (true);

CREATE POLICY "Allow all to manage formula_schedules" ON formula_schedules
  FOR ALL USING (true) WITH CHECK (true);

-- INVENTORY_ITEMS
CREATE POLICY "Allow all to read inventory_items" ON inventory_items
  FOR SELECT USING (true);

CREATE POLICY "Allow all to manage inventory_items" ON inventory_items
  FOR ALL USING (true) WITH CHECK (true);

-- EQUIPMENT
CREATE POLICY "Allow all to read equipment" ON equipment
  FOR SELECT USING (true);

CREATE POLICY "Allow all to manage equipment" ON equipment
  FOR ALL USING (true) WITH CHECK (true);

-- MAINTENANCE_LOGS
CREATE POLICY "Allow all to read maintenance_logs" ON maintenance_logs
  FOR SELECT USING (true);

CREATE POLICY "Allow all to manage maintenance_logs" ON maintenance_logs
  FOR ALL USING (true) WITH CHECK (true);

-- EXPENSES
CREATE POLICY "Allow all to read expenses" ON expenses
  FOR SELECT USING (true);

CREATE POLICY "Allow all to manage expenses" ON expenses
  FOR ALL USING (true) WITH CHECK (true);

-- TRIMMING_SESSIONS
CREATE POLICY "Allow all to read trimming_sessions" ON trimming_sessions
  FOR SELECT USING (true);

CREATE POLICY "Allow all to manage trimming_sessions" ON trimming_sessions
  FOR ALL USING (true) WITH CHECK (true);

-- ANNOUNCEMENTS
CREATE POLICY "Allow all to read announcements" ON announcements
  FOR SELECT USING (true);

CREATE POLICY "Allow all to manage announcements" ON announcements
  FOR ALL USING (true) WITH CHECK (true);

-- PNO_PROCEDURES
CREATE POLICY "Allow all to read pno_procedures" ON pno_procedures
  FOR SELECT USING (true);

CREATE POLICY "Allow all to manage pno_procedures" ON pno_procedures
  FOR ALL USING (true) WITH CHECK (true);

-- INFOGRAPHICS
CREATE POLICY "Allow all to read infographics" ON infographics
  FOR SELECT USING (true);

CREATE POLICY "Allow all to manage infographics" ON infographics
  FOR ALL USING (true) WITH CHECK (true);

-- CROP_PLANT_COUNTS
CREATE POLICY "Allow all to read crop_plant_counts" ON crop_plant_counts
  FOR SELECT USING (true);

CREATE POLICY "Allow all to manage crop_plant_counts" ON crop_plant_counts
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- NOTA IMPORTANTE
-- ============================================
-- Estas políticas permiten acceso completo (lectura y escritura) a todas las tablas.
-- En un entorno de producción, deberías implementar políticas más restrictivas
-- basadas en roles de usuario y permisos específicos.
