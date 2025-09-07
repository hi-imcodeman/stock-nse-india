/**
 * MCP Client with OpenAI Function Calling Example
 * 
 * This example demonstrates the advantages of using OpenAI's built-in function calling
 * feature for MCP client implementation.
 * 
 * Prerequisites:
 * 1. Set OPENAI_API_KEY environment variable
 * 2. Start the server: npm run start
 * 3. Run this example: node examples/mcp-openai-functions-example.js
 */

const axios = require('axios')

// Configuration
const BASE_URL = 'http://localhost:3000'
const OPENAI_API_KEY = process.env.OPENAI_API_KEY

if (!OPENAI_API_KEY) {
    console.error('❌ Please set OPENAI_API_KEY environment variable')
    process.exit(1)
}

// Example queries to test different scenarios
const exampleQueries = [
    {
        name: "Simple Query",
        query: "What is the current market status?",
        expectedTools: ["get_market_status"]
    },
    {
        name: "Multiple Function Calls",
        query: "Show me the market status and list some stock symbols",
        expectedTools: ["get_market_status", "get_all_stock_symbols"]
    },
    {
        name: "Stock Information Query",
        query: "Get me details about TCS stock and its current price",
        expectedTools: ["get_equity_details", "get_equity_intraday_data"]
    },
    {
        name: "Historical Data Query",
        query: "Show me historical data for RELIANCE for the last 30 days",
        expectedTools: ["get_equity_historical_data"]
    },
    {
        name: "Index Information Query",
        query: "What is the current NIFTY 50 index value and show me some indices",
        expectedTools: ["get_index_intraday_data", "get_all_indices"]
    },
    {
        name: "Complex Multi-tool Query",
        query: "Give me a comprehensive market overview including status, top stocks, and indices",
        expectedTools: ["get_market_status", "get_all_stock_symbols", "get_all_indices"]
    }
]

async function testOpenAIFunctionCalling() {
    console.log('🚀 Testing MCP Client with OpenAI Function Calling\n')
    console.log('=' * 60)

    try {
        // Test 1: Check if server is running
        console.log('1️⃣ Testing server connection...')
        try {
            const response = await axios.get(`${BASE_URL}/api/mcp/test`)
            console.log('✅ Server is running')
            console.log('📝 Message:', response.data.message)
        } catch (error) {
            console.log('❌ Server is not running. Please start with: npm start')
            return
        }

        // Test 2: Get available functions
        console.log('\n2️⃣ Testing OpenAI functions endpoint...')
        try {
            const response = await axios.get(`${BASE_URL}/api/mcp/functions`)
            console.log(`✅ Found ${response.data.functions.length} OpenAI functions`)
            console.log('📋 Sample functions:')
            response.data.functions.slice(0, 3).forEach(func => {
                console.log(`   - ${func.name}: ${func.description}`)
            })
        } catch (error) {
            console.log('❌ Functions endpoint failed:', error.response?.data?.error || error.message)
        }

        // Test 3: Test single function calls
        console.log('\n3️⃣ Testing single function calls...\n')
        
        for (let i = 0; i < Math.min(3, exampleQueries.length); i++) {
            const testCase = exampleQueries[i]
            console.log(`🔍 Test ${i + 1}: ${testCase.name}`)
            console.log(`📝 Query: "${testCase.query}"`)
            console.log('-'.repeat(50))
            
            try {
                const startTime = Date.now()
                const response = await axios.post(`${BASE_URL}/api/mcp/query`, {
                    query: testCase.query,
                    model: 'gpt-4o-mini',
                    temperature: 0.7,
                    max_tokens: 1500
                })
                const endTime = Date.now()
                
                console.log('🤖 AI Response:')
                console.log(response.data.response)
                console.log(`\n🔧 Tools Used: ${response.data.tools_used.join(', ')}`)
                console.log(`⏱️  Response Time: ${endTime - startTime}ms`)
                
                // Check if expected tools were used
                const expectedTools = testCase.expectedTools || []
                const usedTools = response.data.tools_used || []
                const toolsMatched = expectedTools.some(tool => usedTools.includes(tool))
                
                if (expectedTools.length > 0) {
                    console.log(`✅ Expected tools: ${expectedTools.join(', ')}`)
                    console.log(toolsMatched ? '✅ Tools used correctly!' : '⚠️  Different tools used than expected')
                }
                
            } catch (error) {
                console.error('❌ Query failed:', error.response?.data?.error || error.message)
            }
            
            console.log('\n' + '='.repeat(60) + '\n')
        }

        // Test 4: Test multiple function calls
        console.log('4️⃣ Testing multiple function calls...\n')
        
        const multiQuery = "Show me the market status, list some stock symbols, and get details about NIFTY index"
        console.log(`🔍 Multi-function Query: "${multiQuery}"`)
        console.log('-'.repeat(50))
        
        try {
            const startTime = Date.now()
            const response = await axios.post(`${BASE_URL}/api/mcp/query-multiple`, {
                query: multiQuery,
                model: 'gpt-4o-mini',
                temperature: 0.7,
                max_tokens: 2000
            })
            const endTime = Date.now()
            
            console.log('🤖 AI Response:')
            console.log(response.data.response)
            console.log(`\n🔧 Tools Used: ${response.data.tools_used.join(', ')}`)
            console.log(`⏱️  Response Time: ${endTime - startTime}ms`)
            console.log('✅ Multiple function calls executed successfully!')
            
        } catch (error) {
            console.error('❌ Multi-function query failed:', error.response?.data?.error || error.message)
        }

        console.log('\n🎉 OpenAI Function Calling tests completed!')
        console.log('\n📊 Advantages of OpenAI Function Calling:')
        console.log('   ✅ Automatic tool selection by AI')
        console.log('   ✅ Native parameter extraction')
        console.log('   ✅ Support for multiple function calls')
        console.log('   ✅ Better error handling')
        console.log('   ✅ More reliable than custom parsing')
        console.log('   ✅ Follows OpenAI best practices')

    } catch (error) {
        console.error('❌ Test failed:', error.message)
    }
}

// Run the test
if (require.main === module) {
    testOpenAIFunctionCalling()
}

module.exports = { testOpenAIFunctionCalling, exampleQueries }
