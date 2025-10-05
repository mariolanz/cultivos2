/**
 * Script de migración de datos de constants.ts a Supabase
 * 
 * Este script toma todos los datos de ejemplo de constants.ts y los migra a Supabase.
 * IMPORTANTE: Las contraseñas se hashearán con bcrypt antes de insertarlas.
 * Genera UUIDs válidos pero mantiene las relaciones entre tablas.
 * 
 * Ejecutar con: npm run migrate
 */

// @ts-nocheck
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import {
  USERS,
  GENETICS,
  LOCATIONS,
  MOTHER_PLANTS,
  PLANT_BATCHES,
  CROPS,
  INVENTORY_ITEMS,
  FORMULAS,
  FORMULA_SCHEDULE,
  TASKS,
  INITIAL_PNO_PROCEDURES,
  INITIAL_INFOGRAPHICS
} from './constants';

// Inicializar Supabase con las credenciales del entorno
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
// Para migración, usar service_role key que bypasa RLS
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY deben estar configurados');
  console.error('   Para obtener tu service_role key:');
  console.error('   1. Ve a tu proyecto en Supabase Dashboard');
  console.error('   2. Settings → API');
  console.error('   3. Copia la "service_role" key (NO la "anon" key)');
  console.error('   4. Configúrala: export SUPABASE_SERVICE_ROLE_KEY="tu_key_aqui"');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Mapas para convertir IDs antiguos a UUIDs
const idMaps = {
  genetics: new Map(),
  locations: new Map(),
  users: new Map(),
  motherPlants: new Map(),
  crops: new Map(),
  batches: new Map(),
  formulas: new Map(),
  tasks: new Map(),
  procedures: new Map(),
  infographics: new Map(),
  inventory: new Map()
};

async function migrateData() {
  console.log('🚀 Iniciando migración de datos a Supabase...\n');

  try {
    // 1. Migrar Genetics (sin dependencias)
    console.log('📦 Migrando genéticas...');
    for (const genetic of GENETICS) {
      const uuid = randomUUID();
      idMaps.genetics.set(genetic.id, uuid);
      
      const { error } = await supabase.from('genetics').insert({
        id: uuid,
        name: genetic.name,
        type: 'Híbrida',
        thc_content: null,
        cbd_content: null,
        flowering_days: null,
        description: null,
        image: null
      });
      if (error && !error.message.includes('duplicate')) {
        console.error(`Error al insertar genética ${genetic.name}:`, error.message);
      }
    }
    console.log(`✅ ${GENETICS.length} genéticas migradas\n`);

    // 2. Migrar Locations (self-referencing)
    console.log('📍 Migrando ubicaciones...');
    // Primero las ubicaciones principales (sin parentId)
    const mainLocations = LOCATIONS.filter(loc => !loc.parentId);
    for (const location of mainLocations) {
      const uuid = randomUUID();
      idMaps.locations.set(location.id, uuid);
      
      const { error } = await supabase.from('locations').insert({
        id: uuid,
        name: location.name,
        type: 'site'
      });
      if (error && !error.message.includes('duplicate')) {
        console.error(`Error al insertar ubicación ${location.name}:`, error.message);
      }
    }
    // Luego las salas (con parentId)
    const rooms = LOCATIONS.filter(loc => loc.parentId);
    for (const room of rooms) {
      const uuid = randomUUID();
      idMaps.locations.set(room.id, uuid);
      
      const { error } = await supabase.from('locations').insert({
        id: uuid,
        name: room.name,
        type: 'room',
        parent_id: idMaps.locations.get(room.parentId) || null
      });
      if (error && !error.message.includes('duplicate')) {
        console.error(`Error al insertar sala ${room.name}:`, error.message);
      }
    }
    console.log(`✅ ${LOCATIONS.length} ubicaciones migradas\n`);

    // 3. Migrar Users (dependen de locations)
    console.log('👥 Migrando usuarios (hasheando contraseñas)...');
    for (const user of USERS) {
      const uuid = randomUUID();
      idMaps.users.set(user.id, uuid);
      
      // Hashear la contraseña con bcrypt
      const passwordHash = await bcrypt.hash(user.password, 10);
      
      const locationUUID = user.locationId === 'TODAS' ? null : idMaps.locations.get(user.locationId);
      
      const { error } = await supabase.from('users').insert({
        id: uuid,
        username: user.username,
        password_hash: passwordHash,
        roles: user.roles,
        location_id: locationUUID,
        maintenance_location_ids: [],
        permissions: user.permissions || {}
      });
      if (error && !error.message.includes('duplicate')) {
        console.error(`Error al insertar usuario ${user.username}:`, error.message);
      }
    }
    console.log(`✅ ${USERS.length} usuarios migrados con contraseñas hasheadas\n`);

    // 4. Migrar Mother Plants (dependen de genetics, locations)
    console.log('🌱 Migrando plantas madre...');
    for (const plant of MOTHER_PLANTS) {
      const uuid = randomUUID();
      idMaps.motherPlants.set(plant.id, uuid);
      
      const { error } = await supabase.from('mother_plants').insert({
        id: uuid,
        name: plant.name,
        genetics_id: idMaps.genetics.get(plant.geneticsId),
        location_id: idMaps.locations.get(plant.locationId),
        sowing_date: plant.sowingDate,
        clone_count: plant.cloneCount || 0,
        is_archived: plant.isArchived || false
      });
      if (error && !error.message.includes('duplicate')) {
        console.error(`Error al insertar planta madre ${plant.name}:`, error.message);
      }
    }
    console.log(`✅ ${MOTHER_PLANTS.length} plantas madre migradas\n`);

    // 5. Migrar Crops (dependen de genetics, locations, users)
    console.log('🌿 Migrando cultivos...');
    for (const crop of CROPS) {
      const uuid = randomUUID();
      idMaps.crops.set(crop.id, uuid);
      
      const { error } = await supabase.from('crops').insert({
        id: uuid,
        genetics_id: idMaps.genetics.get(crop.geneticsId),
        location_id: idMaps.locations.get(crop.locationId),
        owner_id: idMaps.users.get(crop.ownerId),
        cloning_date: crop.cloningDate,
        pre_veg_date: crop.preVegDate,
        veg_date: crop.vegDate,
        flower_date: crop.flowerDate,
        drying_curing_date: crop.dryingCuringDate,
        harvest_date: crop.harvestDate,
        light_hours_veg: crop.lightHours?.veg || 18,
        light_hours_flower: crop.lightHours?.flower || 12,
        is_archived: crop.isArchived || false,
        harvest_data: crop.harvestData || null
      });
      if (error && !error.message.includes('duplicate')) {
        console.error(`Error al insertar cultivo ${crop.id}:`, error.message);
      }
    }
    console.log(`✅ ${CROPS.length} cultivos migrados\n`);

    // 6. Migrar Plant Batches (dependen de genetics, locations, users, mother_plants)
    console.log('📦 Migrando lotes de plantas...');
    for (const batch of PLANT_BATCHES) {
      const uuid = randomUUID();
      idMaps.batches.set(batch.id, uuid);
      
      const { error } = await supabase.from('plant_batches').insert({
        id: uuid,
        name: batch.name,
        genetics_id: idMaps.genetics.get(batch.geneticsId),
        creation_date: batch.creationDate,
        initial_plant_count: batch.initialPlantCount,
        rooted_plant_count: batch.rootedPlantCount,
        available_plant_count: batch.availablePlantCount,
        source_location_id: idMaps.locations.get(batch.sourceLocationId),
        type: batch.type,
        status: batch.status,
        creator_id: idMaps.users.get(batch.creatorId),
        mother_plant_id: null
      });
      if (error && !error.message.includes('duplicate')) {
        console.error(`Error al insertar lote ${batch.name}:`, error.message);
      }
    }
    console.log(`✅ ${PLANT_BATCHES.length} lotes de plantas migrados\n`);

    // 7. Migrar Crop Plant Counts (junction table)
    console.log('🔢 Migrando conteos de plantas por cultivo...');
    let plantCountsInserted = 0;
    for (const crop of CROPS) {
      if (crop.plantCounts && crop.plantCounts.length > 0) {
        for (const plantCount of crop.plantCounts) {
          const cropUUID = idMaps.crops.get(crop.id);
          const batchUUID = idMaps.batches.get(plantCount.batchId);
          
          if (cropUUID && batchUUID) {
            const { error } = await supabase.from('crop_plant_counts').insert({
              crop_id: cropUUID,
              batch_id: batchUUID,
              count: plantCount.count
            });
            if (error && !error.message.includes('duplicate')) {
              console.error(`Error al insertar plant count para cultivo ${crop.id}:`, error.message);
            } else {
              plantCountsInserted++;
            }
          }
        }
      }
    }
    console.log(`✅ ${plantCountsInserted} conteos de plantas migrados\n`);

    // 8. Migrar Formulas
    console.log('🧪 Migrando fórmulas...');
    for (const formula of FORMULAS) {
      const uuid = randomUUID();
      idMaps.formulas.set(formula.id, uuid);
      
      const { error } = await supabase.from('formulas').insert({
        id: uuid,
        name: formula.name,
        type: 'Nutriente',
        nutrients: formula.nutrients,
        ec: formula.targetPPM ? formula.targetPPM / 500 : null,
        ph: null,
        notes: `Target PPM: ${formula.targetPPM || 'N/A'}`
      });
      if (error && !error.message.includes('duplicate')) {
        console.error(`Error al insertar fórmula ${formula.name}:`, error.message);
      }
    }
    console.log(`✅ ${FORMULAS.length} fórmulas migradas\n`);

    // 9. Migrar Formula Schedule (convertir IDs de fórmulas a UUIDs)
    console.log('📅 Migrando calendario de fórmulas...');
    const convertedSchedule = {};
    for (const [stage, weeks] of Object.entries(FORMULA_SCHEDULE)) {
      convertedSchedule[stage] = {};
      for (const [week, formulaId] of Object.entries(weeks)) {
        convertedSchedule[stage][week] = idMaps.formulas.get(formulaId) || formulaId;
      }
    }
    
    const { error: scheduleError } = await supabase.from('formula_schedules').insert({
      name: 'PNO Default Schedule',
      schedules: convertedSchedule
    });
    if (scheduleError && !scheduleError.message.includes('duplicate')) {
      console.error('Error al insertar calendario de fórmulas:', scheduleError.message);
    } else {
      console.log('✅ Calendario de fórmulas migrado\n');
    }

    // 10. Migrar Inventory Items
    console.log('📊 Migrando inventario...');
    for (const item of INVENTORY_ITEMS) {
      const uuid = randomUUID();
      idMaps.inventory.set(item.id, uuid);
      
      const { error } = await supabase.from('inventory_items').insert({
        id: uuid,
        name: item.name,
        category: item.category,
        quantity: item.currentStock || 0,
        unit: item.unit,
        cost_per_unit: item.averageCostPerUnit || 0,
        supplier: null,
        purchase_history: []
      });
      if (error && !error.message.includes('duplicate')) {
        console.error(`Error al insertar item de inventario ${item.name}:`, error.message);
      }
    }
    console.log(`✅ ${INVENTORY_ITEMS.length} items de inventario migrados\n`);

    // 11. Migrar Tasks
    console.log('✅ Migrando tareas...');
    for (const task of TASKS) {
      const uuid = randomUUID();
      idMaps.tasks.set(task.id, uuid);
      
      const { error } = await supabase.from('tasks').insert({
        id: uuid,
        title: task.title,
        description: task.description || '',
        type: 'cultivation',
        priority: 'medium',
        due_date: null,
        assigned_to: null,
        crop_id: null,
        equipment_id: null,
        is_completed: false,
        recurring: null
      });
      if (error && !error.message.includes('duplicate')) {
        console.error(`Error al insertar tarea ${task.title}:`, error.message);
      }
    }
    console.log(`✅ ${TASKS.length} tareas migradas\n`);

    // 12. Migrar PNO Procedures
    console.log('📋 Migrando procedimientos PNO...');
    for (const procedure of INITIAL_PNO_PROCEDURES) {
      const uuid = randomUUID();
      idMaps.procedures.set(procedure.id, uuid);
      
      const { error } = await supabase.from('pno_procedures').insert({
        id: uuid,
        title: procedure.title,
        description: '',
        category: 'Cultivo',
        version: '1.0',
        content: {},
        attachments: [],
        created_by: null
      });
      if (error && !error.message.includes('duplicate')) {
        console.error(`Error al insertar procedimiento ${procedure.title}:`, error.message);
      }
    }
    console.log(`✅ ${INITIAL_PNO_PROCEDURES.length} procedimientos PNO migrados\n`);

    // 13. Migrar Infographics
    console.log('📊 Migrando infografías...');
    for (const infographic of INITIAL_INFOGRAPHICS) {
      const uuid = randomUUID();
      idMaps.infographics.set(infographic.id, uuid);
      
      const { error } = await supabase.from('infographics').insert({
        id: uuid,
        title: infographic.title,
        description: '',
        type: 'general',
        data: {}
      });
      if (error && !error.message.includes('duplicate')) {
        console.error(`Error al insertar infografía ${infographic.title}:`, error.message);
      }
    }
    console.log(`✅ ${INITIAL_INFOGRAPHICS.length} infografías migradas\n`);

    console.log('🎉 ¡Migración completada exitosamente!\n');
    console.log('📋 Resumen:');
    console.log(`   - ${GENETICS.length} genéticas`);
    console.log(`   - ${LOCATIONS.length} ubicaciones`);
    console.log(`   - ${USERS.length} usuarios (contraseñas hasheadas con bcrypt)`);
    console.log(`   - ${MOTHER_PLANTS.length} plantas madre`);
    console.log(`   - ${CROPS.length} cultivos`);
    console.log(`   - ${PLANT_BATCHES.length} lotes de plantas`);
    console.log(`   - ${plantCountsInserted} conteos de plantas`);
    console.log(`   - ${FORMULAS.length} fórmulas`);
    console.log(`   - 1 calendario de fórmulas`);
    console.log(`   - ${INVENTORY_ITEMS.length} items de inventario`);
    console.log(`   - ${TASKS.length} tareas`);
    console.log(`   - ${INITIAL_PNO_PROCEDURES.length} procedimientos PNO`);
    console.log(`   - ${INITIAL_INFOGRAPHICS.length} infografías`);
    console.log('\n✅ Ahora puedes iniciar sesión con cualquiera de estos usuarios:');
    console.log('   - Usuario: LUIS B, Password: LUBBana420 (ADMIN)');
    console.log('   - Usuario: LUMZA, Password: LZBana420 (GROWER)');
    console.log('   - Usuario: FERMIN, Password: FEBana420 (GROWER)');
    console.log('   - (y más...)');

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    process.exit(1);
  }
}

// Ejecutar la migración
migrateData();
