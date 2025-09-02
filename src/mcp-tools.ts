import type { NseIndia } from './index.js'

// Common MCP tools configuration for NSE India servers
export const mcpTools = [
  {
    name: 'get_all_stock_symbols',
    description: 'Get list of all NSE equity symbols',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'get_equity_details',
    description: 'Get equity details for a specific symbol',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: 'Stock symbol (e.g., TCS, RELIANCE)',
        },
      },
      required: ['symbol'],
    },
  },
  {
    name: 'get_equity_trade_info',
    description: 'Get equity trade information for a specific symbol',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: 'Stock symbol (e.g., TCS, RELIANCE)',
        },
      },
      required: ['symbol'],
    },
  },
  {
    name: 'get_equity_corporate_info',
    description: 'Get corporate information for a specific equity symbol',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: 'Stock symbol (e.g., TCS, RELIANCE)',
        },
      },
      required: ['symbol'],
    },
  },
  {
    name: 'get_equity_intraday_data',
    description: 'Get intraday data for a specific equity symbol',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: 'Stock symbol (e.g., TCS, RELIANCE)',
        },
        is_pre_open_data: {
          type: 'boolean',
          description: 'Whether to get pre-open data (default: false)',
        },
      },
      required: ['symbol'],
    },
  },
  {
    name: 'get_equity_historical_data',
    description: 'Get historical data for a specific equity symbol',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: 'Stock symbol (e.g., TCS, RELIANCE)',
        },
        start_date: {
          type: 'string',
          description: 'Start date in YYYY-MM-DD format',
        },
        end_date: {
          type: 'string',
          description: 'End date in YYYY-MM-DD format',
        },
      },
      required: ['symbol'],
    },
  },
  {
    name: 'get_equity_series',
    description: 'Get series data for a specific equity symbol',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: 'Stock symbol (e.g., TCS, RELIANCE)',
        },
      },
      required: ['symbol'],
    },
  },
  {
    name: 'get_equity_stock_indices',
    description: 'Get equity stock indices for a specific index',
    inputSchema: {
      type: 'object',
      properties: {
        index: {
          type: 'string',
          description: 'Index name (e.g., NIFTY, BANKNIFTY)',
        },
      },
      required: ['index'],
    },
  },
  {
    name: 'get_index_intraday_data',
    description: 'Get intraday data for a specific index',
    inputSchema: {
      type: 'object',
      properties: {
        index: {
          type: 'string',
          description: 'Index name (e.g., NIFTY, BANKNIFTY)',
        },
        is_pre_open_data: {
          type: 'boolean',
          description: 'Whether to get pre-open data (default: false)',
        },
      },
      required: ['index'],
    },
  },
  {
    name: 'get_index_historical_data',
    description: 'Get historical data for a specific index',
    inputSchema: {
      type: 'object',
      properties: {
        index: {
          type: 'string',
          description: 'Index name (e.g., NIFTY, BANKNIFTY)',
        },
        start_date: {
          type: 'string',
          description: 'Start date in YYYY-MM-DD format',
        },
        end_date: {
          type: 'string',
          description: 'End date in YYYY-MM-DD format',
        },
      },
      required: ['index'],
    },
  },
  {
    name: 'get_index_option_chain',
    description: 'Get option chain data for a specific index',
    inputSchema: {
      type: 'object',
      properties: {
        index_symbol: {
          type: 'string',
          description: 'Index symbol (e.g., NIFTY, BANKNIFTY)',
        },
      },
      required: ['index_symbol'],
    },
  },
  {
    name: 'get_equity_option_chain',
    description: 'Get option chain data for a specific equity symbol',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: 'Stock symbol (e.g., TCS, RELIANCE)',
        },
      },
      required: ['symbol'],
    },
  },
  {
    name: 'get_commodity_option_chain',
    description: 'Get option chain data for a specific commodity symbol',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: 'Commodity symbol',
        },
      },
      required: ['symbol'],
    },
  },
  {
    name: 'get_glossary',
    description: 'Get NSE glossary content',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'get_trading_holidays',
    description: 'Get list of trading holidays',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'get_clearing_holidays',
    description: 'Get list of clearing holidays',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'get_market_status',
    description: 'Get current market status',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'get_market_turnover',
    description: 'Get market turnover data',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'get_all_indices',
    description: 'Get list of all indices',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'get_index_names',
    description: 'Get list of index names',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'get_circulars',
    description: 'Get list of circulars',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'get_latest_circulars',
    description: 'Get list of latest circulars',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'get_equity_master',
    description: 'Get equity master data with categorized indices',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'get_pre_open_market_data',
    description: 'Get pre-open market data',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'get_merged_daily_reports_capital',
    description: 'Get merged daily reports for capital market',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'get_merged_daily_reports_derivatives',
    description: 'Get merged daily reports for derivatives',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'get_merged_daily_reports_debt',
    description: 'Get merged daily reports for debt market',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
]

// Common tool call handler function
export async function handleMCPToolCall(
  nseClient: NseIndia,
  name: string,
  args: Record<string, unknown>
): Promise<unknown> {
  let result: unknown

  switch (name) {
          case 'get_all_stock_symbols': {
        result = await nseClient.getAllStockSymbols()
        break
      }

      case 'get_equity_details': {
        if (!args?.symbol || typeof args.symbol !== 'string') {
          throw new Error('Symbol parameter is required and must be a string')
        }
        result = await nseClient.getEquityDetails(args.symbol)
        break
      }

      case 'get_equity_trade_info': {
        if (!args?.symbol || typeof args.symbol !== 'string') {
          throw new Error('Symbol parameter is required and must be a string')
        }
        result = await nseClient.getEquityTradeInfo(args.symbol)
        break
      }

      case 'get_equity_corporate_info': {
        if (!args?.symbol || typeof args.symbol !== 'string') {
          throw new Error('Symbol parameter is required and must be a string')
        }
        result = await nseClient.getEquityCorporateInfo(args.symbol)
        break
      }

          case 'get_equity_intraday_data': {
        if (!args?.symbol || typeof args.symbol !== 'string') {
          throw new Error('Symbol parameter is required and must be a string')
        }
        const isPreOpenData = args.is_pre_open_data && 
          typeof args.is_pre_open_data === 'boolean' ? args.is_pre_open_data : false
        result = await nseClient.getEquityIntradayData(
          args.symbol,
          isPreOpenData
        )
        break
      }

          case 'get_equity_historical_data': {
        if (!args?.symbol || typeof args.symbol !== 'string') {
          throw new Error('Symbol parameter is required and must be a string')
        }
        const range = args.start_date && args.end_date && 
          typeof args.start_date === 'string' && typeof args.end_date === 'string'
          ? { start: new Date(args.start_date), end: new Date(args.end_date) }
          : undefined
        result = await nseClient.getEquityHistoricalData(args.symbol, range)
        break
      }

          case 'get_equity_series': {
        if (!args?.symbol || typeof args.symbol !== 'string') {
          throw new Error('Symbol parameter is required and must be a string')
        }
        result = await nseClient.getEquitySeries(args.symbol)
        break
      }

      case 'get_equity_stock_indices': {
        if (!args?.index || typeof args.index !== 'string') {
          throw new Error('Index parameter is required and must be a string')
        }
        result = await nseClient.getEquityStockIndices(args.index)
        break
      }

          case 'get_index_intraday_data': {
        if (!args?.index || typeof args.index !== 'string') {
          throw new Error('Index parameter is required and must be a string')
        }
        const isIndexPreOpenData = args.is_pre_open_data && 
          typeof args.is_pre_open_data === 'boolean' ? args.is_pre_open_data : false
        result = await nseClient.getIndexIntradayData(
          args.index,
          isIndexPreOpenData
        )
        break
      }

          case 'get_index_historical_data': {
        if (!args?.index || typeof args.index !== 'string') {
          throw new Error('Index parameter is required and must be a string')
        }
        if (!args.start_date || !args.end_date || 
          typeof args.start_date !== 'string' || typeof args.end_date !== 'string') {
          throw new Error('Start date and end date are required and must be strings')
        }
        const indexRange = { start: new Date(args.start_date), end: new Date(args.end_date) }
        result = await nseClient.getIndexHistoricalData(args.index, indexRange)
        break
      }

          case 'get_index_option_chain': {
        if (!args?.index_symbol || typeof args.index_symbol !== 'string') {
          throw new Error('Index symbol parameter is required and must be a string')
        }
        result = await nseClient.getIndexOptionChain(args.index_symbol)
        break
      }

      case 'get_equity_option_chain': {
        if (!args?.symbol || typeof args.symbol !== 'string') {
          throw new Error('Symbol parameter is required and must be a string')
        }
        result = await nseClient.getEquityOptionChain(args.symbol)
        break
      }

      case 'get_commodity_option_chain': {
        if (!args?.symbol || typeof args.symbol !== 'string') {
          throw new Error('Symbol parameter is required and must be a string')
        }
        result = await nseClient.getCommodityOptionChain(args.symbol)
        break
      }

      case 'get_glossary': {
        result = await nseClient.getGlossary()
        break
      }

      case 'get_trading_holidays': {
        result = await nseClient.getTradingHolidays()
        break
      }

      case 'get_clearing_holidays': {
        result = await nseClient.getClearingHolidays()
        break
      }

      case 'get_market_status': {
        result = await nseClient.getMarketStatus()
        break
      }

      case 'get_market_turnover': {
        result = await nseClient.getMarketTurnover()
        break
      }

      case 'get_all_indices': {
        result = await nseClient.getAllIndices()
        break
      }

      case 'get_index_names': {
        result = await nseClient.getIndexNames()
        break
      }

      case 'get_circulars': {
        result = await nseClient.getCirculars()
        break
      }

      case 'get_latest_circulars': {
        result = await nseClient.getLatestCirculars()
        break
      }

      case 'get_equity_master': {
        result = await nseClient.getEquityMaster()
        break
      }

      case 'get_pre_open_market_data': {
        result = await nseClient.getPreOpenMarketData()
        break
      }

      case 'get_merged_daily_reports_capital': {
        result = await nseClient.getMergedDailyReportsCapital()
        break
      }

      case 'get_merged_daily_reports_derivatives': {
        result = await nseClient.getMergedDailyReportsDerivatives()
        break
      }

      case 'get_merged_daily_reports_debt': {
        result = await nseClient.getMergedDailyReportsDebt()
        break
      }

    default:
      throw new Error(`Unknown tool: ${name}`)
  }

  return result
}
