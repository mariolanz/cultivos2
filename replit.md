# Torus Ac. - Cannabis Cultivation Management System

## Overview
This is a comprehensive cannabis cultivation management application built with React, TypeScript, and Vite. The app provides tools for managing cultivation batches, tracking environmental conditions, scheduling tasks, and using AI-powered diagnostics for plant health assessment and harvest predictions.

**Last Updated:** October 5, 2025

## Key Features
- **Dashboard**: Real-time monitoring of cultivation metrics
- **Batch Management**: Track multiple cultivation batches through their lifecycle
- **Environmental Monitoring**: Log and track temperature, humidity, CO2, and other environmental factors
- **AI Diagnosis**: Use Google's Gemini AI to diagnose plant health issues from images
- **Harvest Predictions**: AI-powered yield predictions based on cultivation data
- **Task Scheduling**: Weekly task calendar for cultivation management
- **Reports & Analytics**: Comprehensive reporting and data visualization
- **Mother Plants Management**: Track and manage mother plant genetics
- **PNO Library**: Standard operating procedures for cultivation excellence
- **Maintenance Dashboard**: Equipment and facility maintenance tracking

## Technology Stack
- **Frontend Framework**: React 19.1.1 with TypeScript
- **Build Tool**: Vite 6.2.0
- **Routing**: React Router DOM 7.9.1
- **Charts**: Chart.js 4.4.3, Recharts 3.2.1
- **AI Integration**: Google Gemini AI (@google/genai 1.20.0)
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Authentication**: bcryptjs for secure password hashing
- **Styling**: Tailwind CSS (CDN - development only)

## Project Structure
```
/
├── components/           # React components
│   ├── layout/          # Layout components (Header, Sidebar, MainLayout)
│   ├── ui/              # Reusable UI components (Modal, Card, Spinner)
│   ├── Dashboard.tsx    # Main dashboard
│   ├── BatchManagement.tsx
│   ├── AiDiagnosis.tsx  # AI-powered plant diagnostics
│   ├── HarvestProjection.tsx
│   └── ...              # Other feature components
├── context/             # React context providers
├── hooks/               # Custom React hooks
├── services/            # API and service integrations
│   ├── geminiService.ts    # Gemini AI service
│   ├── supabaseClient.ts   # Supabase database client
│   ├── authService.ts      # Authentication service with bcrypt
│   └── nutritionService.ts
├── functions/           # Netlify-style serverless functions (not used in Replit)
├── App.tsx             # Main app component with routing
├── index.tsx           # App entry point
├── types.ts            # TypeScript type definitions
├── constants.ts        # App constants
└── vite.config.ts      # Vite configuration
```

## Environment Configuration

### Required Secrets
- `GEMINI_API_KEY`: Google Gemini API key for AI features
  - Get your API key at: https://aistudio.google.com/apikey
  - Used for plant diagnosis and harvest predictions
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_ANON_KEY`: Supabase anonymous key for client authentication

### Development Server
- **Port**: 5000
- **Host**: 0.0.0.0 (configured for Replit proxy)
- **HMR**: Configured to work with Replit's proxy environment

## Development Workflow

### Running Locally
The app runs automatically via the configured workflow:
```bash
npm run dev
```

### Building for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Key Configuration Files

### vite.config.ts
- Configured to use port 5000 (Replit's standard port)
- HMR settings optimized for Replit's proxy
- Environment variables exposed to the app via `define` (GEMINI_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY)
- Configured `allowedHosts: true` for EasyPanel Docker deployment

### Dockerfiles
La aplicación usa **dos Dockerfiles separados** para deployment:

**Dockerfile.frontend** (Frontend - Puerto 5000):
- Multi-stage build para optimizar imagen
- Usa `serve` para servir build de producción
- Build arguments para variables Vite (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_GEMINI_API_KEY)
- Comando: `serve -s dist -l 5000`

**Dockerfile.backend** (Backend API - Puerto 3001):
- Imagen ligera con dependencias de producción
- Copia solo archivos necesarios (api/, services/supabaseClient.ts)
- Comando: `npm run api`

### Deployment en EasyPanel
**Arquitectura de 2 Servicios desde el MISMO repositorio:**

**Servicio 1: Frontend**
- Repository: Mismo repo de GitHub
- Dockerfile: `Dockerfile.frontend`
- Variables de entorno:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `VITE_GEMINI_API_KEY`
  - `VITE_API_URL` (URL del backend, ej: https://api.tudominio.com)
- Puerto: 5000

**Servicio 2: Backend API**
- Repository: Mismo repo de GitHub
- Dockerfile: `Dockerfile.backend`
- Variables de entorno:
  - `VITE_SUPABASE_URL` (o `SUPABASE_URL`)
  - `SUPABASE_SERVICE_ROLE_KEY` ⚠️ **Solo en backend**
- Puerto: 3001

## Recent Changes
- **2025-10-06**: Refactorización del Sistema de Autenticación y Base de Datos (COMPLETADO ✅)
  - **Problema resuelto**: Eliminadas dependencias circulares entre usuarios y otras tablas
  - **Nuevo flujo de inicio**: Solo usuario ADMIN por defecto (usuario: ADMIN, password: admin123)
  - **AppProvider optimizado**: 
    - Primera carga: solo usuarios (necesario para login)
    - Post-login: carga todos los datos del sistema
  - **Location por defecto**: Se crea "Central" automáticamente si no existe
  - **RLS actualizado**: Solo usuarios autenticados pueden acceder a datos
  - **Scripts SQL nuevos**:
    - `init-admin-only.sql`: Inicializa solo admin + location Central
    - `update-rls-authenticated.sql`: RLS para usuarios autenticados
    - `remove-public-rls.sql`: Elimina acceso público a locations/genetics
  - **Admin total**: ADMIN tiene acceso completo sin depender de locations/genetics preexistentes
  - **Gestión de Usuarios**: Admin puede crear nuevos usuarios desde "Ajustes y Gestión" → "Usuarios y Permisos"
    - Botón "+ Añadir Usuario" disponible
    - Configurar roles, permisos, ubicaciones al crear
    - Contraseña obligatoria al crear, opcional al editar
    - Manejo de errores mejorado: muestra mensajes de éxito/error y solo cierra el modal si la operación fue exitosa
    - Funciones async correctamente implementadas (createUser y saveUser retornan promesas)
  - **Backend API para Operaciones Administrativas**:
    - Creado servidor Express en `api/server.js` (puerto 3001)
    - Endpoints seguros para crear, editar y eliminar usuarios
    - Usa `SUPABASE_SERVICE_ROLE_KEY` de forma segura (solo en backend)
    - Valida permisos de administrador antes de ejecutar operaciones
    - Frontend actualizado para usar `services/apiService.ts`
    - Separación clara: frontend usa ANON_KEY (lectura), backend usa SERVICE_ROLE_KEY (escritura)

## Recent Changes (Historical)
- **2025-10-06**: Fixed Environment Variables for Production Deploy (COMPLETED ✅)
  - Migrated from `process.env` to `import.meta.env` (Vite standard for client-side)
  - Created `src/vite-env.d.ts` for TypeScript support
  - Simplified `vite.config.ts` - removed custom `define` (Vite handles VITE_* automatically)
  - Created `.env` file mapping Replit Secrets to VITE_* prefix
  - Removed debug console.logs from supabaseClient.ts
  - **IMPORTANT for EasyPanel**: Environment variables MUST have `VITE_` prefix

- **2025-10-06**: Frontend Integration with Supabase (COMPLETED ✅)
  - Creado `services/dataService.ts` con operaciones CRUD completas para todas las entidades
  - AppProvider ahora carga datos de Supabase al inicio de la sesión
  - Todas las operaciones de guardado (save) ahora persisten en Supabase
  - Login usa autenticación bcrypt async desde Supabase
  - **IMPORTANTE**: La app ya NO usa localStorage - todos los datos están en Supabase
  - Archivo backup: `context/AppProvider.localStorage.tsx` (versión anterior con localStorage)

- **2025-10-05**: Data Migration to Supabase (COMPLETED ✅)
  - Successfully migrated all example data from constants.ts to Supabase
  - **Migrated data:**
    - 30 cannabis genetics strains
    - 24 locations (4 sites + 20 rooms)
    - 13 users with bcrypt-hashed passwords (LUIS B, LUMZA, FERMIN, etc.)
    - 30 mother plants
    - 13 active crops
    - 8 plant batches
    - 11 nutrient formulas with schedule
    - 106 inventory items
    - 22 maintenance/cultivation tasks
    - 3 PNO procedures
    - 2 infographics
  - All users ready for login with original passwords (e.g., LUIS B / LUBBana420)

- **2025-10-05**: Supabase Database Integration (COMPLETED ✅)
  - Migrated from localStorage to Supabase PostgreSQL
  - Implemented secure authentication with bcrypt password hashing
  - Created complete database schema with 20 tables and UUID foreign keys
  - Added Row Level Security (RLS) policies for multi-tenant data isolation
  - Created comprehensive MIGRATION_GUIDE.md for data migration
  - Configured Docker deployment for EasyPanel with `serve`
  - Updated Vite config with Supabase environment variables and allowedHosts

- **2025-10-05**: Initial Replit setup
  - Updated Vite config for Replit environment (port 5000, HMR proxy settings)
  - Fixed JSX syntax errors in Infographics.tsx (HTML entity escaping)
  - Created missing index.css file
  - Added .gitignore for Node.js/Vite projects

## User Preferences
- Language: Spanish (UI is in Spanish)
- Application domain: Cannabis cultivation management

## Data Management

### Supabase Database (Production)
The application uses **Supabase PostgreSQL** for persistent data storage with the following architecture:

**Database Schema (20 tables):**
1. `users` - User accounts with bcrypt-hashed passwords
2. `genetics` - Cannabis strain genetics
3. `locations` - Growing locations and rooms
4. `mother_plants` - Mother plant inventory
5. `plant_batches` - Plant batch tracking
6. `crops` - Active cultivation crops
7. `crop_plant_counts` - Plant count tracking per crop
8. `log_entries` - Environmental and cultivation logs
9. `formulas` - Nutrient formulas
10. `formula_schedules` - Formula application schedules
11. `inventory_items` - Inventory management
12. `equipment` - Equipment tracking
13. `tasks` - Task management
14. `maintenance_logs` - Equipment maintenance records
15. `expenses` - Financial expense tracking
16. `trimming_sessions` - Trimming session records
17. `notifications` - User notifications
18. `announcements` - System announcements
19. `pno_procedures` - Standard operating procedures
20. `infographics` - Educational infographics

**Key Features:**
- UUID primary and foreign keys for all relationships
- Row Level Security (RLS) for multi-tenant data isolation
- Fail-fast client initialization (throws error if credentials missing)
- Secure authentication with bcrypt password hashing (rounds: 10)

**Migration Guide:**
See `MIGRATION_GUIDE.md` for complete data migration instructions from localStorage to Supabase, including dependency-safe table ordering to prevent FK violations.

## AI Features
The app integrates with Google's Gemini AI for:

1. **Plant Diagnosis**: Upload plant images with notes to get:
   - Detailed diagnosis of issues
   - Overall health assessment
   - Preventative tips

2. **Harvest Predictions**: Based on cultivation data including:
   - Genetics
   - Growth phases duration
   - Environmental conditions
   - Returns yield range, reasoning, and confidence level

## Notes
- The app was originally designed for Netlify but has been adapted for Replit and EasyPanel deployment
- Tailwind CSS is loaded via CDN (development only - should be installed for production)
- The app uses HashRouter for client-side routing
- Authentication uses bcrypt for secure password hashing
- Database migration must follow the order specified in MIGRATION_GUIDE.md to avoid FK violations

## Important Files
- `database-schema.sql` - Complete Supabase database schema
- `MIGRATION_GUIDE.md` - Step-by-step data migration guide
- `Dockerfile` - Production Docker configuration for EasyPanel
- `services/supabaseClient.ts` - Supabase client with fail-fast initialization
- `services/authService.ts` - Authentication service with bcrypt
