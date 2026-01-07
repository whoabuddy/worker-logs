import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { DurableObject } from 'cloudflare:workers'
import { Ok, Err, ErrorCode } from './result'
import type { Env } from './types'

const app = new Hono<{ Bindings: Env }>()

app.use('*', cors())

// Service info
app.get('/', (c) => {
  return c.json(
    Ok({
      service: 'worker-logs',
      version: '0.1.0',
      description: 'Centralized logging service for Cloudflare Workers',
    })
  )
})

// Placeholder routes - will be implemented in Phase 3+
app.post('/logs', async (c) => {
  return c.json(Err({ code: ErrorCode.NOT_IMPLEMENTED, message: 'Coming soon' }), 501)
})

app.get('/logs', async (c) => {
  return c.json(Err({ code: ErrorCode.NOT_IMPLEMENTED, message: 'Coming soon' }), 501)
})

app.get('/health/:app_id', async (c) => {
  return c.json(Err({ code: ErrorCode.NOT_IMPLEMENTED, message: 'Coming soon' }), 501)
})

app.get('/stats/:app_id', async (c) => {
  return c.json(Err({ code: ErrorCode.NOT_IMPLEMENTED, message: 'Coming soon' }), 501)
})

app.post('/apps/:app_id/prune', async (c) => {
  return c.json(Err({ code: ErrorCode.NOT_IMPLEMENTED, message: 'Coming soon' }), 501)
})

app.post('/apps/:app_id/health-urls', async (c) => {
  return c.json(Err({ code: ErrorCode.NOT_IMPLEMENTED, message: 'Coming soon' }), 501)
})

// Export the Hono app as the default fetch handler
export default app

// Durable Object with SQLite storage - will be fully implemented in Phase 3
export class AppLogsDO extends DurableObject<Env> {
  sql: SqlStorage

  constructor(ctx: DurableObjectState, env: Env) {
    // Required: call super() when extending DurableObject
    super(ctx, env)
    this.sql = ctx.storage.sql

    // Initialize schema on first load
    this.initSchema()
  }

  private initSchema() {
    // Create tables if they don't exist
    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS logs (
        id TEXT PRIMARY KEY,
        timestamp TEXT NOT NULL,
        level TEXT NOT NULL CHECK (level IN ('DEBUG', 'INFO', 'WARN', 'ERROR')),
        message TEXT NOT NULL,
        context TEXT,
        request_id TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs(timestamp DESC);
      CREATE INDEX IF NOT EXISTS idx_logs_level ON logs(level);

      CREATE TABLE IF NOT EXISTS health_checks (
        id TEXT PRIMARY KEY,
        url TEXT NOT NULL,
        status INTEGER,
        latency_ms INTEGER,
        checked_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_health_url ON health_checks(url, checked_at DESC);
    `)
  }

  // Alarm handler for health checks - will be implemented in Phase 3
  async alarm(alarmInfo?: { retryCount: number; isRetry: boolean }) {
    // TODO: Implement health check logic
    // Check if this is a retry
    if (alarmInfo?.isRetry) {
      console.log(`Alarm retry attempt ${alarmInfo.retryCount}`)
    }
  }

  async fetch(request: Request): Promise<Response> {
    return new Response('AppLogsDO - Not yet implemented', { status: 501 })
  }
}
