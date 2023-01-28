import axios from 'axios'
import cheerio from 'cheerio'
import { getDateRangeChunks, sleep } from './utils'
import {
    DateRange,
    IntradayData,
    EquityDetails,
    EquityTradeInfo,
    EquityCorporateInfo,
    EquityHistoricalData,
    SeriesData,
    IndexDetails,
    IndexHistoricalData
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
    private baseUrl = 'https://www.nseindia.com'
    private legacyBaseUrl = 'https://www1.nseindia.com'
    private cookies = ''
    private cookieUsedCount = 0
    private cookieMaxAge = 60 // should be in seconds
    private cookieExpiry = new Date().getTime() + (this.cookieMaxAge * 1000)
    private noOfConnections = 0
    private baseHeaders = {
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive'
    }

    private async getNseCookies() {
        if (this.cookies === '' || this.cookieUsedCount > 10 || this.cookieExpiry <= new Date().getTime()) {
            const response = await axios.get(this.baseUrl, {
                headers: this.baseHeaders
            })
            const setCookies = response.headers['set-cookie']
            const cookies: string[] = []
            setCookies.forEach((cookie: string) => {
                const requiredCookies: string[] = ['nsit', 'nseappid', 'ak_bmsc', 'AKA_A2']
                const cookieKeyValue = cookie.split(';')[0]
                const cookieEntry = cookieKeyValue.split('=')
                if (requiredCookies.includes(cookieEntry[0])) {
                    cookies.push(cookieKeyValue)
                }
            })
            this.cookies = cookies.join('; ')
            this.cookieUsedCount = 0
            this.cookieExpiry = new Date().getTime() + (this.cookieMaxAge * 1000)
        }
        this.cookieUsedCount++
        return this.cookies
    }
    /**
     * 
     * @param url NSE API's URL
     * @returns JSON data from NSE India
     */
    async getData(url: string) {
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
     * @param isLegacy 
     * @returns 
     */
    async getDataByEndpoint(apiEndpoint: string, isLegacy = false) {
        if (!isLegacy)
            return this.getData(`${this.baseUrl}${apiEndpoint}`)
        else
            return this.getData(`${this.legacyBaseUrl}${apiEndpoint}`)
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
        return this.getDataByEndpoint(`/api/quote-equity?symbol=${encodeURIComponent(symbol
            .toUpperCase())}&section=corp_info`)
    }
    /**
     * 
     * @param symbol 
     * @param isPreOpenData 
     * @returns 
     */
    async getEquityIntradayData(symbol: string, isPreOpenData = false): Promise<IntradayData> {
        const details = await this.getEquityDetails(symbol.toUpperCase())
        const identifier = details.info.identifier
        let url = `/api/chart-databyindex?index=${identifier}`
        if (isPreOpenData)
            url += '&preopen=true'
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
            const url = `/api/historical/cm/equity?symbol=${encodeURIComponent(symbol.toUpperCase())}` +
                `&series=[%22${activeSeries}%22]&from=${dateRange.start}&to=${dateRange.end}`
            return this.getDataByEndpoint(url)
        })
        return Promise.all(promises)
    }
    /**
     * 
     * @param symbol 
     * @returns 
     */
    getEquitySeries(symbol: string): Promise<SeriesData> {
        return this.getDataByEndpoint(`/api/historical/cm/equity/series?symbol=${encodeURIComponent(symbol
            .toUpperCase())}`)
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
     * @param isPreOpenData 
     * @returns 
     */
    getIndexIntradayData(index: string, isPreOpenData = false): Promise<IntradayData> {
        let endpoint = `/api/chart-databyindex?index=${index.toUpperCase()}&indices=true`
        if (isPreOpenData)
            endpoint += '&preopen=true'
        return this.getDataByEndpoint(endpoint)
    }
    /**
     * 
     * @param index 
     * @param range 
     * @returns 
     */
    async getIndexHistoricalData(index: string, range: DateRange):Promise<IndexHistoricalData> {
        const dateRanges = getDateRangeChunks(range.start, range.end, 360)
        const promises = dateRanges.map(async (dateRange) => {
            const endpoint = '/products/dynaContent/equities/indices/historicalindices.jsp' +
                `?indexType=${encodeURIComponent(index
                    .toUpperCase())}&fromDate=${dateRange.start}&toDate=${dateRange.end}`
            const html: string = await this.getDataByEndpoint(endpoint, true)
            const $ = cheerio.load(html)
            const historical: any[] = []
            const historicalRecords = $('#csvContentDiv').text().split(':')
            historicalRecords.forEach((record: string, i: number) => {
                if (record && i > 0) {
                    const [date, open, high, low, close, volume, turnover] = record.split(',').map(item => {
                        item = item.replace(/[",\s]/g, '')
                        return item
                    })
                    historical.push({
                        date: new Date(`${date} 17:30:00 GMT+0530`),
                        open: Number(open),
                        high: Number(high),
                        low: Number(low),
                        close: Number(close),
                        volume: Number(volume),
                        turnoverInCrore: Number(turnover)
                    })
                }

            })
            return historical
        })
        const historicalDataArray = await Promise.all(promises)
        let historicalData: any[] = []
        historicalDataArray.forEach(item => {
            historicalData = historicalData.concat(item)
        })
        return {
            indexSymbol: index,
            fromDate: range.start,
            toDate: range.end,
            historicalData
        }
    }
}
