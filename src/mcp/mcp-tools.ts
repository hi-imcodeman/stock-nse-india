import type { NseIndia } from '../index.js'
import { getGainersAndLosersByIndex, getMostActiveEquities } from '../helpers.js'

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
    name: 'get_index_option_chain_contract_info',
    description: 'Get option chain contract information (expiry dates and strike prices) for a specific index',
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
  {
    name: 'get_equity_technical_indicators',
    description: 'Get technical indicators for a specific equity symbol',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: 'Stock symbol (e.g., TCS, RELIANCE)',
        },
        period: {
          type: 'number',
          description: 'Number of days for historical data (default: 200)',
        },
        sma_periods: {
          type: 'array',
          items: { type: 'number' },
          description: 'Array of periods for SMA indicators (e.g., [5, 10, 20, 50])',
        },
        ema_periods: {
          type: 'array',
          items: { type: 'number' },
          description: 'Array of periods for EMA indicators (e.g., [5, 10, 20, 50])',
        },
        rsi_period: {
          type: 'number',
          description: 'RSI period (default: 14)',
        },
        bb_period: {
          type: 'number',
          description: 'Bollinger Bands period (default: 20)',
        },
        bb_std_dev: {
          type: 'number',
          description: 'Bollinger Bands standard deviation (default: 2)',
        },
        show_only_latest: {
          type: 'boolean',
          description: 'Show only latest values (default: true)',
        },
      },
      required: ['symbol'],
    },
  },
  {
    name: 'get_gainers_and_losers_by_index',
    description: 'Get top gainers and losers for a specific index',
    inputSchema: {
      type: 'object',
      properties: {
        index_symbol: {
          type: 'string',
          description: 'Index symbol (e.g., NIFTY 50, NIFTY BANK)',
        },
      },
      required: ['index_symbol'],
    },
  },
  {
    name: 'get_most_active_equities',
    description: 'Get most actively traded equities for a specific index, sorted by volume and value',
    inputSchema: {
      type: 'object',
      properties: {
        index_symbol: {
          type: 'string',
          description: 'Index symbol (e.g., NIFTY 50, NIFTY BANK)',
        },
      },
      required: ['index_symbol'],
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
        result = await nseClient.getEquityIntradayData(args.symbol)
        break
      }

          case 'get_equity_historical_data': {
        if (!args?.symbol || typeof args.symbol !== 'string') {
          throw new Error('Symbol parameter is required and must be a string')
        }
        const range = args.start_date && args.end_date && 
          typeof args.start_date === 'string' && 
          typeof args.end_date === 'string'
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
        result = await nseClient.getIndexIntradayData(args.index)
        break
      }

      case 'get_index_option_chain': {
        if (!args?.index_symbol || typeof args.index_symbol !== 'string') {
          throw new Error('Index symbol parameter is required and must be a string')
        }
        result = await nseClient.getIndexOptionChain(args.index_symbol)
        break
      }

      case 'get_index_option_chain_contract_info': {
        if (!args?.index_symbol || typeof args.index_symbol !== 'string') {
          throw new Error('Index symbol parameter is required and must be a string')
        }
        result = await nseClient.getIndexOptionChainContractInfo(args.index_symbol)
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

      case 'get_equity_technical_indicators': {
        if (!args?.symbol || typeof args.symbol !== 'string') {
          throw new Error('Symbol parameter is required and must be a string')
        }
        
        const options: Record<string, unknown> = {}
        const showOnlyLatest = args.show_only_latest !== undefined 
          ? args.show_only_latest 
          : true
        
        if (args.period && typeof args.period === 'number') {
          options.period = args.period
        }
        
        if (args.sma_periods && Array.isArray(args.sma_periods)) {
          options.smaPeriods = args.sma_periods
        }
        
        if (args.ema_periods && Array.isArray(args.ema_periods)) {
          options.emaPeriods = args.ema_periods
        }
        
        if (args.rsi_period && typeof args.rsi_period === 'number') {
          options.rsiPeriod = args.rsi_period
        }
        
        if (args.bb_period && typeof args.bb_period === 'number') {
          options.bbPeriod = args.bb_period
        }
        
        if (args.bb_std_dev && typeof args.bb_std_dev === 'number') {
          options.bbStdDev = args.bb_std_dev
        }
        
        const indicators = await nseClient.getTechnicalIndicators(
          args.symbol, 
          (options.period as number) || 200, 
          options
        )
        
        // Helper function to round numbers to 2 decimal places
        const roundTo2Decimals = (value: number | null | undefined): number | null => {
          return value !== null && value !== undefined ? Math.round(value * 100) / 100 : null
        }

        // Helper function to round array of numbers to 2 decimal places
        const roundArrayTo2Decimals = (arr: number[]): number[] => {
          return arr.map(value => roundTo2Decimals(value) ?? 0)
        }
        
        if (showOnlyLatest) {
          // Return only the latest values
          const latestIndicators: Record<string, unknown> = {}
          
          // Process SMA indicators
          latestIndicators.sma = {}
          Object.keys(indicators.sma).forEach(key => {
            const values = indicators.sma[key]
            ;(latestIndicators.sma as Record<string, unknown>)[key] = 
              values.length > 0 ? roundTo2Decimals(values[values.length - 1]) : null
          })
          
          // Process EMA indicators
          latestIndicators.ema = {}
          Object.keys(indicators.ema).forEach(key => {
            const values = indicators.ema[key]
            ;(latestIndicators.ema as Record<string, unknown>)[key] = 
              values.length > 0 ? roundTo2Decimals(values[values.length - 1]) : null
          })
          
          // Process other indicators
          latestIndicators.rsi = roundTo2Decimals(
            indicators.rsi.length > 0 
              ? indicators.rsi[indicators.rsi.length - 1] 
              : null
          )
          latestIndicators.macd = {
            macd: roundTo2Decimals(
              indicators.macd.macd.length > 0 
                ? indicators.macd.macd[indicators.macd.macd.length - 1] 
                : null
            ),
            signal: roundTo2Decimals(
              indicators.macd.signal.length > 0 
                ? indicators.macd.signal[indicators.macd.signal.length - 1] 
                : null
            ),
            histogram: roundTo2Decimals(
              indicators.macd.histogram.length > 0 
                ? indicators.macd.histogram[indicators.macd.histogram.length - 1] 
                : null
            )
          }
          latestIndicators.bollingerBands = {
            upper: roundTo2Decimals(
              indicators.bollingerBands.upper.length > 0 
                ? indicators.bollingerBands.upper[indicators.bollingerBands.upper.length - 1] 
                : null
            ),
            middle: roundTo2Decimals(
              indicators.bollingerBands.middle.length > 0 
                ? indicators.bollingerBands.middle[indicators.bollingerBands.middle.length - 1] 
                : null
            ),
            lower: roundTo2Decimals(
              indicators.bollingerBands.lower.length > 0 
                ? indicators.bollingerBands.lower[indicators.bollingerBands.lower.length - 1] 
                : null
            )
          }
          latestIndicators.stochastic = {
            k: roundTo2Decimals(
              indicators.stochastic.k.length > 0 
                ? indicators.stochastic.k[indicators.stochastic.k.length - 1] 
                : null
            ),
            d: roundTo2Decimals(
              indicators.stochastic.d.length > 0 
                ? indicators.stochastic.d[indicators.stochastic.d.length - 1] 
                : null
            )
          }
          latestIndicators.williamsR = roundTo2Decimals(
            indicators.williamsR.length > 0 
              ? indicators.williamsR[indicators.williamsR.length - 1] 
              : null
          )
          latestIndicators.atr = roundTo2Decimals(
            indicators.atr.length > 0 
              ? indicators.atr[indicators.atr.length - 1] 
              : null
          )
          latestIndicators.adx = roundTo2Decimals(
            indicators.adx.length > 0 
              ? indicators.adx[indicators.adx.length - 1] 
              : null
          )
          latestIndicators.obv = roundTo2Decimals(
            indicators.obv.length > 0 
              ? indicators.obv[indicators.obv.length - 1] 
              : null
          )
          latestIndicators.cci = roundTo2Decimals(
            indicators.cci.length > 0 
              ? indicators.cci[indicators.cci.length - 1] 
              : null
          )
          latestIndicators.mfi = roundTo2Decimals(
            indicators.mfi.length > 0 
              ? indicators.mfi[indicators.mfi.length - 1] 
              : null
          )
          latestIndicators.roc = roundTo2Decimals(
            indicators.roc.length > 0 
              ? indicators.roc[indicators.roc.length - 1] 
              : null
          )
          latestIndicators.momentum = roundTo2Decimals(
            indicators.momentum.length > 0 
              ? indicators.momentum[indicators.momentum.length - 1] 
              : null
          )
          latestIndicators.ad = roundTo2Decimals(
            indicators.ad.length > 0 
              ? indicators.ad[indicators.ad.length - 1] 
              : null
          )
          latestIndicators.vwap = roundTo2Decimals(
            indicators.vwap.length > 0 
              ? indicators.vwap[indicators.vwap.length - 1] 
              : null
          )
          
          result = latestIndicators
        } else {
          // Return all values with 2 decimal precision
          const roundedIndicators: Record<string, unknown> = {}
          
          // Process SMA indicators
          roundedIndicators.sma = {}
          Object.keys(indicators.sma).forEach(key => {
            (roundedIndicators.sma as Record<string, unknown>)[key] = 
              roundArrayTo2Decimals(indicators.sma[key])
          })
          
          // Process EMA indicators
          roundedIndicators.ema = {}
          Object.keys(indicators.ema).forEach(key => {
            (roundedIndicators.ema as Record<string, unknown>)[key] = 
              roundArrayTo2Decimals(indicators.ema[key])
          })
          
          // Process other indicators
          roundedIndicators.rsi = roundArrayTo2Decimals(indicators.rsi)
          roundedIndicators.macd = {
            macd: roundArrayTo2Decimals(indicators.macd.macd),
            signal: roundArrayTo2Decimals(indicators.macd.signal),
            histogram: roundArrayTo2Decimals(indicators.macd.histogram)
          }
          roundedIndicators.bollingerBands = {
            upper: roundArrayTo2Decimals(indicators.bollingerBands.upper),
            middle: roundArrayTo2Decimals(indicators.bollingerBands.middle),
            lower: roundArrayTo2Decimals(indicators.bollingerBands.lower)
          }
          roundedIndicators.stochastic = {
            k: roundArrayTo2Decimals(indicators.stochastic.k),
            d: roundArrayTo2Decimals(indicators.stochastic.d)
          }
          roundedIndicators.williamsR = roundArrayTo2Decimals(indicators.williamsR)
          roundedIndicators.atr = roundArrayTo2Decimals(indicators.atr)
          roundedIndicators.adx = roundArrayTo2Decimals(indicators.adx)
          roundedIndicators.obv = roundArrayTo2Decimals(indicators.obv)
          roundedIndicators.cci = roundArrayTo2Decimals(indicators.cci)
          roundedIndicators.mfi = roundArrayTo2Decimals(indicators.mfi)
          roundedIndicators.roc = roundArrayTo2Decimals(indicators.roc)
          roundedIndicators.momentum = roundArrayTo2Decimals(indicators.momentum)
          roundedIndicators.ad = roundArrayTo2Decimals(indicators.ad)
          roundedIndicators.vwap = roundArrayTo2Decimals(indicators.vwap)
          
          result = roundedIndicators
        }
        break
      }

      case 'get_gainers_and_losers_by_index': {
        if (!args?.index_symbol || typeof args.index_symbol !== 'string') {
          throw new Error('Index symbol parameter is required and must be a string')
        }
        result = await getGainersAndLosersByIndex(args.index_symbol)
        break
      }

      case 'get_most_active_equities': {
        if (!args?.index_symbol || typeof args.index_symbol !== 'string') {
          throw new Error('Index symbol parameter is required and must be a string')
        }
        result = await getMostActiveEquities(args.index_symbol)
        break
      }

    default:
      throw new Error(`Unknown tool: ${name}`)
  }

  return result
}
