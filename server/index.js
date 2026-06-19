import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { Hono } from 'hono'
import { clerkMiddleware, getAuth } from '@hono/clerk-auth'
import {
  listTrackers,
  addTracker,
  removeTracker,
  listRequests,
  createRequest,
  updateRequest,
} from './db.js'

const app = new Hono()

// All /api routes require an authenticated Clerk user. clerkMiddleware runs on
// this same sub-app so getAuth() reads the context it populated.
const api = new Hono()
api.use('*', clerkMiddleware())
api.use('*', async (c, next) => {
  const auth = getAuth(c)
  if (!auth?.userId) return c.json({ error: 'Unauthorized' }, 401)
  c.set('userId', auth.userId)
  await next()
})

api.get('/trackers', c => c.json(listTrackers(c.get('userId'))))

api.post('/trackers', async c => {
  const { name } = await c.req.json()
  if (!name?.trim()) return c.json({ error: 'name required' }, 400)
  return c.json(addTracker(c.get('userId'), name.trim()))
})

api.delete('/trackers/:name', c =>
  c.json(removeTracker(c.get('userId'), c.req.param('name')))
)

api.get('/requests', c => {
  const tracker = c.req.query('tracker')
  const filter = c.req.query('filter') || 'open'
  if (!tracker) return c.json({ error: 'tracker required' }, 400)
  return c.json(listRequests(c.get('userId'), tracker, filter))
})

api.post('/requests', async c => {
  const body = await c.req.json()
  if (!body.description?.trim()) return c.json({ error: 'description required' }, 400)
  if (!body.tracker?.trim()) return c.json({ error: 'tracker required' }, 400)
  return c.json(
    createRequest(c.get('userId'), {
      description: body.description.trim(),
      person: (body.person || '').trim(),
      tracker: body.tracker.trim(),
      dueDate: body.dueDate || null,
    })
  )
})

api.patch('/requests/:id', async c => {
  const id = Number(c.req.param('id'))
  const updates = await c.req.json()
  const item = updateRequest(c.get('userId'), id, updates)
  if (!item) return c.json({ error: 'not found' }, 404)
  return c.json(item)
})

app.route('/api', api)

// Unauthenticated health check for the platform/load balancer.
app.get('/healthz', c => c.text('ok'))

// Serve the built frontend (production). Dev uses Vite's own server + /api proxy.
app.use('/assets/*', serveStatic({ root: './dist' }))
app.get('*', serveStatic({ path: './dist/index.html' }))

const port = Number(process.env.PORT) || 8787
const hostname = process.env.HOST || '0.0.0.0'
serve({ fetch: app.fetch, port, hostname }, info => {
  console.log(`thing-tracker server listening on http://${hostname}:${info.port}`)
})
