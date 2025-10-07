# Torus Ac. - Cannabis Cultivation Management System

## Overview
This is a comprehensive cannabis cultivation management application built with React, TypeScript, and Vite. The app provides tools for managing cultivation batches, tracking environmental conditions, scheduling tasks, and using AI-powered diagnostics for plant health assessment and harvest predictions.

**Business Vision**: To provide an all-in-one solution for cannabis cultivators to optimize their operations, improve yields, and ensure plant health through advanced technology and data-driven insights.

## User Preferences
- Language: Spanish (UI is in Spanish)
- Application domain: Cannabis cultivation management

## System Architecture

### UI/UX Decisions
- **Dashboard**: Real-time monitoring of cultivation metrics.
- **Key Features**: Batch Management, Environmental Monitoring, AI Diagnosis, Harvest Predictions, Task Scheduling, Reports & Analytics, Mother Plants Management, PNO Library, Maintenance Dashboard.

### Technical Implementations
- **Frontend Framework**: React 19.1.1 with TypeScript.
- **Build Tool**: Vite 6.2.0.
- **Routing**: React Router DOM 7.9.1 (HashRouter for client-side routing).
- **Charts**: Chart.js 4.4.3, Recharts 3.2.1.
- **Styling**: Tailwind CSS (CDN - development only).
- **Authentication**: bcryptjs for secure password hashing (rounds: 10).
- **Data Management**: All data is stored in Supabase PostgreSQL; localStorage is no longer used.
- **API Integration**: Frontend uses `SUPABASE_ANON_KEY` for read operations. Backend API (`api/server.js` on port 3001) uses `SUPABASE_SERVICE_ROLE_KEY` for secure administrative operations (e.g., user management).

### Feature Specifications
- **AI Diagnosis**: Uses Google's Gemini AI to diagnose plant health issues from images, providing detailed diagnosis, health assessment, and preventative tips.
- **Harvest Predictions**: AI-powered yield predictions based on genetics, growth phases, and environmental conditions, returning a yield range, reasoning, and confidence level.
- **Database Schema**: 20 tables with UUID primary and foreign keys, including users, genetics, locations, mother_plants, plant_batches, crops, log_entries, formulas, inventory_items, equipment, tasks, and more.
- **Row Level Security (RLS)**: Implemented for multi-tenant data isolation.
- **User Management**: Only an ADMIN user (default: ADMIN/admin123) is created initially. ADMINs can create and manage other users with specific roles and permissions via the "Ajustes y Gestión" -> "Usuarios y Permisos" section. Roles must be in Spanish (ADMINISTRADOR, CULTIVADOR, MANTENIMIENTO, TRIMEADOR).

### System Design Choices
- **Deployment**: Configured for Replit and EasyPanel deployment with separate Dockerfiles for frontend (`Dockerfile.frontend`) and backend (`Dockerfile.backend`).
- **Environment Variables**: Uses `import.meta.env` for client-side variables (Vite standard) and `.env` for mapping Replit secrets. Environment variables for deployment must have the `VITE_` prefix.
- **Database Setup**: Requires execution of specific SQL scripts (`setup-database-complete.sql`, `enable-rls-policies.sql`, `seed-clean-start.sql`, `seed-users-with-locations.sql`) in a specific order for both development and production. **CRITICAL:** `enable-rls-policies.sql` must be executed in production or all endpoints will fail with 400 errors.

## External Dependencies
- **AI Integration**: Google Gemini AI (@google/genai 1.20.0) - Requires `GEMINI_API_KEY`.
- **Database**: Supabase (PostgreSQL) - Requires `SUPABASE_URL` and `SUPABASE_ANON_KEY`. Backend operations require `SUPABASE_SERVICE_ROLE_KEY`.
- **Deployment**: Docker, EasyPanel.
- **Styling**: Tailwind CSS (via CDN in development).