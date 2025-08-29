import { NseIndia } from './index.js'
import { mcpTools, handleMCPToolCall } from './mcp-tools.js'

// Initialize NSE India client
const nseClient = new NseIndia()

// MCP Protocol Implementation
class MCPServer {
  private serverInfo = {
    name: 'nse-india-mcp-server',
    version: '1.0.0',
  }

  constructor() {
    this.setupStdinHandling()
  }

  private setupStdinHandling() {
    process.stdin.setEncoding('utf8')
    let buffer = ''

    process.stdin.on('data', (chunk) => {
      buffer += chunk
      
      // Process complete JSON messages
      let newlineIndex
      while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
        const message = buffer.substring(0, newlineIndex).trim()
        buffer = buffer.substring(newlineIndex + 1)
        
        if (message) {
          this.handleMessage(message)
        }
      }
    })

    process.stdin.on('end', () => {
      process.exit(0)
    })
  }

  private async handleMessage(message: string) {
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

      this.sendResponse(response)
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
      this.sendResponse(response)
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

  private sendResponse(response: any) {
    process.stdout.write(JSON.stringify(response) + '\n')
  }
}

// Start the server
const server = new MCPServer()
console.error('NSE India MCP Server started')
