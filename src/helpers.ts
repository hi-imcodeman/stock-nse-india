import { NseIndia } from './index'
import { IndexEquityInfo } from './interface'

const nseIndia = new NseIndia()
/**
 * 
 * @param indexSymbol 
 * @returns 
 */
export const getGainersAndLosersByIndex = async (indexSymbol: string) => {
    const indexData = await nseIndia.getEquityStockIndices(indexSymbol)
    const gainers: IndexEquityInfo[] = []
    const losers: IndexEquityInfo[] = []
    indexData.data.forEach((equityInfo: IndexEquityInfo) => {
        if (equityInfo.pChange > 0)
            gainers.push(equityInfo)
        else
            losers.push(equityInfo)
    })
    return {
        gainers: [...gainers].sort((a, b) => b.pChange - a.pChange),
        losers: [...losers].sort((a, b) => a.pChange - b.pChange)
    }
}
/**
 * 
 * @param indexSymbol 
 * @returns 
 */
export const getMostActiveEquities = async (indexSymbol: string) => {
    const indexData = await nseIndia.getEquityStockIndices(indexSymbol)
    return {
        byVolume: [...indexData.data].sort((a, b) => b.totalTradedVolume - a.totalTradedVolume),
        byValue: [...indexData.data].sort((a, b) => b.totalTradedValue - a.totalTradedValue)

    }
}
