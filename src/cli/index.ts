#!/usr/bin/env node
/* eslint-disable no-console */

import {
    showEquityDetails,
    showHistorical,
    showMarketStatus,
    showIndexDetails,
    showIndexOverview
} from './api'
import yargs from 'yargs'
import { MCPServer } from '../mcp-server'

// MCP Server handler function
function startMCPServer() {
    console.log('🚀 Starting MCP stdio server...')
    
    try {
        // Create and start the MCP server directly
        const server = new MCPServer()
        
        console.log('📡 MCP stdio server is running. Connect your MCP client to this process.')
        console.log('💡 Use Ctrl+C to stop the server.')
        
        // Handle graceful shutdown
        process.on('SIGINT', () => {
            console.log('\n🛑 Shutting down MCP server...')
            process.exit(0)
        })
        
        process.on('SIGTERM', () => {
            console.log('\n🛑 Shutting down MCP server...')
            process.exit(0)
        })
        
    } catch (error) {
        console.error(`❌ Failed to start MCP server: ${error instanceof Error ? error.message : String(error)}`)
        process.exit(1)
    }
}

const _argv = yargs
    .command('$0', 'the default command', {}, showMarketStatus)
    .command('equity <symbol>', 'Get details of the symbol', (yargsBuilder: any) => {
        yargsBuilder.positional('symbol', {
            type: 'string',
            demandOption: true,
            describe: 'Symbol of NSE equities.'
        })
    }, showEquityDetails)
    .command('historical <symbol>', 'Get historical chart of the symbol', (yargsBuilder: any) => {
        yargsBuilder.positional('symbol', {
            type: 'string',
            demandOption: true,
            describe: 'Symbol of NSE equities.'
        })
    }, showHistorical)
    .command('index [indexSymbol]', 'Get details of the index.', (yargsBuilder: any) => {
        yargsBuilder.positional('indexSymbol', {
            type: 'string',
            demandOption: true,
            describe: 'Symbol of NSE Indices.'
        })
    }, (argv: any) => {
        const { indexSymbol: index } = argv
        if (index)
            showIndexDetails(argv)
        else
            showIndexOverview()
    })
    .command('mcp', 'Start MCP stdio server', (yargsBuilder: any) => {
        yargsBuilder
            .example('$0 mcp', 'Start MCP stdio server')
            .example('npx . mcp', 'Start MCP stdio server via npx')
    }, startMCPServer)
    .argv
