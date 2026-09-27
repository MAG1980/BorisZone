# Hard Constraints

- Never modify files in `/legacy` without explicit approval.
- Never hardcode secrets. Use `import.meta.env.VITE_*`.
- Avoid `eval()` and `innerHTML`. Sanitize user input with DOMPurify.
- Keep files under 200 lines. Split into smaller modules if exceeded.