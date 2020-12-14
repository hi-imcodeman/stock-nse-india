import axios from 'axios'

export enum ApiList {
    HOLIDAY_TRADING = '/api/holiday-master?type=trading',
    HOLIDAY_CLEARING = '/api/holiday-master?type=clearing',
    MARKET_STATUS = '/api/marketStatus',
    MARKET_TURNOVER = '/api/market-turnover',
    INDEX_NAMES = '/api/index-names',
    CIRCULARS = '/api/circulars',
    LATEST_CIRCULARS = '/api/latest-circular',
    EQUITY_MASTER = '/api/equity-master'
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
            const responseData = await this.getData(`${this.baseUrl}/api/market-data-pre-open?key=ALL`)
            return responseData.data.map((obj: { metadata: { symbol: string } }) => obj.metadata.symbol).sort()
        } catch (error) {
            Promise.reject(error)
        }
    }
    private async getData(url: string) {
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
}