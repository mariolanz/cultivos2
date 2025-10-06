-- ============================================
-- PERMITIR LECTURA PÚBLICA PARA CATÁLOGOS
-- ============================================
-- locations y genetics deben ser accesibles ANTES del login
-- porque la app los carga al inicio

-- LOCATIONS: Permitir lectura pública (SELECT)
DROP POLICY IF EXISTS "Allow public read access to locations" ON locations;
CREATE POLICY "Allow public read access to locations"
  ON locations
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- LOCATIONS: Solo usuarios autenticados pueden modificar
DROP POLICY IF EXISTS "Allow authenticated users to modify locations" ON locations;
CREATE POLICY "Allow authenticated users to modify locations"
  ON locations
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- GENETICS: Permitir lectura pública (SELECT)
DROP POLICY IF EXISTS "Allow public read access to genetics" ON genetics;
CREATE POLICY "Allow public read access to genetics"
  ON genetics
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- GENETICS: Solo usuarios autenticados pueden modificar
DROP POLICY IF EXISTS "Allow authenticated users to modify genetics" ON genetics;
CREATE POLICY "Allow authenticated users to modify genetics"
  ON genetics
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Mensaje de confirmación
SELECT 'Políticas RLS actualizadas: locations y genetics ahora permiten lectura pública' AS status;
