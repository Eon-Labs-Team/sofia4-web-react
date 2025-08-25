# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server (Vite)
- `npm run build` - Build for production (runs TypeScript compilation then Vite build)
- `npm run build-no-errors` - Build without TypeScript errors (alternative build command)
- `npm run lint` - Run ESLint for code quality
- `npm run types:supabase` - Generate Supabase types (requires SUPABASE_PROJECT_ID env var)

## Project Architecture

This is a React 18 + TypeScript agricultural management system built with Vite, focusing on comprehensive farm operations management.

### Core Technologies
- **Frontend**: React 18.2.0 with TypeScript, Vite 6.2.3 build system
- **UI Library**: Shadcn/ui components built on Radix UI primitives (30+ components)
- **Styling**: Tailwind CSS 3.4.1 with custom design tokens, dark/light theme support
- **Forms**: React Hook Form 7.51.5 + Zod validation schemas
- **State Management**: Zustand 5.0.3 for global state (auth, sidebar, grid configs)
- **Routing**: React Router v6 with protected routes
- **Animation**: Framer Motion 11.18.0 for UI animations
- **Drag & Drop**: React DND for interactive components
- **Backend Integration**: Dual API setup with custom services layer

### Key Architectural Patterns

**Service Layer**: All API interactions centralized in `src/_services/` directory with 40+ domain-specific services. Each service follows consistent patterns for CRUD operations, error handling, and API endpoint management.

**Component Architecture**:
- `src/components/ui/` - Complete Shadcn/ui component library (30+ components) built on Radix UI
- `src/components/layout/` - Layout system (Sidebar, navigation, content areas)
- `src/components/Grid/` - Advanced data grid system with inline editing, export, grouping
- `src/components/DynamicForm/` - Runtime form generation with field rules support
- `src/components/Wizard/` - Multi-step form wizard with validation and progress tracking
- `src/components/auth/` - Authentication guards (ProtectedRoute, PropertyRoute)
- `src/pages/` - 50+ page components for agricultural management domains

**Advanced Form System**: 
- **FormGrid**: Data grid with inline editing, field rules engine, export functionality
- **DynamicForm**: Runtime form generation with type-safe field configurations
- **Wizard**: Multi-step forms with validation, progress tracking, and field rules
- **Field Rules Engine**: Declarative system for form field reactivity and calculations

**State Management Architecture**: 
- **Zustand Stores**: `authStore` (authentication + property selection), `sidebarStore` (navigation), `gridStore` (grid configurations)
- **React Hook Form**: Form-specific state with Zod validation schemas
- **Local State**: Component-level UI interactions and temporary data

### API Integration

**Dual API Architecture**:
- **Primary API** (`VITE_API_CRUDS_URL`, default: localhost:4900): Main agricultural management operations
- **Secondary API** (`VITE_API_SOFIA_URL`, default: localhost:4500): Authentication and chat operations
- **Sofia Chat API** (`VITE_API_SOFIA_CHAT_URL`, default: localhost:3000): AI chat integration

**Endpoint Management**: All API endpoints centralized in `src/lib/constants.ts` with:
- Consistent CRUD patterns (base, byId, changeState, setState)
- Enterprise-scoped data access
- Property-level data filtering
- 25+ domain endpoints covering all agricultural operations

**Authentication & Authorization**:
- JWT-based authentication with localStorage persistence
- Multi-tenant architecture (enterprise → properties → data)
- Role-based access control with permission checks
- Property selection system for data scoping

**Type System**:
- External types from `@eon-lib/eon-mongoose` package
- Import pattern: `import type { TypeName } from '@eon-lib/eon-mongoose'`
- Supabase types generation available via npm script

### Business Domain

Comprehensive agricultural management system covering 6 main areas:

**1. Field Records Management**:
- Soil analysis, fertilization, irrigation records
- Weather events, leaf analysis, water analysis
- Phenological state monitoring, weed tracking
- Animal admission, mass balance calculations

**2. Worker & Labor Management**:
- Worker lists, crew management, personnel provision
- Training records, hand washing logs, hygiene tracking
- Labor classification, contractor management

**3. Machinery & Equipment**:
- Equipment calibration, machinery cleaning
- Backpack sprayer calculations, technical irrigation maintenance
- Calibration of measuring equipment

**4. Compliance & Safety**:
- Waste management and removal, facility cleaning
- Visitor logs, chlorine registration, water chlorination
- Equipment calibration records

**5. Production & Operations**:
- Crop monitoring, task planning, work execution
- **Work Management System**: Unified WorkManager handling 3 work types:
  - **Type A (Aplicación)**: Pesticide/fertilizer applications
  - **Type C (Cosecha)**: Harvest operations  
  - **Type T (Trabajo)**: General agricultural work
- Order applications (OrdenAplicacion), operational area management
- Crop types, varieties, soil types configuration

**6. Inventory Management**:
- Multi-warehouse system (central + property bodegas)
- Product management, lot tracking, inventory movements
- Invoice processing, stock level monitoring

### Development Patterns

**Form Development**:
- **Simple Forms**: React Hook Form + Zod validation schemas
- **Complex Forms**: Use FormGrid with field rules engine for automatic calculations and validation
- **Multi-Step Forms**: Use Wizard component with step validation and progress tracking
- **Field Rules**: Declarative system in `src/lib/fieldRules/` for form reactivity (see `ordenAplicacionRules.ts` example)

**Component Development**:
- Follow Shadcn/ui patterns for consistency
- Use existing UI components from `src/components/ui/` (30+ available)
- Check component stories in `src/stories/` for usage examples
- Implement responsive design with Tailwind breakpoints

**State Management**:
- **Global State**: Use Zustand stores (`authStore`, `sidebarStore`, `gridStore`)
- **Form State**: React Hook Form for form-specific state
- **Authentication**: Use `useAuthStore` hook for auth state and property selection
- **UI State**: Local component state for temporary interactions

**API Integration**:
- Use service layer from `src/_services/` for all API calls
- Follow existing service patterns for consistency
- Handle enterprise/property scoping in service calls
- Use centralized endpoints from `src/lib/constants.ts`

**Styling & Theming**:
- Use Tailwind CSS with custom design tokens from `src/lib/constants.ts`
- Dark/light theme support via theme toggle component
- Follow existing spacing, color, and typography patterns
- Use CSS variables for theme-aware styling

### TypeScript Configuration

**Critical Configuration Notes**:
- TypeScript strict mode is **disabled** (`"strict": false`)
- Be thorough with type annotations as compiler won't catch all errors
- `noEmitOnError: false` allows builds despite TypeScript errors
- Path mapping configured: `@/*` imports for src directory

**Type Imports**:
- External types: `import type { TypeName } from '@eon-lib/eon-mongoose'`
- Internal types: `import type { TypeName } from '@/types/fileName'`
- Component imports: `import { Component } from '@/components/ui/component'`

### Build & Development Tools

**Vite Configuration**:
- React SWC plugin for fast refresh
- Tempo devtools integration for development
- Path aliases configured for `@/` → `src/`
- Base path configuration for deployment flexibility

**Additional Tools**:
- **Tempo**: Development tools integrated in Vite config
- **Storybook**: Component stories available in `src/stories/`
- **ESLint**: TypeScript/React linting configured
- **PostCSS**: Tailwind CSS processing

### Testing & Quality

**Current State**: No explicit test framework configured
- When adding tests, consult with development team for framework choice
- Consider adding tests for field rules engine and complex form logic

**Code Quality**:
- Run `npm run lint` before committing changes
- ESLint configured for TypeScript/React best practices
- Use TypeScript for type safety despite strict mode being disabled
# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.