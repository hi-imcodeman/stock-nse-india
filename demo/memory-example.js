/**
 * Memory and Summarization Example
 * 
 * This example demonstrates the power of memory and context summarization
 * in maintaining context across multiple queries in a conversation.
 */

const { MCPClient } = require('../build/mcp/client/mcp-client.js');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  magenta: '\x1b[35m',
  dim: '\x1b[2m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runMemoryExample() {
  log('\n' + '='.repeat(80), colors.bright + colors.cyan);
  log('Memory and Context Summarization Example', colors.bright + colors.cyan);
  log('='.repeat(80) + '\n', colors.bright + colors.cyan);

  // Create client with memory and summarization enabled
  const client = new MCPClient({
    enableMemory: true,
    enableContextSummarization: true,
    enableDebugLogging: false,
    memoryConfig: {
      maxConversationHistory: 30,
      contextWindowConfig: {
        maxTokens: 6000,  // Smaller window to demonstrate summarization
        summarizationThreshold: 0.7  // Trigger at 70% capacity
      }
    }
  });

  const sessionId = 'memory-example-' + Date.now();
  
  log(`Session ID: ${sessionId}`, colors.dim);
  log('', colors.reset);

  try {
    // Conversation demonstrating memory and context awareness
    const conversation = [
      {
        query: 'Tell me about RELIANCE stock',
        description: 'Initial query about RELIANCE'
      },
      {
        query: 'What is its current price?',
        description: 'Follow-up using context (refers to RELIANCE)'
      },
      {
        query: 'Show me its technical indicators',
        description: 'Another follow-up (still about RELIANCE)'
      },
      {
        query: 'Now tell me about TCS',
        description: 'New topic - TCS stock'
      },
      {
        query: 'Compare it with RELIANCE',
        description: 'Comparison using both stocks from context'
      },
      {
        query: 'Which one has better RSI?',
        description: 'Technical comparison using context'
      },
      {
        query: 'What about HDFC Bank?',
        description: 'Adding another stock to context'
      },
      {
        query: 'Which of the three stocks I asked about is best for long-term investment?',
        description: 'Complex query requiring full conversation context'
      }
    ];

    for (let i = 0; i < conversation.length; i++) {
      const { query, description } = conversation[i];
      
      log(`\n${'─'.repeat(80)}`, colors.dim);
      log(`Query ${i + 1}/${conversation.length}: ${description}`, colors.bright + colors.yellow);
      log(`${'─'.repeat(80)}`, colors.dim);
      log(`\n"${query}"`, colors.cyan);
      
      const response = await client.processQuery({
        query,
        sessionId,
        useMemory: true,
        includeContext: true,
        updatePreferences: true,
        maxIterations: 3
      });

      log(`\n${colors.green}Response:${colors.reset}`);
      log(response.response.substring(0, 300) + '...', colors.green);

      // Show memory features in action
      log(`\n${colors.magenta}Memory Info:${colors.reset}`);
      console.log({
        conversation_length: response.conversation_length,
        context_used: response.context_used,
        preferences_updated: response.user_preferences_updated,
        tools_used: response.tools_used
      });

      // Show context window usage after each query
      try {
        const contextStats = await client.getContextStats(sessionId);
        const usagePercent = contextStats.contextWindowUsage.toFixed(1);
        const usageColor = contextStats.contextWindowUsage > 70 ? colors.yellow : colors.green;
        log(`\n📊 Context Window: ${usagePercent}% used (${contextStats.tokenCount.totalTokens} tokens)`, usageColor);
      } catch (error) {
        // Ignore errors in context stats
      }

      // Check if context was summarized
      if (response.context_summarized) {
        log(`\n${colors.yellow}⚠️  Context Summarization Triggered!${colors.reset}`, colors.yellow);
        log('The conversation history was automatically summarized to save tokens.', colors.yellow);
        if (response.context_summary) {
          log('\nSummary:', colors.dim);
          console.log(response.context_summary);
        }
      }

      await sleep(1000);
    }

    // Show final session statistics
    log('\n' + '='.repeat(80), colors.bright + colors.magenta);
    log('Final Session Statistics', colors.bright + colors.magenta);
    log('='.repeat(80) + '\n', colors.bright + colors.magenta);

    const sessionInfo = client.getSessionInfo(sessionId);
    
    if (sessionInfo) {
      log('Conversation Stats:', colors.cyan);
      console.log({
        session_id: sessionInfo.sessionId,
        user_id: sessionInfo.userId || 'anonymous',
        message_count: sessionInfo.messageCount,
        frequently_accessed_stocks: sessionInfo.frequentlyAccessedStocks,
        frequently_used_tools: sessionInfo.frequentlyUsedTools,
        session_duration: `${Math.round((Date.now() - new Date(sessionInfo.startTime).getTime()) / 1000)}s`
      });
    } else {
      log('Session info not available', colors.yellow);
    }

    // Get conversation history to show learned preferences
    const conversationHistory = client.getConversationHistory(sessionId);
    log('\nConversation Summary:', colors.cyan);
    console.log({
      total_messages: conversationHistory.length,
      user_messages: conversationHistory.filter(m => m.role === 'user').length,
      assistant_messages: conversationHistory.filter(m => m.role === 'assistant').length
    });

    // Show context statistics
    const contextStats = await client.getContextStats(sessionId);
    log('\nContext Window Usage:', colors.cyan);
    console.log({
      message_count: contextStats.messageCount,
      total_tokens: contextStats.tokenCount.totalTokens,
      system_prompt_tokens: contextStats.tokenCount.systemPromptTokens,
      estimated_response_tokens: contextStats.tokenCount.estimatedResponseTokens,
      window_usage: `${contextStats.contextWindowUsage.toFixed(1)}%`,
      needs_summarization: contextStats.needsSummarization
    });

    // Show summarization history if any
    const summaryHistory = client.getSummarizationHistory(sessionId);
    if (summaryHistory.length > 0) {
      log('\nSummarization History:', colors.cyan);
      console.log(`Total summarizations performed: ${summaryHistory.length}`);
      
      // Calculate total tokens saved
      const totalTokensSaved = summaryHistory.reduce((sum, s) => sum + (s.tokensSaved || 0), 0);
      log(`Total tokens saved: ${totalTokensSaved}`, colors.green);
      
      summaryHistory.forEach((record, index) => {
        console.log(`\n  Summarization ${index + 1}:`);
        console.log(`    Timestamp: ${new Date(record.timestamp).toLocaleString()}`);
        console.log(`    Original messages: ${record.originalMessageCount}`);
        console.log(`    After summarization: ${record.summarizedMessageCount}`);
        console.log(`    Tokens saved: ${record.tokensSaved}`);
        console.log(`    Trigger: ${record.triggerReason}`);
      });
    }

    log('\n' + '='.repeat(80), colors.bright + colors.green);
    log('✓ Memory Example Completed Successfully!', colors.bright + colors.green);
    log('='.repeat(80) + '\n', colors.bright + colors.green);

    log('Key Takeaways:', colors.cyan);
    log('  ✓ Context is maintained across queries', colors.green);
    log('  ✓ Follow-up questions work naturally', colors.green);
    log('  ✓ User preferences are learned automatically', colors.green);
    log('  ✓ Context is summarized when needed to save tokens', colors.green);
    log('  ✓ Session data persists throughout the conversation', colors.green);

  } catch (error) {
    log(`\n❌ Error: ${error.message}`, colors.bright);
    console.error(error);
    process.exit(1);
  }
}

// Check for OpenAI API key
if (!process.env.OPENAI_API_KEY) {
  log('❌ Error: OPENAI_API_KEY environment variable is not set!', colors.bright);
  log('Please set it using: export OPENAI_API_KEY=your-api-key', colors.yellow);
  process.exit(1);
}

// Run the example
runMemoryExample().catch(error => {
  log(`Fatal error: ${error.message}`, colors.bright);
  console.error(error);
  process.exit(1);
});

