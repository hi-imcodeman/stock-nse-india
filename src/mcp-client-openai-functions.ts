import OpenAI from 'openai'
import { NseIndia } from './index.js'
import { mcpTools, handleMCPToolCall } from './mcp-tools'

// Initialize NSE India client
const nseClient = new NseIndia()

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface MCPClientRequest {
  query: string
  model?: string
  temperature?: number
  max_tokens?: number
}

export interface MCPClientResponse {
  response: string
  tools_used: string[]
  data_sources: string[]
  timestamp: string
}

export class MCPClientOpenAIFunctions {
  private nseClient: NseIndia
  private openai: OpenAI
  private availableTools: any[]

  constructor() {
    this.nseClient = nseClient
    this.openai = openai
    this.availableTools = mcpTools
  }

  /**
   * Convert MCP tools to OpenAI function format
   */
  private convertToolsToOpenAIFunctions(): OpenAI.Chat.Completions.ChatCompletionCreateParams.Function[] {
    return this.availableTools.map(tool => ({
      name: tool.name,
      description: tool.description,
      parameters: tool.inputSchema
    }))
  }

  /**
   * Process a natural language query using ChatGPT with OpenAI function calling
   */
  async processQuery(request: MCPClientRequest): Promise<MCPClientResponse> {
    const { query, model = 'gpt-4o-mini', temperature = 0.7, max_tokens = 2000 } = request

    try {
      // Convert MCP tools to OpenAI functions
      const functions = this.convertToolsToOpenAIFunctions()

      // Create system prompt
      const systemPrompt = 
        'You are a helpful assistant that provides information about Indian stock market data from NSE India. ' +
        'You have access to various tools to fetch real-time market data, stock information, ' +
        'historical data, and more. ' +
        'When a user asks a question, use the appropriate tools to gather the necessary data ' +
        'and provide a comprehensive answer. ' +
        'Always format your responses in a clear, professional manner with proper markdown ' +
        'formatting when appropriate.'

      // Make the initial request with function calling
      const response = await this.openai.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: query
          }
        ],
        tools: functions.map(fn => ({ type: 'function', function: fn })),
        tool_choice: 'auto', // Let OpenAI decide which tools to call
        temperature,
        max_tokens
      })

      const message = response.choices[0]?.message

      if (!message) {
        throw new Error('No response from OpenAI')
      }

      // If no function calls were made, return the response directly
      if (!message.tool_calls || message.tool_calls.length === 0) {
        return {
          response: message.content || 'Unable to process query',
          tools_used: [],
          data_sources: ['NSE India API via MCP'],
          timestamp: new Date().toISOString()
        }
      }

      // Execute all function calls in parallel
      const functionCallPromises = message.tool_calls.map(async (toolCall) => {
        const functionResult = await this.executeFunctionCalls(toolCall)
        return {
          toolCall,
          result: functionResult
        }
      })

      const functionCallResults = await Promise.all(functionCallPromises)

      // Build messages for follow-up request
      const followUpMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: query
        },
        {
          role: 'assistant',
          content: null,
          tool_calls: message.tool_calls
        }
      ]

      // Add tool responses for each function call
      functionCallResults.forEach(({ toolCall, result }) => {
        followUpMessages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify(result)
        })
      })

      // Make a follow-up request with the function results
      const followUpResponse = await this.openai.chat.completions.create({
        model,
        messages: followUpMessages,
        temperature,
        max_tokens
      })

      const finalMessage = followUpResponse.choices[0]?.message

      return {
        response: finalMessage?.content || 'Unable to process query',
        tools_used: message.tool_calls.map(tc => tc.function.name),
        data_sources: ['NSE India API via MCP'],
        timestamp: new Date().toISOString()
      }

    } catch (error) {
      throw new Error(`MCP Client Error: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Execute function calls using the NSE India API
   */
  private async executeFunctionCalls(toolCall: OpenAI.Chat.Completions.ChatCompletionMessageToolCall): Promise<any> {
    const { function: { name, arguments: args } } = toolCall

    try {
      // Parse the arguments
      const parsedArgs = typeof args === 'string' ? JSON.parse(args) : args

      // Execute the function using our existing MCP tool handler
      const result = await handleMCPToolCall(this.nseClient, name, parsedArgs)
      
      return result
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : String(error)
      }
    }
  }

  /**
   * Process multiple function calls in parallel
   */
  async processQueryWithMultipleFunctions(request: MCPClientRequest): Promise<MCPClientResponse> {
    const { query, model = 'gpt-4o-mini', temperature = 0.7, max_tokens = 2000 } = request

    try {
      const functions = this.convertToolsToOpenAIFunctions()
      const systemPrompt = 
        'You are a helpful assistant that provides information about Indian stock market data from NSE India. ' +
        'You have access to various tools to fetch real-time market data, stock information, ' +
        'historical data, and more. ' +
        'When a user asks a question, you may need to call multiple functions to gather comprehensive data. ' +
        'Always format your responses in a clear, professional manner with proper markdown ' +
        'formatting when appropriate.'

      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: query
        }
      ]

      const toolsUsed: string[] = []
      const functionResults: Record<string, any> = {}

      // Keep calling functions until we get a final response
      const maxIterations = 5
      let iteration = 0

      while (iteration < maxIterations) {
        const response = await this.openai.chat.completions.create({
          model,
          messages,
          tools: functions.map(fn => ({ type: 'function', function: fn })),
          tool_choice: 'auto',
          temperature,
          max_tokens
        })

        const message = response.choices[0]?.message

        if (!message) {
          break
        }

        // If no function calls, we're done
        if (!message.tool_calls || message.tool_calls.length === 0) {
          messages.push({
            role: 'assistant',
            content: message.content
          })
          break
        }

        // Execute all function calls in parallel
        const functionCallPromises = message.tool_calls.map(async (toolCall) => {
          const functionResult = await this.executeFunctionCalls(toolCall)
          toolsUsed.push(toolCall.function.name)
          functionResults[toolCall.function.name] = functionResult
          return {
            toolCall,
            result: functionResult
          }
        })

        const functionCallResults = await Promise.all(functionCallPromises)

        // Add the function calls to the conversation
        messages.push({
          role: 'assistant',
          content: null,
          tool_calls: message.tool_calls
        })

        // Add tool responses for each function call
        functionCallResults.forEach(({ toolCall, result }) => {
          messages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify(result)
          })
        })

        iteration++
      }

      // Get the final response
      const finalResponse = await this.openai.chat.completions.create({
        model,
        messages,
        temperature,
        max_tokens
      })

      const finalMessage = finalResponse.choices[0]?.message

      return {
        response: finalMessage?.content || 'Unable to process query',
        tools_used: toolsUsed,
        data_sources: ['NSE India API via MCP'],
        timestamp: new Date().toISOString()
      }

    } catch (error) {
      throw new Error(`MCP Client Error: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Get available tools information
   */
  getAvailableTools(): any[] {
    return this.availableTools
  }

  /**
   * Get tools in OpenAI function format
   */
  getOpenAIFunctions(): OpenAI.Chat.Completions.ChatCompletionCreateParams.Function[] {
    return this.convertToolsToOpenAIFunctions()
  }

  /**
   * Test the MCP client with a simple query
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.processQuery({ query: 'What is the current market status?' })
      return true
    } catch (error) {
      console.error('MCP Client test failed:', error)
      return false
    }
  }

  /**
   * Test with multiple function calls
   */
  async testMultipleFunctions(): Promise<boolean> {
    try {
      await this.processQueryWithMultipleFunctions({ 
        query: 'Show me the market status and list some stock symbols' 
      })
      return true
    } catch (error) {
      console.error('MCP Client multiple functions test failed:', error)
      return false
    }
  }
}

// Export singleton instance
export const mcpClientOpenAIFunctions = new MCPClientOpenAIFunctions()
