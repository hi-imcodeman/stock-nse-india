export interface IntradayData {
    identifier: string
    name: string
    // Array of [timestamp, price, status] where status is "PO" (pre-open) or "NM" (normal market)
    grapthData: [number, number, string][]
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
    slb_isin: string
    listingDate: string
    isMunicipalBond: boolean
    isHybridSymbol: boolean
    segment: string
    isTop10: boolean
    identifier: string
}



export interface OptionChainContractInfo {
    expiryDates: string[]
    strikePrice: string[]
}

// Equity option chain structure
export interface EquityOptionChainData {
    data: EquityOptionChainItem[];
    timestamp: string;
}

// Index option chain structure
export interface IndexOptionChainData {
    records: IndexRecords | null;
    filtered: Filtered | null;
}

// Commodity option chain structure (strikePrices are numbers, not strings)
export interface CommodityOptionChainData {
    records: CommodityRecords | null;
    filtered: Filtered | null;
}


// Base Records interface
export interface Records {
    expiryDates: string[];
    data: Datum[];
    timestamp: string;
    underlyingValue: number;
}

// Index Records (strikePrices are strings)
export interface IndexRecords extends Records {
    strikePrices: string[]; // API returns strings (e.g., "9000", "10000")
}

// Commodity Records (strikePrices are numbers)
export interface CommodityRecords extends Records {
    strikePrices: number[]; // API returns numbers
}

export interface Filtered {
    data: Datum[];
    CE: OptionsData;
    PE: OptionsData;
}

export interface OptionsData {
    totOI: number;
    totVol: number;
}

// Equity option chain item structure
export interface EquityOptionChainItem {
    identifier: string;
    instrumentType: string;
    underlying: string;
    expiryDate: string;
    optionType: string;
    strikePrice: string;
    openPrice: number;
    highPrice: number;
    lowPrice: number;
    closePrice: number;
    prevClose: number;
    lastPrice: number;
    change: number;
    totalTradedVolume: number;
    totalTurnover: number;
    openInterest: number;
    changeinOpenInterest: number;
    pchangeinOpenInterest: number;
    underlyingValue: number;
    volumeFreezeQuantity: number;
    ticksize: number;
    pchange: number;
}

export interface Datum {
    strikePrice: number;
    expiryDates: string; // For index options, this is a string (e.g., "30-Dec-2025")
    expiryDate?: string; // Alternative field name
    PE?: OptionsDetails;
    CE?: OptionsDetails;
}

export interface OptionsDetails {
    strikePrice: number;
    expiryDate: string | null;
    underlying: Underlying | string | null;
    identifier: string | null;
    openInterest: number;
    changeinOpenInterest: number;
    pchangeinOpenInterest: number;
    totalTradedVolume: number;
    impliedVolatility: number;
    lastPrice: number;
    change: number;
    pChange?: number;
    pchange?: number; // Some APIs use 'pchange' instead of 'pChange'
    totalBuyQuantity: number;
    totalSellQuantity: number;
    bidQty?: number;
    bidprice?: number;
    askQty?: number;
    askPrice?: number;
    buyPrice1?: number; // Index options use buyPrice1/sellPrice1
    buyQuantity1?: number;
    sellPrice1?: number;
    sellQuantity1?: number;
    underlyingValue: number;
    optionType: string | null;
}


export enum Underlying {
    Nifty = "NIFTY",
    Gold = "GOLD"
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
    pdSectorIndAll: string[]
}

export interface EquitySecurityInfo {
    boardStatus: string
    tradingStatus: string
    tradingSegment: string
    sessionNo: string
    slb: string
    classOfShare: string
    derivatives: string
    surveillance: {
        surv: string | null
        desc: string | null
    }
    faceValue: number
    issuedSize: number
}

export interface EquityPriceInfo {
    lastPrice: number
    change: number
    pChange: number
    previousClose: number
    open: number
    close: number
    vwap: number
    stockIndClosePrice: number
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
    iNavValue: number | null
    checkINAV: boolean
    tickSize: number
    ieq: string
}
export interface PreOpenDetails {
    price: number
    buyQty: number
    sellQty: number
    iep?: boolean
}

export interface EquityPreOpenMarket {
    preopen: PreOpenDetails[]
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
    sddDetails: {
        SDDAuditor: string
        SDDStatus: string
    }
    currentMarketType: string
    priceInfo: EquityPriceInfo
    industryInfo: {
        macro: string
        sector: string
        industry: string
        basicIndustry: string
    }
    preOpenMarket: EquityPreOpenMarket
}

export interface EquityTradeInfo {
    noBlockDeals: boolean
    bulkBlockDeals: { name: string }[]
    marketDeptOrderBook: {
        totalBuyQuantity: number
        totalSellQuantity: number
        open: number
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
            cmDailyVolatility: string
            cmAnnualVolatility: string
            marketLot: string
            activeSeries: string
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
    "latest_announcements": {
        "data": {
            "symbol": string
            "broadcastdate": string
            "subject": string
        }[]
    },
    "corporate_actions": {
        "data": {
            "symbol": string
            "exdate": string
            "purpose": string
        }[]
    },
    "shareholdings_patterns": {
        "data": {
            [date: string]: Array<{ [key: string]: string }>
        }
    },
    "financial_results": {
        "data": {
            "from_date": string | null
            "to_date": string
            "expenditure": string | null
            "income": string
            "audited": string
            "cumulative": string | null
            "consolidated": string
            "reDilEPS": string
            "reProLossBefTax": string
            "proLossAftTax": string
            "re_broadcast_timestamp": string
            "xbrl_attachment": string
            "na_attachment": string | null
        }[]
    },
    "borad_meeting": {
        "data": {
            "symbol": string
            "purpose": string
            "meetingdate": string
        }[]
    }
}

export interface EquityHistoricalInfo {
    chSymbol: string
    chSeries: string
    chPreviousClsPrice: number
    chOpeningPrice: number
    chTradeHighPrice: number
    chTradeLowPrice: number
    chLastTradedPrice: number
    chClosingPrice: number
    vwap: number
    chTotTradedQty: number
    chTotTradedVal: number
    chTotalTrades: number
    ch52WeekHighPrice: number
    ch52WeekLowPrice: number
    mtimestamp: string
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

export interface SeriesData {
    data: string[]
}

// Note: The API actually returns a direct array, but we wrap it for consistency
// The actual response type is: string[]
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
    stockIndClosePrice: number
    totalTradedValue: number
    lastUpdateTime: string
    yearHigh: number
    ffmc: number
    yearLow: number
    nearWKH: number
    nearWKL: number
    perChange365d: number
    perChange30d: number
    date365dAgo: string
    date30dAgo: string
    chartTodayPath: string
    chart30dPath: string
    chart365dPath: string
    meta?: EquityInfo
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
        indicativeClose: number
        perChange365d: number
        perChange30d: number
        date365dAgo: string
        date30dAgo: string
        chartTodayPath: string
        chart30dPath: string
        chart365dPath: string
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

// New interfaces for additional APIs
export interface GlossaryData {
    data: {
        content: string
        title: string
        url: string
    }
}

export interface HolidayData {
    data: {
        date: string
        description: string
        trading: boolean
        clearing: boolean
    }[]
}

export interface MarketStatusData {
    marketState: string
    marketStatus: string
    tradeDate: string
    index: string
    last: number
    variation: number
    percentChange: number
    marketStatusMessage: string
}

export interface MarketTurnoverData {
    data: {
        date: string
        totalTradedValue: number
        totalTradedVolume: number
        totalTrades: number
    }[]
}

export interface AllIndicesData {
    data: {
        indexName: string
        open: number
        high: number
        low: number
        previousClose: number
        last: number
        percChange: number
        change: number
        timeVal: string
        yearHigh: number
        yearLow: number
        totalTradedVolume: number
        totalTradedValue: number
        ffmc_sum: number
    }[]
}

export interface IndexNamesData {
    stn: string[][];
    nts: string[][];
}

export interface CircularsData {
    data: {
        fileDept: string;
        circNumber: string;
        fileExt: string;
        sub: string;
        cirDate: string;
        cirDisplayDate: string;
        circFilename: string;
        circFilelink: string;
        circCompany: string;
        circDisplayNo: string;
    }[];
    fromDate: string;
    toDate: string;
}

export interface LatestCircularData {
    data: {
        fileDept: string;
        circNumber: string;
        fileExt: string;
        sub: string;
        cirDate: string;
        cirDisplayDate: string;
        circFilename: string;
        circFilelink: string;
        circCompany: string;
        circDisplayNo: string;
    }[];
}

export interface EquityMasterData {
    data: {
        symbol: string
        series: string
        isin: string
        status: string
        listingDate: string
        industry: string
        lastUpdateTime: string
    }[]
}

export interface MarketDataPreOpenData {
    data: {
        metadata: {
            symbol: string
            series: string
            isin: string
            status: string
            listingDate: string
            industry: string
            lastUpdateTime: string
        }
        priceInfo: {
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
        }
        preOpenMarket: {
            preopen: PreOpenDetails[]
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
    }[]
}

// MergedDailyReports returns an array directly, not wrapped in data
export interface MergedDailyReportsData {
    name: string;
    type: string;
    category: string;
    section: string;
    link: string;
}

export interface Glossary {
    content: {
        title?: string;
        body?: string;
        field_glossary_items?: any;
        field_labels?: any;
        field_reference?: any;
        field_unique_url?: string;
        [key: string]: any; // Glossary content can have various structures
    };
    id: string;
    type: string;
    changed?: string;
}

export interface Holiday {
    tradingDate: string;
    weekDay: string;
    description: string;
    morning_session: string;
    evening_session: string;
    Sr_no: number;
}

// Trading/Clearing holidays are returned as an object with segment keys
export interface HolidaysBySegment {
    [segment: string]: Holiday[];
}

export interface MarketState {
    market: string;
    marketStatus: string;
    tradeDate: string;
    index: string;
    last: number | string;
    variation: number | string;
    percentChange: number | string;
    marketStatusMessage: string;
    expiryDate?: string;
    underlying?: string;
    updated_time?: string;
    tradeDateFormatted?: string;
    slickclass?: string;
}

export interface MarketCap {
    timeStamp: string;
    marketCapinTRDollars: number;
    marketCapinLACCRRupees: number;
    marketCapinCRRupees: number;
    marketCapinCRRupeesFormatted: string;
    marketCapinLACCRRupeesFormatted: string;
    underlying: string;
}

export interface IndicativeNifty50 {
    dateTime: string;
    indicativeTime: string | null;
    indexName: string;
    indexLast: number | null;
    indexPercChange: number | null;
    indexTimeVal: string | null;
    closingValue: number;
    finalClosingValue: number;
    change: number;
    perChange: number;
    status: string;
}

export interface GiftNifty {
    INSTRUMENTTYPE: string;
    SYMBOL: string;
    EXPIRYDATE: string;
    OPTIONTYPE: string;
    STRIKEPRICE: string;
    LASTPRICE: number;
    DAYCHANGE: string;
    PERCHANGE: string;
    CONTRACTSTRADED: number;
    TIMESTMP: string;
    id: string;
}

export interface MarketStatus {
    marketState: MarketState[];
    marketcap: MarketCap;
    indicativenifty50?: IndicativeNifty50;
    giftnifty: GiftNifty;
}

export interface MarketTurnover {
    totalTradedValue: number
    totalTradedVolume: number
    totalTrades: number
    lastUpdateTime: string
}

export interface IndexName {
    indexSymbol: string
    indexName: string
}

export interface Circular {
    subject: string
    description: string
    date: string
    attachment: string
}

export interface IndexCategories {
    [category: string]: string[];
}

// EquityMaster returns an object with category keys directly
export interface EquityMaster {
    [categoryName: string]: string[];
}

export interface PreOpenMarketData {
    data: Array<{
        metadata: {
            symbol: string;
            companyName: string;
            industry: string;
            isinCode: string;
            series?: string;
            status?: string;
            listingDate?: string;
            lastUpdateTime?: string;
        };
        detail?: any;
        priceInfo?: {
            lastPrice: number;
            change: number;
            pChange: number;
            open: number;
            high: number;
            low: number;
            close: number;
            prevClose: number;
            totalTradedVolume: number;
            totalTradedValue: number;
        };
    }>;
    timestamp: string;
    advances: number;
    declines: number;
    unchanged: number;
    totalTradedValue: number;
    totalmarketcap: number;
    totalTradedVolume: number;
}

export interface DailyReport {
    symbol: string
    series: string
    openPrice: number
    highPrice: number
    lowPrice: number
    closePrice: number
    lastTradedPrice: number
    totalTradedQuantity: number
    totalTradedValue: number
    prevClosePrice: number
    change: number
    pChange: number
    totalTrades: number
    isin: string
    tradingDate: string
}

export interface TechnicalIndicators {
    sma: { [key: string]: number[] } // Dynamic SMA indicators (e.g., sma5, sma10, sma20)
    ema: { [key: string]: number[] } // Dynamic EMA indicators (e.g., ema5, ema10, ema20)
    rsi: number[] // Relative Strength Index
    macd: {
        macd: number[]
        signal: number[]
        histogram: number[]
    }
    bollingerBands: {
        upper: number[]
        middle: number[]
        lower: number[]
    }
    stochastic: {
        k: number[]
        d: number[]
    }
    williamsR: number[] // Williams %R
    atr: number[] // Average True Range
    adx: number[] // Average Directional Index
    obv: number[] // On-Balance Volume
    cci: number[] // Commodity Channel Index
    mfi: number[] // Money Flow Index
    roc: number[] // Rate of Change
    momentum: number[] // Momentum
    ad: number[] // Accumulation/Distribution
    vwap: number[] // Volume Weighted Average Price
}
