import fs from 'fs/promises'
import path from 'path'
import { ContextSummarizer, ContextSummary, ContextWindowConfig } from './context-summarizer'
import OpenAI from 'openai'

export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
  tools_used?: string[]
  metadata?: Record<string, any>
}

export interface UserSession {
  sessionId: string
  userId?: string
  startTime: string
  lastActivity: string
  conversationHistory: ConversationMessage[]
  userPreferences: UserPreferences
  contextData: ContextData
}

export interface UserPreferences {
  preferredStocks: string[]
  preferredIndices: string[]
  analysisStyle: 'detailed' | 'brief' | 'technical'
  language: string
  timezone: string
  notificationSettings: {
    priceAlerts: boolean
    marketUpdates: boolean
  }
}

export interface ContextData {
  recentQueries: string[]
  frequentlyAccessedStocks: Record<string, number>
  frequentlyUsedTools: Record<string, number>
  marketContext: {
    currentMarketStatus?: any
    lastMarketUpdate?: string
    activeIndices?: string[]
  }
  userGoals: string[]
  investmentProfile?: 'conservative' | 'moderate' | 'aggressive'
}

export interface MemoryConfig {
  maxConversationHistory: number
  maxRecentQueries: number
  sessionTimeoutMinutes: number
  persistToFile: boolean
  memoryFilePath: string
  contextWindowConfig: Partial<ContextWindowConfig>
}

export class MemoryManager {
  private sessions: Map<string, UserSession> = new Map()
  private config: MemoryConfig
  private memoryFilePath: string
  private contextSummarizer: ContextSummarizer

  constructor(config: Partial<MemoryConfig> = {}) {
    this.config = {
      maxConversationHistory: 50,
      maxRecentQueries: 20,
      sessionTimeoutMinutes: 30,
      persistToFile: true,
      memoryFilePath: './memory-data.json',
      contextWindowConfig: {
        maxTokens: 8000,
        reservedTokens: 2000,
        summarizationThreshold: 0.7,
        minMessagesToSummarize: 10,
        summaryCompressionRatio: 0.3
      },
      ...config
    }
    this.memoryFilePath = this.config.memoryFilePath
    
    // Initialize context summarizer
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
    this.contextSummarizer = new ContextSummarizer(openai, this.config.contextWindowConfig)
    
    this.loadMemoryFromFile()
  }

  /**
   * Create or get existing user session
   */
  getOrCreateSession(sessionId: string, userId?: string): UserSession {
    let session = this.sessions.get(sessionId)
    
    if (!session) {
      session = {
        sessionId,
        userId,
        startTime: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        conversationHistory: [],
        userPreferences: {
          preferredStocks: [],
          preferredIndices: [],
          analysisStyle: 'detailed',
          language: 'en',
          timezone: 'Asia/Kolkata',
          notificationSettings: {
            priceAlerts: false,
            marketUpdates: false
          }
        },
        contextData: {
          recentQueries: [],
          frequentlyAccessedStocks: {},
          frequentlyUsedTools: {},
          marketContext: {},
          userGoals: []
        }
      }
      this.sessions.set(sessionId, session)
    } else {
      // Update last activity
      session.lastActivity = new Date().toISOString()
    }

    return session
  }

  /**
   * Add message to conversation history
   */
  addMessage(sessionId: string, message: ConversationMessage): void {
    const session = this.getOrCreateSession(sessionId)
    
    // Add message to history
    session.conversationHistory.push(message)
    
    // Trim history if it exceeds max length
    if (session.conversationHistory.length > this.config.maxConversationHistory) {
      session.conversationHistory = session.conversationHistory.slice(-this.config.maxConversationHistory)
    }

    // Update context data
    if (message.role === 'user') {
      this.updateRecentQueries(sessionId, message.content)
    }
    
    if (message.tools_used) {
      this.updateToolUsage(sessionId, message.tools_used)
    }

    this.saveMemoryToFile()
  }

  /**
   * Update recent queries
   */
  private updateRecentQueries(sessionId: string, query: string): void {
    const session = this.sessions.get(sessionId)
    if (!session) return

    // Add to recent queries
    session.contextData.recentQueries.unshift(query)
    
    // Trim if exceeds max length
    if (session.contextData.recentQueries.length > this.config.maxRecentQueries) {
      session.contextData.recentQueries = session.contextData.recentQueries.slice(0, this.config.maxRecentQueries)
    }
  }

  /**
   * Update tool usage statistics
   */
  private updateToolUsage(sessionId: string, tools: string[]): void {
    const session = this.sessions.get(sessionId)
    if (!session) return

    tools.forEach(tool => {
      session.contextData.frequentlyUsedTools[tool] = (session.contextData.frequentlyUsedTools[tool] || 0) + 1
    })
  }

  /**
   * Update stock access frequency
   */
  updateStockAccess(sessionId: string, symbol: string): void {
    const session = this.sessions.get(sessionId)
    if (!session) return

    session.contextData.frequentlyAccessedStocks[symbol] = 
      (session.contextData.frequentlyAccessedStocks[symbol] || 0) + 1
  }

  /**
   * Update user preferences
   */
  updatePreferences(sessionId: string, preferences: Partial<UserPreferences>): void {
    const session = this.sessions.get(sessionId)
    if (!session) return

    session.userPreferences = { ...session.userPreferences, ...preferences }
    this.saveMemoryToFile()
  }

  /**
   * Update market context
   */
  updateMarketContext(sessionId: string, marketData: Record<string, unknown>): void {
    const session = this.sessions.get(sessionId)
    if (!session) return

    session.contextData.marketContext = {
      ...session.contextData.marketContext,
      currentMarketStatus: marketData,
      lastMarketUpdate: new Date().toISOString()
    }
  }

  /**
   * Get conversation context for AI with intelligent summarization
   */
  async getConversationContext(sessionId: string, maxMessages?: number, systemPrompt?: string): Promise<{
    messages: ConversationMessage[]
    summary?: ContextSummary
    wasSummarized: boolean
    tokenCount: any
  }> {
    const session = this.sessions.get(sessionId)
    if (!session) return { messages: [], wasSummarized: false, tokenCount: { totalTokens: 0 } }

    let messages = session.conversationHistory
    
    // Apply maxMessages limit if specified
    if (maxMessages && messages.length > maxMessages) {
      messages = messages.slice(-maxMessages)
    }

    // If no system prompt provided, use default
    const prompt = systemPrompt || this.getContextualSystemPrompt(sessionId)

    // Get optimized context with summarization
    const optimizedContext = await this.contextSummarizer.getOptimalContext(messages, prompt)

    return {
      messages: optimizedContext.messages,
      summary: optimizedContext.summary,
      wasSummarized: optimizedContext.wasSummarized,
      tokenCount: optimizedContext.tokenCount
    }
  }

  /**
   * Get conversation context for AI (backward compatibility)
   */
  getConversationContextSync(sessionId: string, maxMessages = 10): ConversationMessage[] {
    const session = this.sessions.get(sessionId)
    if (!session) return []

    return session.conversationHistory.slice(-maxMessages)
  }

  /**
   * Get user context summary
   */
  getUserContextSummary(sessionId: string): string {
    const session = this.sessions.get(sessionId)
    if (!session) return ''

    const { userPreferences, contextData } = session
    
    let contextSummary = `User Preferences:\n`
    contextSummary += `- Analysis Style: ${userPreferences.analysisStyle}\n`
    contextSummary += `- Language: ${userPreferences.language}\n`
    contextSummary += `- Timezone: ${userPreferences.timezone}\n`
    
    if (userPreferences.preferredStocks.length > 0) {
      contextSummary += `- Preferred Stocks: ${userPreferences.preferredStocks.join(', ')}\n`
    }
    
    if (userPreferences.preferredIndices.length > 0) {
      contextSummary += `- Preferred Indices: ${userPreferences.preferredIndices.join(', ')}\n`
    }

    if (contextData.frequentlyAccessedStocks && Object.keys(contextData.frequentlyAccessedStocks).length > 0) {
      const topStocks = Object.entries(contextData.frequentlyAccessedStocks)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([symbol]) => symbol)
      contextSummary += `- Frequently Accessed Stocks: ${topStocks.join(', ')}\n`
    }

    if (contextData.recentQueries.length > 0) {
      contextSummary += `- Recent Queries: ${contextData.recentQueries.slice(0, 3).join('; ')}\n`
    }

    if (contextData.userGoals.length > 0) {
      contextSummary += `- User Goals: ${contextData.userGoals.join(', ')}\n`
    }

    return contextSummary
  }

  /**
   * Get system prompt with context
   */
  getContextualSystemPrompt(sessionId: string): string {
    const basePrompt = 
      'You are a helpful assistant that provides information about Indian stock market data from NSE India. ' +
      'You have access to various tools to fetch real-time market data, stock information, ' +
      'historical data, and more. ' +
      'When a user asks a question, use the appropriate tools to gather the necessary data ' +
      'and provide a comprehensive answer. ' +
      'Always format your responses in a clear, professional manner with proper markdown ' +
      'formatting when appropriate.'

    const userContext = this.getUserContextSummary(sessionId)
    
    if (userContext) {
      return `${basePrompt}\n\nUser Context:\n${userContext}\n\n` +
        `Use this context to provide personalized responses and remember user preferences.`
    }

    return basePrompt
  }

  /**
   * Clean up expired sessions
   */
  cleanupExpiredSessions(): void {
    const now = new Date()
    const timeoutMs = this.config.sessionTimeoutMinutes * 60 * 1000

    for (const [sessionId, session] of this.sessions.entries()) {
      const lastActivity = new Date(session.lastActivity)
      if (now.getTime() - lastActivity.getTime() > timeoutMs) {
        this.sessions.delete(sessionId)
      }
    }
  }

  /**
   * Save memory to file
   */
  private async saveMemoryToFile(): Promise<void> {
    if (!this.config.persistToFile) return

    try {
      const memoryData = {
        sessions: Object.fromEntries(this.sessions),
        config: this.config,
        lastSaved: new Date().toISOString()
      }
      
      await fs.writeFile(this.memoryFilePath, JSON.stringify(memoryData, null, 2))
    } catch (error) {
      console.error('Failed to save memory to file:', error)
    }
  }

  /**
   * Load memory from file
   */
  private async loadMemoryFromFile(): Promise<void> {
    if (!this.config.persistToFile) return

    try {
      const data = await fs.readFile(this.memoryFilePath, 'utf-8')
      const memoryData = JSON.parse(data)
      
      if (memoryData.sessions) {
        this.sessions = new Map(Object.entries(memoryData.sessions))
      }
    } catch (error) {
      // File doesn't exist or is corrupted, start fresh
      // No existing memory file found, starting fresh
    }
  }

  /**
   * Get session statistics
   */
  getSessionStats(sessionId: string): any {
    const session = this.sessions.get(sessionId)
    if (!session) return null

    return {
      sessionId: session.sessionId,
      userId: session.userId,
      startTime: session.startTime,
      lastActivity: session.lastActivity,
      messageCount: session.conversationHistory.length,
      recentQueriesCount: session.contextData.recentQueries.length,
      frequentlyAccessedStocks: Object.keys(session.contextData.frequentlyAccessedStocks).length,
      frequentlyUsedTools: Object.keys(session.contextData.frequentlyUsedTools).length
    }
  }

  /**
   * Export session data
   */
  exportSessionData(sessionId: string): any {
    return this.sessions.get(sessionId)
  }

  /**
   * Clear session data
   */
  clearSession(sessionId: string): void {
    this.sessions.delete(sessionId)
    this.saveMemoryToFile()
  }

  /**
   * Check if context needs summarization for a session
   */
  async needsContextSummarization(sessionId: string, systemPrompt?: string): Promise<boolean> {
    const session = this.sessions.get(sessionId)
    if (!session) return false

    const prompt = systemPrompt || this.getContextualSystemPrompt(sessionId)
    return this.contextSummarizer.needsSummarization(session.conversationHistory, prompt)
  }

  /**
   * Get context statistics for a session
   */
  async getContextStats(sessionId: string, systemPrompt?: string): Promise<{
    messageCount: number
    tokenCount: any
    needsSummarization: boolean
    contextWindowUsage: number
  }> {
    const session = this.sessions.get(sessionId)
    if (!session) {
      return {
        messageCount: 0,
        tokenCount: { totalTokens: 0 },
        needsSummarization: false,
        contextWindowUsage: 0
      }
    }

    const prompt = systemPrompt || this.getContextualSystemPrompt(sessionId)
    const tokenCount = this.contextSummarizer.countTokens(session.conversationHistory, prompt)
    const needsSummarization = await this.needsContextSummarization(sessionId, systemPrompt)
    const contextWindowUsage = (tokenCount.totalTokens / this.contextSummarizer.getConfig().maxTokens) * 100

    return {
      messageCount: session.conversationHistory.length,
      tokenCount,
      needsSummarization,
      contextWindowUsage
    }
  }

  /**
   * Force context summarization for a session
   */
  async forceContextSummarization(sessionId: string, systemPrompt?: string): Promise<ContextSummary | null> {
    const session = this.sessions.get(sessionId)
    if (!session) return null

    const prompt = systemPrompt || this.getContextualSystemPrompt(sessionId)
    const summary = await this.contextSummarizer.createContextSummary(session.conversationHistory)
    
    // Store summary in session metadata
    if (!session.contextData.marketContext) {
      session.contextData.marketContext = {}
    }
    (session.contextData.marketContext as any).lastSummary = summary

    this.saveMemoryToFile()
    return summary
  }

  /**
   * Update context window configuration
   */
  updateContextWindowConfig(config: Partial<ContextWindowConfig>): void {
    this.config.contextWindowConfig = { ...this.config.contextWindowConfig, ...config }
    this.contextSummarizer.updateConfig(this.config.contextWindowConfig)
  }

  /**
   * Get context window configuration
   */
  getContextWindowConfig(): ContextWindowConfig {
    return this.contextSummarizer.getConfig()
  }
}

