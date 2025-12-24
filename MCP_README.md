# NSE India MCP Server

This is a Model Context Protocol (MCP) server that exposes all the functions from the NSE India stock market API library.

## What is MCP?

Model Context Protocol (MCP) is a standard for AI assistants to communicate with external data sources and tools. It allows AI models to access real-time stock market data from the National Stock Exchange of India.

## Architecture

The MCP server is built with a modular architecture for maintainability and consistency:

- **`src/mcp/mcp-tools.ts`**: Common tools configuration and handler functions
- **`src/mcp/server/mcp-server.ts`**: Stdio-based MCP server for local AI assistant integration
- **`src/mcp/client/mcp-client.ts`**: OpenAI Functions-based MCP client for natural language queries

All components share the same tool definitions and business logic, ensuring consistency and making maintenance easier.

## Benefits of Common Tools Configuration

- **🔄 Consistency**: All server implementations use identical tool definitions and behavior
- **🛠️ Maintainability**: Single source of truth for tool configurations and business logic
- **📝 Easy Updates**: Add new tools or modify existing ones in one place
- **🧪 Testing**: Unified testing approach across all server implementations
- **📚 Documentation**: Centralized tool documentation and examples

## Available Tools

The MCP server provides the following tools:

### Equity Data
- `get_all_stock_symbols` - Get list of all NSE equity symbols
- `get_equity_details` - Get equity details for a specific symbol
- `get_equity_trade_info` - Get equity trade information for a specific symbol
- `get_equity_corporate_info` - Get corporate information for a specific equity symbol
- `get_equity_intraday_data` - Get intraday data for a specific equity symbol
- `get_equity_historical_data` - Get historical data for a specific equity symbol
- `get_equity_series` - Get series data for a specific equity symbol
- `get_equity_option_chain` - Get option chain data for a specific equity symbol
- `get_equity_technical_indicators` - Get technical indicators (RSI, MACD, Bollinger Bands, etc.) for a specific equity symbol

### Index Data
- `get_equity_stock_indices` - Get equity stock indices for a specific index
- `get_index_intraday_data` - Get intraday data for a specific index
- `get_index_option_chain` - Get option chain data for a specific index
- `get_index_option_chain_contract_info` - Get option chain contract information (expiry dates and strike prices) for a specific index

### Market Data
- `get_market_status` - Get current market status
- `get_market_turnover` - Get market turnover data
- `get_pre_open_market_data` - Get pre-open market data
- `get_all_indices` - Get list of all indices
- `get_index_names` - Get list of index names

### Reports and Information
- `get_glossary` - Get NSE glossary content
- `get_trading_holidays` - Get list of trading holidays
- `get_clearing_holidays` - Get list of clearing holidays
- `get_circulars` - Get list of circulars
- `get_latest_circulars` - Get list of latest circulars
- `get_equity_master` - Get equity master data with categorized indices
- `get_merged_daily_reports_capital` - Get merged daily reports for capital market
- `get_merged_daily_reports_derivatives` - Get merged daily reports for derivatives
- `get_merged_daily_reports_debt` - Get merged daily reports for debt market

### Commodity Data
- `get_commodity_option_chain` - Get option chain data for a specific commodity symbol

### Analysis Tools
- `get_gainers_and_losers_by_index` - Get top gainers and losers for a specific index
- `get_most_active_equities` - Get most actively traded equities for a specific index, sorted by volume and value

## Installation

1. Install dependencies:
```bash
yarn install
```

2. Build the project:
```bash
yarn build
```

## Usage

### Starting the MCP Server

#### Standard I/O (stdio) Server
```bash
# Start the stdio MCP server
yarn start:mcp

# Test the stdio MCP server
yarn test:mcp
```

### Configuration

#### Option 1: Using npx (Recommended for users who have installed the package)

This is the easiest way to use the MCP server without cloning the repository.

**Installation Steps:**

1. **Prerequisites**: Ensure Node.js 18+ is installed on your system
   ```bash
   node --version  # Should be v18.0.0 or higher
   ```

2. **Install the package** (optional but recommended for faster startup):
   ```bash
   npm install -g stock-nse-india
   ```
   
   **Note**: If you don't install globally, `npx` will automatically download and cache the package on first use. The first run may take a few moments to download the package, but subsequent runs will be faster.

**Configuration:**
```json
{
  "mcpServers": {
    "npx-stock-nse-india": {
      "command": "npx",
      "args": ["stock-nse-india", "mcp"],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

#### Option 2: Using local build (For developers with source code)

If you have cloned the repository and built the project locally:

```json
{
  "mcpServers": {
    "nse-india-stdio": {
      "command": "node",
      "args": ["build/mcp/server/mcp-server-stdio.js"],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

**Prerequisites:**
- Node.js 18+ installed
- Repository cloned and dependencies installed (`npm install`)
- Project built (`npm run build`)

#### Configuring in Cursor IDE

1. **Open Cursor Settings**: 
   - Press `Cmd+,` (Mac) or `Ctrl+,` (Windows/Linux) to open settings
   - Or go to `File → Preferences → Settings`

2. **Navigate to MCP Settings**: 
   - Search for "MCP" or "Model Context Protocol" in settings
   - Go to `Settings → Features → Model Context Protocol`

3. **Add Server Configuration**: 
   - Click "Edit in settings.json" or find the MCP configuration section
   - Add one of the configurations above (Option 1 is recommended for most users)
   - Save the configuration file

4. **Restart Cursor**: 
   - Close and reopen Cursor IDE to load the MCP server
   - The server should appear in the MCP status indicator

**Configuration File Location:**
- **Mac/Linux**: `~/.cursor/mcp.json` or workspace-specific settings
- **Windows**: `%APPDATA%\Cursor\mcp.json` or workspace-specific settings

**Verification:**
After configuration and restart, you should see the MCP server active in Cursor's status bar. You can then use natural language queries in Cursor's chat to access NSE India stock market data, such as:
- "What is the current price of TCS?"
- "Show me the top gainers in NIFTY 50"
- "Get technical indicators for RELIANCE"

### Example Tool Calls

#### Get all stock symbols
```json
{
  "name": "get_all_stock_symbols",
  "arguments": {}
}
```

#### Get equity details for TCS
```json
{
  "name": "get_equity_details",
  "arguments": {
    "symbol": "TCS"
  }
}
```

#### Get historical data for RELIANCE
```json
{
  "name": "get_equity_historical_data",
  "arguments": {
    "symbol": "RELIANCE",
    "start_date": "2024-01-01",
    "end_date": "2024-01-31"
  }
}
```

#### Get technical indicators for TCS
```json
{
  "name": "get_equity_technical_indicators",
  "arguments": {
    "symbol": "TCS",
    "period": 200,
    "sma_periods": [5, 10, 20, 50],
    "ema_periods": [5, 10, 20, 50],
    "rsi_period": 14,
    "show_only_latest": true
  }
}
```

#### Get gainers and losers for NIFTY 50
```json
{
  "name": "get_gainers_and_losers_by_index",
  "arguments": {
    "index_symbol": "NIFTY 50"
  }
}
```

#### Get market status
```json
{
  "name": "get_market_status",
  "arguments": {}
}
```

## Features

- **Real-time Data**: Access live stock market data from NSE India
- **Comprehensive Coverage**: All major NSE functions are exposed as MCP tools
- **Error Handling**: Robust error handling with meaningful error messages
- **Type Safety**: Full TypeScript support with proper type definitions
- **Rate Limiting**: Built-in connection limiting to prevent API abuse
- **Context Summarization**: Intelligent conversation history management with configurable thresholds

## MCP Client with Context Summarization

The MCP Client (`MCPClient`) provides an OpenAI Functions-based interface for natural language queries with intelligent context management.

### Basic Usage

```typescript
import { MCPClient } from 'stock-nse-india'

const client = new MCPClient({
  enableMemory: true,
  enableContextSummarization: true,
  memoryConfig: {
    contextWindowConfig: {
      maxTokens: 8000,
      reservedTokens: 2000,
      summarizationThreshold: 0.9,  // Trigger at 90%
      minMessagesToSummarize: 6
    }
  }
})

// Process a natural language query
const result = await client.processQuery({
  query: "What is the current price of TCS?",
  sessionId: "user123",
  maxIterations: 5
})
```

### Context Summarization Configuration

The context summarization system automatically manages conversation history to stay within token limits while preserving important information.

#### Key Configuration Parameters

##### `summarizationThreshold`

Controls when summarization is triggered as a percentage of `maxTokens`.

**Recommended Values:**

| Threshold | Use Case | Behavior |
|-----------|----------|----------|
| **0.9 (90%)** | **Recommended** | Less frequent summarization, more context preserved |
| 0.8 (80%) | Balanced | Moderate summarization frequency |
| 0.7 (70%) | Conservative | More frequent summarization |
| 0.6 (60%) | Aggressive | Very frequent summarization |

##### `maxTokens`

Maximum token limit for the context window.

**Common Values:**
- `8000` - Standard (GPT-4, GPT-3.5)
- `16000` - Extended context models
- `32000` - Large context models
- `128000` - Very large context models (GPT-4 Turbo)

##### `reservedTokens`

Tokens reserved for system prompt and response generation.

**Guidelines:**
- Typical: `2000-3000` tokens
- Includes system prompt (~500-1000 tokens)
- Includes response buffer (~1000-2000 tokens)

##### `minMessagesToSummarize`

Minimum number of messages before summarization can occur.

**Guidelines:**
- Minimum: `4` (2 conversation pairs)
- Recommended: `6-10` (3-5 pairs)
- Prevents premature summarization

#### Configuration Examples

**Example 1: Recommended (Balanced)**

```typescript
const client = new MCPClient({
  enableMemory: true,
  enableContextSummarization: true,
  memoryConfig: {
    contextWindowConfig: {
      maxTokens: 8000,
      reservedTokens: 2000,
      summarizationThreshold: 0.9,  // 90% - less frequent
      minMessagesToSummarize: 6
    }
  }
})
```

**Expected Behavior:**
- Summarization triggers at ~7200 tokens (90%)
- 2-3 summarizations per 20 queries
- More context preserved per query
- Lower API costs

**Example 2: Conservative (Frequent Summarization)**

```typescript
const client = new MCPClient({
  enableMemory: true,
  enableContextSummarization: true,
  memoryConfig: {
    contextWindowConfig: {
      maxTokens: 8000,
      reservedTokens: 2000,
      summarizationThreshold: 0.6,  // 60% - more frequent
      minMessagesToSummarize: 6
    }
  }
})
```

**Expected Behavior:**
- Summarization triggers at ~4800 tokens (60%)
- 4-6 summarizations per 20 queries
- Less context per query
- Higher API costs but safer

**Example 3: Large Context Model**

```typescript
const client = new MCPClient({
  enableMemory: true,
  enableContextSummarization: true,
  memoryConfig: {
    contextWindowConfig: {
      maxTokens: 128000,              // GPT-4 Turbo
      reservedTokens: 4000,
      summarizationThreshold: 0.95,   // 95% - very rare
      minMessagesToSummarize: 20
    }
  }
})
```

**Expected Behavior:**
- Summarization triggers at ~121,600 tokens (95%)
- Very rare summarization
- Preserves entire conversation history
- Higher token costs per query

#### How It Works

**1. Token Counting**

The system estimates tokens for all messages:
```
totalTokens = systemPromptTokens + messageTokens + reservedTokens
```

**2. Threshold Check**

Summarization triggers when:
```
totalTokens > (maxTokens × summarizationThreshold)
AND
messageCount >= minMessagesToSummarize
```

**3. Summarization Process**

When triggered:
1. Keeps recent messages (targets 40% of maxTokens)
2. Summarizes older messages using AI
3. Replaces old messages with summary
4. Continues conversation with reduced context

**4. Result**

After summarization:
- Token usage drops to ~40% of maxTokens
- Recent messages preserved
- Important information in summary
- Ready for more conversation

#### Monitoring

Track these metrics to tune your configuration:

```typescript
// Get context statistics
const stats = await client.memoryManager.getContextStats(sessionId)

console.log('Message Count:', stats.messageCount)
console.log('Token Count:', stats.tokenCount.totalTokens)
console.log('Needs Summarization:', stats.needsSummarization)
console.log('Context Usage:', stats.contextWindowUsage + '%')

// Get summarization history
const history = client.getSummarizationHistory(sessionId)
console.log('Total Summarizations:', history.length)
```

#### Tuning Guidelines

**Choose Higher Threshold (0.8-0.9) When:**
- ✅ You want to preserve more context
- ✅ Cost is not a primary concern
- ✅ Conversations are complex and interconnected
- ✅ You have a larger context window available

**Choose Lower Threshold (0.6-0.7) When:**
- ✅ You want to minimize token costs
- ✅ Conversations are independent queries
- ✅ You have a smaller context window
- ✅ You want guaranteed headroom

#### Best Practices

1. **Start with 0.9 threshold** - Less intrusive, good for most use cases
2. **Monitor token usage** - Adjust based on actual patterns
3. **Consider your use case** - Independent queries vs. long conversations
4. **Test with real data** - Use the demo to see behavior
5. **Balance cost vs. context** - Higher threshold = more tokens but better context

#### Troubleshooting

**Too Many Summarizations**
- **Increase** `summarizationThreshold` (0.6 → 0.9)
- **Increase** `minMessagesToSummarize`

**Token Overflow**
- **Decrease** `summarizationThreshold` (0.9 → 0.7)
- **Increase** `reservedTokens`

**Context Loss**
- **Increase** `summarizationThreshold`
- **Increase** `maxTokens` (if model supports it)

**High API Costs**
- **Increase** `summarizationThreshold` (fewer summarizations)
- Consider caching or simpler summarization

## Requirements

- Node.js >= 18
- TypeScript
- OpenAI API key (for MCP Client with context summarization)
- All dependencies listed in package.json

## License

MIT License - see LICENSE file for details

## Support

For issues and questions, please visit the [GitHub repository](https://github.com/hi-imcodeman/stock-nse-india).
