/* eslint-disable max-len */
import { ApiList, NseIndia } from ".";
import { EquityDetails, IndexDetails } from "./interface";

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

export async function getEquityStockIndices(params: { indexSymbol: string }): Promise<IndexDetails> {
    const details = await nseIndia.getEquityStockIndices(params.indexSymbol)
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
        "description": "Get the list of indices unerd the index category like Sectoral Indices, Broad Market Indices"
    }
}

export const getEquityStockIndicesTool = {
    "type": "function",
    "function": {
        "name": "getEquityStockIndices",
        "description": "Get the index details of the NSE index symbol",
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