#!/usr/bin/env node

const net = require('net')

/**
 * Simple TCP client for connecting to the NSE India MCP Server
 * 
 * Usage:
 * node examples/mcp-tcp-client.js
 */

class MCPTCPClient {
  constructor(host = 'localhost', port = 3001) {
    this.host = host
    this.port = port
    this.socket = null
    this.messageId = 1
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.socket = net.createConnection(this.port, this.host, () => {
        console.log(`✅ Connected to MCP server at ${this.host}:${this.port}`)
        resolve()
      })

      this.socket.on('data', (data) => {
        const response = JSON.parse(data.toString())
        console.log('📥 Response:', JSON.stringify(response, null, 2))
      })

      this.socket.on('error', (err) => {
        console.error('❌ Connection error:', err)
        reject(err)
      })

      this.socket.on('close', () => {
        console.log('🔌 Connection closed')
      })
    })
  }

  sendMessage(method, params = {}) {
    if (!this.socket) {
      throw new Error('Not connected to server')
    }

    const message = {
      jsonrpc: '2.0',
      id: this.messageId++,
      method,
      params
    }

    console.log(`📤 Sending: ${method}`)
    this.socket.write(JSON.stringify(message) + '\n')
  }

  disconnect() {
    if (this.socket) {
      this.socket.end()
      this.socket = null
    }
  }
}

async function main() {
  const client = new MCPTCPClient()
  
  try {
    console.log('🚀 Starting NSE India MCP TCP Client...\n')

    // Connect to server
    await client.connect()

    // Test 1: Initialize
    console.log('\n1️⃣ Testing initialize...')
    client.sendMessage('initialize', {})

    await sleep(1000)

    // Test 2: List tools
    console.log('\n2️⃣ Testing tools/list...')
    client.sendMessage('tools/list', {})

    await sleep(1000)

    // Test 3: Get market status
    console.log('\n3️⃣ Testing get_market_status...')
    client.sendMessage('tools/call', {
      name: 'get_market_status',
      arguments: {}
    })

    await sleep(3000)

    // Test 4: Get equity details for TCS
    console.log('\n4️⃣ Testing get_equity_details for TCS...')
    client.sendMessage('tools/call', {
      name: 'get_equity_details',
      arguments: {
        symbol: 'TCS'
      }
    })

    await sleep(5000)

    // Close connection
    console.log('\n✅ Tests completed. Closing connection...')
    client.disconnect()

  } catch (error) {
    console.error('❌ Test failed:', error)
    client.disconnect()
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Handle process exit
process.on('SIGINT', () => {
  console.log('\n👋 Goodbye!')
  process.exit(0)
})

// Start the client
main().catch(console.error)

