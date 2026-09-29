# Node.js / TypeScript Review Rules

## Async & Errors
- No floating promises — every promise is awaited, returned, or explicitly handled
- No `.catch(() => {})` or `try/catch` that swallows errors
- Reject with `Error` objects, never strings or bare values
- Async work outside a request uses a dedicated context, not the request context

## Module & Types
- Imports match the module system (ESM `import` vs CJS `require`) — no mixing
- No `any` leaks across public boundaries; narrow types at the edge
- Serialization fields have explicit types/validators at the API boundary
- No circular imports between modules

## Dependencies & Config
- New dependencies are justified, pinned, and reviewed (license + maintenance)
- No secrets in code, `.env` files, or committed config
- Config read from environment once at startup, not scattered through code

## Resource & Performance
- No sync fs/IO (`readFileSync`, `execSync`) on the request hot path
- Streams/buffers bounded — no unbounded `readFile` of user-controlled size
- HTTP/gRPC calls have explicit timeouts and a closed failure path
- DB queries are parameterized; no string-interpolated SQL

## Testing
- Tests do not depend on execution order, wall-clock time, or env state
- No `console.log` noise left in committed code — use the project logger
