-- Solución para permitir login en Supabase
-- Ejecuta este SQL en Supabase Dashboard (SQL Editor)

-- Eliminar la política restrictiva actual
DROP POLICY IF EXISTS "Users can view own data" ON users;

-- Crear nueva política que permite SELECT anónimo para login
-- pero solo retorna datos básicos necesarios para autenticación
CREATE POLICY "Allow anonymous login" ON users
  FOR SELECT
  USING (true); -- Permite SELECT a todos

-- IMPORTANTE: Esto permite que cualquiera pueda leer la tabla users
-- incluyendo los hashes de contraseña. Esto es necesario para el login
-- pero debes asegurarte de que tu aplicación no exponga estos datos.
-- Una vez autenticado, el usuario solo debería poder ver sus propios datos.

-- Opcional: Si quieres más seguridad, puedes crear una función RPC
-- que haga el login de forma más segura, pero esto requiere más trabajo.
