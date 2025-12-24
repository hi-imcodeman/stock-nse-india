/**
 * Intraday data for equity or index
 */
export interface IntradayData {
    identifier: string
    name: string
    // Array of [timestamp, price, status] where status is "PO" (pre-open) or "NM" (normal market)
    grapthData: [number, number, string][]
    closePrice: number
}
/**
 * Date range for historical data queries
 */
export interface DateRange {
    start: Date
    end: Date
}

/**
 * Equity information including company details and security metadata
 */
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



/**
 * Option chain contract information with expiry dates and strike prices
 */
export interface OptionChainContractInfo {
    expiryDates: string[]
    strikePrice: string[]
}

/**
 * Equity option chain data structure
 */
export interface EquityOptionChainData {
    data: EquityOptionChainItem[];
    timestamp: string;
}

/**
 * Index option chain data structure
 */
export interface IndexOptionChainData {
    records: IndexRecords | null;
    filtered: Filtered | null;
}

/**
 * Commodity option chain data structure
 */
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

/**
 * Index option chain records with string strike prices
 */
export interface IndexRecords extends Records {
    strikePrices: string[]; // API returns strings (e.g., "9000", "10000")
}

/**
 * Commodity option chain records with numeric strike prices
 */
export interface CommodityRecords extends Records {
    strikePrices: number[]; // API returns numbers
}

/**
 * Filtered option chain data with call and put options
 */
export interface Filtered {
    data: Datum[];
    CE: OptionsData;
    PE: OptionsData;
}

/**
 * Options data with total open interest and volume
 */
export interface OptionsData {
    totOI: number;
    totVol: number;
}

/**
 * Individual equity option chain item with strike price and option details
 */
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

/**
 * Option chain datum with strike price and option details
 */
export interface Datum {
    strikePrice: number;
    expiryDates: string; // For index options, this is a string (e.g., "30-Dec-2025")
    expiryDate?: string; // Alternative field name
    PE?: OptionsDetails;
    CE?: OptionsDetails;
}

/**
 * Detailed options information including open interest, volume, and pricing
 */
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

/**
 * Equity metadata including series, ISIN, status, and listing information
 */
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

/**
 * Equity security information including trading status and surveillance details
 */
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

/**
 * Equity price information including current price, change, and trading bands
 */
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
/**
 * Pre-open market details for individual price levels
 */
export interface PreOpenDetails {
    price: number
    buyQty: number
    sellQty: number
    iep?: boolean
}

/**
 * Pre-open market data for equity including indicative equilibrium price
 */
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

/**
 * Detailed equity information including price, metadata, and market data
 */
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

/**
 * Equity trade information including order book and trade statistics
 */
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

/**
 * Corporate information including announcements, actions, and financial results
 */
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

/**
 * Historical equity price and volume information for a single day
 */
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

/**
 * Historical equity data with price and volume information
 */
export interface EquityHistoricalData {
    data: EquityHistoricalInfo[]
    meta: {
        series: string[]
        fromDate: string
        toDate: string
        symbols: string[]
    }
}

/**
 * Series data for equity symbols
 */
export interface SeriesData {
    data: string[]
}

// Note: The API actually returns a direct array, but we wrap it for consistency
// The actual response type is: string[]
/**
 * Index constituent equity information
 */
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
/**
 * Detailed index information including constituent stocks and metadata
 */
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

/**
 * Market status data
 */
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

/**
 * Market turnover data
 */
export interface MarketTurnoverData {
    data: {
        date: string
        totalTradedValue: number
        totalTradedVolume: number
        totalTrades: number
    }[]
}

/**
 * All indices data
 */
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

/**
 * Index names data organized by category
 */
export interface IndexNamesData {
    stn: string[][];
    nts: string[][];
}

/**
 * Circulars data from NSE
 */
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

/**
 * Latest circular data from NSE
 */
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

/**
 * Equity master data
 */
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

/**
 * Merged daily reports data
 */
export interface MergedDailyReportsData {
    name: string;
    type: string;
    category: string;
    section: string;
    link: string;
}

/**
 * NSE glossary content
 */
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

/**
 * Trading holiday information
 */
export interface Holiday {
    tradingDate: string;
    weekDay: string;
    description: string;
    morning_session: string;
    evening_session: string;
    Sr_no: number;
}

/**
 * Trading and clearing holidays organized by segment
 */
export interface HolidaysBySegment {
    [segment: string]: Holiday[];
}

/**
 * Market state information including status and trading details
 */
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

/**
 * Market capitalization information
 */
export interface MarketCap {
    timeStamp: string;
    marketCapinTRDollars: number;
    marketCapinLACCRRupees: number;
    marketCapinCRRupees: number;
    marketCapinCRRupeesFormatted: string;
    marketCapinLACCRRupeesFormatted: string;
    underlying: string;
}

/**
 * Indicative Nifty 50 index information
 */
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

/**
 * Gift Nifty (formerly SGX Nifty) futures data
 */
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

/**
 * Market status information
 */
export interface MarketStatus {
    marketState: MarketState[];
    marketcap: MarketCap;
    indicativenifty50?: IndicativeNifty50;
    giftnifty: GiftNifty;
}

/**
 * Market turnover information
 */
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

/**
 * Equity master data organized by category
 */
export interface EquityMaster {
    [categoryName: string]: string[];
}

/**
 * Pre-open market data
 */
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

/**
 * Technical indicators including SMA, EMA, RSI, MACD, Bollinger Bands, etc.
 */
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
