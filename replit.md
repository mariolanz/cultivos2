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
│   ├── geminiService.ts # Gemini AI service
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
- Environment variables exposed to the app via `define`

### Deployment
- **Type**: Autoscale (stateless web app)
- **Build**: `npm run build`
- **Run**: Vite preview server on port 5000

## Recent Changes
- **2025-10-05**: Initial Replit setup
  - Updated Vite config for Replit environment (port 5000, HMR proxy settings)
  - Fixed JSX syntax errors in Infographics.tsx (HTML entity escaping)
  - Created missing index.css file
  - Configured deployment for Replit Autoscale
  - Added .gitignore for Node.js/Vite projects

## User Preferences
- Language: Spanish (UI is in Spanish)
- Application domain: Cannabis cultivation management

## Data Management
This application uses local storage for data persistence. No external database is configured. User data including:
- Cultivation batches
- Environmental logs
- Task schedules
- Settings and preferences

Are stored in the browser's localStorage.

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
- The app was originally designed for Netlify but has been adapted for Replit
- Tailwind CSS is loaded via CDN (development only - should be installed for production)
- The app uses HashRouter for client-side routing
- Authentication is handled via local context (no external auth service)
