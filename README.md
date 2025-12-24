
[![NPM](https://nodei.co/npm/stock-nse-india.png)](https://nodei.co/npm/stock-nse-india/)

# National Stock Exchange - India (Unofficial)

![](https://github.com/hi-imcodeman/stock-nse-india/workflows/CI/badge.svg) ![npm](https://img.shields.io/npm/dt/stock-nse-india) ![NPM](https://img.shields.io/npm/l/stock-nse-india) ![GitHub Release Date - Published_At](https://img.shields.io/npm/v/stock-nse-india) ![GitHub top language](https://img.shields.io/github/languages/top/hi-imcodeman/stock-nse-india)

A comprehensive package and API server for accessing equity/index details and historical data from the National Stock Exchange of India. This project provides both an NPM package for direct integration and a full-featured GraphQL/REST API server.

**📚 [Documentation](https://hi-imcodeman.github.io/stock-nse-india)** | **🚀 [Examples](https://github.com/hi-imcodeman/stock-nse-india/tree/master/examples)**

## ✨ Features

- **📦 NPM Package** - Direct integration into your Node.js projects
- **🔌 GraphQL API** - Modern GraphQL interface with Apollo Server
- **🌐 REST API** - Comprehensive REST endpoints with Swagger documentation
- **🤖 MCP Server** - Model Context Protocol server for AI assistants
- **💻 CLI Tool** - Command-line interface for quick data access
- **🐳 Docker Support** - Containerized deployment
- **🔒 CORS Configuration** - Configurable cross-origin resource sharing
- **📊 Real-time Data** - Live market data and historical information
- **📈 Multiple Data Types** - Equity, Index, Commodity, and Options data

## 🚀 Quick Start

**⚠️ Prerequisites:** Node.js 18+ required

### As an NPM Package

```bash
npm install stock-nse-india
```

```javascript
import { NseIndia } from "stock-nse-india";

const nseIndia = new NseIndia();

// Get all stock symbols
const symbols = await nseIndia.getAllStockSymbols();
console.log(symbols);

// Get equity details
const details = await nseIndia.getEquityDetails('IRCTC');
console.log(details);

// Get historical data
const range = {
    start: new Date("2020-01-01"),
    end: new Date("2023-12-31")
};
const historicalData = await nseIndia.getEquityHistoricalData('IRCTC', range);
console.log(historicalData);
```

### As an API Server

```bash
# Clone and setup
git clone https://github.com/hi-imcodeman/stock-nse-india.git
cd stock-nse-india
npm install

# Start the server
npm start
```

**🌐 Server URLs:**
- **Main App:** http://localhost:3000
- **GraphQL Playground:** http://localhost:3000/graphql
- **API Documentation:** http://localhost:3000/api-docs

## 📦 Installation

### Prerequisites

- **Node.js:** Version 18 or higher
- **npm:** Version 8 or higher (comes with Node.js 18+)

### NPM Package
```bash
npm install stock-nse-india
# or
yarn add stock-nse-india
```

### CLI Tool
```bash
npm install -g stock-nse-india
```

### Server Setup
```bash
git clone https://github.com/hi-imcodeman/stock-nse-india.git
cd stock-nse-india
npm install
npm start
```

## 🔌 GraphQL API

The project now includes a powerful GraphQL API for flexible data querying:

### Example Queries

```graphql
# Get equity information
query GetEquity {
  equities(symbolFilter: { symbols: ["IRCTC", "RELIANCE"] }) {
    symbol
    details {
      info {
        companyName
        industry
        isFNOSec
      }
      metadata {
        listingDate
        status
      }
    }
  }
}

# Get indices data
query GetIndices {
  indices(filter: { filterBy: "NIFTY" }) {
    key
    index
    last
    variation
    percentChange
  }
}
```

### GraphQL Schema

The API includes schemas for:
- **Equity** - Stock information, metadata, and details
- **Indices** - Market index data and performance
- **Filters** - Flexible query filtering options

## 🤖 MCP Server

The project includes a Model Context Protocol (MCP) server that allows AI assistants to access NSE India stock market data:

### What is MCP?

Model Context Protocol (MCP) is a standard for AI assistants to communicate with external data sources and tools. This MCP server exposes all NSE India functions as tools that AI models can use.

### Architecture

The MCP implementation is built with a modular architecture for maintainability and consistency:

- **`src/mcp/mcp-tools.ts`**: Common tools configuration and handler functions shared across all implementations
- **`src/mcp/server/mcp-server.ts`**: Stdio-based MCP server for local AI assistant integration
- **`src/mcp/client/mcp-client.ts`**: OpenAI Functions-based MCP client for natural language queries

All components share the same tool definitions and business logic, ensuring consistency and making maintenance easier.

### Benefits of Common Tools Configuration

- **🔄 Consistency**: All server implementations use identical tool definitions and behavior
- **🛠️ Maintainability**: Single source of truth for tool configurations and business logic
- **📝 Easy Updates**: Add new tools or modify existing ones in one place
- **🧪 Testing**: Unified testing approach across all server implementations
- **📚 Documentation**: Centralized tool documentation and examples

### Available Tools

The MCP server provides **30 tools** covering:
- **Equity Data** - Stock details, trade info, corporate info, intraday data, historical data, technical indicators
- **Index Data** - Market indices, intraday data, option chains, contract information
- **Market Data** - Market status, turnover, pre-open data, all indices
- **Reports** - Circulars, daily reports for capital/derivatives/debt markets
- **Commodity Data** - Option chain data for commodities
- **Analysis Tools** - Top gainers/losers, most active equities

### OpenAI Functions MCP Client

The project includes an advanced MCP client that uses OpenAI's native function calling feature for intelligent query processing:

#### Features
- **🤖 Natural Language Processing**: Query data using plain English
- **🔧 Automatic Tool Selection**: AI intelligently chooses the right NSE API tools
- **📊 Real-time Data**: Access live market data, historical information, and more
- **🎯 Smart Parameter Extraction**: Automatically extracts symbols, dates, and other parameters
- **📈 Comprehensive Coverage**: Access to all 30 NSE India API endpoints
- **🔄 Multiple Query Types**: Support for both simple and complex multi-step queries

#### Query Methods
- **`processQuery()`**: Single-round query processing for straightforward requests
- **`processQueryWithMultipleFunctions()`**: Multi-step query processing for complex analysis

#### Example Usage
```javascript
import { mcpClient } from './mcp/client/mcp-client'

// Simple query
const response = await mcpClient.processQuery({
  query: "What is the current price of TCS stock?",
  model: "gpt-4o-mini"
})

// Complex multi-step query
const complexResponse = await mcpClient.processQueryWithMemory({
  query: "Compare the performance of Reliance and TCS over the last month and analyze their trends"
})
```

### Usage

#### Standard I/O (stdio) Server
```bash
# Start the stdio MCP server
npm run start:mcp

# Test the stdio MCP server
npm run test:mcp
```

### Configuration

#### Option 1: Using npx (Recommended for users who have installed the package)

**Installation Steps:**

1. **Prerequisites**: Ensure Node.js 18+ is installed on your system
   ```bash
   node --version  # Should be v18.0.0 or higher
   ```

2. **Install the package** (optional but recommended for faster startup):
   ```bash
   npm install -g stock-nse-india
   ```
   
   **Note**: If you don't install globally, `npx` will automatically download and cache the package on first use, which may take a few moments.

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

#### Configuring in Cursor IDE

1. **Open Cursor Settings**: Press `Cmd+,` (Mac) or `Ctrl+,` (Windows/Linux) to open settings
2. **Navigate to MCP Settings**: Go to Settings → Features → Model Context Protocol
3. **Add Server Configuration**: Add either of the configurations above to your MCP settings
4. **Restart Cursor**: Restart Cursor IDE to load the MCP server

Alternatively, you can directly edit the Cursor configuration file:
- **Mac/Linux**: `~/.cursor/mcp.json` or in your workspace settings
- **Windows**: `%APPDATA%\Cursor\mcp.json`

After configuration, the MCP server will be available in Cursor's AI assistant, allowing you to query NSE India stock market data directly from the chat interface.

For detailed MCP documentation, see [MCP_README.md](./MCP_README.md).

## 🌐 REST API

Comprehensive REST endpoints with automatic Swagger documentation:

### Core Endpoints

- `GET /` - Market status
- `GET /api/marketStatus` - Market status information
- `GET /api/glossary` - NSE glossary
- `GET /api/equity/:symbol` - Equity details
- `GET /api/equity/:symbol/historical` - Historical data
- `GET /api/indices` - Market indices
- `GET /api-docs` - Interactive API documentation

### MCP Client Endpoints

- `POST /api/mcp/query` - Natural language query using OpenAI Functions
- `POST /api/mcp/query-multiple` - Multi-step natural language queries

### API Documentation

Visit `http://localhost:3000/api-docs` for complete interactive API documentation powered by Swagger UI.

## 💻 CLI Usage

### Basic Commands

```bash
# Get help
nseindia --help

# Get market status
nseindia

# Get equity details
nseindia equity IRCTC

# Get historical data
nseindia historical IRCTC

# Get indices information
nseindia index

# Get specific index details
nseindia index "NIFTY AUTO"
```

### CLI Features

- **Real-time data** - Live market information
- **Historical analysis** - Historical price data
- **Index tracking** - Market index performance
- **Interactive charts** - ASCII-based data visualization

## 🐳 Docker

### Quick Start

```bash
# Pull and run from Docker Hub
docker run --rm -d -p 3001:3001 imcodeman/nseindia

# Or build locally
docker build -t nseindia . && docker run --rm -d -p 3001:3001 nseindia:latest
```

### Docker Hub

**Image:** `imcodeman/nseindia`  
**Registry:** [Docker Hub](https://hub.docker.com/r/imcodeman/nseindia)

### Container URLs

- **Main App:** http://localhost:3001
- **GraphQL:** http://localhost:3001/graphql
- **API Docs:** http://localhost:3001/api-docs

## ⚙️ Configuration

### Environment Variables

```bash
# Server Configuration
PORT=3000
HOST_URL=http://localhost:3000
NODE_ENV=development

# CORS Configuration
CORS_ORIGINS=https://myapp.com,https://admin.myapp.com
CORS_METHODS=GET,POST,OPTIONS
CORS_HEADERS=Content-Type,Authorization,X-Requested-With
CORS_CREDENTIALS=true
```

### CORS Settings

- **Origins:** Comma-separated list of allowed domains
- **Methods:** HTTP methods (default: GET,POST,PUT,DELETE,OPTIONS)
- **Headers:** Allowed request headers
- **Credentials:** Enable/disable credentials (default: true)
- **Localhost:** Always allowed for development

## 📊 API Methods

### Core Methods

- **`getAllStockSymbols()`** - Get all NSE stock symbols
- **`getData()`** - Generic data retrieval
- **`getDataByEndpoint()`** - Get data by specific NSE API endpoints

### Equity Methods

- **`getEquityDetails(symbol)`** - Get equity information
- **`getEquityHistoricalData(symbol, range)`** - Historical price data
- **`getEquityIntradayData(symbol)`** - Intraday trading data
- **`getEquityOptionChain(symbol)`** - Options chain data
- **`getEquityCorporateInfo(symbol)`** - Corporate information
- **`getEquityTradeInfo(symbol)`** - Trading statistics

### Index Methods

- **`getEquityStockIndices()`** - Get all market indices
- **`getIndexIntradayData(index)`** - Index intraday data
- **`getIndexOptionChain(index)`** - Index options data
- **`getIndexOptionChainContractInfo(indexSymbol)`** - Get option chain contract information (expiry dates and strike prices)

### Commodity Methods

- **`getCommodityOptionChain(symbol)`** - Commodity options data

### Helper Methods

- **`getGainersAndLosersByIndex(index)`** - Top gainers and losers
- **`getMostActiveEquities()`** - Most actively traded stocks

## 🏃‍♂️ Development

**⚠️ Prerequisites:** Node.js 18+ required

### Local Development

```bash
# Clone repository
git clone https://github.com/hi-imcodeman/stock-nse-india.git
cd stock-nse-india

# Install dependencies
npm install

# Development mode with auto-reload
npm run start:dev

# Build project
npm run build

# Run tests
npm test

# Generate documentation
npm run docs
```

### Development Scripts

- **`npm start`** - Start production server
- **`npm run start:dev`** - Development mode with auto-reload
- **`npm run build`** - Build TypeScript to JavaScript
- **`npm test`** - Run test suite with coverage
- **`npm run docs`** - Generate TypeDoc documentation
- **`npm run lint`** - Run ESLint

### MCP Scripts

- **`npm run start:mcp`** - Start stdio MCP server
- **`npm run test:mcp`** - Test stdio MCP server

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- utils.spec.ts
```

## 📚 Documentation

- **📖 [API Reference](https://hi-imcodeman.github.io/stock-nse-india)** - Complete API documentation
- **🔍 [Examples](https://github.com/hi-imcodeman/stock-nse-india/tree/master/examples)** - Code examples and use cases
- **📋 [Interfaces](https://hi-imcodeman.github.io/stock-nse-india/interfaces/)** - TypeScript interface definitions
- **🏗️ [Modules](https://hi-imcodeman.github.io/stock-nse-india/modules/)** - Module documentation

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines and feel free to submit issues and pull requests.

### Development Setup

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Contributors

<a href="https://github.com/hi-imcodeman/stock-nse-india/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=hi-imcodeman/stock-nse-india" />
</a>

## 🔗 Links

- **🌐 Website:** [https://hi-imcodeman.github.io/stock-nse-india](https://hi-imcodeman.github.io/stock-nse-india)
- **📦 NPM:** [https://www.npmjs.com/package/stock-nse-india](https://www.npmjs.com/package/stock-nse-india)
- **🐳 Docker Hub:** [https://hub.docker.com/r/imcodeman/nseindia](https://hub.docker.com/r/imcodeman/nseindia)
- **🐛 Issues:** [https://github.com/hi-imcodeman/stock-nse-india/issues](https://github.com/hi-imcodeman/stock-nse-india/issues)

---

**⭐ Star this repository if you find it helpful!**
