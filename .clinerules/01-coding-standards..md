# Coding Standards

## TypeScript
- Strict mode always. No `any` — use `unknown` + type guards.
- Prefer `interface` for object shapes, `type` for unions and intersections.
- Use discriminated unions for state machines and async states.
- Explicit return types for public functions and exported hooks.

## React Components
- Functional components only. No class components.
- One component per file. Co-locate styles, tests, and stories.
- Use named exports, not default exports.
- Props interface first, then component.
- Prefer composition over inheritance. Use compound components for complex UI.
- Support `className` prop for customization; merge with `cn()` utility.

## Imports
- Absolute imports from `@/`.
- Group imports: React → third-party → internal → styles.