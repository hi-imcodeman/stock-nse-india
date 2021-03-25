import { NseIndia, ApiList } from "./index";

jest.setTimeout(999999)

describe('class: NseIndia', () => {
    const symbol = 'ITC'
    const nseIndia = new NseIndia()
    test('getAllStockSymbols', async () => {
        const symbols = await nseIndia.getAllStockSymbols()
        expect(symbols.length).toBeGreaterThan(1000)
    })
    test('getEquityDetails', async () => {
        const details = await nseIndia.getEquityDetails(symbol)
        expect(details.info.symbol).toBe(symbol)
    })
    test('getEquityTradeInfo', async () => {
        const tradeInfo = await nseIndia.getEquityTradeInfo(symbol)
        expect(Object.keys(tradeInfo).length).toBeGreaterThan(3)
    })
    test('getEquityCorporateInfo', async () => {
        const corpInfo = await nseIndia.getEquityCorporateInfo(symbol)
        expect(Object.keys(corpInfo.corporate).length).toBeGreaterThan(5)
    })
    test('getEquityIntradayData', async () => {
        const intradayData = await nseIndia.getEquityIntradayData(symbol)
        expect(intradayData.name).toBe(symbol)
    })
    test('getEquityIntradayData:preOpen', async () => {
        const intradayData = await nseIndia.getEquityIntradayData(symbol, true)
        expect(intradayData.identifier).toBe(`Pre Open ${symbol}`)
    })
    test('getEquityHistoricalData', async () => {
        const historicalData = await nseIndia.getEquityHistoricalData(symbol)
        expect(historicalData.length).toBeGreaterThan(1)
        expect(historicalData[historicalData.length - 1].data[0].CH_SYMBOL).toBe(symbol)
    })
    test('getEquityHistoricalData with Date range', async () => {
        const range = {
            start: new Date("2021-03-10"),
            end: new Date("2021-03-20")
        }
        const historicalData = await nseIndia.getEquityHistoricalData(symbol, range)
        expect(historicalData[0].data[0].CH_SYMBOL).toBe(symbol)
        expect(historicalData[0].meta.fromDate).toBe('10-03-2021')
        expect(historicalData[0].meta.toDate).toBe('20-03-2021')
    })
    test('getEquitySeries', async () => {
        const seriesData = await nseIndia.getEquitySeries(symbol)
        expect(seriesData.data.length).toBeGreaterThanOrEqual(1)
    })
    test('getIndexIntradayData', async () => {
        const index = 'NIFTY AUTO'
        const intradayData = await nseIndia.getIndexIntradayData(index)
        expect(intradayData.name).toBe(index)
    })
    test('getIndexIntradayData:proOpen', async () => {
        const index = 'NIFTY FIN SERVICE'
        const intradayData = await nseIndia.getIndexIntradayData(index, true)
        expect(intradayData.identifier).toBe(`Pre Open ${index}`)
    })
    describe('ApiList', () => {
        Object.entries(ApiList).forEach(entry => {
            test(`should return content for ${entry[0]}`, async () => {
                const data = await nseIndia.getDataByEndpoint(entry[1])
                const contentLength = JSON.stringify(data).length
                expect(contentLength).not.toBe(0)
            })
        })
    })
})