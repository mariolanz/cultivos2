-- Verificar genéticas
SELECT COUNT(*) as total_genetics FROM genetics;

-- Ver las primeras 5 genéticas
SELECT id, name, code FROM genetics LIMIT 5;
