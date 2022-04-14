export interface IntradayData {
    identifier: string
    name: string
    graphData: [number, number]
    closePrice: number
}
export interface DateRange {
    start: Date
    end: Date
}

export interface EquityInfo {
    symbol: string
    companyName: string
    industry: string
    activeSeries: string[]
    debtSeries: string[]
    tempSuspendedSeries: string[]
    isFNOSec: boolean
    isCASec: boolean
    isSLBSec: boolean
    isDebtSec: boolean
    isSuspended: boolean
    isETFSec: boolean
    isDelisted: boolean
    isin: string
    isTop10: boolean
    identifier: string
}

export interface EquityMetadata {
    series: string
    symbol: string
    isin: string
    status: string
    listingDate: string
    industry: string
    lastUpdateTime: string
    pdSectorPe: number
    pdSymbolPe: number
    pdSectorInd: string
}

export interface EquitySecurityInfo {
    boardStatus: string
    tradingStatus: string
    tradingSegment: string
    sessionNo: string
    slb: string
    classOfShare: string
    derivatives: string
    surveillance: string
    faceValue: number
    issuedCap: number
}

export interface EquityPriceInfo {
    lastPrice: number
    change: number
    pChange: number
    previousClose: number
    open: number
    close: number
    vwap: number
    lowerCP: string
    upperCP: string
    pPriceBand: string
    basePrice: number
    intraDayHighLow: {
        min: number
        max: number
        value: number
    }
    weekHighLow: {
        min: number
        minDate: string
        max: number
        maxDate: string
        value: number
    }
}
export interface PreOpenDetils {
    price: number
    buyQty: number
    sellQty: number
}

export interface EquityPreOpenMarket {
    preopen: PreOpenDetils[]
    ato: {
        buy: number
        sell: number
    }
    IEP: number
    totalTradedVolume: number
    finalPrice: number
    finalQuantity: number
    lastUpdateTime: string
    totalBuyQuantity: number
    totalSellQuantity: number
    atoBuyQty: number
    atoSellQty: number
}

export interface EquityDetails {
    info: EquityInfo
    metadata: EquityMetadata
    securityInfo: EquitySecurityInfo
    priceInfo: EquityPriceInfo
    preOpenMarket: EquityPreOpenMarket
}

export interface EquityTradeInfo {
    noBlockDeals: boolean
    bulkBlockDeals: { name: string }[]
    marketDeptOrderBook: {
        totalBuyQuantity: number
        totalSellQuantity: number
        bid: {
            price: number
            quantity: number
        }[]
        ask: {
            price: number
            quantity: number
        }[]
        tradeInfo: {
            totalTradedVolume: number
            totalTradedValue: number
            totalMarketCap: number
            ffmc: number
            impactCost: number
        }
        valueAtRisk: {
            securityVar: number
            indexVar: number
            varMargin: number
            extremeLossMargin: number
            adhocMargin: number
            applicableMargin: number
        }
    }
    securityWiseDP: {
        quantityTraded: number
        deliveryQuantity: number
        deliveryToTradedQuantity: number
        seriesRemarks: string | null
        secWiseDelPosDate: string
    }
}
export interface DirectoryDetails {
    webAddress: string
    smName: string
    symbol: string
    office: string
    address: string
    city: string
    pincode: string
    telephone: string
    fax: string
    email: string
}
export interface EquityCorporateInfo {
    corporate: {
        announcements: {
            desc: string
            attchmntText: string
            attchmntFile: string
            an_dt: string
        }[]
        boardMeetings: {
            bm_purpose: string
            bm_desc: string
            attachment: string
            bm_date: string
            bm_timestamp: string
        }[]
        corporateActions: {
            series: string
            faceVal: string
            subject: string
            exDate: string
            recDate: string
            bcStartDate: string
            bcEndDate: string
            ndStartDate: string
            ndEndDate: string
        }[]
        governance: any[]
        financialResults: any[]
        shareholdingPatterns: {
            cols: any[]
            data: any[]
        }
        insiderTrading: any[]
        sastRegulations_29: any[]
        sastRegulations_3132Post: any[]
        votingResults: any[]
        annualReport: {
            companyName: string
            fromYr: string
            toYr: string
            fileName: string
        }[]
        dailyBuyBack: any[]
        companyDirectory: DirectoryDetails[]
        transferAgentDetail: DirectoryDetails[]
        investorComplaints: any[]
        pledgedetails: any[]
        corpEncumbrance: any[]
        secretarialCamp: any[]
    }
}

export interface EquityHistoricalInfo {
    _id: string
    CH_SYMBOL: string
    CH_SERIES: string
    CH_MARKET_TYPE: string
    CH_TRADE_HIGH_PRICE: number
    CH_TRADE_LOW_PRICE: number
    CH_OPENING_PRICE: number
    CH_CLOSING_PRICE: number
    CH_LAST_TRADED_PRICE: number
    CH_PREVIOUS_CLS_PRICE: number
    CH_TOT_TRADED_QTY: number
    CH_TOT_TRADED_VAL: number
    CH_52WEEK_HIGH_PRICE: number
    CH_52WEEK_LOW_PRICE: number
    CH_TOTAL_TRADES: number | null,
    CH_ISIN: string
    CH_TIMESTAMP: string
    TIMESTAMP: string
    createdAt: string
    updatedAt: string
    __v: number
    VWAP: number
    mTIMESTAMP: string
}

export interface EquityHistoricalData {
    data: EquityHistoricalInfo[]
    meta: {
        series: string[]
        fromDate: string
        toDate: string
        symbols: string[]
    }
}

export interface IndexHistoricalData {
    indexSymbol: string
    fromDate: Date
    toDate: Date
    historicalData: {
        date: Date
        open: number
        high: number
        low: number
        close: number
        volume: number
        turnoverInCrore: number
    }[]
}

export interface SeriesData {
    data: string[]
}
export interface IndexEquityInfo {
    priority: number
    symbol: string
    identifier: string
    series: string
    open: number
    dayHigh: number
    dayLow: number
    lastPrice: number
    previousClose: number
    change: number
    pChange: number
    totalTradedVolume: number
    totalTradedValue: number
    lastUpdateTime: string
    yearHigh: number
    ffmc: number
    yearLow: number
    nearWKH: number
    nearWKL: number
    perChange365d: number
    date365dAgo: string
    chart365dPath: string
    date30dAgo: string
    perChange30d: number
    chart30dPath: string
    chartTodayPath: string
    meta: {
        symbol: string
        companyName: string
        industry: string
        activeSeries: string[]
        debtSeries: any[]
        tempSuspendedSeries: any[]
        isFNOSec: boolean
        isCASec: boolean
        isSLBSec: boolean
        isDebtSec: boolean
        isSuspended: boolean
        isETFSec: boolean
        isDelisted: boolean
        isin: string
    }
}
export interface IndexDetails {
    name: string,
    advance: { declines: string, advances: string, unchanged: string },
    timestamp: string,
    data: IndexEquityInfo[],
    metadata: {
        indexName: string,
        open: number
        high: number
        low: number
        previousClose: number
        last: number
        percChange: number
        change: number
        timeVal: string,
        yearHigh: number
        yearLow: number
        totalTradedVolume: number
        totalTradedValue: number
        ffmc_sum: number
    },
    marketStatus: {
        market: string,
        marketStatus: string,
        tradeDate: string,
        index: string,
        last: number
        variation: number
        percentChange: number
        marketStatusMessage: string
    },
    date30dAgo: string,
    date365dAgo: string
}
