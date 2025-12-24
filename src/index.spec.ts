import { NseIndia, ApiList } from "./index";

jest.setTimeout(999999)

describe('Class: NseIndia', () => {
    const symbol = 'ITC'
    const nseIndia = new NseIndia()
    test('getAllStockSymbols', async () => {
        const symbols = await nseIndia.getAllStockSymbols()
        expect(symbols.length).toBeGreaterThan(1000)
    })
    test('getEquityDetails', async () => {
        const details = await nseIndia.getEquityDetails(symbol.toLowerCase())
        // expect(getDataSchema(details,IS_TYPE_STRICT)).toMatchSnapshot(API_RESPONSE_VALIDATION)
        expect(details.info.symbol).toBe(symbol)
    })

    test('getIndexOptionChain', async () => {
        const optionChain = await nseIndia.getIndexOptionChain('NIFTY')
        // expect(getDataSchema(details,IS_TYPE_STRICT)).toMatchSnapshot(API_RESPONSE_VALIDATION)
        expect(optionChain).toBeDefined()
        expect(optionChain).toHaveProperty('records')
        expect(optionChain).toHaveProperty('filtered')
        // Handle case where filtered or records might be null
        if (optionChain.filtered && optionChain.filtered.data && optionChain.filtered.data.length > 0) {
            const firstItem = optionChain.filtered.data[0]
            expect(firstItem.PE?.underlying || firstItem.CE?.underlying).toBe('NIFTY')
        } else if (optionChain.records && optionChain.records.data && optionChain.records.data.length > 0) {
            const firstItem = optionChain.records.data[0]
            expect(firstItem.PE?.underlying || firstItem.CE?.underlying).toBe('NIFTY')
        }
        // At least one of records or filtered should exist (even if null)
        expect(optionChain.records !== undefined && optionChain.filtered !== undefined).toBe(true)
    })
    test('getIndexOptionChain with expiry', async () => {
        const expiry = '23-Dec-2025'
        const optionChain = await nseIndia.getIndexOptionChain('NIFTY', expiry)
        expect(optionChain).toBeDefined()
        expect(optionChain).toHaveProperty('records')
        expect(optionChain).toHaveProperty('filtered')
        // Handle case where filtered or records might be null
        if (optionChain.filtered && optionChain.filtered.data && optionChain.filtered.data.length > 0) {
            const firstItem = optionChain.filtered.data[0]
            expect(firstItem.PE?.underlying || firstItem.CE?.underlying).toBe('NIFTY')
        } else if (optionChain.records && optionChain.records.data && optionChain.records.data.length > 0) {
            const firstItem = optionChain.records.data[0]
            expect(firstItem.PE?.underlying || firstItem.CE?.underlying).toBe('NIFTY')
        }
        // At least one of records or filtered should exist (even if null)
        expect(optionChain.records !== undefined && optionChain.filtered !== undefined).toBe(true)
    })
    test('getIndexOptionChainContractInfo', async () => {
        const contractInfo = await nseIndia.getIndexOptionChainContractInfo('NIFTY')
        expect(contractInfo).toBeDefined()
        expect(contractInfo.expiryDates).toBeDefined()
        expect(Array.isArray(contractInfo.expiryDates)).toBe(true)
        expect(contractInfo.expiryDates.length).toBeGreaterThan(0)
        expect(contractInfo.strikePrice).toBeDefined()
        expect(Array.isArray(contractInfo.strikePrice)).toBe(true)
        expect(contractInfo.strikePrice.length).toBeGreaterThan(0)
    })
    test('getCommodityOptionChain', async () => {
        const optionChain = await nseIndia.getCommodityOptionChain('CRUDEOIL')
        // expect(getDataSchema(details,IS_TYPE_STRICT)).toMatchSnapshot(API_RESPONSE_VALIDATION)
        expect(optionChain).toBeDefined()
        expect(optionChain).toHaveProperty('records')
        expect(optionChain).toHaveProperty('filtered')
        // Handle case where filtered or records might be null
        if (optionChain.filtered && optionChain.filtered.data && optionChain.filtered.data.length > 0) {
            const firstItem = optionChain.filtered.data[0]
            expect(firstItem.PE?.underlying || firstItem.CE?.underlying).toBe('CRUDEOIL')
        } else if (optionChain.records && optionChain.records.data && optionChain.records.data.length > 0) {
            const firstItem = optionChain.records.data[0]
            expect(firstItem.PE?.underlying || firstItem.CE?.underlying).toBe('CRUDEOIL')
        }
        // At least one of records or filtered should exist (even if null)
        expect(optionChain.records !== undefined && optionChain.filtered !== undefined).toBe(true)
    })
    test('getEquityOptionChain', async () => {
        const optionChain = await nseIndia.getEquityOptionChain('TCS')
        // expect(getDataSchema(details,IS_TYPE_STRICT)).toMatchSnapshot(API_RESPONSE_VALIDATION)
        expect(optionChain).toBeDefined()
        expect(optionChain).toHaveProperty('data')
        expect(optionChain).toHaveProperty('timestamp')
        expect(Array.isArray(optionChain.data)).toBe(true)
        expect(optionChain.data.length).toBeGreaterThan(0)
        const firstItem = optionChain.data[0]
        expect(firstItem).toHaveProperty('underlying')
        expect(firstItem.underlying).toBe('TCS')
    })
    test('getEquityTradeInfo', async () => {
        const tradeInfo = await nseIndia.getEquityTradeInfo(symbol)
        // expect(getDataSchema(tradeInfo,IS_TYPE_STRICT)).toMatchSnapshot(API_RESPONSE_VALIDATION)
        expect(Object.keys(tradeInfo).length).toBeGreaterThan(3)
    })
    test('getEquityCorporateInfo', async () => {
        const data = await nseIndia.getEquityCorporateInfo(symbol)
        // expect(getDataSchema(data,IS_TYPE_STRICT)).toMatchSnapshot(API_RESPONSE_VALIDATION)
        expect(data.latest_announcements.data[0].symbol).toBe(symbol)
    })
    test('getEquityIntradayData', async () => {
        const intradayData = await nseIndia.getEquityIntradayData(symbol)
        // expect(getDataSchema(intradayData,IS_TYPE_STRICT)).toMatchSnapshot(API_RESPONSE_VALIDATION)
        expect(intradayData.name).toBe(symbol)
        expect(intradayData.grapthData).toBeDefined()
        expect(Array.isArray(intradayData.grapthData)).toBe(true)
    })
    test('getEquityHistoricalData', async () => {
        const historicalData = await nseIndia.getEquityHistoricalData(symbol)
        // expect(getDataSchema(historicalData,IS_TYPE_STRICT)).toMatchSnapshot(API_RESPONSE_VALIDATION)
        expect(historicalData.length).toBeGreaterThan(1)
        expect(historicalData[historicalData.length - 1].data[0].chSymbol).toBe(symbol)
    })
    test('getEquityHistoricalData with Date range', async () => {
        const range = {
            start: new Date("2021-03-10"),
            end: new Date("2021-03-20")
        }
        const historicalData = await nseIndia.getEquityHistoricalData(symbol, range)
        // expect(getDataSchema(historicalData,IS_TYPE_STRICT)).toMatchSnapshot(API_RESPONSE_VALIDATION)
        expect(historicalData[0].data[0].chSymbol).toBe(symbol)
        expect(historicalData[0].meta.fromDate).toBe('10-03-2021')
        expect(historicalData[0].meta.toDate).toBe('20-03-2021')
    })
    test('getEquitySeries', async () => {
        const seriesData = await nseIndia.getEquitySeries(symbol)
        // expect(getDataSchema(seriesData,IS_TYPE_STRICT)).toMatchSnapshot(API_RESPONSE_VALIDATION)
        expect(seriesData.data.length).toBeGreaterThanOrEqual(1)
    })
    test('getIndexIntradayData', async () => {
        const index = 'NIFTY 50'
        const intradayData = await nseIndia.getIndexIntradayData(index)
        // expect(getDataSchema(intradayData,IS_TYPE_STRICT)).toMatchSnapshot(API_RESPONSE_VALIDATION)
        expect(intradayData).toBeDefined()
        expect(intradayData.name).toBe(index)
        expect(intradayData.grapthData).toBeDefined()
        expect(Array.isArray(intradayData.grapthData)).toBe(true)
    })
    test('getEquityStockIndices', async () => {
        const index = 'NIFTY AUTO'
        const indexData = await nseIndia.getEquityStockIndices(index)
        // expect(getDataSchema(indexData,IS_TYPE_STRICT)).toMatchSnapshot(API_RESPONSE_VALIDATION)
        expect(indexData.metadata.indexName).toBe(index)
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
            expect((error as Error).message).toBe('Request failed with status code 404')
        }
    })

    // Test convenience methods for better coverage
    test('getGlossary', async () => {
        const glossary = await nseIndia.getGlossary()
        expect(glossary).toBeDefined()
        expect(JSON.stringify(glossary).length).toBeGreaterThan(0)
    })

    test('getTradingHolidays', async () => {
        const holidays = await nseIndia.getTradingHolidays()
        expect(holidays).toBeDefined()
        expect(JSON.stringify(holidays).length).toBeGreaterThan(0)
    })

    test('getClearingHolidays', async () => {
        const holidays = await nseIndia.getClearingHolidays()
        expect(holidays).toBeDefined()
        expect(JSON.stringify(holidays).length).toBeGreaterThan(0)
    })

    test('getMarketStatus', async () => {
        const status = await nseIndia.getMarketStatus()
        expect(status).toBeDefined()
        expect(JSON.stringify(status).length).toBeGreaterThan(0)
    })

    test('getMarketTurnover', async () => {
        const turnover = await nseIndia.getMarketTurnover()
        expect(turnover).toBeDefined()
        expect(JSON.stringify(turnover).length).toBeGreaterThan(0)
    })

    test('getAllIndices', async () => {
        const indices = await nseIndia.getAllIndices()
        expect(indices).toBeDefined()
        expect(JSON.stringify(indices).length).toBeGreaterThan(0)
    })

    test('getIndexNames', async () => {
        const names = await nseIndia.getIndexNames()
        expect(names).toBeDefined()
        expect(JSON.stringify(names).length).toBeGreaterThan(0)
    })

    test('getCirculars', async () => {
        const circulars = await nseIndia.getCirculars()
        expect(circulars).toBeDefined()
        expect(JSON.stringify(circulars).length).toBeGreaterThan(0)
    })

    test('getLatestCirculars', async () => {
        const circulars = await nseIndia.getLatestCirculars()
        expect(circulars).toBeDefined()
        expect(JSON.stringify(circulars).length).toBeGreaterThan(0)
    })

    test('getEquityMaster', async () => {
        const master = await nseIndia.getEquityMaster()
        expect(master).toBeDefined()
        expect(JSON.stringify(master).length).toBeGreaterThan(0)
    })

    test('getPreOpenMarketData', async () => {
        const data = await nseIndia.getPreOpenMarketData()
        expect(data).toBeDefined()
        expect(JSON.stringify(data).length).toBeGreaterThan(0)
    })

    test('getMergedDailyReportsCapital', async () => {
        const reports = await nseIndia.getMergedDailyReportsCapital()
        expect(reports).toBeDefined()
        expect(JSON.stringify(reports).length).toBeGreaterThan(0)
    })

    test('getMergedDailyReportsDerivatives', async () => {
        const reports = await nseIndia.getMergedDailyReportsDerivatives()
        expect(reports).toBeDefined()
        expect(JSON.stringify(reports).length).toBeGreaterThan(0)
    })

    test('getMergedDailyReportsDebt', async () => {
        const reports = await nseIndia.getMergedDailyReportsDebt()
        expect(reports).toBeDefined()
        expect(JSON.stringify(reports).length).toBeGreaterThan(0)
    })

    test('getTechnicalIndicators', async () => {
        const indicators = await nseIndia.getTechnicalIndicators(symbol)
        // expect(getDataSchema(indicators,IS_TYPE_STRICT)).toMatchSnapshot(API_RESPONSE_VALIDATION)
        expect(indicators).toBeDefined()
        expect(indicators).toHaveProperty('sma')
        expect(indicators).toHaveProperty('ema')
        expect(indicators).toHaveProperty('rsi')
        expect(indicators).toHaveProperty('macd')
        expect(indicators).toHaveProperty('bollingerBands')
        expect(indicators).toHaveProperty('stochastic')
        expect(indicators).toHaveProperty('williamsR')
        expect(indicators).toHaveProperty('atr')
        expect(indicators).toHaveProperty('adx')
        expect(indicators).toHaveProperty('obv')
        expect(indicators).toHaveProperty('cci')
        expect(indicators).toHaveProperty('mfi')
        expect(indicators).toHaveProperty('roc')
        expect(indicators).toHaveProperty('momentum')
        expect(indicators).toHaveProperty('ad')
        expect(indicators).toHaveProperty('vwap')
        
        // Verify structure of key indicators
        expect(Array.isArray(indicators.rsi)).toBe(true)
        expect(indicators.rsi.length).toBeGreaterThan(0)
        expect(indicators.macd).toHaveProperty('macd')
        expect(indicators.macd).toHaveProperty('signal')
        expect(indicators.macd).toHaveProperty('histogram')
        expect(Array.isArray(indicators.macd.macd)).toBe(true)
        expect(indicators.bollingerBands).toHaveProperty('upper')
        expect(indicators.bollingerBands).toHaveProperty('middle')
        expect(indicators.bollingerBands).toHaveProperty('lower')
        expect(Array.isArray(indicators.bollingerBands.upper)).toBe(true)
    })

    test('getTechnicalIndicators with custom options', async () => {
        const indicators = await nseIndia.getTechnicalIndicators(symbol, 100, {
            smaPeriods: [5, 10, 20],
            emaPeriods: [5, 10],
            rsiPeriod: 14,
            bbPeriod: 20,
            bbStdDev: 2
        })
        expect(indicators).toBeDefined()
        expect(indicators).toHaveProperty('sma')
        expect(indicators).toHaveProperty('ema')
        expect(indicators).toHaveProperty('rsi')
        // Verify custom SMA periods exist
        expect(indicators.sma).toHaveProperty('sma5')
        expect(indicators.sma).toHaveProperty('sma10')
        expect(indicators.sma).toHaveProperty('sma20')
        // Verify custom EMA periods exist
        expect(indicators.ema).toHaveProperty('ema5')
        expect(indicators.ema).toHaveProperty('ema10')
    })

    describe('ApiList', () => {
        Object.entries(ApiList).forEach(entry => {
            test(`should return content for ${entry[0]}`, async () => {
                const data = await nseIndia.getDataByEndpoint(entry[1])
                // expect(getDataSchema(data,IS_TYPE_STRICT)).toMatchSnapshot(API_RESPONSE_VALIDATION)
                const contentLength = JSON.stringify(data).length
                expect(contentLength).not.toBe(0)
            })
        })
    })
})
