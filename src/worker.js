import { Router } from 'itty-router'

const router = Router()

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

// Handle CORS preflight requests
router.options('*', () => {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  })
})

// Health check endpoint
router.get('/api/health', () => {
  return Response.json(
    { 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      service: 'ShortVideoMaker API',
      version: '1.0.0'
    },
    { headers: corsHeaders }
  )
})

// Project save endpoint (for future features)
router.post('/api/projects', async (request, env) => {
  try {
    const data = await request.json()
    const projectId = crypto.randomUUID()
    
    // Store project data in KV (if needed in future)
    if (env.VIDEO_PROJECTS) {
      await env.VIDEO_PROJECTS.put(projectId, JSON.stringify({
        ...data,
        createdAt: new Date().toISOString(),
        id: projectId
      }))
    }

    return Response.json(
      { 
        success: true, 
        projectId,
        message: 'Project saved successfully' 
      },
      { headers: corsHeaders }
    )
  } catch (error) {
    return Response.json(
      { 
        success: false, 
        error: 'Failed to save project',
        message: error.message 
      },
      { 
        status: 500,
        headers: corsHeaders 
      }
    )
  }
})

// Project load endpoint (for future features)
router.get('/api/projects/:id', async (request, _env) => {
  try {
    const { id } = request.params
    
    if (!_env.VIDEO_PROJECTS) {
      return Response.json(
        { success: false, error: 'Storage not available' },
        { status: 503, headers: corsHeaders }
      )
    }

    const project = await _env.VIDEO_PROJECTS.get(id)
    
    if (!project) {
      return Response.json(
        { success: false, error: 'Project not found' },
        { status: 404, headers: corsHeaders }
      )
    }

    return Response.json(
      { 
        success: true, 
        project: JSON.parse(project) 
      },
      { headers: corsHeaders }
    )
  } catch (err) {
    return Response.json(
      { 
        success: false, 
        error: 'Failed to load project',
        message: err.message 
      },
      { 
        status: 500,
        headers: corsHeaders 
      }
    )
  }
})

// Analytics endpoint (for tracking usage)
router.post('/api/analytics', async (request, _env) => {
  try {
    const data = await request.json()
    
    // Simple analytics tracking
    console.log('Analytics event:', data)
    
    return Response.json(
      { success: true, message: 'Event tracked' },
      { headers: corsHeaders }
    )
  } catch {
    return Response.json(
      { success: false, error: 'Failed to track event' },
      { status: 500, headers: corsHeaders }
    )
  }
})

// Serve static assets (handled by Cloudflare Workers Assets)
router.get('*', async (request, _env) => {
  // This will be handled by the assets configuration in wrangler.toml
  // Cloudflare Workers will automatically serve files from the dist/ directory
  return _env.ASSETS.fetch(request)
})

// 404 handler
router.all('*', () => {
  return Response.json(
    { error: 'Not Found' },
    { 
      status: 404,
      headers: corsHeaders 
    }
  )
})

export default {
  async fetch(request, env, ctx) {
    try {
      return await router.handle(request, env, ctx)
    } catch (err) {
      console.error('Worker error:', err)
      return Response.json(
        { 
          error: 'Internal Server Error',
          message: err.message 
        },
        { 
          status: 500,
          headers: corsHeaders 
        }
      )
    }
  },
}