import axios, { AxiosError } from 'axios'
import { wrapper } from 'axios-cookiejar-support'
import { CookieJar } from 'tough-cookie'
import UserAgent from 'user-agents'
import { getDateRangeChunks, sleep } from './utils'
import {
    applyEquityDetailsEnrichment,
    equityRefererSymbol,
    EquityDetailsEnrichment,
    isEquityDetailsShape,
    isEquityTradeInfoShape,
    isIntradayDataShape,
    isRetryableEquityEndpointError,
    mapChartingToIntradayData,
    mapIntradayApiResponse,
    mapPreOpenRowToEquityDetails,
    mapPreOpenRowToEquityTradeInfo,
    mapQuoteEquityResponse,
    mapQuoteEquityTradeInfoResponse
} from './equity-mappers'
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
    ChartingSymbolInfo,
    ChartingOHLCItem,
    ChartingOHLCResponse,
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
    private readonly maxRetries = 3
    private readonly apiHeaders = {
        'Authority': 'www.nseindia.com',
        'Referer': 'https://www.nseindia.com/',
        'Accept': 'application/json, text/plain, */*',
        'Origin': 'https://www.nseindia.com',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive'
    }
    private nseJar = new CookieJar()
    private chartingJar = new CookieJar()
    private nseClient = wrapper(axios.create({ jar: this.nseJar }))
    private chartingClient = wrapper(axios.create({ jar: this.chartingJar }))
    private userAgent = ''
    private cookies = ''
    private cookieUsedCount = 0
    private cookieExpiry = 0
    private noOfConnections = 0
    private readonly chartingBaseUrl = 'https://charting.nseindia.com'
    private chartingCookies = ''
    private chartingCookieUsedCount = 0
    private chartingCookieExpiry = 0
    private chartingUserAgent = ''
    private preOpenCache?: { data: PreOpenMarketData; expiry: number }
    private capitalMarketTypeCache?: { type: string; expiry: number }

    private resetNseClient(): void {
        this.nseJar = new CookieJar()
        this.nseClient = wrapper(axios.create({ jar: this.nseJar }))
    }

    private resetChartingClient(): void {
        this.chartingJar = new CookieJar()
        this.chartingClient = wrapper(axios.create({ jar: this.chartingJar }))
    }

    private invalidateNseSession(): void {
        this.cookies = ''
        this.cookieExpiry = 0
        this.cookieUsedCount = 0
        this.resetNseClient()
    }

    private invalidateChartingSession(): void {
        this.chartingCookies = ''
        this.chartingCookieExpiry = 0
        this.chartingCookieUsedCount = 0
        this.resetChartingClient()
    }

    private isAuthError(error: unknown): boolean {
        if (axios.isAxiosError(error)) {
            const status = error.response?.status
            return status === 401 || status === 403
        }
        return false
    }

    private toHttpError(error: unknown): Error {
        if (axios.isAxiosError(error)) {
            const status = error.response?.status
            const url = error.config?.url ?? 'unknown URL'
            return new Error(`Request failed with status code ${status ?? 'unknown'} (${url})`)
        }
        if (error instanceof Error) {
            return error
        }
        return new Error(String(error))
    }

    private async warmNsePage(path: string, referer = `${this.baseUrl}/`): Promise<void> {
        try {
            await this.nseClient.get(`${this.baseUrl}${path}`, {
                headers: {
                    'User-Agent': this.userAgent,
                    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Accept-Encoding': 'gzip, deflate, br',
                    Connection: 'keep-alive',
                    Referer: referer
                }
            })
        } catch (error) {
            // Warm-up is best-effort; NSE often returns 403/502/503 for HTML pages under load.
            if (axios.isAxiosError(error)) {
                const status = error.response?.status
                if (status === 403 || status === 502 || status === 503) {
                    return
                }
            }
            throw this.toHttpError(error)
        }
    }

    private async warmEquityQuotePage(symbol: string): Promise<void> {
        const upper = symbol.toUpperCase()
        await this.warmNsePage(`/get-quotes/equity?symbol=${encodeURIComponent(upper)}`)
    }

    private normalizeIndexDetails(raw: Record<string, unknown>): IndexDetails {
        const data = (raw.data ?? raw.records ?? []) as IndexDetails['data']
        return { ...(raw as unknown as IndexDetails), data }
    }

    /**
     * Bootstrap NSE session via homepage and persist all Set-Cookie values in the jar.
     * Note: some endpoints (e.g. /api/quote-equity) may still return 403 from Akamai WAF
     * even with a valid session.
     */
    private async ensureNseSession(force = false): Promise<string> {
        const needsRefresh = force ||
            this.cookies === '' ||
            this.cookieUsedCount > 10 ||
            this.cookieExpiry <= Date.now()

        if (needsRefresh) {
            this.userAgent = new UserAgent().toString()
            await this.nseClient.get(`${this.baseUrl}/`, {
                headers: {
                    'User-Agent': this.userAgent,
                    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Accept-Encoding': 'gzip, deflate, br',
                    Connection: 'keep-alive'
                }
            })
            this.cookies = await this.nseJar.getCookieString(this.baseUrl)
            this.cookieUsedCount = 0
            this.cookieExpiry = Date.now() + (this.cookieMaxAge * 1000)
        }
        this.cookieUsedCount++
        return this.cookies
    }

    /** @deprecated Use ensureNseSession internally; kept for tests that spy on cookie bootstrap. */
    private async getNseCookies(): Promise<string> {
        return this.ensureNseSession()
    }

    /**
     * Get cookies for charting.nseindia.com domain
     * Used as fallback when charting API fails with NSE cookies
     * @returns Charting domain cookies
     */
    private async ensureChartingSession(force = false): Promise<string> {
        const needsRefresh = force ||
            this.chartingCookies === '' ||
            this.chartingCookieUsedCount > 10 ||
            this.chartingCookieExpiry <= Date.now()

        if (needsRefresh) {
            this.chartingUserAgent = new UserAgent().toString()
            await this.chartingClient.get(`${this.chartingBaseUrl}/`, {
                headers: {
                    'Authority': 'charting.nseindia.com',
                    'Referer': `${this.chartingBaseUrl}/`,
                    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Accept-Encoding': 'gzip, deflate, br',
                    Connection: 'keep-alive',
                    'User-Agent': this.chartingUserAgent
                }
            })
            this.chartingCookies = await this.chartingJar.getCookieString(this.chartingBaseUrl)
            this.chartingCookieUsedCount = 0
            this.chartingCookieExpiry = Date.now() + (this.cookieMaxAge * 1000)
        }
        this.chartingCookieUsedCount++
        return this.chartingCookies
    }

    private async getChartingCookies(): Promise<string> {
        return this.ensureChartingSession()
    }
    /**
     * 
     * @param url NSE API's URL or charting API URL
     * @param domain Domain type: 'nse' for www.nseindia.com, 'charting' for charting.nseindia.com
     * @returns JSON data from NSE India or charting service
     */
    async getData(url: string, domain: 'nse' | 'charting' = 'nse'): Promise<any> {
        let retries = 0
        let sessionRefreshed = false

        while (retries < this.maxRetries) {
            while (this.noOfConnections >= 5) {
                await sleep(500)
            }
            this.noOfConnections++
            try {
                if (domain === 'charting') {
                    const chartingHeaders = {
                        'Authority': 'charting.nseindia.com',
                        'Referer': `${this.chartingBaseUrl}/`,
                        Accept: 'application/json, text/plain, */*',
                        'Accept-Language': 'en-GB,en;q=0.5',
                        'Accept-Encoding': 'gzip, deflate, br',
                        Connection: 'keep-alive'
                    }

                    await this.ensureNseSession(sessionRefreshed)
                    let response

                    try {
                        response = await this.chartingClient.get(url, {
                            headers: {
                                ...chartingHeaders,
                                Cookie: this.cookies,
                                'User-Agent': this.userAgent
                            }
                        })
                    } catch (primaryError) {
                        const chartingCookies = await this.ensureChartingSession(
                            this.isAuthError(primaryError)
                        )
                        response = await this.chartingClient.get(url, {
                            headers: {
                                ...chartingHeaders,
                                Cookie: chartingCookies,
                                'User-Agent': this.chartingUserAgent || this.userAgent
                            }
                        })
                    }

                    this.noOfConnections--
                    return response.data
                }

                await this.ensureNseSession(sessionRefreshed)

                const apiHeaders = { ...this.apiHeaders, 'User-Agent': this.userAgent }
                if (url.includes('/api/quote-equity') || url.includes('/api/NextApi/apiClient/GetQuoteApi')) {
                    const symbolMatch = url.match(/[?&]symbol=([^&]+)/)
                    const apiSymbol = symbolMatch ? decodeURIComponent(symbolMatch[1]) : 'TCS'
                    const refererSymbol = equityRefererSymbol(apiSymbol)
                    await this.warmEquityQuotePage(refererSymbol)
                    apiHeaders.Referer =
                        `${this.baseUrl}/get-quotes/equity?symbol=${encodeURIComponent(refererSymbol)}`
                } else if (url.includes('/api/equity-stockIndices')) {
                    const indexMatch = url.match(/[?&]index=([^&]+)/)
                    const index = indexMatch ? decodeURIComponent(indexMatch[1]) : 'NIFTY%2050'
                    const indexPath = `/market-data/live-equity-market?symbol=${encodeURIComponent(index)}`
                    await this.warmNsePage(indexPath)
                    apiHeaders.Referer = `${this.baseUrl}${indexPath}`
                }

                const response = await this.nseClient.get(url, { headers: apiHeaders })
                this.noOfConnections--
                return response.data
            } catch (error) {
                this.noOfConnections--
                retries++
                if (this.isAuthError(error) && !sessionRefreshed) {
                    this.invalidateNseSession()
                    sessionRefreshed = true
                    continue
                }
                throw this.toHttpError(error)
            }
        }

        throw new Error(`NSE request failed after ${this.maxRetries} attempts`)
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
     * Get historical chart data from charting.nseindia.com
     * @param symbol Equity symbol with series (e.g., 'ONGC')
     * @param range Optional date range for chart data query
     * @param token NSE script code (token) for the symbol. If not provided, it is
     *              automatically fetched via {@link getEquitySymbolInfo}.
     * @param symbolType Type of symbol (e.g., 'Equity', 'Index')
     * @param chartType Chart type (e.g., 'I' for intraday, 'D' for daily)
     * @param timeInterval Time interval in minutes (e.g., '5', '15', '60')
     * @returns Chart data from charting service
     */
    async getEquityChartHistoricalData(
        symbol: string,
        range?: DateRange,
        token?: string | number,
        symbolType = 'Equity',
        chartType = 'I',
        timeInterval: string | number = '5'
    ): Promise<ChartingOHLCResponse> {
        const endDate = range?.end ?? new Date()
        const startDate = range?.start ?? new Date(endDate.getTime() - 24 * 60 * 60 * 1000)
        const fromDate = Math.floor(startDate.getTime() / 1000)
        const toDate = Math.floor(endDate.getTime() / 1000)

        // Auto-fetch token (scripCode) when not supplied by the caller
        let resolvedToken = token
        if (!resolvedToken) {
            const symbolInfo = await this.getEquitySymbolInfo(symbol)
            resolvedToken = symbolInfo.scripcode
        }

        const url = `${this.chartingBaseUrl}/v1/charts/symbolHistoricalData?` +
            `fromDate=${fromDate}&` +
            `toDate=${toDate}&` +
            `symbol=${encodeURIComponent(symbol)}&` +
            `token=${resolvedToken}&` +
            `symbolType=${encodeURIComponent(symbolType)}&` +
            `chartType=${encodeURIComponent(chartType)}&` +
            `timeInterval=${timeInterval}`

        return this.getData(url, 'charting')
    }

    /**
     * Look up the NSE script code (token) for an equity symbol using the charting domain.
     * The `scripCode` in the returned object is the value that must be passed as `token`
     * to {@link getEquityChartHistoricalData}.
     * @param symbol Equity symbol with series code (e.g., 'ONGC') OR plain symbol (e.g., 'ONGC')
     * @param segment Optional market segment filter (default: empty string, returns all segments)
     * @returns Symbol information including scripCode / token
     */
    async getEquitySymbolInfo(
        symbol: string,
        segment = ''
    ): Promise<ChartingSymbolInfo> {
        const url = `${this.chartingBaseUrl}/v1/exchanges/symbolsDynamic` +
            `?symbol=${encodeURIComponent(symbol)}&segment=${encodeURIComponent(segment)}`

        const response = await this.getData(url, 'charting')

        let symbolList = response
        if (!Array.isArray(response) && response && typeof response === 'object' && Array.isArray(response.data)) {
            symbolList = response.data
        }

        // The API returns an array; pick the best match: prefer exact symbol match
        if (!Array.isArray(symbolList) || symbolList.length === 0) {
            throw new Error(`No symbol info found for: ${symbol}`)
        }

        // Try exact match first (symbol === input), fall back to first result
        const upperSymbol = symbol.toUpperCase()
        const exact = symbolList.find((s: any) =>
            s.symbol?.toUpperCase() === upperSymbol
        )
        return exact ?? symbolList[0]
    }

    /**
     * 
     * @returns List of NSE equity symbols
     */
    async getAllStockSymbols(): Promise<string[]> {
        const { data } = await this.getDataByEndpoint(ApiList.MARKET_DATA_PRE_OPEN)
        return data.map((obj: { metadata: { symbol: string } }) => obj.metadata.symbol).sort()
    }
    private async getPreOpenMarketCached(): Promise<PreOpenMarketData> {
        if (!this.preOpenCache || this.preOpenCache.expiry <= Date.now()) {
            const data = await this.getDataByEndpoint(ApiList.MARKET_DATA_PRE_OPEN)
            this.preOpenCache = { data, expiry: Date.now() + (this.cookieMaxAge * 1000) }
        }
        return this.preOpenCache.data
    }

    private async resolveCapitalMarketType(): Promise<string> {
        if (this.capitalMarketTypeCache && this.capitalMarketTypeCache.expiry > Date.now()) {
            return this.capitalMarketTypeCache.type
        }

        try {
            const status = await this.getMarketStatus()
            const capital = status.marketState?.find((entry) => entry.market === 'Capital Market')
            const marketStatus = capital?.marketStatus?.toLowerCase() ?? ''
            let type = 'NM'
            if (marketStatus.includes('pre') && marketStatus.includes('open')) {
                type = 'preOpen'
            }
            this.capitalMarketTypeCache = {
                type,
                expiry: Date.now() + (this.cookieMaxAge * 1000)
            }
            return type
        } catch {
            return 'NM'
        }
    }

    private async fetchEquityDetailsEnrichment(symbol: string): Promise<EquityDetailsEnrichment> {
        const upper = symbol.toUpperCase()
        let chartingName = ''
        let chartingIsin = ''
        let corporateName = ''
        let corporateIsin = ''
        let corporateIndustry = ''

        await Promise.all([
            this.getEquitySymbolInfo(upper)
                .then((info) => {
                    chartingName = info.companyName?.trim() || info.description?.trim() || ''
                    chartingIsin = info.isin?.trim() || ''
                })
                .catch(() => undefined),
            this.getDataByEndpoint(
                `/api/corporates-financial-results?index=equities&symbol=${encodeURIComponent(upper)}`
            )
                .then((rows: Array<{ companyName?: string; isin?: string; industry?: string }>) => {
                    if (!Array.isArray(rows) || rows.length === 0) return
                    const row = rows.find((entry) => entry.isin && entry.isin !== '-') ?? rows[0]
                    corporateName = row.companyName?.trim() || ''
                    corporateIsin = row.isin?.trim() && row.isin !== '-' ? row.isin.trim() : ''
                    corporateIndustry = row.industry?.trim() && row.industry !== '-' ? row.industry.trim() : ''
                })
                .catch(() => undefined)
        ])

        const enrichment: EquityDetailsEnrichment = {}
        if (corporateName || chartingName) {
            enrichment.companyName = corporateName || chartingName
        }
        if (corporateIsin || chartingIsin) {
            enrichment.isin = corporateIsin || chartingIsin
        }
        if (corporateIndustry) {
            enrichment.industry = corporateIndustry
        }
        return enrichment
    }

    private async enrichPreOpenEquityDetails(
        details: EquityDetails,
        symbol: string
    ): Promise<EquityDetails> {
        const [marketType, enrichment] = await Promise.all([
            this.resolveCapitalMarketType(),
            this.fetchEquityDetailsEnrichment(symbol)
        ])
        return applyEquityDetailsEnrichment(details, {
            ...enrichment,
            currentMarketType: marketType
        })
    }

    /**
     * Equity quote with fallback when /api/quote-equity is blocked (Akamai 403).
     * Primary: quote-equity JSON; fallback: market-data-pre-open row for the symbol.
     */
    async getEquityDetails(symbol: string): Promise<EquityDetails> {
        const upper = symbol.toUpperCase()
        const attempts: string[] = []

        try {
            const raw = await this.getDataByEndpoint(
                `/api/quote-equity?symbol=${encodeURIComponent(upper)}`
            )
            if (isEquityDetailsShape(raw)) {
                return mapQuoteEquityResponse(raw)
            }
            attempts.push('quote-equity: unexpected response shape')
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error)
            attempts.push(`quote-equity: ${message}`)
            if (!isRetryableEquityEndpointError(error)) {
                throw error instanceof Error ? error : new Error(message)
            }
        }

        try {
            const preOpen = await this.getPreOpenMarketCached()
            const row = preOpen.data?.find((entry) => entry.metadata?.symbol === upper)
            if (row) {
                const mapped = mapPreOpenRowToEquityDetails(row, upper)
                return this.enrichPreOpenEquityDetails(mapped, upper)
            }
            attempts.push('pre-open: symbol not found in market-data-pre-open')
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error)
            attempts.push(`pre-open: ${message}`)
        }

        throw new Error(
            `No equity quote available for ${upper}. Attempts: ${attempts.join('; ')}`
        )
    }
    /**
     * 
     * @param symbol 
     * @returns 
     */
    async getEquityTradeInfo(symbol: string): Promise<EquityTradeInfo> {
        const upper = symbol.toUpperCase()
        const attempts: string[] = []

        try {
            const raw = await this.getDataByEndpoint(
                `/api/quote-equity?symbol=${encodeURIComponent(upper)}&section=trade_info`
            )
            if (isEquityTradeInfoShape(raw)) {
                return mapQuoteEquityTradeInfoResponse(raw)
            }
            attempts.push('quote-equity trade_info: unexpected response shape')
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error)
            attempts.push(`quote-equity trade_info: ${message}`)
            if (!isRetryableEquityEndpointError(error)) {
                throw error instanceof Error ? error : new Error(message)
            }
        }

        try {
            const preOpen = await this.getPreOpenMarketCached()
            const row = preOpen.data?.find((entry) => entry.metadata?.symbol === upper)
            if (row) {
                return mapPreOpenRowToEquityTradeInfo(row, upper)
            }
            attempts.push('pre-open: symbol not found in market-data-pre-open')
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error)
            attempts.push(`pre-open: ${message}`)
        }

        throw new Error(
            `No equity trade info available for ${upper}. Attempts: ${attempts.join('; ')}`
        )
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
        const upper = symbol.toUpperCase()
        const attempts: string[] = []
        const chartSymbols = [`${upper}-EQ`, upper]

        for (const chartSymbol of chartSymbols) {
            try {
                const raw = await this.getDataByEndpoint(
                    `/api/NextApi/apiClient/GetQuoteApi?functionName=getSymbolChartData` +
                    `&symbol=${encodeURIComponent(chartSymbol)}&days=1D`
                )
                if (isIntradayDataShape(raw)) {
                    return mapIntradayApiResponse(raw, upper)
                }
                attempts.push(`${chartSymbol}: unexpected response shape`)
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error)
                attempts.push(`${chartSymbol}: ${message}`)
                if (!isRetryableEquityEndpointError(error)) {
                    throw error instanceof Error ? error : new Error(message)
                }
            }
        }

        try {
            const chart = await this.getEquityChartHistoricalData(
                upper,
                undefined,
                undefined,
                'Equity',
                'I',
                '5'
            )
            if (chart?.data?.length) {
                return mapChartingToIntradayData(chart, upper)
            }
            attempts.push('charting: empty data')
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error)
            attempts.push(`charting: ${message}`)
        }

        throw new Error(
            `No intraday data available for ${upper}. Attempts: ${attempts.join('; ')}`
        )
    }
    /**
     * 
     * @param symbol 
     * @param range 
     * @returns 
     */
    async getEquityHistoricalData(symbol: string, range?: DateRange): Promise<EquityHistoricalData[]> {
        const upper = symbol.toUpperCase()
        let activeSeries = 'EQ'

        if (!range) {
            const data = await this.getEquityDetails(upper)
            activeSeries = data.info.activeSeries.length ? data.info.activeSeries[0] : 'EQ'
            const now = new Date()
            const listingDate = new Date(data.metadata.listingDate)
            const hasValidListingDate = !Number.isNaN(listingDate.getTime())
            const fallbackStart = new Date(now)
            fallbackStart.setFullYear(now.getFullYear() - 1)
            range = {
                start: hasValidListingDate ? listingDate : fallbackStart,
                end: now
            }
        } else {
            try {
                const seriesData = await this.getEquitySeries(upper)
                const seriesList = seriesData.data ?? []
                activeSeries = seriesList.includes('EQ') ? 'EQ' : (seriesList[0] ?? 'EQ')
            } catch {
                activeSeries = 'EQ'
            }
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
    async getEquityStockIndices(index: string): Promise<IndexDetails> {
        const indexParam = encodeURIComponent(index.toUpperCase())
        const legacyUrl = `${this.baseUrl}/api/equity-stockIndices?index=${indexParam}`
        const summaryUrl = `${this.baseUrl}/api/equity-stockIndex?index=${indexParam}`

        try {
            const legacy = await this.getData(legacyUrl)
            const normalized = this.normalizeIndexDetails(legacy)
            if (normalized.data?.length) {
                return normalized
            }
        } catch (legacyError) {
            const message = legacyError instanceof Error ? legacyError.message : ''
            if (!message.includes('404')) {
                throw legacyError
            }
        }

        const summary = await this.getData(summaryUrl)
        return this.normalizeIndexDetails(summary)
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
    ChartingSymbolInfo,
    ChartingOHLCItem,
    ChartingOHLCResponse,
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
