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
- `log_entries` - Entradas de registro
- `formulas` - Fórmulas de nutrientes
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
const fs = require('fs');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function migrate() {
  const data = JSON.parse(fs.readFileSync('backup.json', 'utf-8'));
  
  // Migrar usuarios
  for (const user of data.users || []) {
    await supabase.from('users').insert({
      id: user.id,
      username: user.username,
      password_hash: user.password, // ⚠️ Hash this properly!
      roles: user.roles,
      location_id: user.locationId,
      maintenance_location_ids: user.maintenanceLocationIds,
      permissions: user.permissions
    });
  }
  
  // Migrar genéticas
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
  
  // ... continuar con otras tablas
}

migrate().catch(console.error);
```

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

### Importante: Hash de Contraseñas
El servicio actual NO hashea contraseñas. Antes de usar en producción:

```typescript
import bcrypt from 'bcryptjs';

// Al crear usuario
const hashedPassword = await bcrypt.hash(password, 10);

// Al verificar login
const isValid = await bcrypt.compare(password, user.password_hash);
```

### Políticas RLS Recomendadas

1. **Usuarios solo leen su propia información**
2. **Cultivos visibles según ubicación del usuario**
3. **Logs solo editables por sus creadores**
4. **Administradores tienen acceso completo**

## 📝 Notas Importantes

1. **UUIDs vs IDs Locales**: Supabase usa UUIDs. Los IDs antiguos (`crop-1`, `user-1`) deben mapearse.

2. **Relaciones**: Las tablas usan claves foráneas. Asegúrate de insertar en el orden correcto:
   - Genetics → Locations → Users → Mother Plants → Plant Batches → Crops → Logs

3. **Campos JSONB**: Campos como `environmental`, `irrigation`, `harvest_data` se almacenan como JSON.

4. **Timestamps**: Todas las tablas tienen `created_at` y `updated_at` automáticos.

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
