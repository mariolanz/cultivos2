/**
 * Script de migración de datos de constants.ts a Supabase
 * 
 * Este script toma todos los datos de ejemplo de constants.ts y los migra a Supabase.
 * IMPORTANTE: Las contraseñas se hashearán con bcrypt antes de insertarlas.
 * 
 * Ejecutar con: npm run migrate
 */

// @ts-nocheck
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
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
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: SUPABASE_URL y SUPABASE_ANON_KEY deben estar configurados');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateData() {
  console.log('🚀 Iniciando migración de datos a Supabase...\n');

  try {
    // 1. Migrar Genetics (sin dependencias)
    console.log('📦 Migrando genéticas...');
    for (const genetic of GENETICS) {
      const { error } = await supabase.from('genetics').insert({
        id: genetic.id,
        name: genetic.name,
        type: genetic.type || 'Híbrida',
        thc_content: genetic.thcContent,
        cbd_content: genetic.cbdContent,
        flowering_days: genetic.floweringDays,
        description: genetic.description,
        image: genetic.image
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
      const { error } = await supabase.from('locations').insert({
        id: location.id,
        name: location.name,
        type: location.type || 'site'
      });
      if (error && !error.message.includes('duplicate')) {
        console.error(`Error al insertar ubicación ${location.name}:`, error.message);
      }
    }
    // Luego las salas (con parentId)
    const rooms = LOCATIONS.filter(loc => loc.parentId);
    for (const room of rooms) {
      const { error } = await supabase.from('locations').insert({
        id: room.id,
        name: room.name,
        type: room.type || 'room',
        parent_id: room.parentId
      });
      if (error && !error.message.includes('duplicate')) {
        console.error(`Error al insertar sala ${room.name}:`, error.message);
      }
    }
    console.log(`✅ ${LOCATIONS.length} ubicaciones migradas\n`);

    // 3. Migrar Users (dependen de locations)
    console.log('👥 Migrando usuarios (hasheando contraseñas)...');
    for (const user of USERS) {
      // Hashear la contraseña con bcrypt
      const passwordHash = await bcrypt.hash(user.password, 10);
      
      const { error } = await supabase.from('users').insert({
        id: user.id,
        username: user.username,
        password_hash: passwordHash,
        roles: user.roles,
        location_id: user.locationId === 'TODAS' ? null : user.locationId,
        maintenance_location_ids: user.maintenanceLocationIds || [],
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
      const { error } = await supabase.from('mother_plants').insert({
        id: plant.id,
        name: plant.name,
        genetics_id: plant.geneticsId,
        location_id: plant.locationId,
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
      const { error } = await supabase.from('crops').insert({
        id: crop.id,
        genetics_id: crop.geneticsId,
        location_id: crop.locationId,
        owner_id: crop.ownerId,
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
      const { error } = await supabase.from('plant_batches').insert({
        id: batch.id,
        name: batch.name,
        genetics_id: batch.geneticsId,
        creation_date: batch.creationDate,
        initial_plant_count: batch.initialPlantCount,
        rooted_plant_count: batch.rootedPlantCount,
        available_plant_count: batch.availablePlantCount,
        source_location_id: batch.sourceLocationId,
        type: batch.type,
        status: batch.status,
        creator_id: batch.creatorId,
        mother_plant_id: batch.motherPlantId || null
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
          const { error } = await supabase.from('crop_plant_counts').insert({
            crop_id: crop.id,
            batch_id: plantCount.batchId,
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
    console.log(`✅ ${plantCountsInserted} conteos de plantas migrados\n`);

    // 8. Migrar Formulas
    console.log('🧪 Migrando fórmulas...');
    for (const formula of FORMULAS) {
      const { error } = await supabase.from('formulas').insert({
        id: formula.id,
        name: formula.name,
        type: 'Nutriente', // Puedes ajustar esto según tus necesidades
        nutrients: formula.nutrients,
        ec: formula.targetPPM ? formula.targetPPM / 500 : null, // Conversión aproximada
        ph: null,
        notes: `Target PPM: ${formula.targetPPM || 'N/A'}`
      });
      if (error && !error.message.includes('duplicate')) {
        console.error(`Error al insertar fórmula ${formula.name}:`, error.message);
      }
    }
    console.log(`✅ ${FORMULAS.length} fórmulas migradas\n`);

    // 9. Migrar Formula Schedule
    console.log('📅 Migrando calendario de fórmulas...');
    const { error: scheduleError } = await supabase.from('formula_schedules').insert({
      name: 'PNO Default Schedule',
      schedules: FORMULA_SCHEDULE
    });
    if (scheduleError && !scheduleError.message.includes('duplicate')) {
      console.error('Error al insertar calendario de fórmulas:', scheduleError.message);
    } else {
      console.log('✅ Calendario de fórmulas migrado\n');
    }

    // 10. Migrar Inventory Items
    console.log('📊 Migrando inventario...');
    for (const item of INVENTORY_ITEMS) {
      const { error } = await supabase.from('inventory_items').insert({
        id: item.id,
        name: item.name,
        category: item.category,
        quantity: item.currentStock || 0,
        unit: item.unit,
        cost_per_unit: item.averageCostPerUnit || 0,
        supplier: null,
        purchase_history: item.purchases || []
      });
      if (error && !error.message.includes('duplicate')) {
        console.error(`Error al insertar item de inventario ${item.name}:`, error.message);
      }
    }
    console.log(`✅ ${INVENTORY_ITEMS.length} items de inventario migrados\n`);

    // 11. Migrar Tasks
    console.log('✅ Migrando tareas...');
    for (const task of TASKS) {
      const { error } = await supabase.from('tasks').insert({
        id: task.id,
        title: task.title,
        description: task.description,
        type: task.type,
        priority: task.priority || 'medium',
        due_date: task.dueDate || null,
        assigned_to: null, // Se asignará manualmente después
        crop_id: null,
        equipment_id: null,
        is_completed: false,
        recurring: task.recurring || null
      });
      if (error && !error.message.includes('duplicate')) {
        console.error(`Error al insertar tarea ${task.title}:`, error.message);
      }
    }
    console.log(`✅ ${TASKS.length} tareas migradas\n`);

    // 12. Migrar PNO Procedures
    console.log('📋 Migrando procedimientos PNO...');
    for (const procedure of INITIAL_PNO_PROCEDURES) {
      const { error } = await supabase.from('pno_procedures').insert({
        id: procedure.id,
        title: procedure.title,
        description: procedure.description,
        category: procedure.category,
        version: procedure.version || '1.0',
        content: procedure.content,
        attachments: procedure.attachments || [],
        created_by: null // Se asignará al primer usuario admin
      });
      if (error && !error.message.includes('duplicate')) {
        console.error(`Error al insertar procedimiento ${procedure.title}:`, error.message);
      }
    }
    console.log(`✅ ${INITIAL_PNO_PROCEDURES.length} procedimientos PNO migrados\n`);

    // 13. Migrar Infographics
    console.log('📊 Migrando infografías...');
    for (const infographic of INITIAL_INFOGRAPHICS) {
      const { error } = await supabase.from('infographics').insert({
        id: infographic.id,
        title: infographic.title,
        description: infographic.description,
        type: infographic.type,
        data: infographic.data
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
