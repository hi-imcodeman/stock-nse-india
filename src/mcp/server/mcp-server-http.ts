import express from 'express'
import cors from 'cors'
import { NseIndia } from '../../index.js'
import { mcpTools, handleMCPToolCall } from '../mcp-tools.js'

// Initialize NSE India client
const nseClient = new NseIndia()

// Create Express app
const app = express()
const port = parseInt(process.env.MCP_PORT || '3001')

// Middleware
app.use(cors())
app.use(express.json())

// Base MCP endpoint for initial connection
app.post('/mcp', (req, res) => {
  const { id, method, params } = req.body
  
  // Route to appropriate handler based on method
  switch (method) {
    case 'initialize':
      return handleInitialize(req, res)
    case 'tools/list':
      return handleToolsList(req, res)
    case 'tools/call':
      return handleToolsCall(req, res)
    case 'notifications/initialized':
      // Handle notification (no response needed)
      return res.status(200).json({ jsonrpc: '2.0', result: null })
    case 'prompts/list':
      return handlePromptsList(req, res)
    case 'resources/list':
      return handleResourcesList(req, res)
    default:
      res.status(400).json({
        jsonrpc: '2.0',
        id,
        error: {
          code: -32601,
          message: `Method not found: ${method}`
        }
      })
  }
})

// Handler functions for MCP methods
function handleInitialize(req: any, res: any) {
  const { id } = req.body
  
  const result = {
    protocolVersion: '2024-11-05',
    capabilities: {
      tools: {},
      prompts: {},
      resources: {},
    },
    serverInfo: {
      name: 'nse-india-stdio',
      version: '1.2.2',
    },
  }

  res.json({
    jsonrpc: '2.0',
    id,
    result,
  })
}

function handleToolsList(req: any, res: any) {
  const { id } = req.body
  
  res.json({
    jsonrpc: '2.0',
    id,
    result: { tools: mcpTools },
  })
}

async function handleToolsCall(req: any, res: any) {
  const { id, params } = req.body
  
  try {
    const { name, arguments: args } = params
    if (!name) {
      return res.json({
        jsonrpc: '2.0',
        id,
        error: {
          code: -32602,
          message: 'Invalid params: missing tool name'
        }
      })
    }
    
    const result = await handleMCPToolCall(nseClient, name, args)

    res.json({
      jsonrpc: '2.0',
      id,
      result: {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      },
    })
  } catch (error) {
    res.json({
      jsonrpc: '2.0',
      id,
      error: {
        code: -32603,
        message: error instanceof Error ? error.message : String(error),
      },
    })
  }
}

// Handler functions for prompts and resources
function handlePromptsList(req: any, res: any) {
  const { id } = req.body
  
  res.json({
    jsonrpc: '2.0',
    id,
    result: { prompts: [] },
  })
}

function handleResourcesList(req: any, res: any) {
  const { id } = req.body
  
  res.json({
    jsonrpc: '2.0',
    id,
    result: { resources: [] },
  })
}

// Convenience endpoints for direct API access
app.get('/api/tools', (req, res) => {
  res.json({ tools: mcpTools })
})

app.get('/api/market-status', async (req, res) => {
  try {
    const result = await nseClient.getMarketStatus()
    res.json(result)
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) })
  }
})

app.get('/api/equity/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params
    const result = await nseClient.getEquityDetails(symbol)
    res.json(result)
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) })
  }
})

app.get('/api/equity/:symbol/historical', async (req, res) => {
  try {
    const { symbol } = req.params
    const { start_date, end_date } = req.query
    
    if (!start_date || !end_date) {
      return res.status(400).json({ error: 'start_date and end_date are required' })
    }
    
    const range = { start: new Date(start_date as string), end: new Date(end_date as string) }
    const result = await nseClient.getEquityHistoricalData(symbol, range)
    res.json(result)
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) })
  }
})

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    server: 'nse-india-stdio',
    version: '1.2.2',
    timestamp: new Date().toISOString()
  })
})

// Root endpoint with server info
app.get('/', (req, res) => {
  res.json({
    name: 'NSE India MCP Server',
    version: '1.2.2',
    description: 'Model Context Protocol server for NSE India stock market data',
    endpoints: {
      mcp: {
        initialize: 'POST /mcp',
        tools_list: 'POST /mcp',
        tools_call: 'POST /mcp'
      },
      api: {
        tools: 'GET /api/tools',
        market_status: 'GET /api/market-status',
        equity_details: 'GET /api/equity/:symbol',
        equity_historical: 'GET /api/equity/:symbol/historical'
      },
      health: 'GET /health'
    },
    documentation: '/docs'
  })
})

// Start the server
app.listen(port, () => {
  console.error(`🚀 NSE India MCP Server (HTTP) started on port ${port}`)
  console.error(`📡 MCP Endpoints:`)
  console.error(`   POST http://localhost:${port}/mcp`)
  console.error(`🌐 API Endpoints:`)
  console.error(`   GET  http://localhost:${port}/api/tools`)
  console.error(`   GET  http://localhost:${port}/api/market-status`)
  console.error(`   GET  http://localhost:${port}/api/equity/:symbol`)
  console.error(`   GET  http://localhost:${port}/api/equity/:symbol/historical`)
  console.error(`💚 Health: http://localhost:${port}/health`)
})

