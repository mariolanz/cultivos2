-- Script para actualizar códigos de genéticas existentes
-- EJECUTAR DESPUÉS de update-schema-frontend-compatibility.sql

-- Actualizar códigos de genéticas existentes
UPDATE genetics SET code = 'B' WHERE name = 'Bannana punch';
UPDATE genetics SET code = 'BXBL' WHERE name = 'Banna x BL';
UPDATE genetics SET code = 'BS' WHERE name = 'Bloodsport';
UPDATE genetics SET code = 'BDE' WHERE name = 'Big detroit energy';
UPDATE genetics SET code = 'CC' WHERE name = 'Cali cookies';
UPDATE genetics SET code = 'CH' WHERE name = 'Champaña';
UPDATE genetics SET code = 'CS' WHERE name = 'Candy Store Rbx';
UPDATE genetics SET code = 'DC' WHERE name = 'Divoce Cake';
UPDATE genetics SET code = 'EG' WHERE name = 'End Game';
UPDATE genetics SET code = 'FA' WHERE name = 'Forbiben apple';
UPDATE genetics SET code = 'G' WHERE name = 'Gelato';
UPDATE genetics SET code = 'GMO' WHERE name = 'GMO x Zoobie Kush';
UPDATE genetics SET code = 'HK' WHERE name = 'Hindu kush';
UPDATE genetics SET code = 'JB' WHERE name = 'Jelly Breath';
UPDATE genetics SET code = 'KP' WHERE name = 'Kit pampoe';
UPDATE genetics SET code = 'LBC' WHERE name = 'Lemon berry candy';
UPDATE genetics SET code = 'LM' WHERE name = 'Limonada mango';
UPDATE genetics SET code = 'LU' WHERE name = 'Lemon up';
UPDATE genetics SET code = 'MG' WHERE name = 'Mango';
UPDATE genetics SET code = 'NN' WHERE name = 'Nanamichi';
UPDATE genetics SET code = 'PZ' WHERE name = 'Purple Zkittlez';
UPDATE genetics SET code = 'R' WHERE name = 'Rufius';
UPDATE genetics SET code = 'RWR' WHERE name = 'Red whine runtz';
UPDATE genetics SET code = 'SBC' WHERE name = 'Strowberry candy';
UPDATE genetics SET code = 'SBOG' WHERE name = 'Strawberry OG Cookies';
UPDATE genetics SET code = 'SLAM' WHERE name = 'Slammichi';
UPDATE genetics SET code = 'SU' WHERE name = 'Sugar michi';
UPDATE genetics SET code = 'WF' WHERE name = 'White fire';
UPDATE genetics SET code = 'VHO' WHERE name = 'VHO';
UPDATE genetics SET code = 'SLM' WHERE name = 'Limonada mango' AND code IS NULL; -- Segunda "Limonada mango"

DO $$
BEGIN
  RAISE NOTICE '✅ Códigos de genéticas actualizados';
END $$;
