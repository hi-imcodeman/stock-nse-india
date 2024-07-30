import { NseIndia } from ".";
import { EquityDetails } from "./interface";

const nseIndia = new NseIndia()

export async function getStockDetails(params: { symbol: string }): Promise<EquityDetails> {
    const details = await nseIndia.getEquityDetails(params.symbol)
    return details
}

export const getStockDetailsTool = {
    "type": "function",
    "function": {
        "name": "getStockDetails",
        "description": "Get the current stock price and details",
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