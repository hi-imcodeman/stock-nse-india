import { ApiList, NseIndia } from './index'
import { IndexEquityInfo } from './interface'

const nseIndia = new NseIndia()

export const getGainersAndLosersByIndex = async (indexSymbol: string) => {
    if (indexSymbol !== "all") {
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
            gainers: gainers.sort((a, b) => b.pChange - a.pChange),
            loosers: losers.sort((a, b) => a.pChange - b.pChange)
        }
    } else {
        return nseIndia.getEquityGainersLoosers()
    }
}

export const getMostActiveEquities = async (indexSymbol: string) => {
    const indexData = await nseIndia.getEquityStockIndices(indexSymbol)
    return {
        byVolume: indexData.data.sort((a, b) => b.totalTradedVolume - a.totalTradedVolume),
        byValue: indexData.data.sort((a, b) => b.totalTradedValue - a.totalTradedValue)

    }
}
