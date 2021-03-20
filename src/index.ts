import axios from 'axios'
import moment from 'moment'
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
export default class NseIndia {
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
    async getAllStockSymbols() {
        try {
            const responseData = await this.getDataByEndpoint(ApiList.MARKET_DATA_PRE_OPEN)
            return responseData.data.map((obj: { metadata: { symbol: string } }) => obj.metadata.symbol).sort()
        } catch (error) {
            Promise.reject(error)
        }
    }
    async getData(url: string) {
        try {
            const response = await axios.get(url, {
                headers: {
                    'Cookie': await this.getNseCookies()
                }
            })
            return response.data
        } catch (error) {
            return Promise.reject(error)
        }
    }
    async getDataByEndpoint(apiEndpoint: string) {
        try {
            return await this.getData(`${this.baseUrl}${apiEndpoint}`)
        } catch (error) {
            Promise.reject(error)
        }
    }
    async getEquityDetails(symbol: string) {
        try {
            return await this.getData(`${this.baseUrl}/api/quote-equity?symbol=${symbol}`)
        } catch (error) {
            Promise.reject(error)
        }
    }
    async getEquityTradeInfo(symbol: string) {
        try {
            return await this.getData(`${this.baseUrl}/api/quote-equity?symbol=${symbol}&section=trade_info`)
        } catch (error) {
            Promise.reject(error)
        }
    }

    async getEquityCorporateInfo(symbol: string) {
        try {
            return await this.getData(`${this.baseUrl}/api/quote-equity?symbol=${symbol}&section=corp_info`)
        } catch (error) {
            Promise.reject(error)
        }
    }
    async getEquityIntradayData(symbol: string, isPreOpenData = false) {
        try {
            const details = await this.getEquityDetails(symbol)
            const identifier = details.info.identifier
            let url = `${this.baseUrl}/api/chart-databyindex?index=${identifier}`
            if (isPreOpenData)
                url += '&preopen=true'
            return await this.getData(url)
        } catch (error) {
            Promise.reject(error)
        }
    }
    async getEquityHistoricalData(symbol: string, range?: DateRange) {
        if (!range) {
            const data = await this.getEquityDetails(symbol)
            range = { start: new Date(data.metadata.listingDate), end: new Date() }
        }
        const dateRanges = getDateRangeChunks(range.start, range.end, 66)
        const promises = dateRanges.map(dateRange => {
            return this.getData(`${this.baseUrl}/api/historical/cm/equity?symbol=${symbol}&series=[%22EQ%22]&from=${dateRange.start}&to=${dateRange.end}`)
        })
        const results = await Promise.all(promises)
        return results

    }
    async getEquitySeries(symbol: string) {
        try {
            return await this.getData(`${this.baseUrl}/api/historical/cm/equity/series?symbol=${symbol}`)
        } catch (error) {
            Promise.reject(error)
        }
    }
    async getIndexIntradayData(index: string, isPreOpenData = false) {
        try {
            let url = `${this.baseUrl}/api/chart-databyindex?index=${index}&indices=true`
            if (isPreOpenData)
                url += '&preopen=true'
            return await this.getData(url)
        } catch (error) {
            Promise.reject(error)
        }
    }
}