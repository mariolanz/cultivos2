# Guía de Migración a Supabase

Esta guía te ayudará a migrar tu aplicación Torus Ac. de localStorage a Supabase para una gestión de datos más robusta y escalable.

## 📋 Requisitos Previos

1. ✅ Tener una instancia de Supabase corriendo (ya la tienes en tu servidor)
2. ✅ Credenciales configuradas en Replit Secrets:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `GEMINI_API_KEY`

## 🗄️ Paso 1: Crear el Esquema de Base de Datos

Ejecuta el archivo `database-schema.sql` en tu instancia de Supabase:

1. Ve al panel de Supabase
2. Navega a **SQL Editor**
3. Copia y pega el contenido de `database-schema.sql`
4. Ejecuta el script

Este script creará todas las tablas necesarias:
- `users` - Usuarios del sistema
- `genetics` - Genéticas de cannabis
- `locations` - Ubicaciones y salas
- `mother_plants` - Plantas madre
- `plant_batches` - Lotes de plantas
- `crops` - Cultivos activos
- `crop_plant_counts` - Conteo de plantas por cultivo (junction table)
- `log_entries` - Entradas de registro
- `formulas` - Fórmulas de nutrientes
- `formula_schedules` - Schedules de aplicación de fórmulas
- `inventory_items` - Inventario
- `equipment` - Equipamiento
- `tasks` - Tareas
- `maintenance_logs` - Registros de mantenimiento
- `expenses` - Gastos
- `trimming_sessions` - Sesiones de trimeado
- `notifications` - Notificaciones
- `announcements` - Anuncios
- `pno_procedures` - Procedimientos PNO
- `infographics` - Infografías

## 🔐 Paso 2: Configurar Row Level Security (RLS)

El esquema ya incluye políticas básicas de RLS, pero puedes personalizarlas según tus necesidades:

```sql
-- Ejemplo: Permitir que usuarios vean todos los cultivos de su ubicación
CREATE POLICY "Users can view location crops" ON crops
  FOR SELECT USING (
    location_id IN (
      SELECT location_id FROM users WHERE id = auth.uid()
    )
  );
```

## 📊 Paso 3: Migrar Datos Existentes (Opcional)

Si tienes datos en localStorage que quieres preservar:

1. En la app actual, ve a **Ajustes y Gestión**
2. Usa la opción **"Exportar Backup Completo"**
3. Guarda el archivo JSON generado
4. Usa el siguiente script Node.js para importar a Supabase:

```javascript
// migration-script.js
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const fs = require('fs');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function migrate() {
  const data = JSON.parse(fs.readFileSync('backup.json', 'utf-8'));
  
  console.log('Iniciando migración de datos...');
  
  // 1. Migrar genéticas PRIMERO (no tienen dependencias)
  console.log('Migrando genéticas...');
  for (const genetic of data.genetics || []) {
    await supabase.from('genetics').insert({
      id: genetic.id,
      name: genetic.name,
      type: genetic.type,
      thc_content: genetic.thcContent,
      cbd_content: genetic.cbdContent,
      flowering_days: genetic.floweringDays,
      description: genetic.description,
      image: genetic.image
    });
  }
  
  // 2. Migrar ubicaciones (no tienen dependencias excepto parent_id)
  console.log('Migrando ubicaciones...');
  for (const location of data.locations || []) {
    await supabase.from('locations').insert({
      id: location.id,
      name: location.name,
      type: location.type,
      parent_id: location.parentId
    });
  }
  
  // 3. Migrar usuarios (necesita locations)
  console.log('Migrando usuarios...');
  for (const user of data.users || []) {
    // ✅ IMPORTANTE: Hashear contraseñas con bcrypt
    const passwordHash = await bcrypt.hash(user.password || 'changeme', 10);
    
    await supabase.from('users').insert({
      id: user.id,
      username: user.username,
      password_hash: passwordHash, // ✅ Contraseña hasheada
      roles: user.roles,
      location_id: user.locationId, // UUID de location
      maintenance_location_ids: user.maintenanceLocationIds || [], // Array de UUIDs
      permissions: user.permissions
    });
  }
  
  // 4. Migrar plantas madre (necesita genetics y locations)
  console.log('Migrando plantas madre...');
  for (const motherPlant of data.motherPlants || []) {
    await supabase.from('mother_plants').insert({
      id: motherPlant.id,
      name: motherPlant.name,
      genetics_id: motherPlant.geneticsId,
      location_id: motherPlant.locationId,
      sowing_date: motherPlant.sowingDate,
      clone_count: motherPlant.cloneCount || 0,
      is_archived: motherPlant.isArchived || false
    });
  }
  
  // 5. Migrar equipamiento (necesita locations)
  console.log('Migrando equipamiento...');
  for (const equip of data.equipment || []) {
    await supabase.from('equipment').insert({
      id: equip.id,
      name: equip.name,
      type: equip.type,
      location_id: equip.locationId,
      installation_date: equip.installationDate,
      warranty_expiry_date: equip.warrantyExpiryDate,
      maintenance_interval_days: equip.maintenanceIntervalDays,
      last_maintenance_date: equip.lastMaintenanceDate,
      notes: equip.notes
    });
  }
  
  // 6. Migrar lotes de plantas (necesita genetics, locations, users, mother_plants)
  console.log('Migrando lotes de plantas...');
  for (const batch of data.plantBatches || []) {
    await supabase.from('plant_batches').insert({
      id: batch.id,
      name: batch.name,
      genetics_id: batch.geneticsId,
      creation_date: batch.creationDate,
      initial_plant_count: batch.initialPlantCount,
      rooted_plant_count: batch.rootedPlantCount,
      available_plant_count: batch.availablePlantCount,
      source_location_id: batch.sourceLocationId, // UUID
      type: batch.type,
      status: batch.status,
      creator_id: batch.creatorId,
      mother_plant_id: batch.motherPlantId
    });
  }
  
  // 7. Migrar cultivos (necesita genetics, locations, users)
  console.log('Migrando cultivos...');
  for (const crop of data.allCrops || []) {
    await supabase.from('crops').insert({
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
      harvest_data: crop.harvestData
    });
    
    // 7b. Migrar plant counts del cultivo
    for (const pc of crop.plantCounts || []) {
      await supabase.from('crop_plant_counts').insert({
        crop_id: crop.id,
        batch_id: pc.batchId,
        count: pc.count
      });
    }
  }
  
  // 8. Migrar entradas de log (necesita crops, batches, mother_plants, users)
  console.log('Migrando entradas de log de cultivos...');
  for (const crop of data.allCrops || []) {
    for (const log of crop.logEntries || []) {
      await supabase.from('log_entries').insert({
        id: log.id,
        crop_id: crop.id,
        date: log.date,
        environmental: log.environmental,
        irrigation: log.irrigation,
        ipm: log.ipm,
        observations: log.observations,
        photos: log.photos || [],
        user_id: log.userId
      });
    }
  }
  
  console.log('Migrando entradas de log de lotes...');
  for (const batch of data.plantBatches || []) {
    for (const log of batch.logEntries || []) {
      await supabase.from('log_entries').insert({
        id: log.id,
        batch_id: batch.id,
        date: log.date,
        environmental: log.environmental,
        irrigation: log.irrigation,
        ipm: log.ipm,
        observations: log.observations,
        photos: log.photos || [],
        user_id: log.userId
      });
    }
  }
  
  console.log('Migrando entradas de log de plantas madre...');
  for (const motherPlant of data.motherPlants || []) {
    for (const log of motherPlant.logEntries || []) {
      await supabase.from('log_entries').insert({
        id: log.id,
        mother_plant_id: motherPlant.id,
        date: log.date,
        environmental: log.environmental,
        irrigation: log.irrigation,
        ipm: log.ipm,
        observations: log.observations,
        photos: log.photos || [],
        user_id: log.userId
      });
    }
  }
  
  // 9. Migrar fórmulas y schedules (sin dependencias complejas)
  console.log('Migrando fórmulas...');
  for (const formula of data.formulas || []) {
    await supabase.from('formulas').insert({
      id: formula.id,
      name: formula.name,
      type: formula.type,
      nutrients: formula.nutrients,
      ec: formula.ec,
      ph: formula.ph,
      notes: formula.notes
    });
  }
  
  console.log('Migrando schedules de fórmulas...');
  if (data.formulaSchedule) {
    await supabase.from('formula_schedules').insert({
      id: data.formulaSchedule.id || crypto.randomUUID(),
      name: data.formulaSchedule.name || 'Default Schedule',
      schedules: data.formulaSchedule
    });
  }
  
  console.log('Migrando inventario...');
  for (const item of data.inventory || []) {
    await supabase.from('inventory_items').insert({
      id: item.id,
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      cost_per_unit: item.costPerUnit,
      supplier: item.supplier,
      purchase_history: item.purchaseHistory || []
    });
  }
  
  // 10. Migrar tareas (necesita users, crops, equipment)
  console.log('Migrando tareas...');
  for (const task of data.tasks || []) {
    await supabase.from('tasks').insert({
      id: task.id,
      title: task.title,
      description: task.description,
      type: task.type,
      priority: task.priority,
      due_date: task.dueDate,
      assigned_to: task.assignedTo,
      crop_id: task.cropId,
      equipment_id: task.equipmentId,
      completed_for_crops: task.completedForCrops || [],
      is_completed: task.isCompleted || false,
      recurring: task.recurring
    });
  }
  
  // 11. Migrar gastos, trimming, etc.
  console.log('Migrando gastos y sesiones de trimeado...');
  for (const expense of data.expenses || []) {
    await supabase.from('expenses').insert({
      id: expense.id,
      date: expense.date,
      category: expense.category,
      description: expense.description,
      amount: expense.amount,
      location_id: expense.locationId,
      crop_id: expense.cropId,
      created_by: expense.createdBy
    });
  }
  
  for (const session of data.trimmingSessions || []) {
    await supabase.from('trimming_sessions').insert({
      id: session.id,
      crop_id: session.cropId,
      date: session.date,
      trimmer_id: session.trimmerId,
      weight_before: session.weightBefore,
      weight_after: session.weightAfter,
      notes: session.notes
    });
  }
  
  // 12. Migrar registros de mantenimiento (necesita tasks, equipment, users)
  console.log('Migrando registros de mantenimiento...');
  for (const log of data.maintenanceLogs || []) {
    await supabase.from('maintenance_logs').insert({
      id: log.id,
      task_id: log.taskId,
      equipment_id: log.equipmentId,
      performed_by: log.performedBy,
      performed_date: log.performedDate,
      notes: log.notes,
      photo: log.photo,
      parts_used: log.partsUsed || []
    });
  }
  
  // 13. Migrar notificaciones (necesita users)
  console.log('Migrando notificaciones...');
  for (const notif of data.notifications || []) {
    await supabase.from('notifications').insert({
      id: notif.id,
      user_id: notif.userId,
      message: notif.message,
      type: notif.type || 'info',
      is_read: notif.isRead || false,
      created_at: notif.timestamp
    });
  }
  
  // 14. Migrar anuncios (necesita locations, users)
  console.log('Migrando anuncios...');
  for (const announcement of data.announcements || []) {
    await supabase.from('announcements').insert({
      id: announcement.id,
      message: announcement.message,
      location_id: announcement.locationId,
      created_by: announcement.createdBy,
      read_by: announcement.readBy || [],
      created_at: announcement.timestamp
    });
  }
  
  // 15. Migrar procedimientos PNO (necesita users)
  console.log('Migrando procedimientos PNO...');
  for (const pno of data.pnoProcedures || []) {
    await supabase.from('pno_procedures').insert({
      id: pno.id,
      title: pno.title,
      description: pno.description,
      category: pno.category,
      version: pno.version || '1.0',
      content: pno.content,
      attachments: pno.attachments || [],
      created_by: pno.createdBy
    });
  }
  
  // 16. Migrar infografías (sin dependencias)
  console.log('Migrando infografías...');
  for (const info of data.infographics || []) {
    await supabase.from('infographics').insert({
      id: info.id,
      title: info.title,
      description: info.description,
      type: info.type,
      data: info.data
    });
  }
  
  console.log('✅ Migración completada exitosamente - Todas las tablas migradas');
}

migrate().catch(console.error);
```

**IMPORTANTE**: 
- ✅ Las contraseñas se hashean con `bcrypt.hash()` antes de insertar
- ✅ El orden de migración respeta las dependencias de claves foráneas
- ✅ `location_id` y `maintenance_location_ids` usan UUIDs de la tabla locations

## 🚀 Paso 4: Implementación Gradual

La migración se puede hacer gradualmente:

### Fase 1: Autenticación (Implementado)
- ✅ Cliente de Supabase creado (`services/supabaseClient.ts`)
- ✅ Servicio de autenticación (`services/authService.ts`)
- ✅ Variables de entorno configuradas

### Fase 2: Módulos Principales (Pendiente)
1. Actualizar `AppProvider.tsx` para usar `authService`
2. Crear servicios para:
   - `cropService.ts` - Gestión de cultivos
   - `batchService.ts` - Gestión de lotes
   - `geneticsService.ts` - Gestión de genéticas
   - `locationService.ts` - Gestión de ubicaciones
   - `logService.ts` - Gestión de registros

### Fase 3: Funcionalidades Avanzadas (Pendiente)
- Sistema de tareas
- Inventario
- Reportes
- Notificaciones en tiempo real

## 🔄 Sincronización en Tiempo Real

Supabase soporta suscripciones en tiempo real:

```typescript
// Ejemplo: Escuchar cambios en cultivos
supabase
  .channel('crops-changes')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'crops'
  }, (payload) => {
    console.log('Cambio detectado:', payload);
    // Actualizar estado de la app
  })
  .subscribe();
```

## 🔒 Seguridad

### ✅ Hash de Contraseñas Implementado
El servicio de autenticación ahora usa **bcrypt** para hashear contraseñas de forma segura:

- Al crear usuario: `bcrypt.hash(password, 10)` con 10 rounds de salt
- Al verificar login: `bcrypt.compare(password, user.password_hash)`
- Las contraseñas **nunca** se almacenan en texto plano

**Dependencia instalada**: `bcryptjs` y `@types/bcryptjs`

### Políticas RLS Recomendadas

1. **Usuarios solo leen su propia información**
2. **Cultivos visibles según ubicación del usuario**
3. **Logs solo editables por sus creadores**
4. **Administradores tienen acceso completo**

## 📝 Notas Importantes

1. **UUIDs vs IDs Locales**: Supabase usa UUIDs. Los IDs antiguos (`crop-1`, `user-1`) deben mapearse.

2. **Relaciones con UUIDs**: Las siguientes relaciones usan UUIDs:
   - `users.location_id` → `locations.id` (UUID)
   - `users.maintenance_location_ids` → array de UUIDs de locations
   - `plant_batches.source_location_id` → `locations.id` (UUID)
   
3. **Orden de Inserción**: Las tablas usan claves foráneas. Inserta en este orden:
   - **Primero**: Genetics, Locations
   - **Segundo**: Users (necesita locations)
   - **Tercero**: Mother Plants, Equipment
   - **Cuarto**: Plant Batches (puede necesitar mother plants)
   - **Quinto**: Crops, Tasks
   - **Último**: Log Entries, Maintenance Logs, etc.

4. **Campos JSONB**: Campos como `environmental`, `irrigation`, `harvest_data` se almacenan como JSON.

5. **Timestamps**: Todas las tablas tienen `created_at` y `updated_at` automáticos.

6. **Seguridad**: 
   - El cliente Supabase **lanza un error** si faltan las credenciales (fail-fast)
   - Las contraseñas se hashean con bcrypt (10 rounds)
   - Login verifica el hash antes de autenticar

## 🧪 Testing

Antes de migrar en producción:

1. Crea datos de prueba en Supabase
2. Verifica que los servicios funcionan correctamente
3. Prueba las políticas RLS
4. Valida la migración de datos

## 🆘 Problemas Comunes

### Error: "row-level security policy"
- **Causa**: Políticas RLS bloqueando acceso
- **Solución**: Revisa las políticas o temporalmente desactiva RLS para testing

### Error: "duplicate key value"
- **Causa**: Intentando insertar un ID que ya existe
- **Solución**: Usa `upsert` o verifica que los IDs sean únicos

### Error: "violates foreign key constraint"
- **Causa**: Referencia a un ID que no existe
- **Solución**: Inserta las entidades relacionadas primero

## 📞 Soporte

Si necesitas ayuda con la migración, revisa:
- [Documentación de Supabase](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- El código de ejemplo en `services/authService.ts`
