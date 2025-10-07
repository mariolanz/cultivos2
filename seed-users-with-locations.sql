-- Script para insertar locations y usuarios de constants.ts a Supabase
-- Ejecutar en Development Database

-- 1. Insertar locations principales (sites)
DO $$
DECLARE
  loc_mc UUID;
  loc_ll UUID;
  loc_ss UUID;
  loc_br UUID;
BEGIN
  -- Insertar locations principales (solo si no existen)
  INSERT INTO locations (name, type, parent_id)
  SELECT 'MC', 'site', NULL WHERE NOT EXISTS (SELECT 1 FROM locations WHERE name = 'MC' AND parent_id IS NULL);
  
  INSERT INTO locations (name, type, parent_id)
  SELECT 'LL', 'site', NULL WHERE NOT EXISTS (SELECT 1 FROM locations WHERE name = 'LL' AND parent_id IS NULL);
  
  INSERT INTO locations (name, type, parent_id)
  SELECT 'SS', 'site', NULL WHERE NOT EXISTS (SELECT 1 FROM locations WHERE name = 'SS' AND parent_id IS NULL);
  
  INSERT INTO locations (name, type, parent_id)
  SELECT 'BR', 'site', NULL WHERE NOT EXISTS (SELECT 1 FROM locations WHERE name = 'BR' AND parent_id IS NULL);

  -- Obtener los IDs de las locations
  SELECT id INTO loc_mc FROM locations WHERE name = 'MC' AND parent_id IS NULL;
  SELECT id INTO loc_ll FROM locations WHERE name = 'LL' AND parent_id IS NULL;
  SELECT id INTO loc_ss FROM locations WHERE name = 'SS' AND parent_id IS NULL;
  SELECT id INTO loc_br FROM locations WHERE name = 'BR' AND parent_id IS NULL;

  -- 2. Insertar usuarios con contraseñas hasheadas
  -- LUIS B (ADMIN, GROWER) - locationId: TODAS
  INSERT INTO users (username, password_hash, roles, location_id, permissions)
  VALUES (
    'LUIS B',
    '$2b$10$q1RCQLLGuth.NBktk.sOGel5nD7HAWXvvmjJkpoy1aqJ5O8Zst/oO',
    ARRAY['ADMIN', 'GROWER']::text[],
    NULL,  -- TODAS = NULL
    jsonb_build_object(
      'dashboard', true, 'schedule', true, 'notifications', true, 'batches', true, 
      'setup', true, 'log', true, 'motherPlants', true, 'pnoLibrary', true, 
      'infographics', true, 'aiDiagnosis', true, 'reports', true, 'trimming', true,
      'harvest', true, 'archive', true, 'maintenanceCalendar', true,
      'maintenanceReports', true, 'expenses', true, 'settings', true
    )
  )
  ON CONFLICT (username) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    roles = EXCLUDED.roles,
    location_id = EXCLUDED.location_id,
    permissions = EXCLUDED.permissions;

  -- LUMZA (GROWER) - MC
  INSERT INTO users (username, password_hash, roles, location_id, permissions)
  VALUES (
    'LUMZA',
    '$2b$10$WKEVCSor3IB9Uff6yWZrRu2sqWYJUmuP19SX1/TyxZfxArns5fQrW',
    ARRAY['GROWER']::text[],
    loc_mc,
    jsonb_build_object(
      'dashboard', true, 'schedule', true, 'notifications', true, 'batches', true,
      'setup', true, 'log', true, 'motherPlants', true, 'pnoLibrary', true,
      'infographics', true, 'aiDiagnosis', true, 'reports', true,
      'harvest', true, 'archive', true, 'settings', true
    )
  )
  ON CONFLICT (username) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    roles = EXCLUDED.roles,
    location_id = EXCLUDED.location_id,
    permissions = EXCLUDED.permissions;

  -- LUIS T (GROWER) - MC
  INSERT INTO users (username, password_hash, roles, location_id, permissions)
  VALUES (
    'LUIS T',
    '$2b$10$eIUi3FCkjocHj8PREg9XgeIEE5n/oOKvCoLn73dGMk79sNfTCjSka',
    ARRAY['GROWER']::text[],
    loc_mc,
    jsonb_build_object(
      'dashboard', true, 'schedule', true, 'notifications', true, 'batches', true,
      'setup', true, 'log', true, 'motherPlants', true, 'pnoLibrary', true,
      'infographics', true, 'aiDiagnosis', true, 'reports', true,
      'harvest', true, 'archive', true, 'settings', true
    )
  )
  ON CONFLICT (username) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    roles = EXCLUDED.roles,
    location_id = EXCLUDED.location_id,
    permissions = EXCLUDED.permissions;

  -- FERMIN (GROWER) - LL
  INSERT INTO users (username, password_hash, roles, location_id, permissions)
  VALUES (
    'FERMIN',
    '$2b$10$3ImreZlDr6sJx8xT6zMaMOJMitZuuO3Xekd/r/5H9N2p32OiO1v/O',
    ARRAY['GROWER']::text[],
    loc_ll,
    jsonb_build_object(
      'dashboard', true, 'schedule', true, 'notifications', true, 'batches', true,
      'setup', true, 'log', true, 'motherPlants', true, 'pnoLibrary', true,
      'infographics', true, 'aiDiagnosis', true, 'reports', true,
      'harvest', true, 'archive', true, 'settings', true
    )
  )
  ON CONFLICT (username) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    roles = EXCLUDED.roles,
    location_id = EXCLUDED.location_id,
    permissions = EXCLUDED.permissions;

  -- CRISTIAN (GROWER, MAINTENANCE) - LL, maintenance TODAS
  INSERT INTO users (username, password_hash, roles, location_id, maintenance_location_ids, permissions)
  VALUES (
    'CRISTIAN',
    '$2b$10$th9zelWhXE5p3VTHVq2UEeV4o76X.jSThupwGv9stQ8y2Js9KB1BK',
    ARRAY['GROWER', 'MAINTENANCE']::text[],
    loc_ll,
    NULL,  -- TODAS = NULL
    jsonb_build_object(
      'dashboard', true, 'schedule', true, 'notifications', true, 'batches', true,
      'setup', true, 'log', true, 'motherPlants', true, 'pnoLibrary', true,
      'infographics', true, 'aiDiagnosis', true, 'reports', true,
      'harvest', true, 'archive', true, 'settings', true,
      'maintenanceCalendar', true, 'maintenanceReports', true, 'expenses', true
    )
  )
  ON CONFLICT (username) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    roles = EXCLUDED.roles,
    location_id = EXCLUDED.location_id,
    maintenance_location_ids = EXCLUDED.maintenance_location_ids,
    permissions = EXCLUDED.permissions;

  -- TOMY (GROWER, TRIMMER) - LL
  INSERT INTO users (username, password_hash, roles, location_id, permissions)
  VALUES (
    'TOMY',
    '$2b$10$iAUaxTp0n1H2qzTylMOq6OqmomwG4RQIHZ7zLQhT1HkyuoCOXqLTO',
    ARRAY['GROWER', 'TRIMMER']::text[],
    loc_ll,
    jsonb_build_object(
      'dashboard', true, 'schedule', true, 'notifications', true, 'batches', true,
      'setup', true, 'log', true, 'motherPlants', true, 'pnoLibrary', true,
      'infographics', true, 'aiDiagnosis', true, 'reports', true,
      'harvest', true, 'archive', true, 'settings', true,
      'trimming', true
    )
  )
  ON CONFLICT (username) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    roles = EXCLUDED.roles,
    location_id = EXCLUDED.location_id,
    permissions = EXCLUDED.permissions;

  -- DAYANA (GROWER) - SS
  INSERT INTO users (username, password_hash, roles, location_id, permissions)
  VALUES (
    'DAYANA',
    '$2b$10$keZAox1ZlPVmGQ8lEXpRoOAFetEvjJDpRDZV1VQ/8TnBjFPjBsYYO',
    ARRAY['GROWER']::text[],
    loc_ss,
    jsonb_build_object(
      'dashboard', true, 'schedule', true, 'notifications', true, 'batches', true,
      'setup', true, 'log', true, 'motherPlants', true, 'pnoLibrary', true,
      'infographics', true, 'aiDiagnosis', true, 'reports', true,
      'harvest', true, 'archive', true, 'settings', true
    )
  )
  ON CONFLICT (username) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    roles = EXCLUDED.roles,
    location_id = EXCLUDED.location_id,
    permissions = EXCLUDED.permissions;

  -- ARTURO (GROWER, MAINTENANCE) - SS, maintenance SS
  INSERT INTO users (username, password_hash, roles, location_id, maintenance_location_ids, permissions)
  VALUES (
    'ARTURO',
    '$2b$10$4arGAABBPWj3cDO/upj62.UlwefPHEo/QQDwaly29ZT2YbgehVtqG',
    ARRAY['GROWER', 'MAINTENANCE']::text[],
    loc_ss,
    ARRAY[loc_ss],
    jsonb_build_object(
      'dashboard', true, 'schedule', true, 'notifications', true, 'batches', true,
      'setup', true, 'log', true, 'motherPlants', true, 'pnoLibrary', true,
      'infographics', true, 'aiDiagnosis', true, 'reports', true,
      'harvest', true, 'archive', true, 'settings', true,
      'maintenanceCalendar', true, 'maintenanceReports', true, 'expenses', true
    )
  )
  ON CONFLICT (username) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    roles = EXCLUDED.roles,
    location_id = EXCLUDED.location_id,
    maintenance_location_ids = EXCLUDED.maintenance_location_ids,
    permissions = EXCLUDED.permissions;

  -- EDUARDO (GROWER) - BR
  INSERT INTO users (username, password_hash, roles, location_id, permissions)
  VALUES (
    'EDUARDO',
    '$2b$10$svJSNP45KEBGCuOoT5Wz0uvZ/MFuODXgPGaK5RIrhW8Z/Tjd2Dbz2',
    ARRAY['GROWER']::text[],
    loc_br,
    jsonb_build_object(
      'dashboard', true, 'schedule', true, 'notifications', true, 'batches', true,
      'setup', true, 'log', true, 'motherPlants', true, 'pnoLibrary', true,
      'infographics', true, 'aiDiagnosis', true, 'reports', true,
      'harvest', true, 'archive', true, 'settings', true
    )
  )
  ON CONFLICT (username) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    roles = EXCLUDED.roles,
    location_id = EXCLUDED.location_id,
    permissions = EXCLUDED.permissions;

  -- GUSTAVO (GROWER) - BR
  INSERT INTO users (username, password_hash, roles, location_id, permissions)
  VALUES (
    'GUSTAVO',
    '$2b$10$qzPTR0w21a7SgjMRhQwfBO.OhV4hpNLnEx9nVyD0SnHqeuFVVEIdK',
    ARRAY['GROWER']::text[],
    loc_br,
    jsonb_build_object(
      'dashboard', true, 'schedule', true, 'notifications', true, 'batches', true,
      'setup', true, 'log', true, 'motherPlants', true, 'pnoLibrary', true,
      'infographics', true, 'aiDiagnosis', true, 'reports', true,
      'harvest', true, 'archive', true, 'settings', true
    )
  )
  ON CONFLICT (username) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    roles = EXCLUDED.roles,
    location_id = EXCLUDED.location_id,
    permissions = EXCLUDED.permissions;

  -- PACO (GROWER) - BR
  INSERT INTO users (username, password_hash, roles, location_id, permissions)
  VALUES (
    'PACO',
    '$2b$10$QKzKGk8IrfGDlxKDJ/PlZOrCzqtqts/k2KSpJCRhVs3Dl6sXx6m2.',
    ARRAY['GROWER']::text[],
    loc_br,
    jsonb_build_object(
      'dashboard', true, 'schedule', true, 'notifications', true, 'batches', true,
      'setup', true, 'log', true, 'motherPlants', true, 'pnoLibrary', true,
      'infographics', true, 'aiDiagnosis', true, 'reports', true,
      'harvest', true, 'archive', true, 'settings', true
    )
  )
  ON CONFLICT (username) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    roles = EXCLUDED.roles,
    location_id = EXCLUDED.location_id,
    permissions = EXCLUDED.permissions;

  -- DEYSI (TRIMMER, MAINTENANCE) - TODAS, maintenance TODAS
  INSERT INTO users (username, password_hash, roles, location_id, maintenance_location_ids, permissions)
  VALUES (
    'DEYSI',
    '$2b$10$7XgLeNxgbVqVBp4e/C7poO6ICCMQlOlJ2hn5LuiHfdn7pIRvjH8lS',
    ARRAY['TRIMMER', 'MAINTENANCE']::text[],
    NULL,  -- TODAS = NULL
    NULL,  -- TODAS = NULL
    jsonb_build_object(
      'dashboard', true, 'trimming', true, 'harvest', true, 'settings', true,
      'maintenanceCalendar', true, 'maintenanceReports', true, 'expenses', true
    )
  )
  ON CONFLICT (username) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    roles = EXCLUDED.roles,
    location_id = EXCLUDED.location_id,
    maintenance_location_ids = EXCLUDED.maintenance_location_ids,
    permissions = EXCLUDED.permissions;

  -- SEBASTIAN (TRIMMER, MAINTENANCE) - TODAS, maintenance TODAS
  INSERT INTO users (username, password_hash, roles, location_id, maintenance_location_ids, permissions)
  VALUES (
    'SEBASTIAN',
    '$2b$10$WD6G6TagFS3fnO6vLTaz7exfVls0fQLFI9sCjRsZjwo1xaaemYO2W',
    ARRAY['TRIMMER', 'MAINTENANCE']::text[],
    NULL,  -- TODAS = NULL
    NULL,  -- TODAS = NULL
    jsonb_build_object(
      'dashboard', true, 'trimming', true, 'harvest', true, 'settings', true,
      'maintenanceCalendar', true, 'maintenanceReports', true, 'expenses', true
    )
  )
  ON CONFLICT (username) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    roles = EXCLUDED.roles,
    location_id = EXCLUDED.location_id,
    maintenance_location_ids = EXCLUDED.maintenance_location_ids,
    permissions = EXCLUDED.permissions;

  RAISE NOTICE 'Locations y usuarios insertados/actualizados correctamente';
END $$;
