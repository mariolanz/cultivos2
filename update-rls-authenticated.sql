-- Actualizar políticas RLS para usuarios autenticados
-- Solo usuarios autenticados pueden acceder a los datos

BEGIN;

-- Eliminar políticas públicas si existen
DROP POLICY IF EXISTS "Allow public read access to locations" ON locations;
DROP POLICY IF EXISTS "Allow public read access to genetics" ON genetics;

-- Asegurar que las políticas basadas en usuario_id existen
-- LOCATIONS
DROP POLICY IF EXISTS "Users can view locations" ON locations;
CREATE POLICY "Users can view locations" ON locations
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can manage locations" ON locations;
CREATE POLICY "Users can manage locations" ON locations
  FOR ALL USING (auth.uid() IS NOT NULL);

-- GENETICS
DROP POLICY IF EXISTS "Users can view genetics" ON genetics;
CREATE POLICY "Users can view genetics" ON genetics
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can manage genetics" ON genetics;
CREATE POLICY "Users can manage genetics" ON genetics
  FOR ALL USING (auth.uid() IS NOT NULL);

-- USERS (debe permitir lectura para login pero escritura solo autenticada)
DROP POLICY IF EXISTS "Anyone can view users for login" ON users;
CREATE POLICY "Anyone can view users for login" ON users
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage users" ON users;
CREATE POLICY "Authenticated users can manage users" ON users
  FOR ALL USING (auth.uid() IS NOT NULL);

COMMIT;

SELECT 'Políticas RLS actualizadas para usuarios autenticados' as status;
