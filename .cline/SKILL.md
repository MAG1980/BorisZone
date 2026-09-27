---
name: react-component-generator
description: Generate a new React TypeScript component following project conventions. Use when creating a new UI component, page, or layout.
---

# React Component Generator

Generate a production-ready React TypeScript component.

## Steps
1. Determine component name (PascalCase) and folder location.
2. Create the component file with props interface, named export, and `className` support.
3. Create a co-located test file with React Testing Library.
4. If the component needs logic, extract it into a custom hook in `src/hooks/`.

## Template
```tsx
interface {{Name}}Props {
  children?: React.ReactNode;
  className?: string;
}

export function {{Name}}({ children, className }: {{Name}}Props) {
  return (
    <div className={cn("base-styles", className)}>
      {children}
    </div>
  );
}