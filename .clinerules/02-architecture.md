# Architecture

## Folder Structure
- `src/components/` — reusable UI components (PascalCase folders)
- `src/hooks/` — custom hooks (`use{Name}.ts`)
- `src/services/` — API layer, all calls through `apiClient`
- `src/utils/` — pure utility functions
- `src/types/` — shared TypeScript types

## State Management
- Server state → TanStack Query.
- Client state → Zustand or `useState`.
- Form state → React Hook Form + Zod.
- URL state → `useSearchParams`.

## API Layer
- Never use `fetch` directly. Use the provided Axios instance.
- All API calls go through `services/api.ts`.
- Error handling: catch errors and display toast via `useToast`.