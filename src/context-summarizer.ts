import OpenAI from 'openai'

export interface ContextSummary {
  summary: string
  keyPoints: string[]
  importantStocks: string[]
  importantIndices: string[]
  userPreferences: Record<string, any>
  timestamp: string
  originalMessageCount: number
}

export interface ContextWindowConfig {
  maxTokens: number
  reservedTokens: number // Tokens reserved for system prompt and response
  summarizationThreshold: number // When to start summarizing (as percentage of max tokens)
  minMessagesToSummarize: number // Minimum messages before summarization
  summaryCompressionRatio: number // How much to compress (0.1 = 10% of original)
}

export interface TokenCountResult {
  totalTokens: number
  messageTokens: number[]
  systemPromptTokens: number
  estimatedResponseTokens: number
}

export class ContextSummarizer {
  private openai: OpenAI
  private config: ContextWindowConfig

  constructor(openai: OpenAI, config: Partial<ContextWindowConfig> = {}) {
    this.openai = openai
    this.config = {
      maxTokens: 8000, // Default context window
      reservedTokens: 2000, // Reserve tokens for system prompt and response
      summarizationThreshold: 0.7, // Start summarizing at 70% of available tokens
      minMessagesToSummarize: 10, // Don't summarize until we have at least 10 messages
      summaryCompressionRatio: 0.3, // Compress to 30% of original size
      ...config
    }
  }

  /**
   * Estimate token count for a message (rough approximation)
   */
  private estimateTokenCount(text: string): number {
    // Rough estimation: 1 token ≈ 4 characters for English text
    // This is a simplified approach - in production, use tiktoken or similar
    return Math.ceil(text.length / 4)
  }

  /**
   * Count tokens for a conversation
   */
  countTokens(messages: any[], systemPrompt: string): TokenCountResult {
    const systemPromptTokens = this.estimateTokenCount(systemPrompt)
    const messageTokens = messages.map(msg => {
      if (msg.content) {
        return this.estimateTokenCount(msg.content)
      }
      return 0
    })
    
    const totalMessageTokens = messageTokens.reduce((sum, count) => sum + count, 0)
    const totalTokens = systemPromptTokens + totalMessageTokens + this.config.reservedTokens

    return {
      totalTokens,
      messageTokens,
      systemPromptTokens,
      estimatedResponseTokens: this.config.reservedTokens
    }
  }

  /**
   * Check if context needs summarization
   */
  needsSummarization(messages: any[], systemPrompt: string): boolean {
    const tokenCount = this.countTokens(messages, systemPrompt)
    const availableTokens = this.config.maxTokens - this.config.reservedTokens
    const threshold = availableTokens * this.config.summarizationThreshold

    return (
      messages.length >= this.config.minMessagesToSummarize &&
      tokenCount.totalTokens > threshold
    )
  }

  /**
   * Extract key information from messages for summarization
   */
  private extractKeyInformation(messages: any[]): {
    stocks: Set<string>
    indices: Set<string>
    queries: string[]
    tools: Set<string>
    preferences: Record<string, any>
  } {
    const stocks = new Set<string>()
    const indices = new Set<string>()
    const queries: string[] = []
    const tools = new Set<string>()
    const preferences: Record<string, any> = {}

    messages.forEach(msg => {
      if (msg.role === 'user' && msg.content) {
        queries.push(msg.content)
        
        // Extract stock symbols (simple regex)
        const stockMatches = msg.content.match(/\b[A-Z]{2,10}\b/g) || []
        stockMatches.forEach((symbol: string) => {
          if (!['THE', 'AND', 'OR', 'FOR', 'WITH', 'FROM', 'TO', 'IN', 'ON', 'AT', 'BY'].includes(symbol)) {
            stocks.add(symbol)
          }
        })

        // Extract indices
        const indexKeywords = ['nifty', 'banknifty', 'sensex', 'midcap', 'smallcap']
        indexKeywords.forEach(keyword => {
          if (msg.content.toLowerCase().includes(keyword)) {
            indices.add(keyword.toUpperCase())
          }
        })
      }

      if (msg.tools_used) {
        msg.tools_used.forEach((tool: string) => tools.add(tool))
      }

      if (msg.metadata?.preferences) {
        Object.assign(preferences, msg.metadata.preferences)
      }
    })

    return { stocks, indices, queries, tools, preferences }
  }

  /**
   * Create a context summary using AI
   */
  async createContextSummary(messages: any[]): Promise<ContextSummary> {
    const keyInfo = this.extractKeyInformation(messages)
    
    // Create a summary prompt
    const summaryPrompt = `Please create a concise summary of this conversation about Indian stock market data.
Focus on:

1. Key topics discussed
2. Important stock symbols mentioned
3. Important indices mentioned
4. User preferences and analysis style
5. Tools used
6. Main queries and their outcomes

Conversation to summarize:
${messages.map((msg, i) => `${i + 1}. [${msg.role}]: ${msg.content}`).join('\n')}

Please provide:
- A brief summary (2-3 sentences)
- Key points (bullet list)
- Important stocks mentioned
- Important indices mentioned
- User preferences detected
- Tools used

Format as JSON with these fields: summary, keyPoints, importantStocks, importantIndices, userPreferences, toolsUsed`

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that creates concise summaries of conversations. ' +
              'Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: summaryPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 500
      })

      const summaryText = response.choices[0]?.message?.content || '{}'
      const summaryData = JSON.parse(summaryText)

      return {
        summary: summaryData.summary || 'Conversation summary',
        keyPoints: summaryData.keyPoints || [],
        importantStocks: summaryData.importantStocks || Array.from(keyInfo.stocks),
        importantIndices: summaryData.importantIndices || Array.from(keyInfo.indices),
        userPreferences: summaryData.userPreferences || keyInfo.preferences,
        timestamp: new Date().toISOString(),
        originalMessageCount: messages.length
      }
    } catch (error) {
      // Fallback to simple extraction if AI summarization fails
      return {
        summary: `Conversation with ${messages.length} messages about Indian stock market data`,
        keyPoints: keyInfo.queries.slice(0, 5), // First 5 queries as key points
        importantStocks: Array.from(keyInfo.stocks),
        importantIndices: Array.from(keyInfo.indices),
        userPreferences: keyInfo.preferences,
        timestamp: new Date().toISOString(),
        originalMessageCount: messages.length
      }
    }
  }

  /**
   * Optimize context by selecting most relevant messages
   */
  async optimizeContext(messages: any[], systemPrompt: string, maxTokens: number): Promise<{
    selectedMessages: any[]
    summary?: ContextSummary
    wasSummarized: boolean
  }> {
    const tokenCount = this.countTokens(messages, systemPrompt)
    
    if (tokenCount.totalTokens <= maxTokens) {
      return {
        selectedMessages: messages,
        wasSummarized: false
      }
    }

    // If we need to reduce context, prioritize recent messages and important ones
    const availableTokens = maxTokens - this.config.reservedTokens
    const systemPromptTokens = tokenCount.systemPromptTokens
    const targetMessageTokens = availableTokens - systemPromptTokens

    // Sort messages by importance (recent + with tools + user queries)
    const scoredMessages = messages.map((msg, index) => {
      let score = 0
      
      // Recent messages get higher score
      score += (messages.length - index) * 10
      
      // Messages with tools get higher score
      if (msg.tools_used && msg.tools_used.length > 0) {
        score += 50
      }
      
      // User queries get higher score
      if (msg.role === 'user') {
        score += 30
      }
      
      // Assistant responses get medium score
      if (msg.role === 'assistant') {
        score += 20
      }

      return { message: msg, score, index }
    })

    // Sort by score (highest first)
    scoredMessages.sort((a, b) => b.score - a.score)

    // Select messages that fit within token limit
    const selectedMessages: any[] = []
    let currentTokens = 0

    for (const { message } of scoredMessages) {
      const messageTokens = this.estimateTokenCount(message.content || '')
      
      if (currentTokens + messageTokens <= targetMessageTokens) {
        selectedMessages.unshift(message) // Add to beginning to maintain order
        currentTokens += messageTokens
      } else {
        break
      }
    }

    // If we still have too many messages, create a summary
    if (selectedMessages.length < messages.length * 0.5) {
      return await this.createSummarizedContext(messages, systemPrompt, maxTokens)
    }

    return {
      selectedMessages,
      wasSummarized: false
    }
  }

  /**
   * Create summarized context when too much history
   */
  private async createSummarizedContext(
    messages: any[], 
    systemPrompt: string, 
    maxTokens: number
  ): Promise<{
    selectedMessages: any[]
    summary?: ContextSummary
    wasSummarized: boolean
  }> {
    // Keep the most recent messages and summarize the rest
    const recentMessages = messages.slice(-5) // Keep last 5 messages
    const olderMessages = messages.slice(0, -5)

    if (olderMessages.length === 0) {
      return {
        selectedMessages: recentMessages,
        wasSummarized: false
      }
    }

    // Create summary of older messages
    const summary = await this.createContextSummary(olderMessages)
    
    // Create a summary message
    const summaryMessage = {
      role: 'system' as const,
      content: `[CONTEXT SUMMARY] ${summary.summary}\n\nKey Points: ${summary.keyPoints.join(', ')}\n` +
        `Important Stocks: ${summary.importantStocks.join(', ')}\n` +
        `Important Indices: ${summary.importantIndices.join(', ')}\n` +
        `User Preferences: ${JSON.stringify(summary.userPreferences)}`,
      timestamp: summary.timestamp,
      metadata: {
        isSummary: true,
        originalMessageCount: summary.originalMessageCount,
        summaryData: summary
      }
    }

    return {
      selectedMessages: [summaryMessage, ...recentMessages],
      summary,
      wasSummarized: true
    }
  }

  /**
   * Get optimal context for a conversation
   */
  async getOptimalContext(
    messages: any[], 
    systemPrompt: string, 
    maxTokens?: number
  ): Promise<{
    messages: any[]
    summary?: ContextSummary
    wasSummarized: boolean
    tokenCount: TokenCountResult
  }> {
    const targetTokens = maxTokens || this.config.maxTokens
    const tokenCount = this.countTokens(messages, systemPrompt)

    // If we're within limits, return as is
    if (tokenCount.totalTokens <= targetTokens) {
      return {
        messages,
        wasSummarized: false,
        tokenCount
      }
    }

    // Optimize context
    const optimized = await this.optimizeContext(messages, systemPrompt, targetTokens)
    
    return {
      messages: optimized.selectedMessages,
      summary: optimized.summary,
      wasSummarized: optimized.wasSummarized,
      tokenCount: this.countTokens(optimized.selectedMessages, systemPrompt)
    }
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<ContextWindowConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  /**
   * Get current configuration
   */
  getConfig(): ContextWindowConfig {
    return { ...this.config }
  }
}
