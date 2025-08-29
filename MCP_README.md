# NSE India MCP Server

This is a Model Context Protocol (MCP) server that exposes all the functions from the NSE India stock market API library.

## What is MCP?

Model Context Protocol (MCP) is a standard for AI assistants to communicate with external data sources and tools. It allows AI models to access real-time stock market data from the National Stock Exchange of India.

## Architecture

The MCP server is built with a modular architecture for maintainability and consistency:

- **`src/mcp-tools.ts`**: Common tools configuration and handler functions shared across all server implementations
- **`src/mcp-server.ts`**: Stdio-based MCP server for local AI assistant integration
- **`src/mcp-server-tcp.ts`**: TCP-based MCP server for network-based communication
- **`src/mcp-server-http.ts`**: HTTP-based MCP server with REST API endpoints for web integration

All server implementations share the same tool definitions and business logic, ensuring consistency across different transport protocols and making maintenance easier.

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

### Index Data
- `get_equity_stock_indices` - Get equity stock indices for a specific index
- `get_index_intraday_data` - Get intraday data for a specific index
- `get_index_historical_data` - Get historical data for a specific index
- `get_index_option_chain` - Get option chain data for a specific index

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

#### TCP Server (Recommended for production)
```bash
# Start the TCP MCP server on port 3001
yarn start:mcp:tcp

# Test the TCP MCP server
yarn test:mcp:tcp

# Custom port (set environment variable)
MCP_PORT=3002 yarn start:mcp:tcp
```

#### HTTP Server (Best for web integration)
```bash
# Start the HTTP MCP server on port 3001
yarn start:mcp:http

# Custom port (set environment variable)
MCP_PORT=3002 yarn start:mcp:http
```

### Configuration

#### For stdio server (AI assistant integration):
```json
{
  "mcpServers": {
    "nse-india-stdio": {
      "command": "node",
      "args": ["build/mcp-server.js"],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

#### For TCP server (network access):
```json
{
  "mcpServers": {
    "nse-india-tcp": {
      "command": "node",
      "args": ["build/mcp-server-tcp.js"],
      "env": {
        "NODE_ENV": "production",
        "MCP_PORT": "3001"
      }
    }
  }
}
```

#### For HTTP server (web integration):
```json
{
  "mcpServers": {
    "nse-india-http": {
      "command": "node",
      "args": ["build/mcp-server-http.js"],
      "env": {
        "NODE_ENV": "production",
        "MCP_PORT": "3001"
      }
    }
  }
}
```

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

## Requirements

- Node.js >= 18
- TypeScript
- All dependencies listed in package.json

## License

MIT License - see LICENSE file for details

## Support

For issues and questions, please visit the [GitHub repository](https://github.com/hi-imcodeman/stock-nse-india).
