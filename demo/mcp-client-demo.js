/**
 * MCP Client Demo - Comprehensive Examples
 * 
 * This demo showcases various features of the MCP Client including:
 * - Basic queries without memory
 * - Session-based conversations with memory
 * - Context summarization for long conversations
 * - Multi-iteration queries
 * - Technical analysis queries
 * - Investment recommendations
 */

const { MCPClient } = require('../build/mcp/client/mcp-client.js');

// ANSI color codes for better console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(80));
  log(title, colors.bright + colors.cyan);
  console.log('='.repeat(80) + '\n');
}

function logSubSection(title) {
  log(`\n${title}`, colors.bright + colors.yellow);
  log('-'.repeat(title.length), colors.dim);
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Demo 1: Basic Query with Memory and Summarization Enabled
 */
async function demo1_BasicQuery() {
  logSection('Demo 1: Basic Query with Memory and Summarization Enabled');
  
  const client = new MCPClient({
    enableMemory: true,
    enableContextSummarization: true,
    enableDebugLogging: false,
    memoryConfig: {
      maxConversationHistory: 50,
      contextWindowConfig: {
        maxTokens: 8000,
        summarizationThreshold: 0.8
      }
    }
  });

  const sessionId = 'demo1-session-' + Date.now();

  try {
    log('Query: What is the current market status?', colors.blue);
    log(`Session ID: ${sessionId}`, colors.dim);
    
    const response = await client.processQuery({
      query: 'What is the current market status?',
      sessionId,
      useMemory: true,
      includeContext: true,
      updatePreferences: true,
      maxIterations: 3
    });

    logSubSection('Response:');
    log(response.response, colors.green);
    
    logSubSection('Metadata:');
    console.log({
      tools_used: response.tools_used,
      iterations_used: response.iterations_used,
      session_id: response.sessionId,
      context_used: response.context_used,
      conversation_length: response.conversation_length,
      timestamp: response.timestamp
    });

    logSubSection('Memory Features:');
    log('✓ Session memory enabled', colors.green);
    log('✓ Context summarization enabled', colors.green);
    log('✓ User preferences tracking enabled', colors.green);
  } catch (error) {
    log(`Error: ${error.message}`, colors.red);
  }
}

/**
 * Demo 2: Session-based Conversation with Memory
 */
async function demo2_SessionWithMemory() {
  logSection('Demo 2: Session-based Conversation with Memory');
  
  const client = new MCPClient({
    enableMemory: true,
    enableContextSummarization: true,
    enableDebugLogging: false
  });

  const sessionId = 'demo-session-' + Date.now();

  try {
    // First query
    logSubSection('Query 1: Get details about RELIANCE stock');
    const response1 = await client.processQuery({
      query: 'Tell me about RELIANCE stock',
      sessionId,
      useMemory: true,
      includeContext: true,
      maxIterations: 3
    });
    log(response1.response.substring(0, 300) + '...', colors.green);
    
    await sleep(1000);

    // Second query (uses context from first)
    logSubSection('Query 2: Follow-up question using context');
    const response2 = await client.processQuery({
      query: 'What are its technical indicators?',
      sessionId,
      useMemory: true,
      includeContext: true,
      maxIterations: 3
    });
    log(response2.response.substring(0, 300) + '...', colors.green);

    await sleep(1000);

    // Third query (uses context from both)
    logSubSection('Query 3: Another follow-up question');
    const response3 = await client.processQuery({
      query: 'Should I invest in it?',
      sessionId,
      useMemory: true,
      includeContext: true,
      maxIterations: 3
    });
    log(response3.response.substring(0, 300) + '...', colors.green);

    // Show session info
    logSubSection('Session Information:');
    const sessionInfo = client.getSessionInfo(sessionId);
    if (sessionInfo) {
      console.log({
        session_id: sessionInfo.sessionId,
        message_count: sessionInfo.messageCount,
        frequently_accessed_stocks: sessionInfo.frequentlyAccessedStocks
      });
    }
  } catch (error) {
    log(`Error: ${error.message}`, colors.red);
  }
}

/**
 * Demo 3: Technical Analysis Query with Memory
 */
async function demo3_TechnicalAnalysis() {
  logSection('Demo 3: Technical Analysis Query with Memory');
  
  const client = new MCPClient({
    enableMemory: true,
    enableContextSummarization: true,
    enableDebugLogging: false
  });

  const sessionId = 'demo3-session-' + Date.now();

  try {
    log('Query: Get technical indicators for TCS stock', colors.blue);
    log(`Session ID: ${sessionId}`, colors.dim);
    
    const response = await client.processQuery({
      query: 'Get me the technical indicators for TCS stock including RSI, MACD, and Bollinger Bands',
      sessionId,
      useMemory: true,
      includeContext: true,
      updatePreferences: true,
      maxIterations: 5
    });

    logSubSection('Response:');
    log(response.response, colors.green);
    
    logSubSection('Iteration Details:');
    response.iteration_details.forEach((detail, index) => {
      console.log(`\nIteration ${detail.iteration}:`);
      console.log(`  Purpose: ${detail.purpose}`);
      console.log(`  Tools: ${detail.tools_called.join(', ')}`);
    });

    logSubSection('Session Info:');
    const sessionInfo = client.getSessionInfo(sessionId);
    if (sessionInfo) {
      console.log({
        session_id: sessionInfo.sessionId,
        message_count: sessionInfo.messageCount,
        frequently_accessed_stocks: sessionInfo.frequentlyAccessedStocks,
        frequently_used_tools: sessionInfo.frequentlyUsedTools
      });
    }
  } catch (error) {
    log(`Error: ${error.message}`, colors.red);
  }
}

/**
 * Demo 4: Investment Recommendation Query with Memory
 */
async function demo4_InvestmentRecommendation() {
  logSection('Demo 4: Investment Recommendation Query with Memory');
  
  const client = new MCPClient({
    enableMemory: true,
    enableContextSummarization: true,
    enableDebugLogging: false
  });

  const sessionId = 'demo4-session-' + Date.now();

  try {
    log('Query: Which NIFTY 50 stocks are good for investment based on technical indicators?', colors.blue);
    log(`Session ID: ${sessionId}`, colors.dim);
    
    const response = await client.processQuery({
      query: 'Which NIFTY 50 stocks are good for investment based on technical indicators?',
      sessionId,
      useMemory: true,
      includeContext: true,
      updatePreferences: true,
      maxIterations: 5
    });

    logSubSection('Response:');
    log(response.response, colors.green);
    
    logSubSection('Query Statistics:');
    console.log({
      tools_used: response.tools_used,
      iterations_used: response.iterations_used,
      data_sources: response.data_sources,
      conversation_length: response.conversation_length,
      preferences_updated: response.user_preferences_updated
    });

    logSubSection('Session Statistics:');
    const sessionInfo = client.getSessionInfo(sessionId);
    if (sessionInfo) {
      console.log({
        session_id: sessionInfo.sessionId,
        message_count: sessionInfo.messageCount,
        frequently_accessed_stocks: sessionInfo.frequentlyAccessedStocks,
        frequently_used_tools: sessionInfo.frequentlyUsedTools
      });
    }
  } catch (error) {
    log(`Error: ${error.message}`, colors.red);
  }
}

/**
 * Demo 5: Multi-user Sessions
 */
async function demo5_MultiUserSessions() {
  logSection('Demo 5: Multi-user Sessions');
  
  const client = new MCPClient({
    enableMemory: true,
    enableContextSummarization: true,
    enableDebugLogging: false
  });

  try {
    // User 1
    logSubSection('User 1 Session:');
    const user1Session = 'user1-' + Date.now();
    const user1Response = await client.processQuery({
      query: 'I am interested in IT stocks. Tell me about TCS.',
      sessionId: user1Session,
      userId: 'user1',
      useMemory: true,
      maxIterations: 3
    });
    log(user1Response.response.substring(0, 200) + '...', colors.green);

    await sleep(500);

    // User 2
    logSubSection('User 2 Session:');
    const user2Session = 'user2-' + Date.now();
    const user2Response = await client.processQuery({
      query: 'I am interested in banking stocks. Tell me about HDFC Bank.',
      sessionId: user2Session,
      userId: 'user2',
      useMemory: true,
      maxIterations: 3
    });
    log(user2Response.response.substring(0, 200) + '...', colors.green);

    await sleep(500);

    // User 1 follow-up
    logSubSection('User 1 Follow-up:');
    const user1FollowUp = await client.processQuery({
      query: 'What about Infosys?',
      sessionId: user1Session,
      userId: 'user1',
      useMemory: true,
      includeContext: true,
      maxIterations: 3
    });
    log(user1FollowUp.response.substring(0, 200) + '...', colors.green);

    // Show session statistics
    logSubSection('Session Statistics:');
    const user1Info = client.getSessionInfo(user1Session);
    const user2Info = client.getSessionInfo(user2Session);
    
    if (user1Info && user2Info) {
      console.log('\nUser 1:');
      console.log({
        session_id: user1Info.sessionId,
        message_count: user1Info.messageCount,
        frequently_accessed_stocks: user1Info.frequentlyAccessedStocks
      });
      
      console.log('\nUser 2:');
      console.log({
        session_id: user2Info.sessionId,
        message_count: user2Info.messageCount,
        frequently_accessed_stocks: user2Info.frequentlyAccessedStocks
      });
    }
  } catch (error) {
    log(`Error: ${error.message}`, colors.red);
  }
}

/**
 * Demo 6: Context Summarization
 */
async function demo6_ContextSummarization() {
  logSection('Demo 6: Context Summarization (Long Conversation)');
  
  const client = new MCPClient({
    enableMemory: true,
    enableContextSummarization: true,
    enableDebugLogging: false,
    memoryConfig: {
      contextWindowConfig: {
        maxTokens: 4000, // Small window to trigger summarization
        summarizationThreshold: 0.7
      }
    }
  });

  const sessionId = 'summarization-demo-' + Date.now();

  try {
    const queries = [
      'Tell me about RELIANCE stock',
      'What is its current price?',
      'Show me its technical indicators',
      'What about TCS stock?',
      'Compare RELIANCE and TCS',
      'Which one is better for long-term investment?',
      'What are the risks?',
      'Tell me about HDFC Bank',
      'Should I diversify my portfolio?'
    ];

    for (let i = 0; i < queries.length; i++) {
      logSubSection(`Query ${i + 1}: ${queries[i]}`);
      
      const response = await client.processQuery({
        query: queries[i],
        sessionId,
        useMemory: true,
        includeContext: true,
        maxIterations: 2
      });

      log(response.response.substring(0, 150) + '...', colors.green);
      
      if (response.context_summarized) {
        log('\n⚠️  Context was summarized!', colors.yellow);
        console.log('Summary:', response.context_summary);
      }

      await sleep(500);
    }

    // Show final session stats
    logSubSection('Final Session Statistics:');
    const stats = await client.getContextStats(sessionId);
    console.log({
      message_count: stats.messageCount,
      total_tokens: stats.tokenCount.totalTokens,
      context_window_usage: `${stats.contextWindowUsage.toFixed(1)}%`,
      needs_summarization: stats.needsSummarization
    });

    // Show summarization history
    const summaryHistory = client.getSummarizationHistory(sessionId);
    if (summaryHistory.length > 0) {
      logSubSection('Summarization History:');
      console.log(`Total summarizations: ${summaryHistory.length}`);
    }
  } catch (error) {
    log(`Error: ${error.message}`, colors.red);
  }
}

/**
 * Demo 7: Available Tools and Configuration
 */
async function demo7_ToolsAndConfig() {
  logSection('Demo 7: Available Tools and Configuration');
  
  const client = new MCPClient({
    enableMemory: true,
    enableContextSummarization: true,
    enableDebugLogging: false
  });

  try {
    logSubSection('Client Configuration:');
    const config = client.getConfig();
    console.log({
      memory_enabled: client.isMemoryEnabled(),
      context_summarization_enabled: client.isContextSummarizationEnabled(),
      debug_logging: client.isDebugLoggingEnabled()
    });

    logSubSection('Available Tools:');
    const tools = client.getAvailableTools();
    console.log(`Total tools available: ${tools.length}\n`);
    
    tools.slice(0, 5).forEach((tool, index) => {
      console.log(`${index + 1}. ${tool.name}`);
      console.log(`   ${tool.description.substring(0, 80)}...`);
    });
    
    log(`\n... and ${tools.length - 5} more tools`, colors.dim);

    logSubSection('Context Window Configuration:');
    const contextConfig = client.getContextWindowConfig();
    console.log({
      max_tokens: contextConfig.maxTokens,
      summarization_threshold: `${(contextConfig.summarizationThreshold * 100).toFixed(0)}%`,
      reserved_tokens: contextConfig.reservedTokens,
      min_messages_to_summarize: contextConfig.minMessagesToSummarize
    });
  } catch (error) {
    log(`Error: ${error.message}`, colors.red);
  }
}

/**
 * Main function to run all demos
 */
async function runAllDemos() {
  log('\n' + '█'.repeat(80), colors.bright + colors.magenta);
  log('  MCP CLIENT DEMO - NSE India Stock Market Data', colors.bright + colors.magenta);
  log('█'.repeat(80) + '\n', colors.bright + colors.magenta);

  log('This demo will showcase various features of the MCP Client.', colors.cyan);
  log('Make sure you have set the OPENAI_API_KEY environment variable.\n', colors.yellow);

  // Check for OpenAI API key
  if (!process.env.OPENAI_API_KEY) {
    log('❌ Error: OPENAI_API_KEY environment variable is not set!', colors.red);
    log('Please set it using: export OPENAI_API_KEY=your-api-key', colors.yellow);
    process.exit(1);
  }

  try {
    // Run demos based on command line argument
    const demoNumber = process.argv[2];

    if (demoNumber) {
      const demoMap = {
        '1': demo1_BasicQuery,
        '2': demo2_SessionWithMemory,
        '3': demo3_TechnicalAnalysis,
        '4': demo4_InvestmentRecommendation,
        '5': demo5_MultiUserSessions,
        '6': demo6_ContextSummarization,
        '7': demo7_ToolsAndConfig
      };

      const demoFunc = demoMap[demoNumber];
      if (demoFunc) {
        await demoFunc();
      } else {
        log(`Invalid demo number: ${demoNumber}`, colors.red);
        log('Available demos: 1-7', colors.yellow);
      }
    } else {
      // Run all demos
      await demo1_BasicQuery();
      await sleep(2000);
      
      await demo2_SessionWithMemory();
      await sleep(2000);
      
      await demo3_TechnicalAnalysis();
      await sleep(2000);
      
      await demo4_InvestmentRecommendation();
      await sleep(2000);
      
      await demo5_MultiUserSessions();
      await sleep(2000);
      
      await demo6_ContextSummarization();
      await sleep(2000);
      
      await demo7_ToolsAndConfig();
    }

    log('\n' + '█'.repeat(80), colors.bright + colors.green);
    log('  ✓ Demo completed successfully!', colors.bright + colors.green);
    log('█'.repeat(80) + '\n', colors.bright + colors.green);

    log('Usage:', colors.cyan);
    log('  Run all demos:        node demo/mcp-client-demo.js', colors.dim);
    log('  Run specific demo:    node demo/mcp-client-demo.js <1-7>', colors.dim);
    log('  Or use npm:           npm run demo:mcp-client <1-7>', colors.dim);
    log('\nAvailable demos:', colors.cyan);
    log('  1. Basic Query with Memory and Summarization', colors.dim);
    log('  2. Session-based Conversation with Memory', colors.dim);
    log('  3. Technical Analysis Query with Memory', colors.dim);
    log('  4. Investment Recommendation Query with Memory', colors.dim);
    log('  5. Multi-user Sessions', colors.dim);
    log('  6. Context Summarization (Long Conversations)', colors.dim);
    log('  7. Available Tools and Configuration', colors.dim);
    log('\n💡 All demos use memory and context summarization features!', colors.yellow);
  } catch (error) {
    log('\n' + '█'.repeat(80), colors.bright + colors.red);
    log('  ✗ Demo failed!', colors.bright + colors.red);
    log('█'.repeat(80) + '\n', colors.bright + colors.red);
    log(`Error: ${error.message}`, colors.red);
    console.error(error);
    process.exit(1);
  }
}

// Run the demos
if (require.main === module) {
  runAllDemos().catch(error => {
    log(`Fatal error: ${error.message}`, colors.red);
    console.error(error);
    process.exit(1);
  });
}

module.exports = {
  demo1_BasicQuery,
  demo2_SessionWithMemory,
  demo3_TechnicalAnalysis,
  demo4_InvestmentRecommendation,
  demo5_MultiUserSessions,
  demo6_ContextSummarization,
  demo7_ToolsAndConfig
};

