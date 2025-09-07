/**
 * Test script for MCP Client
 * 
 * This script tests the MCP client functionality without requiring OpenAI API key
 * by testing the basic functionality and tool extraction logic.
 */

const axios = require('axios')

const BASE_URL = 'http://localhost:3000'

async function testMCPServer() {
    console.log('🧪 Testing MCP Client Server...\n')

    try {
        // Test 1: Check if server is running
        console.log('1️⃣ Testing server connection...')
        try {
            const response = await axios.get(`${BASE_URL}/api/marketStatus`)
            console.log('✅ Server is running')
        } catch (error) {
            console.log('❌ Server is not running. Please start with: npm start')
            return
        }

        // Test 2: Test MCP tools endpoint
        console.log('\n2️⃣ Testing MCP tools endpoint...')
        try {
            const response = await axios.get(`${BASE_URL}/api/mcp/tools`)
            console.log(`✅ Found ${response.data.tools.length} MCP tools`)
            console.log('📋 Sample tools:')
            response.data.tools.slice(0, 3).forEach(tool => {
                console.log(`   - ${tool.name}: ${tool.description}`)
            })
        } catch (error) {
            console.log('❌ MCP tools endpoint failed:', error.response?.data?.error || error.message)
        }

        // Test 3: Test MCP test endpoint (without OpenAI key)
        console.log('\n3️⃣ Testing MCP test endpoint...')
        try {
            const response = await axios.get(`${BASE_URL}/api/mcp/test`)
            if (response.data.status === 'error' && response.data.message.includes('OpenAI API key')) {
                console.log('✅ MCP test endpoint working (OpenAI key not configured - expected)')
            } else {
                console.log('✅ MCP test endpoint working:', response.data.message)
            }
        } catch (error) {
            console.log('❌ MCP test endpoint failed:', error.response?.data?.error || error.message)
        }

        // Test 4: Test MCP query endpoint (should fail without OpenAI key)
        console.log('\n4️⃣ Testing MCP query endpoint...')
        try {
            const response = await axios.post(`${BASE_URL}/api/mcp/query`, {
                query: 'What is the market status?'
            })
            console.log('✅ MCP query endpoint working:', response.data.response)
        } catch (error) {
            if (error.response?.status === 500 && error.response?.data?.error?.includes('OpenAI API key')) {
                console.log('✅ MCP query endpoint working (OpenAI key not configured - expected)')
            } else {
                console.log('❌ MCP query endpoint failed:', error.response?.data?.error || error.message)
            }
        }

        console.log('\n🎉 MCP Client server tests completed!')
        console.log('\n📝 Next steps:')
        console.log('   1. Set OPENAI_API_KEY environment variable')
        console.log('   2. Run: node examples/mcp-client-example.js')
        console.log('   3. Or test with curl:')
        console.log('      curl -X POST http://localhost:3000/api/mcp/query \\')
        console.log('        -H "Content-Type: application/json" \\')
        console.log('        -d \'{"query": "What is the market status?"}\'')

    } catch (error) {
        console.error('❌ Test failed:', error.message)
    }
}

// Run the test
if (require.main === module) {
    testMCPServer()
}

module.exports = { testMCPServer }

