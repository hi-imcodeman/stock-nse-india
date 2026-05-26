import quoteEquityFixture from './__fixtures__/nse/quote-equity-tcs.json'
import preOpenRowFixture from './__fixtures__/nse/preopen-tcs-row.json'
import {
    applyEquityDetailsEnrichment,
    equityRefererSymbol,
    isEquityDetailsShape,
    isEquityTradeInfoShape,
    isIntradayDataShape,
    isRetryableEquityEndpointError,
    mapChartingToIntradayData,
    mapIntradayApiResponse,
    mapPreOpenRowToEquityDetails,
    mapPreOpenRowToEquityTradeInfo,
    mapQuoteEquityResponse,
    mapQuoteEquityTradeInfoResponse
} from './equity-mappers'

describe('equity-mappers', () => {
    test('isEquityDetailsShape accepts quote-equity fixture', () => {
        expect(isEquityDetailsShape(quoteEquityFixture)).toBe(true)
        expect(isEquityDetailsShape({})).toBe(false)
        expect(isEquityDetailsShape({ info: null, priceInfo: {} })).toBe(false)
        expect(isEquityDetailsShape({ info: {}, priceInfo: undefined })).toBe(false)
        expect(isEquityDetailsShape('not-an-object')).toBe(false)
    })

    test('mapQuoteEquityResponse returns fixture as-is', () => {
        const mapped = mapQuoteEquityResponse(quoteEquityFixture)
        expect(mapped.info.symbol).toBe('TCS')
        expect(mapped.priceInfo.lastPrice).toBe(2308.2)
    })

    test('mapQuoteEquityResponse rejects invalid payloads', () => {
        expect(() => mapQuoteEquityResponse({})).toThrow('valid quote-equity payload')
    })

    test('mapQuoteEquityTradeInfoResponse rejects invalid payloads', () => {
        expect(() => mapQuoteEquityTradeInfoResponse({})).toThrow('valid quote-equity trade_info payload')
        expect(isEquityTradeInfoShape(null)).toBe(false)
    })

    test('mapPreOpenRowToEquityDetails builds EquityDetails from pre-open row', () => {
        const mapped = mapPreOpenRowToEquityDetails(preOpenRowFixture as any, 'TCS')
        expect(mapped.info.symbol).toBe('TCS')
        expect(mapped.info.identifier).toBe('TCSEQN')
        expect(mapped.priceInfo.lastPrice).toBe(2308.2)
        expect(mapped.currentMarketType).toBe('preOpen')
        expect(mapped.preOpenMarket.preopen.length).toBeGreaterThan(0)

        const minimal = mapPreOpenRowToEquityDetails({ metadata: { symbol: 'X' } } as any, 'x')
        expect(minimal.info.symbol).toBe('X')
        expect(mapPreOpenRowToEquityDetails(preOpenRowFixture as any, 'TCS', 'NM').currentMarketType)
            .toBe('NM')

        const withPriceInfo = mapPreOpenRowToEquityDetails({
            metadata: { symbol: 'Y' },
            priceInfo: {
                lastPrice: 11,
                change: 1,
                pChange: 2,
                prevClose: 10,
                open: 9,
                close: 12
            },
            detail: {
                preOpenMarket: {
                    preopen: [],
                    ato: { buy: 7, sell: 8 },
                    atoBuyQty: 1,
                    atoSellQty: 2
                }
            }
        } as any, 'Y')
        expect(withPriceInfo.priceInfo.open).toBe(9)
        expect(withPriceInfo.preOpenMarket.ato.buy).toBe(7)
        expect(withPriceInfo.preOpenMarket.atoSellQty).toBe(2)
    })

    test('mapPreOpenRowToEquityTradeInfo builds order book from pre-open row', () => {
        const rowWithAsk = {
            ...preOpenRowFixture,
            metadata: {
                ...preOpenRowFixture.metadata,
                marketCap: 12345,
                totalTurnover: 5000000
            },
            detail: {
                preOpenMarket: {
                    ...preOpenRowFixture.detail.preOpenMarket,
                    preopen: [
                        { price: 100, buyQty: 10, sellQty: 0 },
                        { price: 101, buyQty: 0, sellQty: 5 }
                    ],
                    ato: { buy: 1, sell: 2 }
                }
            }
        }
        const mapped = mapPreOpenRowToEquityTradeInfo(rowWithAsk as any, 'TCS')
        expect(isEquityTradeInfoShape(mapped)).toBe(true)
        expect(mapped.marketDeptOrderBook.bid.length).toBe(1)
        expect(mapped.marketDeptOrderBook.ask.length).toBe(1)
        expect(mapped.marketDeptOrderBook.tradeInfo.totalTradedVolume).toBe(1000)
        expect(mapped.marketDeptOrderBook.tradeInfo.totalMarketCap).toBe(12345)
        expect(mapped.marketDeptOrderBook.tradeInfo.totalTradedValue).toBe(50)

        const dashCap = mapPreOpenRowToEquityTradeInfo({
            metadata: { symbol: 'X', series: 'EQ', marketCap: '-' },
            detail: { preOpenMarket: { preopen: [], ato: { totalBuyQuantity: 3, totalSellQuantity: 4 } } }
        } as any, 'X')
        expect(dashCap.marketDeptOrderBook.tradeInfo.totalMarketCap).toBe(0)
        expect(dashCap.marketDeptOrderBook.totalBuyQuantity).toBe(0)
        expect(mapped.marketDeptOrderBook.tradeInfo.activeSeries).toBe('EQ')
        expect(mapped.securityWiseDP.quantityTraded).toBe(1000)
    })

    test('applyEquityDetailsEnrichment supports partial field updates', () => {
        const base = mapPreOpenRowToEquityDetails({ metadata: { symbol: 'Z' } } as any, 'Z')
        expect(applyEquityDetailsEnrichment(base, { isin: 'INE123' }).metadata.isin).toBe('INE123')
        expect(applyEquityDetailsEnrichment(base, { companyName: '  Co  ' }).info.companyName).toBe('Co')
        expect(applyEquityDetailsEnrichment(base, { currentMarketType: 'NM' }).currentMarketType).toBe('NM')
    })

    test('applyEquityDetailsEnrichment fills company and isin', () => {
        const base = mapPreOpenRowToEquityDetails(preOpenRowFixture as any, 'TCS')
        const enriched = applyEquityDetailsEnrichment(base, {
            companyName: 'Tata Consultancy Services Limited',
            isin: 'INE467B01029',
            industry: 'IT Services',
            currentMarketType: 'NM'
        })
        expect(enriched.info.companyName).toBe('Tata Consultancy Services Limited')
        expect(enriched.info.isin).toBe('INE467B01029')
        expect(enriched.metadata.industry).toBe('IT Services')
        expect(enriched.currentMarketType).toBe('NM')
    })

    test('equityRefererSymbol maps identifiers to page symbols', () => {
        expect(equityRefererSymbol('TCSEQN')).toBe('TCS')
        expect(equityRefererSymbol('TCS-EQ')).toBe('TCS')
        expect(equityRefererSymbol('TCS')).toBe('TCS')
        expect(equityRefererSymbol('  relianceeqn  ')).toBe('RELIANCE')
    })

    test('mapIntradayApiResponse validates and fills name', () => {
        const raw = { identifier: 'X', grapthData: [[1, 2, 'NM']], closePrice: 2 }
        expect(mapIntradayApiResponse(raw, 'tcs').name).toBe('TCS')
        expect(mapIntradayApiResponse({ ...raw, name: 'Custom' }, 'tcs').name).toBe('Custom')
        expect(() => mapIntradayApiResponse({}, 'TCS')).toThrow('valid intraday chart payload')
        expect(isIntradayDataShape(null)).toBe(false)
    })

    test('mapChartingToIntradayData converts OHLC to grapthData', () => {
        const mapped = mapChartingToIntradayData({
            status: true,
            data: [{ volume: 1, high: 10, low: 9, time: 1000, close: 9.5, open: 10 }]
        }, 'TCS')
        expect(isIntradayDataShape(mapped)).toBe(true)
        expect(mapped.name).toBe('TCS')
        expect(mapped.grapthData).toEqual([[1000, 9.5, 'NM']])
        expect(mapped.closePrice).toBe(9.5)

        const empty = mapChartingToIntradayData({ status: true, data: [] }, 'TCS')
        expect(empty.grapthData).toEqual([])
        expect(empty.closePrice).toBe(0)

        const noData = mapChartingToIntradayData({ status: true, data: undefined as any }, 'TCS')
        expect(noData.grapthData).toEqual([])
    })

    test('isRetryableEquityEndpointError detects auth failures', () => {
        expect(isRetryableEquityEndpointError(new Error('Request failed with status code 403 (url)'))).toBe(true)
        expect(isRetryableEquityEndpointError(new Error('Request failed with status code 404 (url)'))).toBe(true)
        expect(isRetryableEquityEndpointError(new Error('status code 502 (url)'))).toBe(true)
        expect(isRetryableEquityEndpointError(new Error('status code 503 (url)'))).toBe(true)
        expect(isRetryableEquityEndpointError(new Error('timeout'))).toBe(false)
        expect(isRetryableEquityEndpointError('not an error')).toBe(false)
    })

    test('applyEquityDetailsEnrichment skips dash industry', () => {
        const base = mapPreOpenRowToEquityDetails(preOpenRowFixture as any, 'TCS')
        const enriched = applyEquityDetailsEnrichment(base, { industry: '-' })
        expect(enriched.metadata.industry).toBe('IT Services')
    })

    test('mapQuoteEquityTradeInfoResponse returns valid trade info as-is', () => {
        const tradeInfo = mapPreOpenRowToEquityTradeInfo(preOpenRowFixture as any, 'TCS')
        expect(mapQuoteEquityTradeInfoResponse(tradeInfo)).toBe(tradeInfo)
    })

    test('mapPreOpenRowToEquityTradeInfo handles sparse rows', () => {
        const sparse = mapPreOpenRowToEquityTradeInfo({} as any, 'abc')
        expect(sparse.marketDeptOrderBook.tradeInfo.activeSeries).toBe('EQ')
        expect(sparse.marketDeptOrderBook.open).toBe(0)

        const noPreopen = mapPreOpenRowToEquityTradeInfo({
            detail: { preOpenMarket: { ato: {} } }
        } as any, 'abc')
        expect(noPreopen.marketDeptOrderBook.bid).toEqual([])

        const nullMeta = mapPreOpenRowToEquityDetails({ metadata: null } as any, 'abc')
        expect(nullMeta.info.symbol).toBe('ABC')
    })
})
