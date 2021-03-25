import axios from 'axios'
import { getDateRangeChunks } from './utils'

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

export interface DateRange {
    start: Date
    end: Date
}
export class NseIndia {
    private baseUrl = 'https://www.nseindia.com'
    private cookies = ''
    private cookieUsedCount = 0
    private cookieMaxAge = 60 // should be in seconds
    private cookieExpiry = new Date().getTime() + (this.cookieMaxAge * 1000)

    private async getNseCookies() {
        if (this.cookies === '' || this.cookieUsedCount > 10 || this.cookieExpiry <= new Date().getTime()) {
            const response = await axios.get(this.baseUrl)
            const setCookies = response.headers['set-cookie']
            const cookies: string[] = []
            setCookies.forEach((cookie: string) => {
                const requiredCookies: string[] = ['nsit', 'nseappid']
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

    async getData(url: string) {
        const response = await axios.get(url, {
            headers: {
                'Cookie': await this.getNseCookies()
            }
        })
        return response.data
    }

    getDataByEndpoint(apiEndpoint: string) {
        return this.getData(`${this.baseUrl}${apiEndpoint}`)
    }

    async getAllStockSymbols() {
        const responseData = await this.getDataByEndpoint(ApiList.MARKET_DATA_PRE_OPEN)
        return responseData.data.map((obj: { metadata: { symbol: string } }) => obj.metadata.symbol).sort()
    }
    getEquityDetails(symbol: string) {
        return this.getDataByEndpoint(`/api/quote-equity?symbol=${symbol}`)
    }
    getEquityTradeInfo(symbol: string) {
        return this.getDataByEndpoint(`/api/quote-equity?symbol=${symbol}&section=trade_info`)
    }
    getEquityCorporateInfo(symbol: string) {
        return this.getDataByEndpoint(`/api/quote-equity?symbol=${symbol}&section=corp_info`)
    }
    async getEquityIntradayData(symbol: string, isPreOpenData = false) {
        const details = await this.getEquityDetails(symbol)
        const identifier = details.info.identifier
        let url = `/api/chart-databyindex?index=${identifier}`
        if (isPreOpenData)
            url += '&preopen=true'
        return this.getDataByEndpoint(url)
    }
    async getEquityHistoricalData(symbol: string, range?: DateRange) {
        if (!range) {
            const data = await this.getEquityDetails(symbol)
            range = { start: new Date(data.metadata.listingDate), end: new Date() }
        }
        const dateRanges = getDateRangeChunks(range.start, range.end, 66)
        const promises = dateRanges.map(dateRange => {
            return this.getDataByEndpoint(`/api/historical/cm/equity?symbol=${symbol}` +
                `&series=[%22EQ%22]&from=${dateRange.start}&to=${dateRange.end}`)
        })
        return Promise.all(promises)
    }
    getEquitySeries(symbol: string) {
        return this.getDataByEndpoint(`/api/historical/cm/equity/series?symbol=${symbol}`)
    }
    getIndexIntradayData(index: string, isPreOpenData = false) {
        let url = `/api/chart-databyindex?index=${index}&indices=true`
        if (isPreOpenData)
            url += '&preopen=true'
        return this.getDataByEndpoint(url)
    }
}