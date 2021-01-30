import NseIndia, { ApiList } from "./index";

jest.setTimeout(999999)

const sleep = (ms: number) => {
    return new Promise<void>(resolve => {
        setTimeout(() => {
            resolve()
        }, ms)
    })
}

describe('class: NseIndia', () => {
    const nseIndia = new NseIndia()
    test('getAllStockSymbols', async () => {
        const symbols = await nseIndia.getAllStockSymbols()
        expect(symbols.length).toBeGreaterThan(1000)
    })
    test('getEquityDetails', async () => {
        const symbols = await nseIndia.getAllStockSymbols()
        const details = await nseIndia.getEquityDetails(symbols[0])
        expect(details.info.symbol).toBe(symbols[0])
    })
    test('getEquityTradeInfo', async () => {
        const symbols = await nseIndia.getAllStockSymbols()
        const tradeInfo = await nseIndia.getEquityDetails(symbols[0])
        expect(Object.keys(tradeInfo).length).toBeGreaterThan(3)
    })
    test('getEquityCorporateInfo', async () => {
        const symbols = await nseIndia.getAllStockSymbols()
        const corpInfo = await nseIndia.getEquityCorporateInfo(symbols[0])
        expect(Object.keys(corpInfo.corporate).length).toBeGreaterThan(5)
    })
    test('getEquityIntradayData', async () => {
        const symbols = await nseIndia.getAllStockSymbols()
        const intradayData = await nseIndia.getEquityIntradayData(symbols[0])
        expect(intradayData.name).toBe(symbols[0])
    })
    test('getEquityIntradayData:preOpen', async () => {
        const symbols = await nseIndia.getAllStockSymbols()
        const intradayData = await nseIndia.getEquityIntradayData(symbols[0], true)
        expect(intradayData.identifier).toBe(`Pre Open ${symbols[0]}`)
    })
    test('getEquityHistoricalData', async () => {
        const symbols = await nseIndia.getAllStockSymbols()
        const historicalData = await nseIndia.getEquityHistoricalData(symbols[0])
        expect(historicalData.data[0].CH_SYMBOL).toBe(symbols[0])
    })
    test('getEquitySeries', async () => {
        const symbols = await nseIndia.getAllStockSymbols()
        const seriesData = await nseIndia.getEquitySeries(symbols[0])
        expect(seriesData.data.length).toBeGreaterThanOrEqual(1)
    })
    test('getIndexIntradayData', async () => {
        const index= 'NIFTY AUTO'
        const intradayData = await nseIndia.getIndexIntradayData(index)
        expect(intradayData.name).toBe(index)
    })
    test('getIndexIntradayData:proOpen', async () => {
        const index= 'NIFTY FIN SERVICE'
        const intradayData = await nseIndia.getIndexIntradayData(index,true)
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