/* eslint-disable max-len */
import { ApiList, NseIndia } from ".";
import { EquityDetails, IndexDetails, IndexEquityInfo } from "./interface";

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