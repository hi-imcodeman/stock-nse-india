/* eslint-disable max-len */
import { ApiList, NseIndia } from ".";
import { 
    EquityDetails, 
    IndexEquityInfo,
    EquityTradeInfo,
    EquityCorporateInfo,
    IntradayData,
    DateRange,
    EquityHistoricalData,
    SeriesData,
    IndexHistoricalData,
    OptionChainData
} from "./interface";

const nseIndia = new NseIndia()

export async function getEquityDetails(params: { symbol: string }): Promise<EquityDetails> {
    const details = await nseIndia.getEquityDetails(params.symbol)
    return details
}

export async function getMarketStatus(): Promise<any> {
    const status = await nseIndia.getDataByEndpoint(ApiList.MARKET_STATUS)
    return status
}

export async function getAllIndices(): Promise<any> {
    const allIndices = await nseIndia.getDataByEndpoint(ApiList.ALL_INDICES)
    return allIndices
}

export async function getEquityMaster(): Promise<any> {
    const equityMaster = await nseIndia.getDataByEndpoint(ApiList.EQUITY_MASTER)
    return equityMaster
}

export async function getEquityStockIndices(params: { indexSymbol: string }): Promise<any> {
    const details = await nseIndia.getEquityStockIndices(params.indexSymbol)
    return details.data ? {
        name: details.name,
        advance: details.advance.advances,
        declines: details.advance.declines,
        unchanged: details.advance.unchanged,
        timestamp: details.timestamp,
        equities: details.data.filter((item: IndexEquityInfo) => item.symbol !== params.indexSymbol).map((item: IndexEquityInfo) => {
            return {
                'symbol': item.symbol,
                'open': item.open,
                'high': item.dayHigh,
                'low': item.dayLow,
                'lastPrice': item.lastPrice,
                'previousClose': item.previousClose,
                'change': Number(item.change.toFixed(2)),
                'changePercent': item.pChange
            }
        })
    } : {}
}

export async function getAllStockSymbols(): Promise<string[]> {
    const symbols = await nseIndia.getAllStockSymbols()
    return symbols
}

export async function getEquityTradeInfo(params: { symbol: string }): Promise<EquityTradeInfo> {
    const details = await nseIndia.getEquityTradeInfo(params.symbol)
    return details
}

export async function getEquityCorporateInfo(params: { symbol: string }): Promise<EquityCorporateInfo> {
    const details = await nseIndia.getEquityCorporateInfo(params.symbol)
    return details
}

export async function getEquityIntradayData(params: { symbol: string, isPreOpenData?: boolean }): Promise<IntradayData> {
    const details = await nseIndia.getEquityIntradayData(params.symbol, params.isPreOpenData)
    return details
}

export async function getEquityHistoricalData(params: { symbol: string, range?: DateRange }): Promise<EquityHistoricalData[]> {
    const details = await nseIndia.getEquityHistoricalData(params.symbol, params.range)
    return details
}

export async function getEquitySeries(params: { symbol: string }): Promise<SeriesData> {
    const details = await nseIndia.getEquitySeries(params.symbol)
    return details
}

export async function getIndexIntradayData(params: { index: string, isPreOpenData?: boolean }): Promise<IntradayData> {
    const details = await nseIndia.getIndexIntradayData(params.index, params.isPreOpenData)
    return details
}

export async function getIndexHistoricalData(params: { index: string, range: DateRange }): Promise<IndexHistoricalData[]> {
    const details = await nseIndia.getIndexHistoricalData(params.index, params.range)
    return details
}

export async function getIndexOptionChain(params: { indexSymbol: string }): Promise<OptionChainData> {
    const details = await nseIndia.getIndexOptionChain(params.indexSymbol)
    return details
}

export async function getEquityOptionChain(params: { symbol: string }): Promise<OptionChainData> {
    const details = await nseIndia.getEquityOptionChain(params.symbol)
    return details
}

export async function getCommodityOptionChain(params: { symbol: string }): Promise<OptionChainData> {
    const details = await nseIndia.getCommodityOptionChain(params.symbol)
    return details
}

export const getEquityDetailsTool = {
    "type": "function",
    "function": {
        "name": "getEquityDetails",
        "description": "Get the equity details of the NSE equity symbol",
        "parameters": {
            "type": "object",
            "properties": {
                "symbol": {
                    "type": "string",
                    "description": "The NSE india stock symbol like TCS, ZOMATO, SBIN"
                }
            },
            "required": [
                "symbol"
            ]
        }
    }
}

export const getMarketStatusTool = {
    "type": "function",
    "function": {
        "name": "getMarketStatus",
        "description": "Get the current market status of NSE India"
    }
}

export const getAllIndicesTool = {
    "type": "function",
    "function": {
        "name": "getAllIndices",
        "description": "Get the details of all indices in Nse India"
    }
}

export const getEquityMasterTool = {
    "type": "function",
    "function": {
        "name": "getEquityMaster",
        "description": "Get the list of indices under the index category like Sectoral Indices, Broad Market Indices"
    }
}

export const getEquityStockIndicesTool = {
    "type": "function",
    "function": {
        "name": "getEquityStockIndices",
        "description": "Get the list of equities under the NSE index symbol, equity details contains open, high low, close, volume, previous close, change, change percent, year high, year low, company name, industry, active series and is FNO or not",
        "parameters": {
            "type": "object",
            "properties": {
                "indexSymbol": {
                    "type": "string",
                    "description": "The NSE india index symbol like NIFTY, NIFTY 50, BANKNIFTY"
                }
            },
            "required": [
                "indexSymbol"
            ]
        }
    }
}

export const getAllStockSymbolsTool = {
    "type": "function",
    "function": {
        "name": "getAllStockSymbols",
        "description": "Get the list of all NSE equity symbols"
    }
}

export const getEquityTradeInfoTool = {
    "type": "function",
    "function": {
        "name": "getEquityTradeInfo",
        "description": "Get the trade information for a specific equity symbol",
        "parameters": {
            "type": "object",
            "properties": {
                "symbol": {
                    "type": "string",
                    "description": "The NSE india stock symbol like TCS, ZOMATO, SBIN"
                }
            },
            "required": ["symbol"]
        }
    }
}

export const getEquityCorporateInfoTool = {
    "type": "function",
    "function": {
        "name": "getEquityCorporateInfo",
        "description": "Get the corporate information for a specific equity symbol",
        "parameters": {
            "type": "object",
            "properties": {
                "symbol": {
                    "type": "string",
                    "description": "The NSE india stock symbol like TCS, ZOMATO, SBIN"
                }
            },
            "required": ["symbol"]
        }
    }
}

export const getEquityIntradayDataTool = {
    "type": "function",
    "function": {
        "name": "getEquityIntradayData",
        "description": "Get the intraday data for a specific equity symbol",
        "parameters": {
            "type": "object",
            "properties": {
                "symbol": {
                    "type": "string",
                    "description": "The NSE india stock symbol like TCS, ZOMATO, SBIN"
                },
                "isPreOpenData": {
                    "type": "boolean",
                    "description": "Whether to get pre-open data"
                }
            },
            "required": ["symbol"]
        }
    }
}

export const getEquityHistoricalDataTool = {
    "type": "function",
    "function": {
        "name": "getEquityHistoricalData",
        "description": "Get the historical data for a specific equity symbol",
        "parameters": {
            "type": "object",
            "properties": {
                "symbol": {
                    "type": "string",
                    "description": "The NSE india stock symbol like TCS, ZOMATO, SBIN"
                },
                "range": {
                    "type": "object",
                    "properties": {
                        "start": {
                            "type": "string",
                            "description": "Start date in YYYY-MM-DD format"
                        },
                        "end": {
                            "type": "string",
                            "description": "End date in YYYY-MM-DD format"
                        }
                    }
                }
            },
            "required": ["symbol"]
        }
    }
}

export const getEquitySeriesTool = {
    "type": "function",
    "function": {
        "name": "getEquitySeries",
        "description": "Get the series data for a specific equity symbol",
        "parameters": {
            "type": "object",
            "properties": {
                "symbol": {
                    "type": "string",
                    "description": "The NSE india stock symbol like TCS, ZOMATO, SBIN"
                }
            },
            "required": ["symbol"]
        }
    }
}

export const getIndexIntradayDataTool = {
    "type": "function",
    "function": {
        "name": "getIndexIntradayData",
        "description": "Get the intraday data for a specific index",
        "parameters": {
            "type": "object",
            "properties": {
                "index": {
                    "type": "string",
                    "description": "The NSE india index symbol like NIFTY, BANKNIFTY"
                },
                "isPreOpenData": {
                    "type": "boolean",
                    "description": "Whether to get pre-open data"
                }
            },
            "required": ["index"]
        }
    }
}

export const getIndexHistoricalDataTool = {
    "type": "function",
    "function": {
        "name": "getIndexHistoricalData",
        "description": "Get the historical data for a specific index",
        "parameters": {
            "type": "object",
            "properties": {
                "index": {
                    "type": "string",
                    "description": "The NSE india index symbol like NIFTY, BANKNIFTY"
                },
                "range": {
                    "type": "object",
                    "properties": {
                        "start": {
                            "type": "string",
                            "description": "Start date in YYYY-MM-DD format"
                        },
                        "end": {
                            "type": "string",
                            "description": "End date in YYYY-MM-DD format"
                        }
                    },
                    "required": ["start", "end"]
                }
            },
            "required": ["index", "range"]
        }
    }
}

export const getIndexOptionChainTool = {
    "type": "function",
    "function": {
        "name": "getIndexOptionChain",
        "description": "Get the option chain data for a specific index",
        "parameters": {
            "type": "object",
            "properties": {
                "indexSymbol": {
                    "type": "string",
                    "description": "The NSE india index symbol like NIFTY, BANKNIFTY"
                }
            },
            "required": ["indexSymbol"]
        }
    }
}

export const getEquityOptionChainTool = {
    "type": "function",
    "function": {
        "name": "getEquityOptionChain",
        "description": "Get the option chain data for a specific equity",
        "parameters": {
            "type": "object",
            "properties": {
                "symbol": {
                    "type": "string",
                    "description": "The NSE india stock symbol like TCS, ZOMATO, SBIN"
                }
            },
            "required": ["symbol"]
        }
    }
}

export const getCommodityOptionChainTool = {
    "type": "function",
    "function": {
        "name": "getCommodityOptionChain",
        "description": "Get the option chain data for a specific commodity",
        "parameters": {
            "type": "object",
            "properties": {
                "symbol": {
                    "type": "string",
                    "description": "The commodity symbol"
                }
            },
            "required": ["symbol"]
        }
    }
}

export type ToolFunctionList = { [key: string]: CallableFunction }
export type ToolInfo = {
  type: string;
  function: {
      name: string;
      description: string;
  };
}
export type ToolData = {
  tools: ToolInfo[],
  avaialbeFunctions: ToolFunctionList
}

const avaialbeFunctions:ToolFunctionList = {
  getEquityDetails,
  getMarketStatus,
  getAllIndices,
  getEquityMaster,
  getEquityStockIndices,
  getAllStockSymbols,
  getEquityTradeInfo,
  getEquityCorporateInfo,
  getEquityIntradayData,
  getEquityHistoricalData,
  getEquitySeries,
  getIndexIntradayData,
  getIndexHistoricalData,
  getIndexOptionChain,
  getEquityOptionChain,
  getCommodityOptionChain
}
const tools:ToolInfo[] = [
  getEquityDetailsTool,
  getMarketStatusTool,
  getAllIndicesTool,
  getEquityMasterTool,
  getEquityStockIndicesTool,
  getAllStockSymbolsTool,
  getEquityTradeInfoTool,
  getEquityCorporateInfoTool,
  getEquityIntradayDataTool,
  getEquityHistoricalDataTool,
  getEquitySeriesTool,
  getIndexIntradayDataTool,
  getIndexHistoricalDataTool,
  getIndexOptionChainTool,
  getEquityOptionChainTool,
  getCommodityOptionChainTool
]

export const toolsData: ToolData = {
  tools,
  avaialbeFunctions
}