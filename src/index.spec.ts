import { NseIndia, ApiList } from "./index";
import { getDataSchema } from './utils'
import { API_RESPONSE_VALIDATION, IS_TYPE_STRICT } from './constants'

describe('Class: NseIndia', () => {
    const symbol = 'ITC'
    const nseIndia = new NseIndia()
    test('getAllStockSymbols', async () => {
        const symbols = await nseIndia.getAllStockSymbols()
        expect(symbols.length).toBeGreaterThan(1000)
    })
    test('getEquityDetails', async () => {
        const details = await nseIndia.getEquityDetails(symbol.toLowerCase())
        expect(getDataSchema(details,IS_TYPE_STRICT)).toMatchSnapshot(API_RESPONSE_VALIDATION)
        expect(details.info.symbol).toBe(symbol)
    })
    test('getEquityTradeInfo', async () => {
        const tradeInfo = await nseIndia.getEquityTradeInfo(symbol)
        expect(getDataSchema(tradeInfo,IS_TYPE_STRICT)).toMatchSnapshot(API_RESPONSE_VALIDATION)
        expect(Object.keys(tradeInfo).length).toBeGreaterThan(3)
    })
    test('getEquityCorporateInfo', async () => {
        const corpInfo = await nseIndia.getEquityCorporateInfo(symbol)
        expect(getDataSchema(corpInfo,IS_TYPE_STRICT)).toMatchSnapshot(API_RESPONSE_VALIDATION)
        expect(Object.keys(corpInfo.corporate).length).toBeGreaterThan(5)
    })
    test('getEquityIntradayData', async () => {
        const intradayData = await nseIndia.getEquityIntradayData(symbol)
        expect(getDataSchema(intradayData,IS_TYPE_STRICT)).toMatchSnapshot(API_RESPONSE_VALIDATION)
        expect(intradayData.name).toBe(symbol)
    })
    test('getEquityIntradayData:preOpen', async () => {
        const intradayData = await nseIndia.getEquityIntradayData(symbol, true)
        expect(getDataSchema(intradayData,IS_TYPE_STRICT)).toMatchSnapshot(API_RESPONSE_VALIDATION)
        expect(intradayData.identifier).toBe(`Pre Open ${symbol}`)
    })
    test('getEquityHistoricalData', async () => {
        const historicalData = await nseIndia.getEquityHistoricalData(symbol)
        expect(getDataSchema(historicalData,IS_TYPE_STRICT)).toMatchSnapshot(API_RESPONSE_VALIDATION)
        expect(historicalData.length).toBeGreaterThan(1)
        expect(historicalData[historicalData.length - 1].data[0].CH_SYMBOL).toBe(symbol)
    })
    test('getEquityHistoricalData with Date range', async () => {
        const range = {
            start: new Date("2021-03-10"),
            end: new Date("2021-03-20")
        }
        const historicalData = await nseIndia.getEquityHistoricalData(symbol, range)
        expect(getDataSchema(historicalData,IS_TYPE_STRICT)).toMatchSnapshot(API_RESPONSE_VALIDATION)
        expect(historicalData[0].data[0].CH_SYMBOL).toBe(symbol)
        expect(historicalData[0].meta.fromDate).toBe('10-03-2021')
        expect(historicalData[0].meta.toDate).toBe('20-03-2021')
    })
    test('getEquitySeries', async () => {
        const seriesData = await nseIndia.getEquitySeries(symbol)
        expect(getDataSchema(seriesData,IS_TYPE_STRICT)).toMatchSnapshot(API_RESPONSE_VALIDATION)
        expect(seriesData.data.length).toBeGreaterThanOrEqual(1)
    })
    test('getIndexIntradayData', async () => {
        const index = 'NIFTY AUTO'
        const intradayData = await nseIndia.getIndexIntradayData(index)
        expect(getDataSchema(intradayData,IS_TYPE_STRICT)).toMatchSnapshot(API_RESPONSE_VALIDATION)
        expect(intradayData.name).toBe(index)
    })
    test('getEquityStockIndices', async () => {
        const index = 'NIFTY AUTO'
        const indexData = await nseIndia.getEquityStockIndices(index)
        expect(getDataSchema(indexData,IS_TYPE_STRICT)).toMatchSnapshot(API_RESPONSE_VALIDATION)
        expect(indexData.metadata.indexName).toBe(index)
    })
    test('getIndexIntradayData:preOpen', async () => {
        const index = 'NIFTY FIN SERVICE'
        const intradayData = await nseIndia.getIndexIntradayData(index, true)
        expect(getDataSchema(intradayData, IS_TYPE_STRICT)).toMatchSnapshot(API_RESPONSE_VALIDATION)
        expect(intradayData.identifier).toBe(`Pre Open ${index}`)
    })
    test('getIndexHistoricalData', async () => {
        const index = 'NIFTY 50'
        const range = {
            start: new Date("2020-01-01"),
            end: new Date("2022-04-14")
        }
        const data = await nseIndia.getIndexHistoricalData(index, range)
        expect(getDataSchema(data,IS_TYPE_STRICT)).toMatchSnapshot(API_RESPONSE_VALIDATION)
        expect(data.indexSymbol).toBe(index)
        expect(data.fromDate).toBe(range.start)
        expect(data.toDate).toBe(range.end)
        expect(data.historicalData.length).toBe(570)
        expect(data.historicalData[0]).toEqual({
            date: new Date('2020-01-01T12:00:00.000Z'),
            open: 12202.15,
            high: 12222.2,
            low: 12165.3,
            close: 12182.5,
            volume: 304078039,
            turnoverInCrore: 10445.68
        })

    })
    test('Multiple request to getaData', async () => {
        const limit = 15
        const symbols = await nseIndia.getAllStockSymbols()
        const selectedSymbols = symbols.filter((_symbol, index) => index < limit)
        const promises = selectedSymbols.map(async (symbol) => {
            const data = await nseIndia.getEquityDetails(symbol)
            return { symbol, data }
        })
        const allData = await Promise.all(promises)
        expect(allData.length).toBe(limit)
    })
    test('Invalid API call', async () => {
        try {
            await nseIndia.getDataByEndpoint('/api/invalidapi')
        } catch (error) {
            expect(error.message).toBe('Request failed with status code 404')
        }
    })

    describe('ApiList', () => {
        Object.entries(ApiList).forEach(entry => {
            test(`should return content for ${entry[0]}`, async () => {
                const data = await nseIndia.getDataByEndpoint(entry[1])
                expect(getDataSchema(data,IS_TYPE_STRICT)).toMatchSnapshot(API_RESPONSE_VALIDATION)
                const contentLength = JSON.stringify(data).length
                expect(contentLength).not.toBe(0)
            })
        })
    })
})
