import axios from 'axios'
import cheerio from 'cheerio'
import { spawnSync, execSync } from "child_process";
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
    IndexHistoricalData
} from './interface'
import { error } from 'console';

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
    private cookies = ''
    private cookieUsedCount = 0
    private cookieMaxAge = 60 // should be in seconds
    private cookieExpiry = new Date().getTime() + (this.cookieMaxAge * 1000)
    private noOfConnections = 0
    private baseHeaders = {
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/118.0',
    }

    private async getNseCookies(useSubProcess: boolean = false) {
        try {
            if (this.cookies === '' || this.cookieUsedCount > 10 || this.cookieExpiry <= new Date().getTime()) {
                var response, setCookies;
                if (useSubProcess) {

                    const curlProcess = spawnSync('curl', [
                        '-i',
                        this.baseUrl,
                        '-H', 'authority: beta.nseindia.com',
                        '-H', 'cache-control: max-age=0',
                        '-H', 'dnt: 1',
                        '-H', 'upgrade-insecure-requests: 1',
                        '-H', 'user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.117 Safari/537.36',
                        '-H', 'accept-encoding: gzip, deflate, br',
                        '-H', 'accept-language: en-US,en;q=0.9,hi;q=0.8',
                    ]);
                    const response = curlProcess.stdout.toString();
                    const lines = response.split('\n');
                    // Find and extract the Set-Cookie header
                    setCookies = lines.filter(line => line.toLowerCase().startsWith('set-cookie'))
                        .map(line => line.split(':')[1].trim());
                        console.log(`getNseCookies => got cookies ${setCookies}`)
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
            console.log(error)
            return "";
        }

    }
    /**
     * 
     * @param url NSE API's URL
     * @returns JSON data from NSE India
     */
    async getData(url: string, useSubProcess: boolean = false) {
        let retries = 0
        let hasError = false
        var response;
        do {
            while (this.noOfConnections >= 5) {
                await sleep(500)
            }
            this.noOfConnections++
            try {
                if(!useSubProcess){
                    response = await axios.get(url, {
                        headers: {
                            ...this.baseHeaders,
                            'Cookie': await this.getNseCookies(useSubProcess),
                        }
                    })
                    response = response.data;
                }
                else{
                    console.log(`getData => Using subprocess`)
                    const curlCommand = await this.constructCurlCommand(url);
                    const commnad = curlCommand[0]
                    const header = curlCommand.slice(1);
                    const result = spawnSync(commnad, header, {encoding:'buffer'});
                    if(result.error){
                        throw error;
                    }
                    else{
                        console.log(`getData => Got data from buffer`)
                        response = gunzipSync(result.stdout).toString('utf-8');
                    }

                    response = JSON.parse(response);
                    console.log(`getData => response `);
                    console.log(response)
                    
                }
                
                this.noOfConnections--
                return response
            } catch (error) {
                hasError = true
                retries++
                this.noOfConnections--
                if (retries >= 10)
                    throw error
            }
        } while (hasError);
    }
    
    async constructCurlCommand(url: string) {
        try {
            var convertedHeaderArr = [
                'curl', '--location', `${url}`,
            ];
            
            for (const [key, value] of Object.entries(this.baseHeaders)) {
                convertedHeaderArr.push("-H");
                convertedHeaderArr.push(`${key}: ${value}`);
            }
            const cookie = await this.getNseCookies(true); 
            console.log(`constructCurlCommand => got cookie ${cookie}`);
            if(cookie != ""){
                convertedHeaderArr = [...convertedHeaderArr, ...[
                    "-H", "HOST: www.nseindia.com",
                    "-H", `Cookie: ${cookie}`,
                    "-H", "Accept: application/json, text/javascript, */*; q=0.01",
                    "-H", "Sec-Fetch-Dest: empty",
                    "-H", "Sec-Fetch-Mode: cors",
                    "-H", "Sec-Fetch-Site: same-origin",
                    "-H", "X-Requested-With: XMLHttpRequest",
                    "-H", "Referer: https://www.nseindia.com/",
                    "-H", "TE: trailers",
                    //"--compressed"//this need compressed arg due to decompress the response from NSE 

                ]]
            }
            console.log(`constructCurlCommand => result array`);
            console.log(convertedHeaderArr);

            return convertedHeaderArr;
           
        } catch (error) {
            throw error;
        }
    }
    /**
     * 
     * @param apiEndpoint 
     * @returns 
     */
    async getDataByEndpoint(apiEndpoint: string, forRepute: boolean = false) {
        return this.getData(`${this.baseUrl}${apiEndpoint}`, forRepute)
    }
    /**
     * 
     * @returns List of NSE equity symbols
     */
    async getAllStockSymbols(forRepute: boolean = false): Promise<string[]> {
        const { data } = await this.getDataByEndpoint(ApiList.MARKET_DATA_PRE_OPEN, forRepute)
        return data.map((obj: { metadata: { symbol: string } }) => obj.metadata.symbol).sort()
    }
    /**
     * 
     * @param symbol 
     * @returns 
     */
    getEquityDetails(symbol: string, forRepute: boolean = false): Promise<EquityDetails> {
        return this.getDataByEndpoint(`/api/quote-equity?symbol=${encodeURIComponent(symbol.toUpperCase())}`, forRepute)
    }
    /**
     * 
     * @param symbol 
     * @returns 
     */
    getEquityTradeInfo(symbol: string, forRepute: boolean = false): Promise<EquityTradeInfo> {
        return this.getDataByEndpoint(`/api/quote-equity?symbol=${encodeURIComponent(symbol
            .toUpperCase())}&section=trade_info`, forRepute)
    }
    /**
     * 
     * @param symbol 
     * @returns 
     */
    getEquityCorporateInfo(symbol: string, forRepute: boolean = false): Promise<any> {
        return this.getDataByEndpoint(`/api/quote-equity?symbol=${encodeURIComponent(symbol
            .toUpperCase())}`, forRepute)
    }
    /**
     * 
     * @param symbol 
     * @param isPreOpenData 
     * @returns 
     */
    async getEquityIntradayData(symbol: string, isPreOpenData = false, forRepute: boolean = false): Promise<IntradayData> {
        const details = await this.getEquityDetails(symbol.toUpperCase(), forRepute)
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
    async getEquityHistoricalData(symbol: string, range?: DateRange, forRepute: boolean = false): Promise<EquityHistoricalData[]> {
        const data = await this.getEquityDetails(symbol.toUpperCase(), forRepute)
        const activeSeries = data.info.activeSeries.length ? data.info.activeSeries[0] : /* istanbul ignore next */ 'EQ'
        if (!range) {
            range = { start: new Date(data.metadata.listingDate), end: new Date() }
        }
        const dateRanges = getDateRangeChunks(range.start, range.end, 66)
        const promises = dateRanges.map(async (dateRange) => {
            const url = `/api/historical/cm/equity?symbol=${encodeURIComponent(symbol.toUpperCase())}` +
                `&series=[%22${activeSeries}%22]&from=${dateRange.start}&to=${dateRange.end}`
            return this.getDataByEndpoint(url, forRepute)
        })
        return Promise.all(promises)
    }
    /**
     * 
     * @param symbol 
     * @returns 
     */
    getEquitySeries(symbol: string, forRepute: boolean = false): Promise<SeriesData> {
        return this.getDataByEndpoint(`/api/historical/cm/equity/series?symbol=${encodeURIComponent(symbol
            .toUpperCase())}`, forRepute)
    }
    /**
     * 
     * @param index 
     * @returns 
     */
    getEquityStockIndices(index: string, forRepute: boolean = false): Promise<IndexDetails> {
        return this.getDataByEndpoint(`/api/equity-stockIndices?index=${encodeURIComponent(index.toUpperCase())}`, forRepute)
    }
    /**
     * 
     * @param index 
     * @param isPreOpenData 
     * @returns 
     */
    getIndexIntradayData(index: string, isPreOpenData = false, forRepute: boolean = false): Promise<IntradayData> {
        let endpoint = `/api/chart-databyindex?index=${index.toUpperCase()}&indices=true`
        if (isPreOpenData)
            endpoint += '&preopen=true'
        return this.getDataByEndpoint(endpoint, forRepute)
    }
    /**
     * 
     * @param index 
     * @param range 
     * @returns 
     */
    async getIndexHistoricalData(index: string, range: DateRange, forRepute: boolean = false): Promise<IndexHistoricalData[]> {
        const dateRanges = getDateRangeChunks(range.start, range.end, 66)
        const promises = dateRanges.map(async (dateRange) => {
            const url = `/api/historical/indicesHistory?indexType=${encodeURIComponent(index.toUpperCase())}` +
                `&from=${dateRange.start}&to=${dateRange.end}`
            return this.getDataByEndpoint(url, forRepute)
        })
        return Promise.all(promises)
    }
}
