-- Script para corregir roles de usuarios en PRODUCCIÓN
-- Ejecutar este script en la base de datos de producción de EasyPanel

-- Actualizar roles de inglés a español (para coincidir con el enum del código)
UPDATE users SET roles = 
  ARRAY(
    SELECT CASE 
      WHEN unnest = 'ADMIN' THEN 'ADMINISTRADOR'
      WHEN unnest = 'GROWER' THEN 'CULTIVADOR'
      WHEN unnest = 'MAINTENANCE' THEN 'MANTENIMIENTO'
      WHEN unnest = 'TRIMMER' THEN 'TRIMEADOR'
      ELSE unnest
    END
    FROM unnest(roles)
  )
WHERE roles && ARRAY['ADMIN', 'GROWER', 'MAINTENANCE', 'TRIMMER']::text[];

-- Verificar el resultado
SELECT username, roles FROM users ORDER BY username;
