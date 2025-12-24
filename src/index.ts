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
    OptionChainData,
    OptionChainContractInfo,
    EquityCorporateInfo,
    Glossary,
    Holiday,
    MarketStatus,
    MarketTurnover,
    IndexName,
    Circular,
    EquityMaster,
    PreOpenMarketData,
    DailyReport,
    TechnicalIndicators
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
    async getIndexOptionChain(indexSymbol: string, expiry?: string): Promise<OptionChainData> {
        // If expiry not provided, fetch the nearest upcoming expiry date from the API
        if (!expiry) {
            const contractInfo = await this.getIndexOptionChainContractInfo(indexSymbol)
            if (contractInfo && contractInfo.expiryDates && Array.isArray(contractInfo.expiryDates)) {
                const today = new Date()
                today.setHours(0, 0, 0, 0) // Reset time to start of day for comparison
                
                // Find the nearest upcoming expiry date
                let nearestExpiry: string | null = null
                let nearestDate: Date | null = null
                
                for (const expiryDateStr of contractInfo.expiryDates) {
                    // Parse date in DD-MMM-YYYY format
                    const dateParts = expiryDateStr.split('-')
                    if (dateParts.length === 3) {
                        const day = parseInt(dateParts[0], 10)
                        const monthNames = [
                            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
                        ]
                        const month = monthNames.indexOf(dateParts[1])
                        const year = parseInt(dateParts[2], 10)
                        
                        if (month !== -1) {
                            const expiryDate = new Date(year, month, day)
                            expiryDate.setHours(0, 0, 0, 0)
                            
                            // Check if this expiry is in the future or today
                            if (expiryDate >= today) {
                                if (!nearestDate || expiryDate < nearestDate) {
                                    nearestDate = expiryDate
                                    nearestExpiry = expiryDateStr
                                }
                            }
                        }
                    }
                }
                
                if (nearestExpiry) {
                    expiry = nearestExpiry
                } else {
                    // Fallback: use the last expiry date if no upcoming date found
                    expiry = contractInfo.expiryDates[contractInfo.expiryDates.length - 1]
                }
            } else {
                // Fallback: use current date if API fails
                const today = new Date()
                const day = today.getDate().toString().padStart(2, '0')
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                const month = months[today.getMonth()]
                const year = today.getFullYear()
                expiry = `${day}-${month}-${year}`
            }
        }
        // Ensure expiry is defined (should always be set by this point)
        if (!expiry) {
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
    getEquityOptionChain(symbol: string): Promise<OptionChainData> {
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
    getCommodityOptionChain(symbol: string): Promise<OptionChainData> {
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
    getTradingHolidays(): Promise<Holiday[]> {
        return this.getDataByEndpoint(ApiList.HOLIDAY_TRADING)
    }

    /**
     * Get clearing holidays
     * @returns List of clearing holidays
     */
    getClearingHolidays(): Promise<Holiday[]> {
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
    getAllIndices(): Promise<IndexDetails[]> {
        return this.getDataByEndpoint(ApiList.ALL_INDICES)
    }

    /**
     * Get index names
     * @returns List of index names
     */
    getIndexNames(): Promise<IndexName[]> {
        return this.getDataByEndpoint(ApiList.INDEX_NAMES)
    }

    /**
     * Get circulars
     * @returns List of circulars
     */
    getCirculars(): Promise<Circular[]> {
        return this.getDataByEndpoint(ApiList.CIRCULARS)
    }

    /**
     * Get latest circulars
     * @returns List of latest circulars
     */
    getLatestCirculars(): Promise<Circular[]> {
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
    getPreOpenMarketData(): Promise<PreOpenMarketData[]> {
        return this.getDataByEndpoint(ApiList.MARKET_DATA_PRE_OPEN)
    }

    /**
     * Get merged daily reports for capital market
     * @returns Daily reports for capital market
     */
    getMergedDailyReportsCapital(): Promise<DailyReport[]> {
        return this.getDataByEndpoint(ApiList.MERGED_DAILY_REPORTS_CAPITAL)
    }

    /**
     * Get merged daily reports for derivatives
     * @returns Daily reports for derivatives
     */
    getMergedDailyReportsDerivatives(): Promise<DailyReport[]> {
        return this.getDataByEndpoint(ApiList.MERGED_DAILY_REPORTS_DERIVATIVES)
    }

    /**
     * Get merged daily reports for debt market
     * @returns Daily reports for debt market
     */
    getMergedDailyReportsDebt(): Promise<DailyReport[]> {
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
