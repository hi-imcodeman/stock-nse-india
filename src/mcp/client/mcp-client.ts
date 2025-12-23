import OpenAI from 'openai'
import { NseIndia } from '../../index.js'
import { mcpTools, handleMCPToolCall } from '../mcp-tools.js'
import { MemoryManager, ConversationMessage, MemoryConfig } from '../memory-manager.js'

export interface MCPClientRequest {
  query: string
  sessionId?: string
  userId?: string
  model?: string
  temperature?: number
  max_tokens?: number
  includeContext?: boolean
  updatePreferences?: boolean
  useMemory?: boolean
  maxIterations?: number
  enableDebugLogging?: boolean
}

export interface MCPClientResponse {
  response: string
  tools_used: string[]
  data_sources: string[]
  timestamp: string
  sessionId?: string
  context_used?: boolean
  user_preferences_updated?: boolean
  conversation_length?: number
  context_summarized?: boolean
  context_summary?: any
  token_count?: any
  iterations_used?: number
  iteration_details?: {
    iteration: number
    tools_called: string[]
    purpose: string
    tool_parameters?: {
      tool_name: string
      parameters: any
    }[]
  }[]
}

export interface MCPClientConfig {
  memoryConfig?: Partial<MemoryConfig>
  openaiApiKey?: string
  enableMemory?: boolean
  enableContextSummarization?: boolean
  enableDebugLogging?: boolean
}

/**
 * Unified MCP Client with OpenAI Function Calling, Memory, and Context Summarization
 * 
 * This is the single, unified MCP client that combines all features:
 * - OpenAI function calling for natural language queries
 * - Memory management for context awareness
 * - Context summarization for handling long conversations
 * - Session management for multi-user support
 */
export class MCPClient {
  private nseClient: NseIndia
  private openai: OpenAI
  private availableTools: any[]
  private memoryManager?: MemoryManager
  private config: MCPClientConfig
  private currentQuery?: string  // Track current query for smarter iteration decisions
  private allToolsUsed: string[] = []  // Track all tools used across iterations

  constructor(config: MCPClientConfig = {}) {
    this.config = {
      enableMemory: true,
      enableContextSummarization: true,
      enableDebugLogging: false,
      ...config
    }

    // Initialize NSE India client
    this.nseClient = new NseIndia()
    
    // Initialize OpenAI client
    this.openai = new OpenAI({
      apiKey: config.openaiApiKey || process.env.OPENAI_API_KEY,
    })
    
    // Initialize available tools
    this.availableTools = mcpTools
    
    // Initialize memory manager if enabled
    if (this.config.enableMemory) {
      this.memoryManager = new MemoryManager(config.memoryConfig)
    }
  }

  /**
   * Debug logging method
   */
  private debugLog(message: string, data?: any): void {
    if (this.config.enableDebugLogging) {
      // eslint-disable-next-line no-console
      console.log(`[MCP DEBUG] ${message}`)
      if (data) {
        // eslint-disable-next-line no-console
        console.log(`[MCP DEBUG] Data:`, JSON.stringify(data, null, 2))
      }
    }
  }

  /**
   * Enable or disable debug logging on this client instance
   */
  setDebugLogging(enabled: boolean): void {
    this.config.enableDebugLogging = enabled
  }

  /**
   * Get current debug logging status
   */
  isDebugLoggingEnabled(): boolean {
    return this.config.enableDebugLogging === true
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
   * Extract stock symbols from query for context tracking
   */
  private extractStockSymbols(query: string): string[] {
    const symbolRegex = /\b[A-Z]{2,10}\b/g
    const matches = query.match(symbolRegex) || []
    const commonWords = ['THE', 'AND', 'OR', 'FOR', 'WITH', 'FROM', 'TO', 'IN', 'ON', 'AT', 'BY']
    return matches.filter(symbol => !commonWords.includes(symbol))
  }

  /**
   * Get base system prompt without context
   */
  private getBaseSystemPrompt(): string {
    return 'You are a helpful assistant that provides information about Indian stock market data from NSE India. ' +
      'You have access to various tools to fetch real-time market data, stock information, ' +
      'historical data, and more. ' +
      'When a user asks a question, use the appropriate tools to gather the necessary data ' +
      'and provide a comprehensive answer. ' +
      'Always format your responses in a clear, professional manner with proper markdown ' +
      'formatting when appropriate.'
  }

  /**
   * Process a natural language query with multi-iteration support (default: 5 iterations)
   */
  async processQuery(request: MCPClientRequest): Promise<MCPClientResponse> {
    const { 
      query, 
      sessionId, 
      userId, 
      model = 'gpt-4o-mini', 
      temperature = 0.7, 
      max_tokens = 2000,
      includeContext = true,
      updatePreferences = true,
      useMemory = true,
      maxIterations = 5
    } = request

    try {
      // Initialize query tracking for smart iteration decisions
      this.currentQuery = query
      this.allToolsUsed = []
      
      // Determine if we should use memory features
      const shouldUseMemory = !!(useMemory && this.config.enableMemory && this.memoryManager && sessionId)

      let session: any = null
      let conversationContext: any = { messages: [], wasSummarized: false, tokenCount: { totalTokens: 0 } }

      // Initialize session and memory if enabled
      if (shouldUseMemory) {
        session = this.memoryManager!.getOrCreateSession(sessionId!, userId)
        
        // Add user message to conversation history
        const userMessage: ConversationMessage = {
          role: 'user',
          content: query,
          timestamp: new Date().toISOString()
        }
        this.memoryManager!.addMessage(sessionId!, userMessage)

        // Extract stock symbols for context tracking
        const stockSymbols = this.extractStockSymbols(query)
        stockSymbols.forEach(symbol => {
          this.memoryManager!.updateStockAccess(sessionId!, symbol)
        })

        // Get conversation history with context summarization
        if (includeContext) {
          conversationContext = await this.memoryManager!.getConversationContext(sessionId!)
        }
      }

      // Get system prompt (contextual if memory is enabled)
      const systemPrompt = shouldUseMemory && includeContext
        ? this.memoryManager!.getContextualSystemPrompt(sessionId!)
        : this.getBaseSystemPrompt()

      // Initialize iteration tracking
          let currentIteration = 0
          const uniqueToolsUsed = new Set<string>()  // Use Set for true uniqueness
          const iterationDetails: { 
            iteration: number; 
            tools_called: string[]; 
            purpose: string;
            tool_parameters?: {
              tool_name: string;
              parameters: any;
            }[]
          }[] = []
      
      // Build initial messages array
      const allMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        {
          role: 'system',
          content: systemPrompt
        }
      ]

      // Add conversation history if memory is enabled
      if (shouldUseMemory && includeContext) {
        conversationContext.messages.forEach((msg: ConversationMessage) => {
          if (msg.role === 'assistant' && msg.content) {
            allMessages.push({
              role: 'assistant',
              content: msg.content
            })
          } else if (msg.role === 'user' && msg.content !== query) {
            allMessages.push({
              role: 'user',
              content: msg.content
            })
          } else if (msg.role === 'system' && msg.content) {
            allMessages.push({
              role: 'system',
              content: msg.content
            })
          }
        })
      }

      // Add current user query
      allMessages.push({
        role: 'user',
        content: query
      })

      // Convert MCP tools to OpenAI functions
      const functions = this.convertToolsToOpenAIFunctions()

      // Main iteration loop
      while (currentIteration < maxIterations) {
        currentIteration++
        this.debugLog(`Iteration ${currentIteration}/${maxIterations}`)
        this.debugLog('Sending messages to OpenAI:', allMessages)

        const response = await this.openai.chat.completions.create({
          model,
          messages: allMessages,
          tools: functions.map(fn => ({ type: 'function', function: fn })),
          tool_choice: 'auto',
          temperature,
          max_tokens
        })

        this.debugLog('OpenAI Response:', {
          model: response.model,
          usage: response.usage,
          message: response.choices[0]?.message
        })

        const message = response.choices[0]?.message
        if (!message) {
          throw new Error(`No response from OpenAI in iteration ${currentIteration}`)
        }

        // Add assistant message to conversation
        allMessages.push({
          role: 'assistant',
          content: message.content,
          tool_calls: message.tool_calls
        })

        // Check if tools were called
        if (message.tool_calls && message.tool_calls.length > 0) {
          const iterationTools = message.tool_calls.map(tc => tc.function.name)
          this.debugLog(
            `Iteration ${currentIteration}: Calling ${iterationTools.length} tools: ${iterationTools.join(', ')}`
          )
          
          // Log tool parameters for debugging
          message.tool_calls.forEach((toolCall, index) => {
            this.debugLog(`Tool ${index + 1}: ${toolCall.function.name}`)
            try {
              const params = JSON.parse(toolCall.function.arguments)
              this.debugLog(`Parameters:`, params)
            } catch (e) {
              this.debugLog(`Invalid JSON parameters: ${toolCall.function.arguments}`)
            }
          })
          
          // Execute all function calls in parallel
          const functionCallPromises = message.tool_calls.map(async (toolCall) => {
            this.debugLog(`Executing tool: ${toolCall.function.name}`)
            const functionResult = await this.executeFunctionCall(toolCall)
            this.debugLog(`Tool ${toolCall.function.name} result:`, functionResult)
            return {
              toolCall,
              result: functionResult
            }
          })

          const functionCallResults = await Promise.all(functionCallPromises)
          this.debugLog(`Completed ${functionCallResults.length} tool executions`)
          
          // Add unique tools to Set (automatically handles duplicates)
          iterationTools.forEach(tool => {
            uniqueToolsUsed.add(tool)
          })
          
          // Track all tools (including duplicates) for internal logic
          this.allToolsUsed.push(...iterationTools)

          // Capture tool parameters for iteration details
          const toolParameters = message.tool_calls.map(toolCall => ({
            tool_name: toolCall.function.name,
            parameters: (() => {
              try {
                return JSON.parse(toolCall.function.arguments)
              } catch (e) {
                return {
                  raw_arguments: toolCall.function.arguments,
                  parse_error: e instanceof Error ? e.message : String(e)
                }
              }
            })()
          }))

          // Add iteration details
          iterationDetails.push({
            iteration: currentIteration,
            tools_called: iterationTools,
            purpose: this.inferIterationPurpose(iterationTools, currentIteration),
            tool_parameters: toolParameters
          })

          // Add tool results to conversation
          functionCallResults.forEach(({ toolCall, result }) => {
            allMessages.push({
              role: 'tool',
              tool_call_id: toolCall.id,
              content: JSON.stringify(result)
            })
          })

          // Check if we should continue iterating
          if (this.shouldContinueIterating(message, currentIteration, maxIterations)) {
            // Add instruction for next iteration with specific guidance
            let nextInstruction = `You now have additional data from iteration ${currentIteration}. `
            
            // Provide specific guidance based on the original query and current context
            if (query.toLowerCase().includes('technical indicators') &&
              !this.allToolsUsed.includes('get_equity_technical_indicators')) {
              nextInstruction += `IMPORTANT: The user specifically asked about technical indicators ` +
                `for investment decisions. You MUST call get_equity_technical_indicators for several ` +
                `promising stocks from the data you received. Do not provide investment recommendations ` +
                `without actual technical analysis data.`
            } else if (query.toLowerCase().includes('invest') && currentIteration <= 2) {
              nextInstruction += `The user is asking for investment recommendations. You need to ` +
                `analyze the data more deeply by calling get_equity_technical_indicators or ` +
                `get_equity_details for specific stocks to make informed recommendations.`
            } else if (query.toLowerCase().includes('nifty') && query.toLowerCase().includes('invest')) {
              nextInstruction += `You have NIFTY stock data. Now you need to select promising ` +
                `stocks and get their technical indicators by calling get_equity_technical_indicators ` +
                `for informed investment recommendations.`
            } else {
              nextInstruction += `If you need more specific information to provide a comprehensive ` +
                `answer, call the appropriate tools. If you have sufficient data, provide your final analysis.`
            }
            
            allMessages.push({
              role: 'system',
              content: nextInstruction
            })
            continue
          } else {
            // Final synthesis iteration: always perform a final completion and return
            allMessages.push({
              role: 'system',
              content: 'Based on all the data gathered from previous tool calls, provide your ' +
                'comprehensive final analysis and recommendations.'
            })
            
            const finalResponse = await this.openai.chat.completions.create({
              model,
              messages: allMessages,
              temperature,
              max_tokens
            })
            
            const finalMessage = finalResponse.choices[0]?.message?.content || 'Unable to generate final response'
            
            // Add final response to conversation history if memory is enabled
            if (shouldUseMemory) {
              const assistantMessage: ConversationMessage = {
                role: 'assistant',
                content: finalMessage,
                timestamp: new Date().toISOString(),
                tools_used: Array.from(uniqueToolsUsed),
                metadata: {
                  model,
                  temperature,
                  max_tokens,
                  iterations_used: currentIteration + 1
                }
              }
              this.memoryManager!.addMessage(sessionId!, assistantMessage)
            }

            return this.buildFinalResponse(
              finalMessage,
              Array.from(uniqueToolsUsed),
              currentIteration + 1,
              iterationDetails,
              request,
              shouldUseMemory,
              session,
              conversationContext,
              updatePreferences || false
            )
          }
        } else {
          // No tools called, this is the final response
          // Iteration ${currentIteration}: No more tools needed, providing final response
          
          const finalResponse = message.content || 'Unable to process query'

          // Add final response to conversation history if memory is enabled
          if (shouldUseMemory) {
            const assistantMessage: ConversationMessage = {
              role: 'assistant',
              content: finalResponse,
              timestamp: new Date().toISOString(),
              tools_used: Array.from(uniqueToolsUsed),
              metadata: {
                model,
                temperature,
                max_tokens,
                iterations_used: currentIteration
              }
            }
            this.memoryManager!.addMessage(sessionId!, assistantMessage)
          }

          return this.buildFinalResponse(
            finalResponse,
            Array.from(uniqueToolsUsed),
            currentIteration,
            iterationDetails,
            request,
            shouldUseMemory,
            session,
            conversationContext,
            updatePreferences || false
          )
        }
      }
      
      throw new Error(`Query exceeded maximum iterations (${maxIterations}). ` +
        `Consider simplifying the query or increasing maxIterations.`)

    } catch (error) {
      throw new Error(`MCP Client Error: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Execute function calls using the NSE India API
   */
  private async executeFunctionCall(toolCall: OpenAI.Chat.Completions.ChatCompletionMessageToolCall): Promise<any> {
    const { function: { name, arguments: args } } = toolCall

    try {
      const parsedArgs = typeof args === 'string' ? JSON.parse(args) : args
      const result = await handleMCPToolCall(this.nseClient, name, parsedArgs)
      return result
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : String(error)
      }
    }
  }

  /**
   * Determine if iterations should continue based on AI response and context
   */
  private shouldContinueIterating(message: any, currentIteration: number, maxIterations: number): boolean {
    // Don't exceed max iterations (save one for final synthesis)
    if (currentIteration >= maxIterations - 1) return false
    
    // Always continue for specific complex query patterns that need multiple steps
    const originalQuery = this.currentQuery?.toLowerCase() || ''
    
    // AGGRESSIVE: For technical indicator investment queries, force continuation until we get technical data
    if (originalQuery.includes('technical indicators') && originalQuery.includes('invest')) {
      // Continue until we've called technical indicators tool OR reached iteration 4
      if (!this.allToolsUsed.includes('get_equity_technical_indicators') && currentIteration <= 3) {
        // Forcing continuation for technical indicators query (iteration ${currentIteration})
        return true
      }
    }
    
    // AGGRESSIVE: For NIFTY investment queries, ensure we go deeper than just index lookup
    if (originalQuery.includes('nifty') && originalQuery.includes('invest') && currentIteration <= 2) {
      // Forcing continuation for NIFTY investment query (iteration ${currentIteration})
      return true
    }
    
    // Check if assistant indicates more work is needed
    const content = message.content?.toLowerCase() || ''
    const needsMoreData = 
      content.includes('i need to') ||
      content.includes('let me analyze') ||
      content.includes('i should get') ||
      content.includes('need more information') ||
      content.includes('let me check') ||
      content.includes('i will analyze') ||
      content.includes('let me gather') ||
      content.includes('additional data needed')
    
    // For investment/analysis queries, be more aggressive about continuing
    const isInvestmentQuery = 
      content.includes('invest') ||
      content.includes('recommend') ||
      content.includes('technical') ||
      content.includes('analysis') ||
      content.includes('indicators')
    
    // If it's an investment query and we're early in iterations, continue
    if (isInvestmentQuery && currentIteration <= 2) {
      return true
    }
    
    return needsMoreData
  }

  /**
   * Infer the purpose of an iteration based on tools called
   */
  private inferIterationPurpose(tools: string[], iteration: number): string {
    if (tools.includes('get_equity_stock_indices')) {
      return 'Getting index composition data'
    } else if (tools.includes('get_equity_technical_indicators')) {
      return 'Analyzing technical indicators'
    } else if (tools.includes('get_equity_details') || tools.includes('get_equity_trade_info')) {
      return 'Gathering stock details and trade information'
    } else if (tools.includes('get_market_status')) {
      return 'Checking market status'
    } else if (tools.includes('get_all_stock_symbols')) {
      return 'Getting available stock symbols'
    } else {
      return `Data collection (iteration ${iteration})`
    }
  }

  /**
   * Build the final response with all tracking information
   */
  private buildFinalResponse(
    finalResponse: string,
    toolsUsed: string[],
    iterationsUsed: number,
    iterationDetails: { 
      iteration: number; 
      tools_called: string[]; 
      purpose: string;
      tool_parameters?: {
        tool_name: string;
        parameters: any;
      }[]
    }[],
    request: MCPClientRequest,
    shouldUseMemory: boolean,
    session: any,
    conversationContext: any,
    updatePreferences: boolean
  ): MCPClientResponse {
    // Update user preferences if requested and memory is enabled
    let preferencesUpdated = false
    if (shouldUseMemory && updatePreferences && request.sessionId) {
      preferencesUpdated = this.updateUserPreferencesFromQuery(request.sessionId, request.query!, toolsUsed)
    }

    // Build response
    const clientResponse: MCPClientResponse = {
      response: finalResponse,
      tools_used: toolsUsed,
      data_sources: ['NSE India API via MCP'],
      timestamp: new Date().toISOString(),
      iterations_used: iterationsUsed,
      iteration_details: iterationDetails
    }

    // Add memory-related fields if memory is enabled
    if (shouldUseMemory) {
      clientResponse.sessionId = request.sessionId
      clientResponse.context_used = request.includeContext
      clientResponse.user_preferences_updated = preferencesUpdated
      clientResponse.conversation_length = session?.conversationHistory?.length || 0
      clientResponse.context_summarized = conversationContext.wasSummarized
      clientResponse.context_summary = conversationContext.summary
      clientResponse.token_count = conversationContext.tokenCount
    }

    return clientResponse
  }

  /**
   * Update user preferences based on query patterns
   */
  private updateUserPreferencesFromQuery(sessionId: string, query: string, toolsUsed: string[]): boolean {
    if (!this.memoryManager) return false

    const session = this.memoryManager.getOrCreateSession(sessionId)
    let updated = false

    const queryLower = query.toLowerCase()

    // Detect analysis style preference
    if (queryLower.includes('brief') || queryLower.includes('summary')) {
      if (session.userPreferences.analysisStyle !== 'brief') {
        session.userPreferences.analysisStyle = 'brief'
        updated = true
      }
    } else if (queryLower.includes('detailed') || queryLower.includes('comprehensive')) {
      if (session.userPreferences.analysisStyle !== 'detailed') {
        session.userPreferences.analysisStyle = 'detailed'
        updated = true
      }
    } else if (queryLower.includes('technical') || queryLower.includes('indicators')) {
      if (session.userPreferences.analysisStyle !== 'technical') {
        session.userPreferences.analysisStyle = 'technical'
        updated = true
      }
    }

    // Detect preferred stocks from query
    const stockSymbols = this.extractStockSymbols(query)
    stockSymbols.forEach(symbol => {
      if (!session.userPreferences.preferredStocks.includes(symbol)) {
        session.userPreferences.preferredStocks.push(symbol)
        if (session.userPreferences.preferredStocks.length > 10) {
          session.userPreferences.preferredStocks = session.userPreferences.preferredStocks.slice(-10)
        }
        updated = true
      }
    })

    // Detect preferred indices
    const indexKeywords = ['nifty', 'banknifty', 'sensex', 'midcap', 'smallcap']
    indexKeywords.forEach(keyword => {
      if (queryLower.includes(keyword)) {
        const indexName = keyword.toUpperCase()
        if (!session.userPreferences.preferredIndices.includes(indexName)) {
          session.userPreferences.preferredIndices.push(indexName)
          updated = true
        }
      }
    })

    if (updated) {
      this.memoryManager.updatePreferences(sessionId, session.userPreferences)
    }

    return updated
  }

  // ============================================================================
  // Memory Management Methods (only available if memory is enabled)
  // ============================================================================

  /**
   * Get session information
   */
  getSessionInfo(sessionId: string): any {
    if (!this.memoryManager) {
      throw new Error('Memory is not enabled for this MCP client')
    }
    return this.memoryManager.getSessionStats(sessionId)
  }

  /**
   * Update user preferences manually
   */
  updateUserPreferences(sessionId: string, preferences: Record<string, unknown>): void {
    if (!this.memoryManager) {
      throw new Error('Memory is not enabled for this MCP client')
    }
    this.memoryManager.updatePreferences(sessionId, preferences)
  }

  /**
   * Get conversation history
   */
  getConversationHistory(sessionId: string, maxMessages?: number): ConversationMessage[] {
    if (!this.memoryManager) {
      throw new Error('Memory is not enabled for this MCP client')
    }
    return this.memoryManager.getConversationContextSync(sessionId, maxMessages)
  }

  /**
   * Get conversation history with context summarization
   */
  async getConversationHistoryWithSummarization(
    sessionId: string,
    maxMessages?: number,
    systemPrompt?: string
  ): Promise<{
    messages: ConversationMessage[]
    summary?: any
    wasSummarized: boolean
    tokenCount: any
  }> {
    if (!this.memoryManager) {
      throw new Error('Memory is not enabled for this MCP client')
    }
    return this.memoryManager.getConversationContext(sessionId, maxMessages, systemPrompt)
  }

  /**
   * Clear session data
   */
  clearSession(sessionId: string): void {
    if (!this.memoryManager) {
      throw new Error('Memory is not enabled for this MCP client')
    }
    this.memoryManager.clearSession(sessionId)
  }

  /**
   * Export session data
   */
  exportSessionData(sessionId: string): any {
    if (!this.memoryManager) {
      throw new Error('Memory is not enabled for this MCP client')
    }
    return this.memoryManager.exportSessionData(sessionId)
  }

  /**
   * Check if context needs summarization
   */
  async needsContextSummarization(sessionId: string, systemPrompt?: string): Promise<boolean> {
    if (!this.memoryManager) {
      throw new Error('Memory is not enabled for this MCP client')
    }
    return this.memoryManager.needsContextSummarization(sessionId, systemPrompt)
  }

  /**
   * Get context statistics
   */
  async getContextStats(sessionId: string, systemPrompt?: string): Promise<{
    messageCount: number
    tokenCount: any
    needsSummarization: boolean
    contextWindowUsage: number
  }> {
    if (!this.memoryManager) {
      throw new Error('Memory is not enabled for this MCP client')
    }
    return this.memoryManager.getContextStats(sessionId, systemPrompt)
  }

  /**
   * Force context summarization
   */
  async forceContextSummarization(sessionId: string, systemPrompt?: string): Promise<any> {
    if (!this.memoryManager) {
      throw new Error('Memory is not enabled for this MCP client')
    }
    return this.memoryManager.forceContextSummarization(sessionId, systemPrompt)
  }

  /**
   * Update context window configuration
   */
  updateContextWindowConfig(config: Record<string, unknown>): void {
    if (!this.memoryManager) {
      throw new Error('Memory is not enabled for this MCP client')
    }
    this.memoryManager.updateContextWindowConfig(config)
  }

  /**
   * Get context window configuration
   */
  getContextWindowConfig(): any {
    if (!this.memoryManager) {
      throw new Error('Memory is not enabled for this MCP client')
    }
    return this.memoryManager.getContextWindowConfig()
  }

  /**
   * Cleanup expired sessions
   */
  cleanupExpiredSessions(): void {
    if (!this.memoryManager) {
      throw new Error('Memory is not enabled for this MCP client')
    }
    this.memoryManager.cleanupExpiredSessions()
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

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
   * Test the MCP client connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.processQuery({ 
        query: 'What is the current market status?',
        useMemory: false
      })
      return true
    } catch (error) {
      console.error('MCP Client test failed:', error)
      return false
    }
  }

  /**
   * Test the MCP client with memory
   */
  async testConnectionWithMemory(sessionId: string): Promise<boolean> {
    if (!this.memoryManager) {
      throw new Error('Memory is not enabled for this MCP client')
    }
    
    try {
      await this.processQuery({ 
        query: 'What is the current market status?', 
        sessionId,
        useMemory: true,
        includeContext: false
      })
      return true
    } catch (error) {
      console.error('MCP Client with Memory test failed:', error)
      return false
    }
  }

  /**
   * Get client configuration
   */
  getConfig(): MCPClientConfig {
    return { ...this.config }
  }

  /**
   * Check if memory is enabled
   */
  isMemoryEnabled(): boolean {
    return this.config.enableMemory === true && this.memoryManager !== undefined
  }

  /**
   * Check if context summarization is enabled
   */
  isContextSummarizationEnabled(): boolean {
    return this.config.enableContextSummarization === true && this.memoryManager !== undefined
  }

  /**
   * Get last summarization for a session
   */
  getLastSummarization(sessionId: string): any {
    if (!this.memoryManager) return null
    return this.memoryManager.getLastSummarization(sessionId)
  }

  /**
   * Get summarization history for a session
   */
  getSummarizationHistory(sessionId: string, limit?: number): any[] {
    if (!this.memoryManager) return []
    return this.memoryManager.getSummarizationHistory(sessionId, limit)
  }

  /**
   * Get summarization summary for a session
   */
  getSummarizationSummary(sessionId: string): any {
    if (!this.memoryManager) return null
    return this.memoryManager.getSummarizationSummary(sessionId)
  }

  /**
   * Get OpenAI messages for a session (including system message)
   */
  getOpenAIMessages(sessionId: string): any {
    if (!this.memoryManager) return null
    
    const session = this.memoryManager.getOrCreateSession(sessionId)
    const systemPrompt = this.memoryManager.getContextualSystemPrompt(sessionId)
    
    return {
      systemPrompt,
      conversationHistory: session.conversationHistory
    }
  }
}

// Export singleton instance with default configuration
export const mcpClient = new MCPClient({
  enableMemory: true,
  enableContextSummarization: true
})

// Export factory function for custom configurations
export function createMCPClient(config: MCPClientConfig): MCPClient {
  return new MCPClient(config)
}
