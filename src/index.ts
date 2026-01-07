import { Hono } from 'hono'
import { cors } from 'hono/cors'

// Types will be expanded in Phase 2
type Env = {
  APP_LOGS_DO: DurableObjectNamespace
  LOGS_KV: KVNamespace
}

const app = new Hono<{ Bindings: Env }>()

app.use('*', cors())

// Health check
app.get('/', (c) => {
  return c.json({
    ok: true,
    data: {
      service: 'worker-logs',
      version: '0.1.0',
      description: 'Centralized logging service for Cloudflare Workers'
    }
  })
})

// Placeholder routes - will be implemented in later phases
app.post('/logs', async (c) => {
  return c.json({ ok: false, error: { code: 'NOT_IMPLEMENTED', message: 'Coming soon' } }, 501)
})

app.get('/logs', async (c) => {
  return c.json({ ok: false, error: { code: 'NOT_IMPLEMENTED', message: 'Coming soon' } }, 501)
})

app.get('/health/:app_id', async (c) => {
  return c.json({ ok: false, error: { code: 'NOT_IMPLEMENTED', message: 'Coming soon' } }, 501)
})

app.get('/stats/:app_id', async (c) => {
  return c.json({ ok: false, error: { code: 'NOT_IMPLEMENTED', message: 'Coming soon' } }, 501)
})

// Export the Hono app as the default fetch handler
export default app

// Placeholder DO class - will be implemented in Phase 3
export class AppLogsDO {
  state: DurableObjectState
  env: Env

  constructor(state: DurableObjectState, env: Env) {
    this.state = state
    this.env = env
  }

  async fetch(request: Request): Promise<Response> {
    return new Response('AppLogsDO - Not yet implemented', { status: 501 })
  }
}
