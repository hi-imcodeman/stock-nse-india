import axios from 'axios'
import UserAgent from 'user-agents'
import { getDateRangeChunks, sleep } from './utils'
import {
    DateRange,
    IntradayData,
    EquityDetails,
    EquityTradeInfo,
    EquityHistoricalData,
    SeriesData,
    IndexDetails,
    EquityOptionChainData,
    IndexOptionChainData,
    CommodityOptionChainData,
    OptionChainContractInfo,
    EquityCorporateInfo,
    Glossary,
    HolidaysBySegment,
    MarketStatus,
    MarketTurnover,
    AllIndicesData,
    IndexNamesData,
    CircularsData,
    LatestCircularData,
    EquityMaster,
    PreOpenMarketData,
    MergedDailyReportsData,
    TechnicalIndicators,
    // Nested interfaces
    EquityInfo,
    EquityMetadata,
    EquitySecurityInfo,
    EquityPriceInfo,
    EquityPreOpenMarket,
    EquityHistoricalInfo,
    EquityOptionChainItem,
    IndexEquityInfo,
    IndexRecords,
    CommodityRecords,
    Filtered,
    Holiday,
    MarketState,
    MarketCap,
    IndicativeNifty50,
    GiftNifty,
    Datum,
    PreOpenDetails,
    OptionsData,
    OptionsDetails
} from './interface'

export enum ApiList {
    GLOSSARY = '/api/cmsContent?url=/glossary',
    HOLIDAY_TRADING = '/api/holiday-master?type=trading',
    HOLIDAY_CLEARING = '/api/holiday-master?type=clearing',
    MARKET_STATUS = '/api/marketStatus',
    MARKET_TURNOVER = '/api/market-turnover',
    ALL_INDICES = '/api/allIndices',
    INDEX_NAMES = '/api/index-names',
    CIRCULARS = '/api/circulars',
    LATEST_CIRCULARS = '/api/latest-circular',
    EQUITY_MASTER = '/api/equity-master',
    MARKET_DATA_PRE_OPEN = '/api/market-data-pre-open?key=ALL',
    MERGED_DAILY_REPORTS_CAPITAL = '/api/merged-daily-reports?key=favCapital',
    MERGED_DAILY_REPORTS_DERIVATIVES = '/api/merged-daily-reports?key=favDerivatives',
    MERGED_DAILY_REPORTS_DEBT = '/api/merged-daily-reports?key=favDebt'
}

export class NseIndia {
    private readonly baseUrl = 'https://www.nseindia.com'
    private readonly cookieMaxAge = 60 // should be in seconds
    private readonly baseHeaders = {
        'Authority': 'www.nseindia.com',
        'Referer': 'https://www.nseindia.com/',
        'Accept': '*/*',
        'Origin': this.baseUrl,
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'application/json, text/plain, */*',
        'Connection': 'keep-alive'
    }
    private userAgent = ''
    private cookies = ''
    private cookieUsedCount = 0
    private cookieExpiry = new Date().getTime() + (this.cookieMaxAge * 1000)
    private noOfConnections = 0
    

    private async getNseCookies() {
        if (this.cookies === '' || this.cookieUsedCount > 10 || this.cookieExpiry <= new Date().getTime()) {
            this.userAgent = new UserAgent().toString()
            const response = await axios.get(`${this.baseUrl}/get-quotes/equity?symbol=TCS`, {
                headers: {...this.baseHeaders,'User-Agent': this.userAgent}
            })
            const setCookies: string[] | undefined = response.headers['set-cookie']
            const cookies: string[] = []
            if (setCookies) {
                setCookies.forEach((cookie: string) => {
                    const cookieKeyValue = cookie.split(';')[0]
                    cookies.push(cookieKeyValue)
                })
                this.cookies = cookies.join('; ')
                this.cookieUsedCount = 0
                this.cookieExpiry = new Date().getTime() + (this.cookieMaxAge * 1000)
            }
            this.cookieUsedCount++
            return this.cookies
        }
        this.cookieUsedCount++
        return this.cookies
    }
    /**
     * 
     * @param url NSE API's URL
     * @returns JSON data from NSE India
     */
    async getData(url: string): Promise<any> {
        let retries = 0
        let hasError = false
        do {
            while (this.noOfConnections >= 5) {
                await sleep(500)
            }
            this.noOfConnections++
            try {
                const response = await axios.get(url, {
                    headers: {
                        ...this.baseHeaders,
                        'Cookie': await this.getNseCookies(),
                        'User-Agent': this.userAgent
                    }
                })
                this.noOfConnections--
                return response.data
            } catch (error) {
                hasError = true
                retries++
                this.noOfConnections--
                if (retries >= 10)
                    throw error
            }
        } while (hasError);
    }
    /**
     * 
     * @param apiEndpoint 
     * @returns 
     */
    async getDataByEndpoint(apiEndpoint: string): Promise<any> {
        return this.getData(`${this.baseUrl}${apiEndpoint}`)
    }
    /**
     * 
     * @returns List of NSE equity symbols
     */
    async getAllStockSymbols(): Promise<string[]> {
        const { data } = await this.getDataByEndpoint(ApiList.MARKET_DATA_PRE_OPEN)
        return data.map((obj: { metadata: { symbol: string } }) => obj.metadata.symbol).sort()
    }
    /**
     * 
     * @param symbol 
     * @returns 
     */
    getEquityDetails(symbol: string): Promise<EquityDetails> {
        return this.getDataByEndpoint(`/api/quote-equity?symbol=${encodeURIComponent(symbol.toUpperCase())}`)
    }
    /**
     * 
     * @param symbol 
     * @returns 
     */
    getEquityTradeInfo(symbol: string): Promise<EquityTradeInfo> {
        return this.getDataByEndpoint(`/api/quote-equity?symbol=${encodeURIComponent(symbol
            .toUpperCase())}&section=trade_info`)
    }

    /**
     * 
     * @param symbol 
     * @returns 
     */
    getEquityCorporateInfo(symbol: string): Promise<EquityCorporateInfo> {
        return this.getDataByEndpoint(`/api/top-corp-info?symbol=${encodeURIComponent(symbol
            .toUpperCase())}&market=equities`)
    }
    /**
     * 
     * @param symbol 
     * @returns 
     */
    async getEquityIntradayData(symbol: string): Promise<IntradayData> {
        const details = await this.getEquityDetails(symbol.toUpperCase())
        const identifier = details.info.identifier
        const url = `/api/NextApi/apiClient/GetQuoteApi?functionName=getSymbolChartData` +
            `&symbol=${encodeURIComponent(identifier)}&days=1D`
        return this.getDataByEndpoint(url)
    }
    /**
     * 
     * @param symbol 
     * @param range 
     * @returns 
     */
    async getEquityHistoricalData(symbol: string, range?: DateRange): Promise<EquityHistoricalData[]> {
        const data = await this.getEquityDetails(symbol.toUpperCase())
        const activeSeries = data.info.activeSeries.length ? data.info.activeSeries[0] : /* istanbul ignore next */ 'EQ'
        if (!range) {
            range = { start: new Date(data.metadata.listingDate), end: new Date() }
        }
        const dateRanges = getDateRangeChunks(range.start, range.end, 66)
        const promises = dateRanges.map(async (dateRange) => {
            const url = `/api/NextApi/apiClient/GetQuoteApi?functionName=getHistoricalTradeData` +
                `&symbol=${encodeURIComponent(symbol.toUpperCase())}` +
                `&series=${encodeURIComponent(activeSeries)}` +
                `&fromDate=${dateRange.start}&toDate=${dateRange.end}`
            const response = await this.getDataByEndpoint(url)
            // New API returns a direct array, wrap it in EquityHistoricalData structure for backward compatibility
            /* istanbul ignore next */
            return {
                data: Array.isArray(response) ? response : [],
                meta: {
                    series: [activeSeries],
                    fromDate: dateRange.start,
                    toDate: dateRange.end,
                    symbols: [symbol.toUpperCase()]
                }
            }
        })
        return Promise.all(promises)
    }
    /**
     * 
     * @param symbol 
     * @returns 
     */
    async getEquitySeries(symbol: string): Promise<SeriesData> {
        const response = await this.getDataByEndpoint(
            `/api/NextApi/apiClient/GetQuoteApi?functionName=histTradeDataSeries` +
            `&symbol=${encodeURIComponent(symbol.toUpperCase())}`
        )
        // New API returns a direct array, wrap it in SeriesData structure for backward compatibility
        /* istanbul ignore next */
        return {
            data: Array.isArray(response) ? response : []
        }
    }
    /**
     * 
     * @param index 
     * @returns 
     */
    getEquityStockIndices(index: string): Promise<IndexDetails> {
        return this.getDataByEndpoint(`/api/equity-stockIndices?index=${encodeURIComponent(index.toUpperCase())}`)
    }
    /**
     * 
     * @param index 
     * @returns 
     */
    async getIndexIntradayData(index: string): Promise<IntradayData> {
        const response = await this.getDataByEndpoint(
            `/api/NextApi/apiClient?functionName=getGraphChart` +
            `&type=${encodeURIComponent(index.toUpperCase())}&flag=1D`
        )
        // The API response is wrapped in a 'data' object
        /* istanbul ignore next */
        return response.data || response
    }
    /**
     * Get option chain contract information (expiry dates and strike prices) for an index
     * 
     * @param indexSymbol 
     * @returns 
     */
    getIndexOptionChainContractInfo(indexSymbol: string): Promise<OptionChainContractInfo> {
        return this.getDataByEndpoint(
            `/api/option-chain-contract-info?symbol=${encodeURIComponent(indexSymbol.toUpperCase())}`
        ) as Promise<OptionChainContractInfo>
    }

    /**
     * 
     * @param indexSymbol 
     * @param expiry Optional expiry date in DD-MMM-YYYY format (e.g., "23-Dec-2025").
     *               If not provided, will fetch nearest upcoming expiry
     * @returns 
     */
    async getIndexOptionChain(indexSymbol: string, expiry?: string): Promise<IndexOptionChainData> {
        // If expiry not provided, fetch the nearest upcoming expiry date from the API
        if (!expiry) {
            /* istanbul ignore next */
            const contractInfo = await this.getIndexOptionChainContractInfo(indexSymbol)
            /* istanbul ignore next */
            if (contractInfo && contractInfo.expiryDates && Array.isArray(contractInfo.expiryDates)) {
                /* istanbul ignore next */
                const today = new Date()
                /* istanbul ignore next */
                today.setHours(0, 0, 0, 0) // Reset time to start of day for comparison
                
                // Find the nearest upcoming expiry date
                /* istanbul ignore next */
                let nearestExpiry: string | null = null
                /* istanbul ignore next */
                let nearestDate: Date | null = null
                
                /* istanbul ignore next */
                for (const expiryDateStr of contractInfo.expiryDates) {
                    // Parse date in DD-MMM-YYYY format
                    /* istanbul ignore next */
                    const dateParts = expiryDateStr.split('-')
                    /* istanbul ignore next */
                    if (dateParts.length === 3) {
                        /* istanbul ignore next */
                        const day = parseInt(dateParts[0], 10)
                        /* istanbul ignore next */
                        const monthNames = [
                            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
                        ]
                        /* istanbul ignore next */
                        const month = monthNames.indexOf(dateParts[1])
                        /* istanbul ignore next */
                        const year = parseInt(dateParts[2], 10)
                        
                        /* istanbul ignore next */
                        if (month !== -1) {
                            /* istanbul ignore next */
                            const expiryDate = new Date(year, month, day)
                            /* istanbul ignore next */
                            expiryDate.setHours(0, 0, 0, 0)
                            
                            // Check if this expiry is in the future or today
                            /* istanbul ignore next */
                            if (expiryDate >= today) {
                                /* istanbul ignore next */
                                if (!nearestDate || expiryDate < nearestDate) {
                                    /* istanbul ignore next */
                                    nearestDate = expiryDate
                                    /* istanbul ignore next */
                                    nearestExpiry = expiryDateStr
                                }
                            }
                        }
                    }
                }
                
                /* istanbul ignore next */
                if (nearestExpiry) {
                    /* istanbul ignore next */
                    expiry = nearestExpiry
                } else {
                    // Fallback: use the last expiry date if no upcoming date found
                    /* istanbul ignore next */
                    expiry = contractInfo.expiryDates[contractInfo.expiryDates.length - 1]
                }
            } else {
                // Fallback: use current date if API fails
                /* istanbul ignore next */
                const today = new Date()
                /* istanbul ignore next */
                const day = today.getDate().toString().padStart(2, '0')
                /* istanbul ignore next */
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                /* istanbul ignore next */
                const month = months[today.getMonth()]
                /* istanbul ignore next */
                const year = today.getFullYear()
                /* istanbul ignore next */
                expiry = `${day}-${month}-${year}`
            }
        }
        // Ensure expiry is defined (should always be set by this point)
        /* istanbul ignore next */
        if (!expiry) {
            /* istanbul ignore next */
            throw new Error('Failed to determine expiry date')
        }
        
        return this.getDataByEndpoint(
            `/api/option-chain-v3?type=Indices` +
            `&symbol=${encodeURIComponent(indexSymbol.toUpperCase())}` +
            `&expiry=${encodeURIComponent(expiry)}`
        )
    }

    /**
     * 
     * @param symbol 
     * @returns 
     */
    getEquityOptionChain(symbol: string): Promise<EquityOptionChainData> {
        return this.getDataByEndpoint(
            `/api/NextApi/apiClient/GetQuoteApi?functionName=getSymbolDerivativesData` +
            `&symbol=${encodeURIComponent(symbol.toUpperCase())}`
        )
    }
    
    /**
         * 
         * @param symbol 
         * @returns 
         */
    getCommodityOptionChain(symbol: string): Promise<CommodityOptionChainData> {
        return this.getDataByEndpoint(`/api/option-chain-com?symbol=${encodeURIComponent(symbol
            .toUpperCase())}`)
    }

    /**
     * Get NSE glossary content
     * @returns Glossary content
     */
    getGlossary(): Promise<Glossary> {
        return this.getDataByEndpoint(ApiList.GLOSSARY)
    }

    /**
     * Get trading holidays
     * @returns List of trading holidays
     */
    getTradingHolidays(): Promise<HolidaysBySegment> {
        return this.getDataByEndpoint(ApiList.HOLIDAY_TRADING)
    }

    /**
     * Get clearing holidays
     * @returns List of clearing holidays
     */
    getClearingHolidays(): Promise<HolidaysBySegment> {
        return this.getDataByEndpoint(ApiList.HOLIDAY_CLEARING)
    }

    /**
     * Get market status
     * @returns Current market status
     */
    getMarketStatus(): Promise<MarketStatus> {
        return this.getDataByEndpoint(ApiList.MARKET_STATUS)
    }

    /**
     * Get market turnover
     * @returns Market turnover data
     */
    getMarketTurnover(): Promise<MarketTurnover> {
        return this.getDataByEndpoint(ApiList.MARKET_TURNOVER)
    }

    /**
     * Get all indices
     * @returns List of all indices
     */
    getAllIndices(): Promise<AllIndicesData> {
        return this.getDataByEndpoint(ApiList.ALL_INDICES)
    }

    /**
     * Get index names
     * @returns List of index names
     */
    getIndexNames(): Promise<IndexNamesData> {
        return this.getDataByEndpoint(ApiList.INDEX_NAMES)
    }

    /**
     * Get circulars
     * @returns List of circulars
     */
    getCirculars(): Promise<CircularsData> {
        return this.getDataByEndpoint(ApiList.CIRCULARS)
    }

    /**
     * Get latest circulars
     * @returns List of latest circulars
     */
    getLatestCirculars(): Promise<LatestCircularData> {
        return this.getDataByEndpoint(ApiList.LATEST_CIRCULARS)
    }

    /**
     * Get equity master
     * @returns Equity master data with categorized indices
     */
    getEquityMaster(): Promise<EquityMaster> {
        return this.getDataByEndpoint(ApiList.EQUITY_MASTER)
    }

    /**
     * Get pre-open market data
     * @returns Pre-open market data
     */
    getPreOpenMarketData(): Promise<PreOpenMarketData> {
        return this.getDataByEndpoint(ApiList.MARKET_DATA_PRE_OPEN)
    }

    /**
     * Get merged daily reports for capital market
     * @returns Daily reports for capital market
     */
    getMergedDailyReportsCapital(): Promise<MergedDailyReportsData[]> {
        return this.getDataByEndpoint(ApiList.MERGED_DAILY_REPORTS_CAPITAL)
    }

    /**
     * Get merged daily reports for derivatives
     * @returns Daily reports for derivatives
     */
    getMergedDailyReportsDerivatives(): Promise<MergedDailyReportsData[]> {
        return this.getDataByEndpoint(ApiList.MERGED_DAILY_REPORTS_DERIVATIVES)
    }

    /**
     * Get merged daily reports for debt market
     * @returns Daily reports for debt market
     */
    getMergedDailyReportsDebt(): Promise<MergedDailyReportsData[]> {
        return this.getDataByEndpoint(ApiList.MERGED_DAILY_REPORTS_DEBT)
    }

    /**
     * Get technical indicators for a specific equity symbol
     * @param symbol - The equity symbol (e.g., 'RELIANCE', 'TCS')
     * @param period - Number of days for historical data (default: 200)
     * @param options - Optional configuration for indicators
     * @returns Promise<TechnicalIndicators>
     */
    async getTechnicalIndicators(
        symbol: string, 
        period = 200,
        options: {
            smaPeriods?: number[] // Array of periods for SMA (e.g., [5, 10, 20, 50])
            emaPeriods?: number[] // Array of periods for EMA (e.g., [5, 10, 20, 50])
            rsiPeriod?: number
            macdFast?: number
            macdSlow?: number
            macdSignal?: number
            bbPeriod?: number
            bbStdDev?: number
            stochK?: number
            stochD?: number
            williamsRPeriod?: number
            atrPeriod?: number
            adxPeriod?: number
            cciPeriod?: number
            mfiPeriod?: number
            rocPeriod?: number
            momentumPeriod?: number
        } = {}
    ): Promise<TechnicalIndicators> {
        const { getTechnicalIndicators } = await import('./helpers')
        return getTechnicalIndicators(symbol, period, options)
    }
}

// Export all interfaces for TypeDoc documentation
export type {
    DateRange,
    IntradayData,
    EquityDetails,
    EquityTradeInfo,
    EquityHistoricalData,
    SeriesData,
    IndexDetails,
    EquityOptionChainData,
    IndexOptionChainData,
    CommodityOptionChainData,
    OptionChainContractInfo,
    EquityCorporateInfo,
    Glossary,
    HolidaysBySegment,
    MarketStatus,
    MarketTurnover,
    AllIndicesData,
    IndexNamesData,
    CircularsData,
    LatestCircularData,
    EquityMaster,
    PreOpenMarketData,
    MergedDailyReportsData,
    TechnicalIndicators,
    // Nested interfaces
    EquityInfo,
    EquityMetadata,
    EquitySecurityInfo,
    EquityPriceInfo,
    EquityPreOpenMarket,
    EquityHistoricalInfo,
    EquityOptionChainItem,
    IndexEquityInfo,
    IndexRecords,
    CommodityRecords,
    Filtered,
    Holiday,
    MarketState,
    MarketCap,
    IndicativeNifty50,
    GiftNifty,
    Datum,
    PreOpenDetails,
    OptionsData,
    OptionsDetails
}
