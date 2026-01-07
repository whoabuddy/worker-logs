# worker-logs

Centralized logging service for Cloudflare Workers.

## Features

- **Sharded storage** - Each app gets isolated SQLite via Durable Objects
- **Dual access** - RPC binding for internal workers, REST API with API key for external
- **Health monitoring** - Periodic URL checks via DO alarms
- **Result types** - Ok/Err response format for clarity

## Setup

### 1. Cloudflare API Token

Create a token at https://dash.cloudflare.com/profile/api-tokens using the "Edit Cloudflare Workers" template, then add:
- **Workers KV Storage: Edit**
- **Account Settings: Read**

### 2. Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
# Edit .env with your CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID
```

### 3. Install & Run

```bash
npm install
npm run dev      # Local development
npm run deploy   # Deploy to Cloudflare
```

### 4. Create KV Namespace (after first deploy)

```bash
npm run wrangler -- kv namespace create LOGS_KV
# Add the returned ID to wrangler.jsonc
```

### 5. Set Admin API Key

App registration requires an admin key. Set it as a secret:

```bash
npm run wrangler -- secret put ADMIN_API_KEY
# Enter a secure random key (e.g., openssl rand -hex 24)
```

## Usage

### REST API (External)

```bash
# Write logs
curl -X POST https://worker-logs.<your-domain>.workers.dev/logs \
  -H "X-App-ID: my-app" \
  -H "X-Api-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"level": "INFO", "message": "Hello from external"}'

# Query logs
curl "https://worker-logs.<your-domain>.workers.dev/logs?level=ERROR&limit=10" \
  -H "X-App-ID: my-app" \
  -H "X-Api-Key: your-api-key"
```

### RPC Binding (Internal Workers)

```typescript
// In your worker's wrangler.jsonc:
// "services": [{ "binding": "LOGS", "service": "worker-logs", "entrypoint": "LogsRPC" }]

// Usage:
await env.LOGS.info('my-app', 'User action', { userId: '123' })
```

## Testing

```bash
npm test        # Run all tests
npm run test:watch  # Watch mode
```

## Documentation

- [Integration Guide](docs/integration.md) - How to integrate worker-logs into your workers
- [Implementation Plan](docs/PLAN.md) - Architecture and design details

## License

MIT
