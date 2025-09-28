/**
 * Unified MCP Client Example
 * 
 * This example demonstrates the unified MCP client that combines:
 * - OpenAI function calling for natural language queries
 * - Memory management for context awareness
 * - Context summarization for handling long conversations
 * - Session management for multi-user support
 * 
 * Prerequisites:
 * 1. Set OPENAI_API_KEY environment variable
 * 2. Start the server: npm run start
 * 3. Run this example: node examples/unified-mcp-client-example.js
 */

const axios = require('axios')

// Configuration
const BASE_URL = 'http://localhost:3000'
const OPENAI_API_KEY = process.env.OPENAI_API_KEY

if (!OPENAI_API_KEY) {
    console.error('❌ Please set OPENAI_API_KEY environment variable')
    process.exit(1)
}

// Generate a unique session ID
const generateSessionId = () => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

// Example conversation scenarios
const scenarios = {
    basic: [
        "What is the current market status?",
        "Show me the price of TCS stock",
        "What about RELIANCE?"
    ],
    
    withMemory: [
        "What is the current market status?",
        "Show me the price of TCS stock",
        "What about RELIANCE?",
        "Compare these two stocks",
        "Give me a brief summary of what we discussed"
    ],
    
    longConversation: [
        "What is the current market status?",
        "Show me the price of TCS stock",
        "What about RELIANCE stock?",
        "Compare TCS and RELIANCE",
        "Show me technical indicators for TCS",
        "What are the moving averages for RELIANCE?",
        "Show me the option chain for NIFTY",
        "What is the current VIX level?",
        "Show me the top gainers today",
        "What about the top losers?",
        "Show me the most active stocks",
        "What is the market turnover?",
        "Show me the pre-market data",
        "What are the trading holidays this month?",
        "Show me the latest circulars from NSE",
        "Based on our entire conversation, what are the key insights about the market today?"
    ]
}

async function testUnifiedMCPClient() {
    console.log('🚀 Testing Unified MCP Client\n')
    console.log('Features: OpenAI Function Calling + Memory + Context Summarization')
    console.log('=' * 80)

    try {
        // Test 1: Basic functionality without memory
        console.log('\n1️⃣ Testing basic functionality (no memory)...')
        
        for (let i = 0; i < scenarios.basic.length; i++) {
            const query = scenarios.basic[i]
            console.log(`\n🔍 Query ${i + 1}: "${query}"`)
            
            try {
                const startTime = Date.now()
                const response = await axios.post(`${BASE_URL}/api/mcp/query`, {
                    query: query,
                    useMemory: false // Disable memory for basic test
                })
                const endTime = Date.now()
                
                console.log('✅ Response received')
                console.log(`🔧 Tools Used: ${response.data.tools_used.join(', ')}`)
                console.log(`⏱️  Response Time: ${endTime - startTime}ms`)
                console.log(`📝 Response: ${response.data.response.substring(0, 100)}...`)
                
            } catch (error) {
                console.error('❌ Query failed:', error.response?.data?.error || error.message)
            }
        }

        // Test 2: Memory-enabled functionality
        console.log('\n\n2️⃣ Testing with memory and context awareness...')
        const sessionId = generateSessionId()
        console.log(`📝 Session ID: ${sessionId}`)
        
        for (let i = 0; i < scenarios.withMemory.length; i++) {
            const query = scenarios.withMemory[i]
            console.log(`\n🔍 Query ${i + 1}: "${query}"`)
            
            try {
                const startTime = Date.now()
                const response = await axios.post(`${BASE_URL}/api/mcp/query`, {
                    query: query,
                    sessionId: sessionId,
                    userId: 'demo_user',
                    useMemory: true,
                    includeContext: true,
                    updatePreferences: true
                })
                const endTime = Date.now()
                
                console.log('✅ Response received')
                console.log(`🔧 Tools Used: ${response.data.tools_used.join(', ')}`)
                console.log(`🧠 Context Used: ${response.data.context_used}`)
                console.log(`⚙️  Preferences Updated: ${response.data.user_preferences_updated}`)
                console.log(`📊 Conversation Length: ${response.data.conversation_length}`)
                console.log(`📈 Context Summarized: ${response.data.context_summarized || false}`)
                console.log(`⏱️  Response Time: ${endTime - startTime}ms`)
                console.log(`📝 Response: ${response.data.response.substring(0, 150)}...`)
                
                if (response.data.token_count) {
                    console.log(`🔢 Token Count: ${response.data.token_count.totalTokens}`)
                }
                
            } catch (error) {
                console.error('❌ Query failed:', error.response?.data?.error || error.message)
            }
        }

        // Test 3: Session management
        console.log('\n\n3️⃣ Testing session management...')
        
        try {
            const sessionInfo = await axios.get(`${BASE_URL}/api/mcp/session/${sessionId}`)
            console.log('📊 Session Statistics:')
            console.log(`- Session ID: ${sessionInfo.data.sessionId}`)
            console.log(`- User ID: ${sessionInfo.data.userId}`)
            console.log(`- Message Count: ${sessionInfo.data.messageCount}`)
            console.log(`- Recent Queries: ${sessionInfo.data.recentQueriesCount}`)
            console.log(`- Frequently Accessed Stocks: ${sessionInfo.data.frequentlyAccessedStocks}`)
        } catch (error) {
            console.error('❌ Failed to get session info:', error.response?.data?.error || error.message)
        }

        // Test 4: Context statistics and summarization
        console.log('\n\n4️⃣ Testing context summarization with long conversation...')
        const longSessionId = generateSessionId()
        console.log(`📝 Long Session ID: ${longSessionId}`)
        
        // Configure smaller context window to trigger summarization
        try {
            await axios.put(`${BASE_URL}/api/mcp/session/${longSessionId}/context-window`, {
                maxTokens: 4000,
                summarizationThreshold: 0.6,
                minMessagesToSummarize: 5
            })
            console.log('✅ Context window configured for testing')
        } catch (error) {
            console.error('❌ Failed to configure context window:', error.response?.data?.error || error.message)
        }
        
        // Run long conversation
        for (let i = 0; i < Math.min(10, scenarios.longConversation.length); i++) {
            const query = scenarios.longConversation[i]
            console.log(`\n🔍 Long Query ${i + 1}: "${query.substring(0, 50)}..."`)
            
            try {
                const response = await axios.post(`${BASE_URL}/api/mcp/query`, {
                    query: query,
                    sessionId: longSessionId,
                    userId: 'demo_user',
                    useMemory: true,
                    includeContext: true,
                    updatePreferences: true
                })
                
                console.log(`✅ Response received - Length: ${response.data.conversation_length}`)
                console.log(`📈 Context Summarized: ${response.data.context_summarized || false}`)
                
                if (response.data.context_summarized) {
                    console.log('🎯 Context was summarized!')
                    if (response.data.context_summary) {
                        console.log(`📝 Summary: ${response.data.context_summary.summary}`)
                    }
                }
                
            } catch (error) {
                console.error('❌ Query failed:', error.response?.data?.error || error.message)
            }
        }

        // Test 5: Context statistics
        console.log('\n\n5️⃣ Checking final context statistics...')
        
        try {
            const stats = await axios.get(`${BASE_URL}/api/mcp/session/${longSessionId}/context-stats`)
            console.log('📊 Context Statistics:')
            console.log(`- Message Count: ${stats.data.messageCount}`)
            console.log(`- Token Count: ${stats.data.tokenCount.totalTokens}`)
            console.log(`- Needs Summarization: ${stats.data.needsSummarization}`)
            console.log(`- Context Window Usage: ${stats.data.contextWindowUsage.toFixed(2)}%`)
        } catch (error) {
            console.error('❌ Failed to get context stats:', error.response?.data?.error || error.message)
        }

        // Test 6: Different client configurations
        console.log('\n\n6️⃣ Testing different client configurations...')
        
        const configurations = [
            {
                name: 'Memory Disabled',
                config: { useMemory: false }
            },
            {
                name: 'Memory Enabled, No Context',
                config: { useMemory: true, includeContext: false, sessionId: generateSessionId() }
            },
            {
                name: 'Full Features',
                config: { 
                    useMemory: true, 
                    includeContext: true, 
                    updatePreferences: true,
                    sessionId: generateSessionId()
                }
            }
        ]

        for (const { name, config } of configurations) {
            console.log(`\n🔧 Testing ${name}:`)
            
            try {
                const response = await axios.post(`${BASE_URL}/api/mcp/query`, {
                    query: "What is the current market status?",
                    ...config
                })
                
                console.log(`✅ ${name} - Success`)
                console.log(`- Memory Used: ${response.data.sessionId ? 'Yes' : 'No'}`)
                console.log(`- Context Used: ${response.data.context_used || false}`)
                console.log(`- Tools Used: ${response.data.tools_used.join(', ')}`)
                
            } catch (error) {
                console.error(`❌ ${name} failed:`, error.response?.data?.error || error.message)
            }
        }

        // Test 7: Interactive mode
        console.log('\n\n7️⃣ Interactive Mode - Test all features!')
        console.log('Commands:')
        console.log('- "exit" to quit')
        console.log('- "session" for session info')
        console.log('- "stats" for context stats')
        console.log('- "summarize" to force summarization')
        console.log('- "config" to show current configuration')
        console.log('- "memory on/off" to toggle memory')
        console.log('- Any other text will be sent as a query\n')
        
        const readline = require('readline')
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        })

        let interactiveSessionId = generateSessionId()
        let useMemoryInteractive = true
        
        console.log(`📝 Interactive Session ID: ${interactiveSessionId}`)

        const askQuestion = () => {
            rl.question('💬 Your query: ', async (input) => {
                const command = input.toLowerCase().trim()
                
                if (command === 'exit') {
                    console.log('👋 Goodbye!')
                    rl.close()
                    return
                }
                
                if (command === 'session') {
                    try {
                        const sessionInfo = await axios.get(`${BASE_URL}/api/mcp/session/${interactiveSessionId}`)
                        console.log('\n📊 Session Info:')
                        console.log(JSON.stringify(sessionInfo.data, null, 2))
                    } catch (error) {
                        console.error('❌ Failed to get session info:', error.response?.data?.error || error.message)
                    }
                    askQuestion()
                    return
                }
                
                if (command === 'stats') {
                    try {
                        const stats = await axios.get(`${BASE_URL}/api/mcp/session/${interactiveSessionId}/context-stats`)
                        console.log('\n📊 Context Statistics:')
                        console.log(JSON.stringify(stats.data, null, 2))
                    } catch (error) {
                        console.error('❌ Failed to get stats:', error.response?.data?.error || error.message)
                    }
                    askQuestion()
                    return
                }
                
                if (command === 'summarize') {
                    try {
                        const summary = await axios.post(`${BASE_URL}/api/mcp/session/${interactiveSessionId}/summarize`)
                        console.log('\n📝 Context Summary:')
                        console.log(JSON.stringify(summary.data.summary, null, 2))
                    } catch (error) {
                        console.error('❌ Failed to summarize:', error.response?.data?.error || error.message)
                    }
                    askQuestion()
                    return
                }
                
                if (command === 'config') {
                    try {
                        const config = await axios.get(`${BASE_URL}/api/mcp/session/${interactiveSessionId}/context-window`)
                        console.log('\n⚙️ Context Window Configuration:')
                        console.log(JSON.stringify(config.data, null, 2))
                        console.log(`\n🧠 Memory: ${useMemoryInteractive ? 'Enabled' : 'Disabled'}`)
                    } catch (error) {
                        console.error('❌ Failed to get config:', error.response?.data?.error || error.message)
                    }
                    askQuestion()
                    return
                }
                
                if (command === 'memory on') {
                    useMemoryInteractive = true
                    console.log('✅ Memory enabled')
                    askQuestion()
                    return
                }
                
                if (command === 'memory off') {
                    useMemoryInteractive = false
                    console.log('✅ Memory disabled')
                    askQuestion()
                    return
                }

                if (input.trim() === '') {
                    askQuestion()
                    return
                }

                try {
                    console.log('🤔 Processing...')
                    const startTime = Date.now()
                    const response = await axios.post(`${BASE_URL}/api/mcp/query`, {
                        query: input,
                        sessionId: useMemoryInteractive ? interactiveSessionId : undefined,
                        userId: 'interactive_user',
                        useMemory: useMemoryInteractive,
                        includeContext: useMemoryInteractive,
                        updatePreferences: useMemoryInteractive
                    })
                    const endTime = Date.now()
                    
                    console.log('\n🤖 AI Response:')
                    console.log(response.data.response)
                    console.log(`\n🔧 Tools Used: ${response.data.tools_used.join(', ')}`)
                    
                    if (useMemoryInteractive) {
                        console.log(`🧠 Context Used: ${response.data.context_used}`)
                        console.log(`⚙️  Preferences Updated: ${response.data.user_preferences_updated}`)
                        console.log(`📊 Conversation Length: ${response.data.conversation_length}`)
                        console.log(`📈 Context Summarized: ${response.data.context_summarized || false}`)
                        
                        if (response.data.token_count) {
                            console.log(`🔢 Token Count: ${response.data.token_count.totalTokens}`)
                        }
                    }
                    
                    console.log(`⏱️  Response Time: ${endTime - startTime}ms`)
                    
                } catch (error) {
                    console.error('❌ Error:', error.response?.data?.error || error.message)
                }
                
                console.log('')
                askQuestion()
            })
        }

        askQuestion()

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data?.error || error.message)
        process.exit(1)
    }
}

// Run the test
if (require.main === module) {
    testUnifiedMCPClient()
}

module.exports = { testUnifiedMCPClient, scenarios }
