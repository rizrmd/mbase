# CRUSH.md

This file provides guidance to AI agents working with code in this repository.

## Development Commands

### Start Development Environment
- `bun run dev` - Starts both backend and frontend concurrently with colored output
- Backend runs on http://localhost:5050
- Frontend runs on http://localhost:5070

### Production Environment
- `bun run prod` - Builds frontend and starts production servers
- `bun run prod:build` - Build frontend for production only
- `bun run prod:start` - Start backend in production mode only
- `bun run prod:preview` - Start production server (serves built frontend) only

### Individual Services
- `bun run dev:backend` - Start backend only (from backend directory: `bun run dev`)
- `bun run dev:frontend` - Start frontend only (from frontend directory: `npm run dev`)

### Frontend-specific Commands
- `npm run build` - Build frontend for production
- `npm run lint` - Run ESLint on frontend code
- `npm run preview` - Preview production build

## Architecture Overview

This is a full-stack application using Bun for the backend and Vite + React for the frontend.

### Backend Architecture
- **Runtime**: Bun with TypeScript
- **Server**: Built using `Bun.serve()` (not Express)
- **Port**: 5050
- **Entry Point**: `backend/index.ts`

The backend follows a minimal architecture with:
- Simple HTTP route handling in `index.ts`
- Modular services with validation and response utilities
- Environment-based configuration
- Built-in CORS support for frontend on port 5070

### Frontend Architecture
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite (using rolldown-vite variant)
- **Styling**: Tailwind CSS v4 with Vite plugin
- **Port**: 5070
- **Entry Point**: `frontend/src/main.tsx`
- **UI Components**: Custom components with class-variance-authority and clsx/tailwind-merge utilities

Key frontend features:
- Tailwind CSS v4 for styling
- React Compiler for optimizations
- Path aliases (`@/` maps to `src/`)
- API proxy to backend (`/api` routes proxy to localhost:5050)

### Development Workflow
The project uses a unified development script (`scripts/dev.ts`) that:
1. Kills existing processes on ports 5050 and 5070
2. Starts backend with Bun
3. Starts frontend with npm/Vite
4. Provides colored console output for both services
5. Handles graceful shutdown on Ctrl+C

### Production Workflow
The project uses a unified production script (`scripts/prod.ts`) that:
1. Checks port availability for production ports (5050, 5170)
2. Builds frontend for production
3. Starts backend in production mode
4. Starts production server serving built frontend
5. Provides colored console output for all services
6. Handles graceful shutdown on Ctrl+C

## Technology Stack

### Backend
- **Bun**: JavaScript runtime and bundler
- **TypeScript**: For type safety

### Frontend
- **React 19**: UI framework
- **Vite**: Build tool (rolldown-vite variant)
- **Tailwind CSS v4**: Styling
- **TypeScript**: Type safety
- **Lucide React**: Icons

## Configuration Notes

### Port Configuration
- Backend: 5050 (configured in backend/index.ts)
- Frontend: 5070 (configured in frontend/vite.config.ts)
- Production preview: 5170 (default Vite preview port)
- Development script automatically handles port cleanup
- Production script checks port availability but doesn't kill existing processes

### Path Aliases
- Frontend: `@/` maps to `src/` (configured in vite.config.ts)

## Code Style and Conventions

### Backend
- Use Bun APIs instead of Node.js equivalents
- Prefer `Bun.serve()` over Express
- Use built-in WebSocket support
- Follow the existing error handling pattern with `createErrorResponse` utilities

### Frontend
- Use functional components with hooks
- Follow Tailwind CSS v4 conventions
- Use `cn()` utility for conditional className merging
- Leverage React Compiler optimizations

### General
- TypeScript strict mode enabled
- ESNext target for modern JavaScript features
- Consistent use of ESM modules
- Export without .js extensions

## Important Gotchas

### Backend Structure
- The backend imports services from `./src/` directory but these imports will fail as the directory doesn't exist
- These imports need to be either implemented or removed for the application to start properly

### CORS Configuration
- Backend is configured to only accept requests from http://localhost:5070 and http://localhost:3000
- When developing with different frontend ports, update `ALLOWED_ORIGINS` in `backend/index.ts`

### Testing
- No test framework is currently configured
- When adding tests, consider using Bun's built-in test runner for the backend

## Error Handling

The backend uses a centralized error handling pattern:
- `handleError()` function for consistent error responses
- Specific error codes for different failure scenarios
- CORS headers are automatically added to all error responses