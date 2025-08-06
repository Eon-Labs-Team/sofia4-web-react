# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server (Vite)
- `npm run build` - Build for production (runs TypeScript compilation then Vite build)
- `npm run lint` - Run ESLint for code quality
- `npm run types:supabase` - Generate Supabase types (requires SUPABASE_PROJECT_ID env var)

## Project Architecture

This is a React 18 + TypeScript agricultural management system built with Vite, focusing on comprehensive farm operations management.

### Core Technologies
- **Frontend**: React 18.2.0 with TypeScript, Vite 6.2.3 build system
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS 3.4.1 with custom design tokens
- **Forms**: React Hook Form 7.51.5 + Zod validation
- **State Management**: Zustand 5.0.3 for global state
- **Routing**: React Router v6
- **Backend Integration**: Supabase client + custom API services

### Key Architectural Patterns

**Service Layer**: All API interactions centralized in `src/_services/` directory. Each domain has its own service file following consistent patterns for CRUD operations and error handling.

**Component Structure**:
- `src/components/ui/` - Shadcn/ui component library (30+ components)
- `src/components/layout/` - Layout components (Sidebar, navigation)
- `src/components/Grid/` - Advanced data grid system with inline editing
- `src/components/DynamicForm/` - Runtime form generation system
- `src/components/Wizard/` - Multi-step form component with validation

**FormGrid System**: Advanced data grid with inline editing, field rules engine for automatic calculations, export functionality, and real-time validation. Key files: `FormGrid.tsx`, `useFieldRules.ts`.

**State Management**: 
- Zustand stores in `src/lib/store/` for global state (auth, sidebar, grid configs)
- React Hook Form for form-specific state management
- Local component state for UI interactions

### API Integration

**Dual API Setup**:
- Primary API: `VITE_API_URL` (default: localhost:4900) for main application data
- CRUD API: `VITE_API_CRUD_URL` (default: localhost:4500) for warehouse operations

**Endpoints**: Centralized in `src/lib/constants.ts` with consistent patterns for CRUD operations, state changes, and enterprise-scoped data access.

**External Dependencies**: 
- `@eon-lib/eon-mongoose` package provides centralized type definitions
- Types are imported as `import type { TypeName } from '@eon-lib/eon-mongoose'`

### Business Domain

Agricultural management system covering:
- **Field Records**: Soil analysis, irrigation, weather events, leaf analysis
- **Worker Management**: Crew lists, training records, personnel provision
- **Machinery**: Equipment tracking, calibration, maintenance records
- **Compliance**: Waste management, facility cleaning, visitor logs
- **Production**: Crop monitoring, phenological state tracking
- **Inventory**: Warehouse management via secondary API

### Development Patterns

**Form Handling**: Use React Hook Form + Zod schemas. For complex forms with multiple fields and calculations, use the FormGrid component with field rules.

**Component Creation**: Follow Shadcn/ui patterns. Check existing components in `components/ui/` for consistent styling and behavior patterns.

**Authentication**: JWT-based with role-based access control. Properties (multi-tenant) and enterprise-level permissions. Use `authStore` for global auth state.

**Navigation**: Sidebar configuration managed in `sidebarStore.ts`. Role-based menu items with property-scoped access.

**Styling**: Use Tailwind CSS with design tokens from `src/lib/constants.ts`. Dark/light theme support implemented.

### TypeScript Configuration

**Important**: TypeScript strict mode is disabled (`"strict": false`). When adding type annotations, be thorough as the compiler won't catch all type errors automatically.

**Path Mapping**: Use `@/*` imports for src directory (`import { Component } from '@/components/Component'`)

### Testing & Quality

No explicit test framework configured. When adding tests, check with the development team for preferred framework.

**Linting**: ESLint configured for TypeScript/React. Run `npm run lint` before committing changes.