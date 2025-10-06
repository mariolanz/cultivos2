-- Remover políticas RLS públicas
-- Ya no son necesarias porque el admin puede crear locations desde cero

BEGIN;

-- Eliminar políticas de lectura pública
DROP POLICY IF EXISTS "Allow public read access to locations" ON locations;
DROP POLICY IF EXISTS "Allow public read access to genetics" ON genetics;

-- Las políticas normales basadas en usuario_id ya existen y seguirán funcionando

COMMIT;

SELECT 'Políticas RLS públicas removidas exitosamente' as status;
