# Overview

This is a full-stack application built with **Expo (React Native)** for the frontend and **Express.js** for the backend API server. The project is designed to run on Replit with a mobile-first approach, supporting iOS, Android, and web platforms. The app uses a tab-based navigation structure and connects to a PostgreSQL database via Drizzle ORM.

There is also a separate `wifi-wps-repo/` directory containing an unrelated Android (Kotlin/Jetpack Compose) project for WiFi WPS testing. This is a standalone project and not part of the main Expo application.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend (Expo / React Native)

- **Framework**: Expo SDK 54 with React Native 0.81, React 19
- **Routing**: `expo-router` with file-based routing (tabs layout in `app/(tabs)/`)
- **State Management**: `@tanstack/react-query` for server state management
- **UI Libraries**: React Native core components, `expo-blur`, `expo-linear-gradient`, `expo-image`, `react-native-reanimated`, `react-native-gesture-handler`
- **Keyboard Handling**: `react-native-keyboard-controller` with a custom `KeyboardAwareScrollViewCompat` wrapper for cross-platform compatibility
- **Error Handling**: Custom `ErrorBoundary` class component with `ErrorFallback` UI
- **Entry Point**: `app/_layout.tsx` wraps the app with QueryClientProvider, GestureHandlerRootView, and KeyboardProvider
- **Path Aliases**: `@/*` maps to root, `@shared/*` maps to `./shared/*`

### Backend (Express.js)

- **Runtime**: Node.js with TypeScript (via `tsx` for development, `esbuild` for production builds)
- **Server Entry**: `server/index.ts` sets up Express with CORS handling for Replit domains and localhost
- **Routes**: Defined in `server/routes.ts` — all API routes should be prefixed with `/api`
- **Storage Layer**: `server/storage.ts` defines an `IStorage` interface with a default `MemStorage` (in-memory) implementation. This can be swapped for a database-backed implementation.
- **CORS**: Dynamically configured based on `REPLIT_DEV_DOMAIN` and `REPLIT_DOMAINS` environment variables, plus localhost origins for Expo web dev

### Database

- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema**: Defined in `shared/schema.ts` — shared between frontend and backend
- **Current Schema**: A `users` table with `id` (UUID, auto-generated), `username` (unique text), and `password` (text)
- **Validation**: `drizzle-zod` generates Zod schemas from Drizzle table definitions (`insertUserSchema`)
- **Migrations**: Output to `./migrations` directory, managed via `drizzle-kit push` command
- **Connection**: Uses `DATABASE_URL` environment variable

### API Client

- **Location**: `lib/query-client.ts`
- **Base URL**: Constructed from `EXPO_PUBLIC_DOMAIN` environment variable
- **Fetch**: Uses `expo/fetch` for network requests
- **Helper**: `apiRequest()` function handles method, route, JSON body, and error checking

### Build & Deployment

- **Dev Mode**: Two processes — `expo:dev` for the Expo dev server and `server:dev` for the Express API
- **Production Build**: `expo:static:build` creates a static web build, `server:build` bundles the server with esbuild
- **Production Run**: `server:prod` serves the built application
- **Static Build Script**: `scripts/build.js` handles Expo static export with Metro bundler

### Project Structure

```
app/                    # Expo Router pages (file-based routing)
  (tabs)/               # Tab navigator screens
  _layout.tsx           # Root layout with providers
components/             # Reusable React Native components
constants/              # App constants (colors, etc.)
lib/                    # Client-side utilities (query client, API helpers)
server/                 # Express.js backend
  index.ts              # Server entry point
  routes.ts             # API route definitions
  storage.ts            # Data access layer
  templates/            # HTML templates (landing page)
shared/                 # Code shared between frontend and backend
  schema.ts             # Drizzle database schema + Zod validators
migrations/             # Drizzle migration files
```

## External Dependencies

- **PostgreSQL**: Database, connected via `DATABASE_URL` environment variable. Managed with Drizzle ORM and `drizzle-kit`.
- **Replit Environment**: Uses `REPLIT_DEV_DOMAIN`, `REPLIT_DOMAINS`, and `REPLIT_INTERNAL_APP_DOMAIN` for URL configuration and CORS.
- **Expo Services**: Standard Expo toolchain for building and running React Native apps.
- **No external auth service**: Authentication is not yet implemented but the user schema suggests password-based auth is planned.