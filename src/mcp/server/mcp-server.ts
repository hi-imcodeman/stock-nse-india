import { NseIndia } from '../../index.js'
import { mcpTools, handleMCPToolCall } from '../mcp-tools.js'

// Initialize NSE India client
const nseClient = new NseIndia()

// MCP Protocol Implementation
export class MCPServer {
  private serverInfo = {
    name: 'nse-india-stdio',
    version: '1.2.2',
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
    let parsed: any
    try {
      parsed = JSON.parse(message)
      const { id, method, params } = parsed

      // Check if this is a notification (no id) or a request (with id)
      if (id === undefined) {
        // This is a notification - handle it but don't send response
        if (method === 'notifications/initialized') {
          // Just acknowledge the notification silently
          return
        }
        // For other notifications without id, ignore them
        return
      }

      // This is a request - validate required fields
      if (method === undefined) {
        const response = {
          jsonrpc: '2.0',
          id,
          error: {
            code: -32600,
            message: 'Invalid Request: missing method',
          },
        }
        this.sendResponse(response)
        return
      }

      let result: any
      let error: any = null

      try {
        switch (method) {
          case 'initialize':
            result = {
              protocolVersion: '2024-11-05',
              capabilities: {
                tools: {},
                prompts: {},
                resources: {},
              },
              serverInfo: this.serverInfo,
            }
            break

          case 'tools/list':
            result = { tools: mcpTools }
            break

          case 'tools/call':
            if (!params || !params.name) {
              error = {
                code: -32602,
                message: 'Invalid params: missing tool name',
              }
            } else {
              result = await this.handleToolCall(params)
            }
            break

          // Add missing MCP protocol methods
          case 'prompts/list':
            result = { prompts: [] }
            break

          case 'resources/list':
            result = { resources: [] }
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
      // Invalid JSON - only send error if we have an id
      if (parsed && parsed.id !== undefined) {
        const response = {
          jsonrpc: '2.0',
          id: parsed.id,
          error: {
            code: -32700,
            message: 'Parse error',
          },
        }
        this.sendResponse(response)
      }
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
    // Ensure response has all required fields
    const validResponse = {
      jsonrpc: '2.0',
      id: response.id,
      ...(response.error ? { error: response.error } : { result: response.result }),
    }
    
    process.stdout.write(JSON.stringify(validResponse) + '\n')
  }
}
