import { createServer, Socket, Server as NetServer } from 'net'
import { NseIndia } from './index.js'
import { mcpTools, handleMCPToolCall } from './mcp-tools.js'

// Initialize NSE India client
const nseClient = new NseIndia()

// MCP Protocol Implementation for TCP
class MCPServerTCP {
  private serverInfo = {
    name: 'nse-india-mcp-server',
    version: '1.0.0',
  }
  private server: NetServer
  private port: number
  private connections: Set<Socket> = new Set()

  constructor(port = 3001) {
    this.port = port
    this.server = createServer()
    this.setupServer()
  }

  private setupServer() {
    this.server.on('connection', (socket) => {
      this.handleConnection(socket)
    })

    this.server.on('error', (err) => {
      console.error('Server error:', err)
    })

    this.server.on('listening', () => {
      console.error(`NSE India MCP Server started on port ${this.port}`)
    })
  }

  private handleConnection(socket: Socket) {
    this.connections.add(socket)
    let buffer = ''

    console.error(`New connection from ${socket.remoteAddress}:${socket.remotePort}`)

    socket.on('data', (chunk) => {
      buffer += chunk.toString('utf8')
      
      // Process complete JSON messages
      let newlineIndex
      while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
        const message = buffer.substring(0, newlineIndex).trim()
        buffer = buffer.substring(newlineIndex + 1)
        
        if (message) {
          this.handleMessage(message, socket)
        }
      }
    })

    socket.on('end', () => {
      console.error(`Connection closed from ${socket.remoteAddress}:${socket.remotePort}`)
      this.connections.delete(socket)
    })

    socket.on('error', (err) => {
      console.error(`Socket error from ${socket.remoteAddress}:${socket.remotePort}:`, err)
      this.connections.delete(socket)
    })
  }

  private async handleMessage(message: string, socket: Socket) {
    try {
      const parsed = JSON.parse(message)
      const { id, method, params } = parsed

      let result: any
      let error: any = null

      try {
        switch (method) {
          case 'initialize':
            result = {
              protocolVersion: '2024-11-05',
              capabilities: {
                tools: {},
              },
              serverInfo: this.serverInfo,
            }
            break

          case 'tools/list':
            result = { tools: mcpTools }
            break

          case 'tools/call':
            result = await this.handleToolCall(params)
            break

          default:
            error = {
              code: -32601,
              message: `Method not found: ${method}`,
            }
        }
      } catch (err) {
        error = {
          code: -32603,
          message: err instanceof Error ? err.message : String(err),
        }
      }

      const response = {
        jsonrpc: '2.0',
        id,
        ...(error ? { error } : { result }),
      }

      this.sendResponse(response, socket)
    } catch (err) {
      // Invalid JSON
      const response = {
        jsonrpc: '2.0',
        id: null,
        error: {
          code: -32700,
          message: 'Parse error',
        },
      }
      this.sendResponse(response, socket)
    }
  }

  private async handleToolCall(params: any) {
    const { name, arguments: args } = params
    const result = await handleMCPToolCall(nseClient, name, args)

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    }
  }

  private sendResponse(response: any, socket: Socket) {
    try {
      socket.write(JSON.stringify(response) + '\n')
    } catch (err) {
      console.error('Error sending response:', err)
    }
  }

  public start() {
    this.server.listen(this.port)
  }

  public stop() {
    this.server.close()
    // Close all active connections
    this.connections.forEach(socket => {
      socket.destroy()
    })
    this.connections.clear()
  }

  public getPort() {
    return this.port
  }

  public getConnectionsCount() {
    return this.connections.size
  }
}

// Start the server
const port = parseInt(process.env.MCP_PORT || '3001')
const server = new MCPServerTCP(port)

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.error('\nShutting down MCP server...')
  server.stop()
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.error('\nShutting down MCP server...')
  server.stop()
  process.exit(0)
})

server.start()

