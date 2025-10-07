# 🗄️ Setup de Base de Datos - Torus Ac.

## 📋 Scripts Disponibles

### **1. `setup-database-complete.sql`** ⭐ (EJECUTAR PRIMERO)
Crea todas las tablas necesarias y corrige roles de usuarios.

**Qué hace:**
- ✅ Crea 20 tablas (genetics, locations, users, crops, expenses, etc.)
- ✅ Corrige roles de usuarios (ADMIN → ADMINISTRADOR)
- ✅ Verifica tablas creadas

**Cuándo usar:** Al configurar la base de datos por primera vez en desarrollo o producción.

### **2. `enable-rls-policies.sql`** 🔐 (EJECUTAR SEGUNDO - CRÍTICO)
Habilita Row Level Security y crea políticas de acceso.

**Qué hace:**
- ✅ Habilita RLS en todas las 20 tablas
- ✅ Crea políticas que permiten acceso completo para SUPABASE_ANON_KEY
- ✅ Verifica políticas creadas

**Cuándo usar:** En PRODUCCIÓN después de crear las tablas. **SIN ESTO, TODOS LOS ENDPOINTS FALLARÁN CON ERROR 400**.

### **3. `seed-clean-start.sql`** (EJECUTAR TERCERO)
Inserta datos iniciales: genéticas, locations, inventario, nutrientes.

**Qué hace:**
- ✅ 30 genéticas con códigos
- ✅ 24 locations (MC, LL, SS, BR + salas)
- ✅ 52 items de inventario/nutrientes

**Cuándo usar:** Después de `setup-database-complete.sql` para tener datos de ejemplo.

### **4. `seed-users-with-locations.sql`** (OPCIONAL)
Inserta los 13 usuarios de constants.ts con sus contraseñas originales.

---

## 🚀 Proceso de Setup

### **Para BASE DE DATOS DE PRODUCCIÓN (Supabase):**

1. **Ve al SQL Editor de Supabase:**
   - Abre tu proyecto → SQL Editor

2. **Ejecuta los scripts en orden:**
   ```sql
   -- Paso 1: Crear tablas
   [Copiar y ejecutar setup-database-complete.sql]
   
   -- Paso 2: Habilitar RLS y crear políticas ⭐ IMPORTANTE
   [Copiar y ejecutar enable-rls-policies.sql]
   
   -- Paso 3: Insertar datos iniciales
   [Copiar y ejecutar seed-clean-start.sql]
   
   -- Paso 4 (opcional): Insertar usuarios
   [Copiar y ejecutar seed-users-with-locations.sql]
   ```

### **Para BASE DE DATOS DE DESARROLLO (Replit):**

```bash
# Paso 1: Crear tablas
cat setup-database-complete.sql | psql $DATABASE_URL

# Paso 2: Insertar datos
cat seed-clean-start.sql | psql $DATABASE_URL

# Paso 3 (opcional): Insertar usuarios
cat seed-users-with-locations.sql | psql $DATABASE_URL
```

---

## ✅ Verificación

Después de ejecutar los scripts, verifica:

```sql
-- Ver tablas creadas
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' ORDER BY table_name;

-- Ver usuarios
SELECT username, roles FROM users ORDER BY username;

-- Ver genéticas
SELECT name, code FROM genetics ORDER BY name LIMIT 10;

-- Ver locations
SELECT name, type FROM locations ORDER BY name;
```

---

## 🔐 Usuarios Disponibles

Después de ejecutar `seed-users-with-locations.sql`:

| Usuario | Contraseña | Rol |
|---------|-----------|-----|
| LUIS B | LUBBana420 | ADMINISTRADOR, CULTIVADOR |
| LUMZA | LZBana420 | CULTIVADOR |
| FERMIN | FEBana420 | CULTIVADOR |
| ... | ... | ... |

---

## ⚠️ Importante

- **SIEMPRE ejecuta `setup-database-complete.sql` primero** (crea las tablas)
- **Después ejecuta `seed-clean-start.sql`** (inserta datos)
- Los scripts usan `CREATE TABLE IF NOT EXISTS` - son seguros de ejecutar múltiples veces
- Los roles deben estar en español: `ADMINISTRADOR`, `CULTIVADOR`, `MANTENIMIENTO`, `TRIMEADOR`
