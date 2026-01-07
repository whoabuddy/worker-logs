# worker-logs

Centralized logging service for Cloudflare Workers.

## Features

- **Sharded storage** - Each app gets isolated SQLite via Durable Objects
- **Dual access** - RPC binding for internal workers, REST API with API key for external
- **Health monitoring** - Periodic URL checks via DO alarms
- **Result types** - Ok/Err response format for clarity

## Quick Start

```bash
# Install dependencies
npm install

# Run locally
npm run dev

# Deploy
npm run deploy
```

## Usage

### REST API (External)

```bash
# Write logs
curl -X POST https://worker-logs.<your-domain>.workers.dev/logs \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"level": "INFO", "message": "Hello from external"}'

# Query logs
curl "https://worker-logs.<your-domain>.workers.dev/logs?level=ERROR&limit=10" \
  -H "X-API-Key: your-api-key"
```

### RPC Binding (Internal Workers)

```typescript
// In your worker's wrangler.jsonc:
// "services": [{ "binding": "LOGGER", "service": "worker-logs", "entrypoint": "LoggerService" }]

// Usage:
await env.LOGGER.log('my-app', 'INFO', 'User action', { userId: '123' })
```

## Documentation

See [docs/PLAN.md](docs/PLAN.md) for full implementation details.

## License

MIT
