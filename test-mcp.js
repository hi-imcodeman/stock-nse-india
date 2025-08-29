#!/usr/bin/env node

const { spawn } = require('child_process')

// Start the MCP server
const mcpServer = spawn('node', ['build/mcp-server.js'], {
  stdio: ['pipe', 'pipe', 'pipe']
})

// Handle server output
mcpServer.stdout.on('data', (data) => {
  const response = JSON.parse(data.toString())
  console.log('Response:', JSON.stringify(response, null, 2))
})

mcpServer.stderr.on('data', (data) => {
  console.log('Server:', data.toString())
})

// Test functions
async function testMCP() {
  console.log('Testing NSE India MCP Server...\n')

  // Test 1: Initialize
  console.log('1. Testing initialize...')
  sendMessage({
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {}
  })

  await sleep(1000)

  // Test 2: List tools
  console.log('\n2. Testing tools/list...')
  sendMessage({
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/list',
    params: {}
  })

  await sleep(1000)

  // Test 3: Get market status
  console.log('\n3. Testing get_market_status...')
  sendMessage({
    jsonrpc: '2.0',
    id: 3,
    method: 'tools/call',
    params: {
      name: 'get_market_status',
      arguments: {}
    }
  })

  await sleep(3000)

  // Test 4: Get equity details for TCS
  console.log('\n4. Testing get_equity_details for TCS...')
  sendMessage({
    jsonrpc: '2.0',
    id: 4,
    method: 'tools/call',
    params: {
      name: 'get_equity_details',
      arguments: {
        symbol: 'TCS'
      }
    }
  })

  await sleep(5000)

  // Close the server
  console.log('\nTests completed. Closing server...')
  mcpServer.kill()
}

function sendMessage(message) {
  mcpServer.stdin.write(JSON.stringify(message) + '\n')
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Handle process exit
process.on('SIGINT', () => {
  mcpServer.kill()
  process.exit()
})

// Start testing
testMCP().catch(console.error)
