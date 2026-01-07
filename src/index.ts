import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { Ok, Err, ErrorCode, getErrorStatus } from './result'
import type { Env, LogInput, LogBatchInput } from './types'

// Re-export AppLogsDO for wrangler to find
export { AppLogsDO } from './durable-objects/app-logs-do'

const app = new Hono<{ Bindings: Env }>()

app.use('*', cors())

/**
 * Get a DO stub for the given app_id
 */
function getAppDO(env: Env, appId: string) {
  const id = env.APP_LOGS_DO.idFromName(appId)
  return env.APP_LOGS_DO.get(id)
}

// Service info
app.get('/', (c) => {
  return c.json(
    Ok({
      service: 'worker-logs',
      version: '0.2.0',
      description: 'Centralized logging service for Cloudflare Workers',
      endpoints: {
        'POST /logs': 'Write log entries (requires X-API-Key)',
        'GET /logs': 'Query log entries (requires X-API-Key)',
        'GET /health/:app_id': 'Get health check history',
        'GET /stats/:app_id': 'Get daily stats',
        'POST /apps/:app_id/prune': 'Delete old logs',
        'POST /apps/:app_id/health-urls': 'Set health check URLs',
      },
    })
  )
})

// POST /logs - Write log(s)
app.post('/logs', async (c) => {
  const appId = c.req.header('X-App-ID')
  if (!appId) {
    return c.json(Err({ code: ErrorCode.BAD_REQUEST, message: 'X-App-ID header required' }), 400)
  }

  const body = await c.req.json<LogInput | LogBatchInput>()
  const stub = getAppDO(c.env, appId)

  // Check if batch or single
  if ('logs' in body) {
    const res = await stub.fetch(new Request('http://do/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }))
    return c.json(await res.json())
  } else {
    const res = await stub.fetch(new Request('http://do/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }))
    return c.json(await res.json())
  }
})

// GET /logs - Query logs
app.get('/logs', async (c) => {
  const appId = c.req.header('X-App-ID')
  if (!appId) {
    return c.json(Err({ code: ErrorCode.BAD_REQUEST, message: 'X-App-ID header required' }), 400)
  }

  const stub = getAppDO(c.env, appId)
  const url = new URL(c.req.url)

  const res = await stub.fetch(new Request(`http://do/logs${url.search}`, {
    method: 'GET',
  }))
  return c.json(await res.json())
})

// GET /health/:app_id - Get health check history
app.get('/health/:app_id', async (c) => {
  const appId = c.req.param('app_id')
  const stub = getAppDO(c.env, appId)
  const url = new URL(c.req.url)

  const res = await stub.fetch(new Request(`http://do/health${url.search}`, {
    method: 'GET',
  }))
  return c.json(await res.json())
})

// GET /stats/:app_id - Get daily stats (placeholder - Phase 4)
app.get('/stats/:app_id', async (c) => {
  return c.json(Err({ code: ErrorCode.NOT_IMPLEMENTED, message: 'Stats endpoint coming in Phase 4' }), 501)
})

// POST /apps/:app_id/prune - Delete old logs
app.post('/apps/:app_id/prune', async (c) => {
  const appId = c.req.param('app_id')
  const body = await c.req.json<{ before: string }>()

  if (!body.before) {
    return c.json(Err({ code: ErrorCode.BAD_REQUEST, message: '"before" timestamp required' }), 400)
  }

  const stub = getAppDO(c.env, appId)
  const res = await stub.fetch(new Request('http://do/prune', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }))
  return c.json(await res.json())
})

// POST /apps/:app_id/health-urls - Set health check URLs
app.post('/apps/:app_id/health-urls', async (c) => {
  const appId = c.req.param('app_id')
  const body = await c.req.json<{ urls: string[] }>()

  if (!body.urls || !Array.isArray(body.urls)) {
    return c.json(Err({ code: ErrorCode.BAD_REQUEST, message: '"urls" array required' }), 400)
  }

  const stub = getAppDO(c.env, appId)
  const res = await stub.fetch(new Request('http://do/health-urls', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }))
  return c.json(await res.json())
})

// Export the Hono app as the default fetch handler
export default app
