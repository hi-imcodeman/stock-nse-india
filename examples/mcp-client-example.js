/**
 * MCP Client Example
 * 
 * This example demonstrates how to use the MCP client API to query NSE India data
 * using natural language with ChatGPT GPT-4o-mini integration.
 * 
 * Prerequisites:
 * 1. Set OPENAI_API_KEY environment variable
 * 2. Start the server: npm run start
 * 3. Run this example: node examples/mcp-client-example.js
 */

const axios = require('axios')

// Configuration
const BASE_URL = 'http://localhost:3000'
const OPENAI_API_KEY = process.env.OPENAI_API_KEY

if (!OPENAI_API_KEY) {
    console.error('❌ Please set OPENAI_API_KEY environment variable')
    process.exit(1)
}

// Example queries to test
const exampleQueries = [
    "What is the current market status?",
    "Show me the current price of TCS stock",
    "What are the top gainers in NIFTY today?",
    "Get historical data for RELIANCE for the last 30 days",
    "What is the option chain for NIFTY?",
    "Show me all available stock symbols",
    "What are the trading holidays this year?",
    "Get the latest circulars from NSE",
    "What is the current turnover in the market?",
    "Show me the corporate information for INFY"
]

async function testMCPClient() {
    console.log('🚀 Testing MCP Client with ChatGPT GPT-4o-mini\n')
    console.log('=' * 60)

    try {
        // Test 1: Check if MCP client is working
        console.log('\n1️⃣ Testing MCP client connection...')
        const testResponse = await axios.get(`${BASE_URL}/api/mcp/test`)
        console.log('✅ MCP Client Status:', testResponse.data.status)
        console.log('📝 Message:', testResponse.data.message)

        // Test 2: Get available tools
        console.log('\n2️⃣ Getting available MCP tools...')
        const toolsResponse = await axios.get(`${BASE_URL}/api/mcp/tools`)
        console.log(`✅ Found ${toolsResponse.data.tools.length} available tools`)
        console.log('📋 Available tools:')
        toolsResponse.data.tools.slice(0, 5).forEach(tool => {
            console.log(`   - ${tool.name}: ${tool.description}`)
        })
        if (toolsResponse.data.tools.length > 5) {
            console.log(`   ... and ${toolsResponse.data.tools.length - 5} more tools`)
        }

        // Test 3: Run example queries
        console.log('\n3️⃣ Testing example queries...\n')
        
        for (let i = 0; i < Math.min(3, exampleQueries.length); i++) {
            const query = exampleQueries[i]
            console.log(`🔍 Query ${i + 1}: "${query}"`)
            console.log('-'.repeat(50))
            
            try {
                const startTime = Date.now()
                const response = await axios.post(`${BASE_URL}/api/mcp/query`, {
                    query: query,
                    model: 'gpt-4o-mini',
                    temperature: 0.7,
                    max_tokens: 1000
                })
                const endTime = Date.now()
                
                console.log('🤖 AI Response:')
                console.log(response.data.response)
                console.log(`\n🔧 Tools Used: ${response.data.tools_used.join(', ')}`)
                console.log(`⏱️  Response Time: ${endTime - startTime}ms`)
                console.log(`🕐 Timestamp: ${response.data.timestamp}`)
                
            } catch (error) {
                console.error('❌ Query failed:', error.response?.data?.error || error.message)
            }
            
            console.log('\n' + '='.repeat(60) + '\n')
        }

        // Test 4: Interactive mode
        console.log('4️⃣ Interactive Mode - Enter your own queries!')
        console.log('Type "exit" to quit, "help" for example queries\n')
        
        const readline = require('readline')
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        })

        const askQuestion = () => {
            rl.question('💬 Your query: ', async (query) => {
                if (query.toLowerCase() === 'exit') {
                    console.log('👋 Goodbye!')
                    rl.close()
                    return
                }
                
                if (query.toLowerCase() === 'help') {
                    console.log('\n📚 Example queries:')
                    exampleQueries.forEach((q, i) => {
                        console.log(`   ${i + 1}. ${q}`)
                    })
                    console.log('')
                    askQuestion()
                    return
                }

                if (query.trim() === '') {
                    askQuestion()
                    return
                }

                try {
                    console.log('🤔 Processing...')
                    const startTime = Date.now()
                    const response = await axios.post(`${BASE_URL}/api/mcp/query`, {
                        query: query,
                        model: 'gpt-4o-mini',
                        temperature: 0.7,
                        max_tokens: 1500
                    })
                    const endTime = Date.now()
                    
                    console.log('\n🤖 AI Response:')
                    console.log(response.data.response)
                    console.log(`\n🔧 Tools Used: ${response.data.tools_used.join(', ')}`)
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
    testMCPClient()
}

module.exports = { testMCPClient, exampleQueries }

