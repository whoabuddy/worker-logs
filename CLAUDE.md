# worker-logs

Centralized logging service for Cloudflare Workers using SQLite-backed Durable Objects.

## Architecture

- **Hono.js** - HTTP routing framework
- **Durable Objects (DO)** - Per-app isolated SQLite storage for logs and stats
- **KV Namespace** - App registry (app_id -> metadata + hashed API key)
- **RPC Entrypoint** - `LogsRPC` for service bindings between workers

## Key Files

| Path | Purpose |
|------|---------|
| `src/index.ts` | HTTP API routes, main worker entry |
| `src/rpc.ts` | `LogsRPC` WorkerEntrypoint for service bindings |
| `src/durable-objects/app-logs-do.ts` | Durable Object with SQLite for logs + stats |
| `src/services/registry.ts` | App registration, API key management |
| `src/middleware/auth.ts` | API key + admin key authentication |
| `src/utils/result.ts` | Ok/Err result type utilities |

## Testing

```bash
npm test           # Run vitest with Cloudflare pool
npm run test:watch # Watch mode
```

Tests use `@cloudflare/vitest-pool-workers` with `isolatedStorage: false` (required for SQLite DOs).

## Authentication

- **Admin Key** (`X-Admin-Key` header): Required for `POST /apps` (app registration)
- **API Key** (`X-Api-Key` + `X-App-ID` headers): Required for `/logs` endpoints
- **No Auth**: `GET /apps`, `GET /stats/:id`, `GET /health/:id`

## Development Commands

```bash
npm run dev        # Local dev server
npm run build      # Type check
npm run deploy     # Deploy to Cloudflare (prefer CI/CD)
```

## Secrets

Set via `wrangler secret put`:
- `ADMIN_API_KEY` - Admin authentication for app registration

## Data Model

### logs table (per-DO SQLite)
```sql
id TEXT PRIMARY KEY,
level TEXT,      -- DEBUG | INFO | WARN | ERROR
message TEXT,
context TEXT,    -- JSON
request_id TEXT,
timestamp TEXT
```

### daily_stats table (per-DO SQLite)
```sql
date TEXT PRIMARY KEY,  -- YYYY-MM-DD
debug INTEGER DEFAULT 0,
info INTEGER DEFAULT 0,
warn INTEGER DEFAULT 0,
error INTEGER DEFAULT 0
```

### KV Registry
- Key: `app:{app_id}` -> `{ name, api_key_hash, created_at, updated_at }`
- Key: `apps:index` -> `string[]` (list of app IDs)
