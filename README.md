
[![NPM](https://nodei.co/npm/stock-nse-india.png)](https://nodei.co/npm/stock-nse-india/)

# National Stock Exchange - India (Unofficial)

![](https://github.com/hi-imcodeman/stock-nse-india/workflows/CI/badge.svg) ![npm](https://img.shields.io/npm/dt/stock-nse-india) ![NPM](https://img.shields.io/npm/l/stock-nse-india) ![GitHub Release Date - Published_At](https://img.shields.io/npm/v/stock-nse-india) ![GitHub top language](https://img.shields.io/github/languages/top/hi-imcodeman/stock-nse-india)

A comprehensive package and API server for accessing equity/index details and historical data from the National Stock Exchange of India. This project provides both an NPM package for direct integration and a full-featured GraphQL/REST API server.

**📚 [Documentation](https://hi-imcodeman.github.io/stock-nse-india)** | **🚀 [Examples](https://github.com/hi-imcodeman/stock-nse-india/tree/master/examples)**

## ✨ Features

- **📦 NPM Package** - Direct integration into your Node.js projects
- **🔌 GraphQL API** - Modern GraphQL interface with Apollo Server
- **🌐 REST API** - Comprehensive REST endpoints with Swagger documentation
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
- **`getIndexHistoricalData(index, range)`** - Index historical data
- **`getIndexIntradayData(index)`** - Index intraday data
- **`getIndexOptionChain(index)`** - Index options data

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
