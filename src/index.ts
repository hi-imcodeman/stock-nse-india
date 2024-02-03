import axios from 'axios'
import { spawnSync } from "child_process";
import { gunzipSync } from 'zlib';
import { getDateRangeChunks, sleep } from './utils'
import {
    DateRange,
    IntradayData,
    EquityDetails,
    EquityTradeInfo,
    EquityHistoricalData,
    SeriesData,
    IndexDetails,
    IndexHistoricalData,
} from './interface'
import { ApiList } from './apiList';

export interface NseIndiaOptions {
    useSubProcess?: boolean
}
export class NseIndia {
    private baseUrl = 'https://www.nseindia.com'
    private cookies = ''
    private cookieUsedCount = 0
    private cookieMaxAge = 60 // should be in seconds
    private cookieExpiry = new Date().getTime() + (this.cookieMaxAge * 1000)
    private noOfConnections = 0
    private options: NseIndiaOptions = {
        useSubProcess: false
    }
    private baseHeaders = {
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/118.0',
    }

    constructor(options?: NseIndiaOptions) {
        if (options) {
            this.options = options
        }
    }

    private async getNseCookies(): Promise<string> {
        try {
            if (this.cookies === '' || this.cookieUsedCount > 10 || this.cookieExpiry <= new Date().getTime()) {
                let response, setCookies;
                if (this.options.useSubProcess) {

                    const curlProcess = spawnSync('curl', [
                        '-i',
                        this.baseUrl,
                        '-H', 'authority: beta.nseindia.com',
                        '-H', 'cache-control: max-age=0',
                        '-H', 'dnt: 1',
                        '-H', 'upgrade-insecure-requests: 1',
                        // eslint-disable-next-line max-len
                        '-H', 'user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.117 Safari/537.36',
                        '-H', 'accept-encoding: gzip, deflate, br',
                        '-H', 'accept-language: en-US,en;q=0.9,hi;q=0.8',
                    ]);
                    const response = curlProcess.stdout.toString();
                    const lines = response.split('\n');
                    // Find and extract the Set-Cookie header
                    setCookies = lines.filter(line => line.toLowerCase().startsWith('set-cookie'))
                        .map(line => line.split(':')[1].trim());
                    // console.log(`getNseCookies => got cookies ${setCookies}`)
                } else {
                    response = await axios.get(this.baseUrl, {
                        headers: this.baseHeaders
                    })
                    setCookies = response.headers['set-cookie']
                }


                const cookies: string[] = []
                setCookies.forEach((cookie: string) => {
                    const requiredCookies: string[] = ['nsit', 'nseappid', 'ak_bmsc', 'AKA_A2', 'bm_mi', 'bm_sv']
                    const cookieKeyValue = cookie.split(';')[0]
                    const cookieEntry = cookieKeyValue.split('=')
                    /* istanbul ignore else */
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
        } catch (error) {
            /* istanbul ignore next */
            {
                console.error(error)
                throw error
            }
        }
    }
    /**
     * 
     * @param url NSE API's URL
     * @returns JSON data from NSE India
     */
    async getData(url: string): Promise<unknown> {
        let retries = 0
        let hasError = false
        let response;
        /* istanbul ignore else */
        do {
            while (this.noOfConnections >= 5) {
                await sleep(500)
            }
            this.noOfConnections++
            try {
                if (!this.options.useSubProcess) {
                    response = await axios.get(url, {
                        headers: {
                            ...this.baseHeaders,
                            'Cookie': await this.getNseCookies(),
                        }
                    })
                    response = response.data;
                }
                else {
                    // eslint-disable-next-line no-console
                    console.log(`getData => Using CURL subProcess`)
                    const curlCommand = await this.constructCurlCommand(url);
                    const commnad = curlCommand[0]
                    const header = curlCommand.slice(1);
                    const result = spawnSync(commnad, header, { encoding: 'buffer' });
                    /* istanbul ignore if */
                    if (result.error) {
                        console.error(result.error)
                        throw result.error;
                    }
                    else {
                        // eslint-disable-next-line no-console
                        console.log(`getData => Got data from buffer`)
                        response = gunzipSync(result.stdout).toString('utf-8');
                    }
                    response = JSON.parse(response);
                }
                this.noOfConnections--
                return response
            } catch (error) {
                hasError = true
                retries++
                this.noOfConnections--
                if (retries >= 10) {
                    console.error(`Error in getting data from NSE India. Retries exhausted. ${error}`)
                    throw error
                }

            }
        } while(hasError);
    }

    async constructCurlCommand(url: string): Promise<string[]> {
        try {

            const curlCommand = [
                'curl', '--location', `${url}`,
            ];

            for (const [key, value] of Object.entries(this.baseHeaders)) {
                curlCommand.push("-H");
                curlCommand.push(`${key}: ${value}`);
            }
            const cookie = await this.getNseCookies();
            /* istanbul ignore else */
            if (cookie) {
                curlCommand.push(
                    "-H", "HOST: www.nseindia.com",
                    "-H", `Cookie: ${cookie}`,
                    "-H", "Accept: application/json, text/javascript, */*; q=0.01",
                    "-H", "Sec-Fetch-Dest: empty",
                    "-H", "Sec-Fetch-Mode: cors",
                    "-H", "Sec-Fetch-Site: same-origin",
                    "-H", "X-Requested-With: XMLHttpRequest",
                    "-H", "Referer: https://www.nseindia.com",
                    "-H", "TE: trailers",
                    //"--compressed"//this need compressed arg due to decompress the response from NSE 
                );
            }
            return curlCommand;
        } catch (error) {
            /* istanbul ignore next */
            {
                console.error(error)
                throw error
            }
        }
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
    getEquityCorporateInfo(symbol: string): Promise<any[]> {
        return this.getDataByEndpoint(`/api/corp-info?symbol=${encodeURIComponent(symbol
            .toUpperCase())}&corpType=announcement&market=equities`)
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
    async getIndexHistoricalData(index: string, range: DateRange): Promise<IndexHistoricalData[]> {
        const dateRanges = getDateRangeChunks(range.start, range.end, 66)
        const promises = dateRanges.map(async (dateRange) => {
            const url = `/api/historical/indicesHistory?indexType=${encodeURIComponent(index.toUpperCase())}` +
                `&from=${dateRange.start}&to=${dateRange.end}`
            return this.getDataByEndpoint(url)
        })
        return Promise.all(promises)
    }
}
