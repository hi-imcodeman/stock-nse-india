import { NseIndia, ApiList } from './index'
import quoteEquityFixture from './__fixtures__/nse/quote-equity-tcs.json'
import axios from 'axios'

describe('Class: NseIndia (mocked)', () => {
    let nseIndia: NseIndia
    let getDataByEndpointSpy: jest.SpyInstance

    beforeEach(() => {
        nseIndia = new NseIndia()
        getDataByEndpointSpy = jest.spyOn(nseIndia, 'getDataByEndpoint')
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    test('getAllStockSymbols returns sorted symbols from pre-open market data', async () => {
        getDataByEndpointSpy.mockResolvedValue({
            data: [
                { metadata: { symbol: 'TCS' } },
                { metadata: { symbol: 'ITC' } }
            ]
        })

        const symbols = await nseIndia.getAllStockSymbols()

        expect(symbols).toEqual(['ITC', 'TCS'])
        expect(getDataByEndpointSpy).toHaveBeenCalledWith(ApiList.MARKET_DATA_PRE_OPEN)
    })

    test('getEquityDetails returns mapped quote-equity payload', async () => {
        getDataByEndpointSpy.mockResolvedValue(quoteEquityFixture)

        const details = await nseIndia.getEquityDetails('tcs')

        expect(details.info.symbol).toBe('TCS')
        expect(details.priceInfo.lastPrice).toBe(2308.2)
    })

    test('getIndexOptionChain with expiry calls option-chain endpoint', async () => {
        const mockOptionChain = {
            records: { data: [{ CE: { underlying: 'NIFTY' } }] },
            filtered: { data: [] }
        }
        getDataByEndpointSpy.mockResolvedValue(mockOptionChain)

        const optionChain = await nseIndia.getIndexOptionChain('NIFTY', '23-Dec-2025')

        expect(optionChain).toEqual(mockOptionChain)
        expect(getDataByEndpointSpy).toHaveBeenCalledWith(
            '/api/option-chain-v3?type=Indices&symbol=NIFTY&expiry=23-Dec-2025'
        )
    })

    test('getIndexOptionChainContractInfo returns contract metadata', async () => {
        const contractInfo = {
            expiryDates: ['23-Dec-2025'],
            strikePrice: [24000, 24100]
        }
        getDataByEndpointSpy.mockResolvedValue(contractInfo)

        const result = await nseIndia.getIndexOptionChainContractInfo('NIFTY')

        expect(result).toEqual(contractInfo)
    })

    test('getEquityOptionChain returns equity derivatives payload', async () => {
        const mockPayload = {
            data: [{ underlying: 'TCS' }],
            timestamp: '2025-01-01T10:00:00'
        }
        getDataByEndpointSpy.mockResolvedValue(mockPayload)

        const optionChain = await nseIndia.getEquityOptionChain('TCS')

        expect(optionChain).toEqual(mockPayload)
    })

    test('getEquityCorporateInfo calls top-corp-info endpoint', async () => {
        const corporateInfo = {
            latest_announcements: { data: [{ symbol: 'ITC' }] }
        }
        getDataByEndpointSpy.mockResolvedValue(corporateInfo)

        const data = await nseIndia.getEquityCorporateInfo('ITC')

        expect(data).toEqual(corporateInfo)
        expect(getDataByEndpointSpy).toHaveBeenCalledWith('/api/top-corp-info?symbol=ITC&market=equities')
    })

    test('getEquityStockIndices returns index metadata', async () => {
        const indexData = {
            metadata: { indexName: 'NIFTY AUTO' },
            data: []
        }
        getDataByEndpointSpy.mockResolvedValue(indexData)

        const result = await nseIndia.getEquityStockIndices('NIFTY AUTO')

        expect(result.metadata.indexName).toBe('NIFTY AUTO')
    })

    test('getGlossary delegates to ApiList endpoint', async () => {
        const glossary = { terms: [{ term: 'IEP', definition: 'Indicative Equilibrium Price' }] }
        getDataByEndpointSpy.mockResolvedValue(glossary)

        const result = await nseIndia.getGlossary()

        expect(result).toEqual(glossary)
        expect(getDataByEndpointSpy).toHaveBeenCalledWith(ApiList.GLOSSARY)
    })

    test('getMarketStatus delegates to ApiList endpoint', async () => {
        const status = { marketState: [{ market: 'Capital Market', marketStatus: 'Open' }] }
        getDataByEndpointSpy.mockResolvedValue(status)

        const result = await nseIndia.getMarketStatus()

        expect(result).toEqual(status)
        expect(getDataByEndpointSpy).toHaveBeenCalledWith(ApiList.MARKET_STATUS)
    })

    test('getDataByEndpoint propagates API errors', async () => {
        jest.spyOn(nseIndia, 'getData').mockRejectedValue(
            new Error('Request failed with status code 404')
        )

        await expect(nseIndia.getDataByEndpoint('/api/invalidapi')).rejects.toThrow(
            'Request failed with status code 404'
        )
    })

    test('getEquityTradeInfo maps trade_info quote payload', async () => {
        getDataByEndpointSpy.mockResolvedValue({
            securityWiseDP: { quantityTraded: 10, deliveryQuantity: 6, deliveryToTradedQuantity: 60 },
            marketDeptOrderBook: { tradeInfo: { deliveryToTradedQuantity: 60 } }
        })

        const result = await nseIndia.getEquityTradeInfo('TCS')
        expect(result.securityWiseDP.quantityTraded).toBe(10)
    })

    test('getEquityTradeInfo uses pre-open fallback for retryable quote errors', async () => {
        getDataByEndpointSpy
            .mockRejectedValueOnce(new Error('Request failed with status code 403'))
            .mockResolvedValueOnce({
                data: [
                    {
                        metadata: { symbol: 'TCS' },
                        detail: {
                            preOpenMarket: {
                                totalTradedVolume: 20,
                                totalBuyQuantity: 5,
                                totalSellQuantity: 10
                            }
                        }
                    }
                ]
            })

        const result = await nseIndia.getEquityTradeInfo('TCS')
        expect(result.securityWiseDP.quantityTraded).toBe(20)
    })

    test('getEquityHistoricalData wraps array response with meta', async () => {
        jest.spyOn(nseIndia, 'getEquityDetails').mockResolvedValue({
            info: { activeSeries: ['EQ'] },
            metadata: { listingDate: '01-Jan-2025' }
        } as never)
        getDataByEndpointSpy.mockResolvedValue([{ chSymbol: 'TCS' }])

        const data = await nseIndia.getEquityHistoricalData('TCS')
        expect(Array.isArray(data)).toBe(true)
        expect(Array.isArray(data[0].data)).toBe(true)
        expect(data[0].meta.series).toEqual(['EQ'])
    })

    test('getEquitySeries wraps response as series data', async () => {
        getDataByEndpointSpy.mockResolvedValue(['EQ', 'BE'])
        const data = await nseIndia.getEquitySeries('TCS')
        expect(data.data).toEqual(['EQ', 'BE'])
    })

    test('getEquityStockIndices falls back to summary endpoint on 404 legacy response', async () => {
        const getDataSpy = jest.spyOn(nseIndia, 'getData')
        getDataSpy
            .mockRejectedValueOnce(new Error('Request failed with status code 404'))
            .mockResolvedValueOnce({ data: [{ symbol: 'TCS' }] })

        const data = await nseIndia.getEquityStockIndices('NIFTY 50')
        expect(data.data.length).toBe(1)
    })

    test('getIndexIntradayData returns response.data when wrapped payload exists', async () => {
        getDataByEndpointSpy.mockResolvedValue({ data: { name: 'NIFTY 50', grapthData: [] } })
        const data = await nseIndia.getIndexIntradayData('NIFTY 50')
        expect(data.name).toBe('NIFTY 50')
    })

    test('getCommodityOptionChain calls commodity endpoint', async () => {
        getDataByEndpointSpy.mockResolvedValue({ records: {}, filtered: {} })
        await nseIndia.getCommodityOptionChain('crudeoil')
        expect(getDataByEndpointSpy).toHaveBeenCalledWith('/api/option-chain-com?symbol=CRUDEOIL')
    })

    test('misc ApiList convenience methods delegate correctly', async () => {
        getDataByEndpointSpy.mockResolvedValue({ ok: true })
        await nseIndia.getTradingHolidays()
        await nseIndia.getClearingHolidays()
        await nseIndia.getMarketTurnover()
        await nseIndia.getAllIndices()
        await nseIndia.getIndexNames()
        await nseIndia.getCirculars()
        await nseIndia.getLatestCirculars()
        await nseIndia.getEquityMaster()
        await nseIndia.getPreOpenMarketData()
        await nseIndia.getMergedDailyReportsCapital()
        await nseIndia.getMergedDailyReportsDerivatives()
        await nseIndia.getMergedDailyReportsDebt()

        expect(getDataByEndpointSpy).toHaveBeenCalledWith(ApiList.HOLIDAY_TRADING)
        expect(getDataByEndpointSpy).toHaveBeenCalledWith(ApiList.HOLIDAY_CLEARING)
        expect(getDataByEndpointSpy).toHaveBeenCalledWith(ApiList.MARKET_TURNOVER)
        expect(getDataByEndpointSpy).toHaveBeenCalledWith(ApiList.ALL_INDICES)
        expect(getDataByEndpointSpy).toHaveBeenCalledWith(ApiList.INDEX_NAMES)
        expect(getDataByEndpointSpy).toHaveBeenCalledWith(ApiList.CIRCULARS)
        expect(getDataByEndpointSpy).toHaveBeenCalledWith(ApiList.LATEST_CIRCULARS)
        expect(getDataByEndpointSpy).toHaveBeenCalledWith(ApiList.EQUITY_MASTER)
        expect(getDataByEndpointSpy).toHaveBeenCalledWith(ApiList.MARKET_DATA_PRE_OPEN)
        expect(getDataByEndpointSpy).toHaveBeenCalledWith(ApiList.MERGED_DAILY_REPORTS_CAPITAL)
        expect(getDataByEndpointSpy).toHaveBeenCalledWith(ApiList.MERGED_DAILY_REPORTS_DERIVATIVES)
        expect(getDataByEndpointSpy).toHaveBeenCalledWith(ApiList.MERGED_DAILY_REPORTS_DEBT)
    })

    test('getTechnicalIndicators delegates to helpers module', async () => {
        const helpersModule = await import('./helpers')
        const technicalSpy = jest
            .spyOn(helpersModule, 'getTechnicalIndicators')
            .mockResolvedValue({ rsi: [50] } as never)

        const result = await nseIndia.getTechnicalIndicators('TCS', 20, { rsiPeriod: 14 })

        expect(technicalSpy).toHaveBeenCalledWith('TCS', 20, { rsiPeriod: 14 })
        expect(result).toEqual({ rsi: [50] })
    })

    test('private session helpers handle invalidation and error conversion', async () => {
        const anyNse = nseIndia as any
        anyNse.chartingCookies = 'abc'
        anyNse.chartingCookieExpiry = Date.now() + 1000
        anyNse.invalidateChartingSession()
        expect(anyNse.chartingCookies).toBe('')

        expect(anyNse.isAuthError(new Error('x'))).toBe(false)
        const err = anyNse.toHttpError('plain-string')
        expect(err.message).toContain('plain-string')
        expect(anyNse.toHttpError(new Error('native')).message).toBe('native')
    })

    test('isAuthError and toHttpError handle axios-style errors', async () => {
        const anyNse = nseIndia as any
        const axiosLikeError = {
            isAxiosError: true,
            response: { status: 403 },
            config: { url: 'https://example.test' }
        }
        jest.spyOn(axios, 'isAxiosError').mockImplementation((e) => e === axiosLikeError)
        expect(anyNse.isAuthError(axiosLikeError)).toBe(true)

        const httpErr = anyNse.toHttpError(axiosLikeError)
        expect(httpErr.message).toContain('status code 403')
        expect(httpErr.message).toContain('https://example.test')
    })

    test('toHttpError uses unknown placeholders when axios fields are missing', async () => {
        const anyNse = nseIndia as any
        const axiosLikeError = { isAxiosError: true }
        jest.spyOn(axios, 'isAxiosError').mockImplementation((e) => e === axiosLikeError)
        expect(anyNse.toHttpError(axiosLikeError).message).toBe(
            'Request failed with status code unknown (unknown URL)'
        )
    })

    test('warmEquityQuotePage builds expected quote URL', async () => {
        const warmSpy = jest.spyOn(nseIndia as any, 'warmNsePage').mockResolvedValue(undefined)
        await (nseIndia as any).warmEquityQuotePage('tcs')
        expect(warmSpy).toHaveBeenCalledWith('/get-quotes/equity?symbol=TCS')
    })

    test('getNseCookies delegates to ensureNseSession', async () => {
        const ensureSpy = jest.spyOn(nseIndia as any, 'ensureNseSession').mockResolvedValue('cookie=1')
        const cookies = await (nseIndia as any).getNseCookies()
        expect(cookies).toBe('cookie=1')
        expect(ensureSpy).toHaveBeenCalled()
    })

    test('getData retries auth errors and then throws after max retries', async () => {
        const anyNse = nseIndia as any
        anyNse.maxRetries = 1
        anyNse.noOfConnections = 0
        jest.spyOn(anyNse, 'ensureNseSession').mockResolvedValue('cookie=1')
        anyNse.nseClient = {
            get: jest.fn().mockRejectedValue({ isAxiosError: true, response: { status: 403 }, config: { url: 'u' } })
        }

        await expect(nseIndia.getData('https://www.nseindia.com/api/quote-equity?symbol=TCS')).rejects.toThrow(
            'NSE request failed after 1 attempts'
        )
    })

    test('getData sets quote referer path for equity endpoints', async () => {
        const anyNse = nseIndia as any
        jest.spyOn(anyNse, 'ensureNseSession').mockResolvedValue('cookie=1')
        const warmSpy = jest.spyOn(anyNse, 'warmEquityQuotePage').mockResolvedValue(undefined)
        anyNse.nseClient = { get: jest.fn().mockResolvedValue({ data: { ok: true } }) }

        const data = await nseIndia.getData('https://www.nseindia.com/api/quote-equity?symbol=TCS')
        expect(data).toEqual({ ok: true })
        expect(warmSpy).toHaveBeenCalledWith('TCS')
    })

    test('getData sets index referer path for equity-stockIndices endpoint', async () => {
        const anyNse = nseIndia as any
        jest.spyOn(anyNse, 'ensureNseSession').mockResolvedValue('cookie=1')
        const warmSpy = jest.spyOn(anyNse, 'warmNsePage').mockResolvedValue(undefined)
        anyNse.nseClient = { get: jest.fn().mockResolvedValue({ data: { ok: true } }) }

        await nseIndia.getData('https://www.nseindia.com/api/equity-stockIndices?index=NIFTY%2050')
        expect(warmSpy).toHaveBeenCalled()
    })

    test('getEquitySymbolInfo supports wrapped response.data array', async () => {
        jest.spyOn(nseIndia, 'getData').mockResolvedValue({
            data: [{ symbol: 'ONGC', scripcode: '2475' }]
        })
        const info = await nseIndia.getEquitySymbolInfo('ONGC')
        expect(info.scripcode).toBe('2475')
    })

    test('resolveCapitalMarketType and enrichment helpers return expected values', async () => {
        jest.spyOn(nseIndia, 'getMarketStatus').mockResolvedValue({
            marketState: [{ market: 'Capital Market', marketStatus: 'Pre Open' }]
        } as never)
        const type = await (nseIndia as any).resolveCapitalMarketType()
        expect(type).toBe('preOpen')

        jest.spyOn(nseIndia, 'getEquitySymbolInfo').mockResolvedValue({
            companyName: 'Company A',
            isin: 'INE123'
        } as never)
        jest.spyOn(nseIndia, 'getDataByEndpoint').mockResolvedValue([
            { companyName: 'Company B', isin: 'INE999', industry: 'IT' }
        ])
        const enrichment = await (nseIndia as any).fetchEquityDetailsEnrichment('TCS')
        expect(enrichment).toEqual({ companyName: 'Company B', isin: 'INE999', industry: 'IT' })
    })

    test('getEquityDetails and getEquityTradeInfo include fallback attempt errors', async () => {
        getDataByEndpointSpy
            .mockResolvedValueOnce({})
            .mockResolvedValueOnce({ data: [] })
            .mockResolvedValueOnce({})
            .mockResolvedValueOnce({ data: [] })

        await expect(nseIndia.getEquityDetails('TCS')).rejects.toThrow('No equity quote available for TCS')
        await expect(nseIndia.getEquityTradeInfo('TCS')).rejects.toThrow('No equity trade info available for TCS')
    })

    test('getEquityIntradayData falls back to charting map and then throws when empty', async () => {
        getDataByEndpointSpy.mockResolvedValueOnce({}).mockResolvedValueOnce({})
        jest.spyOn(nseIndia, 'getEquityChartHistoricalData').mockResolvedValue({ data: [{ t: 1 }] } as never)
        const mapped = await nseIndia.getEquityIntradayData('TCS')
        expect(mapped.name).toBe('TCS')

        getDataByEndpointSpy.mockResolvedValueOnce({}).mockResolvedValueOnce({})
        jest.spyOn(nseIndia, 'getEquityChartHistoricalData').mockResolvedValueOnce({ data: [] } as never)
        await expect(nseIndia.getEquityIntradayData('TCS')).rejects.toThrow('No intraday data available for TCS')
    })

    test('getEquityHistoricalData range mode falls back to EQ when series lookup fails', async () => {
        jest.spyOn(nseIndia, 'getEquitySeries').mockRejectedValue(new Error('series unavailable'))
        getDataByEndpointSpy.mockResolvedValue([])
        const result = await nseIndia.getEquityHistoricalData('TCS', {
            start: new Date('2025-01-01'),
            end: new Date('2025-01-05')
        })
        expect(result[0].meta.series).toEqual(['EQ'])
    })

    test('getEquityStockIndices keeps legacy response when it has data and throws for non-404 errors', async () => {
        const getDataSpy = jest.spyOn(nseIndia, 'getData')
        getDataSpy.mockResolvedValueOnce({ records: [{ symbol: 'X' }] } as never)
        const data = await nseIndia.getEquityStockIndices('NIFTY NEXT 50')
        expect(data.data.length).toBe(1)

        getDataSpy.mockRejectedValueOnce(new Error('Request failed with status code 500'))
        await expect(nseIndia.getEquityStockIndices('NIFTY 50')).rejects.toThrow('500')
    })

    test('warmNsePage converts unknown failures to HTTP error', async () => {
        const anyNse = nseIndia as any
        anyNse.nseClient = { get: jest.fn().mockRejectedValue('boom') }
        await expect(anyNse.warmNsePage('/market-data')).rejects.toThrow('boom')
    })

    test('getData waits when too many connections exist', async () => {
        const anyNse = nseIndia as any
        anyNse.noOfConnections = 5
        setTimeout(() => {
            anyNse.noOfConnections = 0
        }, 10)
        jest.spyOn(anyNse, 'ensureNseSession').mockResolvedValue('cookie=1')
        anyNse.nseClient = { get: jest.fn().mockResolvedValue({ data: { ok: true } }) }

        const result = await nseIndia.getData('https://www.nseindia.com/api/allIndices')
        expect(result).toEqual({ ok: true })
    })

    test('getEquityChartHistoricalData auto-fetches token when missing', async () => {
        jest.spyOn(nseIndia, 'getEquitySymbolInfo').mockResolvedValue({ scripcode: '999' } as never)
        jest.spyOn(nseIndia, 'getData').mockResolvedValue({ status: true, data: [] })
        await nseIndia.getEquityChartHistoricalData('ONGC')
        expect(nseIndia.getData).toHaveBeenCalledWith(expect.stringContaining('token=999'), 'charting')
    })

    test('getIndexOptionChain auto-selects nearest upcoming expiry when expiry is omitted', async () => {
        getDataByEndpointSpy
            .mockResolvedValueOnce({ expiryDates: ['01-Jan-2020', '31-Dec-2099'], strikePrice: [] })
            .mockResolvedValueOnce({ records: {}, filtered: {} })

        await nseIndia.getIndexOptionChain('NIFTY')
        expect(getDataByEndpointSpy).toHaveBeenLastCalledWith(
            '/api/option-chain-v3?type=Indices&symbol=NIFTY&expiry=31-Dec-2099'
        )
    })

    test('getIndexOptionChain falls back to last expiry when all dates are in past', async () => {
        getDataByEndpointSpy
            .mockResolvedValueOnce({ expiryDates: ['01-Jan-2020', '02-Jan-2020'], strikePrice: [] })
            .mockResolvedValueOnce({ records: {}, filtered: {} })

        await nseIndia.getIndexOptionChain('NIFTY')
        expect(getDataByEndpointSpy).toHaveBeenLastCalledWith(
            '/api/option-chain-v3?type=Indices&symbol=NIFTY&expiry=02-Jan-2020'
        )
    })

    test('resolveCapitalMarketType uses cache and handles failures', async () => {
        const anyNse = nseIndia as any
        anyNse.capitalMarketTypeCache = { type: 'NM', expiry: Date.now() + 10000 }
        await expect(anyNse.resolveCapitalMarketType()).resolves.toBe('NM')

        anyNse.capitalMarketTypeCache = undefined
        jest.spyOn(nseIndia, 'getMarketStatus').mockRejectedValueOnce(new Error('status down'))
        await expect(anyNse.resolveCapitalMarketType()).resolves.toBe('NM')
    })

    test('fetch enrichment tolerates provider failures and enrichPreOpen applies output', async () => {
        jest.spyOn(nseIndia, 'getEquitySymbolInfo').mockRejectedValue(new Error('chart down'))
        getDataByEndpointSpy.mockRejectedValue(new Error('corp down'))
        await expect((nseIndia as any).fetchEquityDetailsEnrichment('TCS')).resolves.toEqual({})

        jest.spyOn(nseIndia as any, 'resolveCapitalMarketType').mockResolvedValue('NM')
        jest.spyOn(nseIndia as any, 'fetchEquityDetailsEnrichment').mockResolvedValue({ companyName: 'X' })
        const base = structuredClone(quoteEquityFixture) as any
        const enriched = await (nseIndia as any).enrichPreOpenEquityDetails(base, 'TCS')
        expect(enriched.info.companyName).toBe('X')
        expect(enriched.currentMarketType).toBe('NM')
    })

    test('equity detail/trade fallback handles thrown pre-open and non-retryable quote errors', async () => {
        getDataByEndpointSpy
            .mockResolvedValueOnce({})
            .mockRejectedValueOnce(new Error('pre-open unavailable'))
            .mockRejectedValueOnce(new Error('Request failed with status code 500'))

        await expect(nseIndia.getEquityDetails('TCS')).rejects.toThrow('No equity quote available for TCS')
        await expect(nseIndia.getEquityTradeInfo('TCS')).rejects.toThrow('500')
    })

    test('equity details/trade map from pre-open row and intraday handles non-retryable errors', async () => {
        jest.spyOn(nseIndia as any, 'enrichPreOpenEquityDetails').mockImplementation(async (d: any) => d)
        getDataByEndpointSpy
            .mockResolvedValueOnce({})
            .mockResolvedValueOnce({
                data: [{
                    metadata: { symbol: 'TCS' },
                    detail: { preOpenMarket: { totalTradedVolume: 1, totalBuyQuantity: 1, totalSellQuantity: 1 } }
                }]
            })
            .mockResolvedValueOnce({
                securityWiseDP: { quantityTraded: 1, deliveryQuantity: 1, deliveryToTradedQuantity: 100 },
                marketDeptOrderBook: { tradeInfo: {} }
            })
            .mockResolvedValueOnce({ grapthData: [] })

        const details = await nseIndia.getEquityDetails('TCS')
        const trade = await nseIndia.getEquityTradeInfo('TCS')
        const intraday = await nseIndia.getEquityIntradayData('TCS')
        expect(details.info.symbol).toBe('TCS')
        expect(trade.securityWiseDP.quantityTraded).toBe(1)
        expect(Array.isArray(intraday.grapthData)).toBe(true)

        getDataByEndpointSpy.mockRejectedValueOnce(new Error('Request failed with status code 500'))
        await expect(nseIndia.getEquityIntradayData('TCS')).rejects.toThrow('500')
    })

    test('intraday fallback captures charting error and historical range picks non-EQ series', async () => {
        getDataByEndpointSpy.mockResolvedValueOnce({}).mockResolvedValueOnce({})
        jest.spyOn(nseIndia, 'getEquityChartHistoricalData').mockRejectedValueOnce(new Error('charting down'))
        await expect(nseIndia.getEquityIntradayData('TCS')).rejects.toThrow('No intraday data available for TCS')

        jest.spyOn(nseIndia, 'getEquitySeries').mockResolvedValue({ data: ['BE'] } as never)
        getDataByEndpointSpy.mockResolvedValue([])
        const result = await nseIndia.getEquityHistoricalData('TCS', {
            start: new Date('2025-01-01'),
            end: new Date('2025-01-03')
        })
        expect(result[0].meta.series).toEqual(['BE'])
    })

    test('getEquityDetails throws immediately on non-retryable quote-equity error', async () => {
        getDataByEndpointSpy.mockRejectedValueOnce(new Error('Request failed with status code 500'))
        await expect(nseIndia.getEquityDetails('TCS')).rejects.toThrow('500')
    })

    test('getEquityDetails converts non-Error rejections to Error message', async () => {
        getDataByEndpointSpy.mockRejectedValueOnce('raw-failure')
        await expect(nseIndia.getEquityDetails('TCS')).rejects.toThrow('raw-failure')
    })

    test('getEquityTradeInfo records pre-open fetch errors in final attempts', async () => {
        getDataByEndpointSpy
            .mockRejectedValueOnce(new Error('Request failed with status code 403'))
            .mockRejectedValueOnce(new Error('pre-open fetch failed'))

        await expect(nseIndia.getEquityTradeInfo('TCS')).rejects.toThrow('No equity trade info available for TCS')
    })

    test('getEquityTradeInfo records non-Error pre-open failures', async () => {
        getDataByEndpointSpy
            .mockRejectedValueOnce(new Error('Request failed with status code 403'))
            .mockRejectedValueOnce('pre-open-raw')

        await expect(nseIndia.getEquityTradeInfo('TCS')).rejects.toThrow('No equity trade info available for TCS')
    })

    test('warmNsePage ignores transient axios statuses', async () => {
        const anyNse = nseIndia as any
        const transientError = { response: { status: 503 } }
        jest.spyOn(axios, 'isAxiosError').mockImplementation((e) => e === transientError)
        anyNse.nseClient = { get: jest.fn().mockRejectedValue(transientError) }
        await expect(anyNse.warmNsePage('/market-data')).resolves.toBeUndefined()
    })

    test('getData uses defaults when quote/index query params are missing', async () => {
        const anyNse = nseIndia as any
        jest.spyOn(anyNse, 'ensureNseSession').mockResolvedValue('cookie=1')
        const warmQuoteSpy = jest.spyOn(anyNse, 'warmEquityQuotePage').mockResolvedValue(undefined)
        const warmIndexSpy = jest.spyOn(anyNse, 'warmNsePage').mockResolvedValue(undefined)
        anyNse.nseClient = { get: jest.fn().mockResolvedValue({ data: { ok: true } }) }

        await nseIndia.getData('https://www.nseindia.com/api/quote-equity')
        await nseIndia.getData('https://www.nseindia.com/api/equity-stockIndices')
        expect(warmQuoteSpy).toHaveBeenCalledWith('TCS')
        expect(warmIndexSpy).toHaveBeenCalled()
    })

    test('getEquityChartHistoricalData honors explicit token and range', async () => {
        const getDataSpy = jest.spyOn(nseIndia, 'getData').mockResolvedValue({ status: true, data: [] })
        await nseIndia.getEquityChartHistoricalData(
            'ONGC',
            { start: new Date('2025-01-01'), end: new Date('2025-01-02') },
            '2475'
        )
        expect(getDataSpy).toHaveBeenCalledWith(expect.stringContaining('token=2475'), 'charting')
    })

    test('fetch enrichment handles corporate placeholders', async () => {
        jest.spyOn(nseIndia, 'getEquitySymbolInfo').mockResolvedValue({
            companyName: 'Chart Name',
            isin: 'CHART-ISIN'
        } as never)
        jest.spyOn(nseIndia, 'getDataByEndpoint').mockResolvedValue([
            { companyName: 'Corp Name', isin: '-', industry: '-' }
        ] as never)
        const enrichment = await (nseIndia as any).fetchEquityDetailsEnrichment('TCS')
        expect(enrichment).toEqual({ companyName: 'Corp Name', isin: 'CHART-ISIN' })
    })

    test('historical no-range mode falls back for invalid listing date', async () => {
        jest.spyOn(nseIndia, 'getEquityDetails').mockResolvedValue({
            info: { activeSeries: [] },
            metadata: { listingDate: 'invalid-date' }
        } as never)
        getDataByEndpointSpy.mockResolvedValue([])
        const result = await nseIndia.getEquityHistoricalData('TCS')
        expect(result[0].meta.series).toEqual(['EQ'])
    })

    test('getIndexOptionChain uses fallback when expiry list missing', async () => {
        getDataByEndpointSpy
            .mockResolvedValueOnce({ expiryDates: null, strikePrice: [] })
            .mockResolvedValueOnce({ records: {}, filtered: {} })
        await nseIndia.getIndexOptionChain('NIFTY')
        expect(getDataByEndpointSpy.mock.calls[1][0]).toContain(
            '/api/option-chain-v3?type=Indices&symbol=NIFTY&expiry='
        )
    })

    test('getTechnicalIndicators wrapper uses defaults', async () => {
        const helpersModule = await import('./helpers')
        const technicalSpy = jest
            .spyOn(helpersModule, 'getTechnicalIndicators')
            .mockResolvedValue({ rsi: [] } as never)
        await nseIndia.getTechnicalIndicators('TCS')
        expect(technicalSpy).toHaveBeenCalledWith('TCS', 200, {})
    })

    test('isAuthError handles 401 and non-auth statuses', async () => {
        const anyNse = nseIndia as any
        const e401 = { response: { status: 401 } }
        const e500 = { response: { status: 500 } }
        jest.spyOn(axios, 'isAxiosError').mockImplementation((e) => e === e401 || e === e500)
        expect(anyNse.isAuthError(e401)).toBe(true)
        expect(anyNse.isAuthError(e500)).toBe(false)
    })

    test('resolveCapitalMarketType returns NM when capital market state missing', async () => {
        jest.spyOn(nseIndia, 'getMarketStatus').mockResolvedValue({
            marketState: [{ market: 'Debt Market', marketStatus: 'Open' }]
        } as never)
        await expect((nseIndia as any).resolveCapitalMarketType()).resolves.toBe('NM')
    })

    test('fetch enrichment prefers first valid corporate ISIN row and charting fallback name', async () => {
        jest.spyOn(nseIndia, 'getEquitySymbolInfo').mockResolvedValue({
            companyName: '',
            description: 'Fallback Name',
            isin: 'CHART-ISIN'
        } as never)
        jest.spyOn(nseIndia, 'getDataByEndpoint').mockResolvedValue([
            { companyName: 'First Row', isin: '-', industry: '-' },
            { companyName: 'Second Row', isin: 'INE123', industry: 'Auto' }
        ] as never)

        const enrichment = await (nseIndia as any).fetchEquityDetailsEnrichment('TCS')
        expect(enrichment).toEqual({ companyName: 'Second Row', isin: 'INE123', industry: 'Auto' })
    })

    test('fetch enrichment handles non-array corporate response', async () => {
        jest.spyOn(nseIndia, 'getEquitySymbolInfo').mockResolvedValue({
            companyName: 'ChartCo',
            isin: 'CHART-ISIN'
        } as never)
        jest.spyOn(nseIndia, 'getDataByEndpoint').mockResolvedValue({ bad: true } as never)
        const enrichment = await (nseIndia as any).fetchEquityDetailsEnrichment('TCS')
        expect(enrichment).toEqual({ companyName: 'ChartCo', isin: 'CHART-ISIN' })
    })

    test('getEquityDetails and trade info capture symbol-not-found in pre-open fallback', async () => {
        getDataByEndpointSpy
            .mockResolvedValueOnce({})
            .mockResolvedValueOnce({ data: [{ metadata: { symbol: 'ABC' } }] })
            .mockResolvedValueOnce({})
            .mockResolvedValueOnce({ data: [{ metadata: { symbol: 'ABC' } }] })
        await expect(nseIndia.getEquityDetails('TCS')).rejects.toThrow('symbol not found in market-data-pre-open')
        await expect(nseIndia.getEquityTradeInfo('TCS')).rejects.toThrow('symbol not found in market-data-pre-open')
    })

    test('getEquityTradeInfo converts non-Error non-retryable rejection to Error', async () => {
        getDataByEndpointSpy.mockRejectedValueOnce('fatal-raw')
        await expect(nseIndia.getEquityTradeInfo('TCS')).rejects.toThrow('fatal-raw')
    })

    test('getEquityIntradayData handles retryable and charting-empty branches', async () => {
        getDataByEndpointSpy
            .mockRejectedValueOnce(new Error('Request failed with status code 403'))
            .mockResolvedValueOnce({})
        jest.spyOn(nseIndia, 'getEquityChartHistoricalData').mockResolvedValue({ data: [] } as never)
        await expect(nseIndia.getEquityIntradayData('TCS')).rejects.toThrow('charting: empty data')
    })

    test('getEquityHistoricalData handles seriesData without data field', async () => {
        jest.spyOn(nseIndia, 'getEquitySeries').mockResolvedValue({} as never)
        getDataByEndpointSpy.mockResolvedValue([])
        const result = await nseIndia.getEquityHistoricalData('TCS', {
            start: new Date('2025-01-01'),
            end: new Date('2025-01-03')
        })
        expect(result[0].meta.series).toEqual(['EQ'])
    })

    test('getEquityStockIndices rethrows non-Error legacy failures', async () => {
        const getDataSpy = jest.spyOn(nseIndia, 'getData')
        getDataSpy.mockRejectedValueOnce('legacy-raw')
        await expect(nseIndia.getEquityStockIndices('NIFTY 50')).rejects.toBe('legacy-raw')
    })

    test('isAuthError returns false for axios error without status', async () => {
        const anyNse = nseIndia as any
        const eNoStatus = { response: {} }
        jest.spyOn(axios, 'isAxiosError').mockImplementation((e) => e === eNoStatus)
        expect(anyNse.isAuthError(eNoStatus)).toBe(false)
    })

    test('getEquityDetails captures non-Error pre-open fallback failure', async () => {
        getDataByEndpointSpy
            .mockResolvedValueOnce({})
            .mockRejectedValueOnce('pre-open-raw')
        await expect(nseIndia.getEquityDetails('TCS')).rejects.toThrow('pre-open: pre-open-raw')
    })

    test('getEquityIntradayData converts non-Error non-retryable failures', async () => {
        getDataByEndpointSpy.mockRejectedValueOnce('intraday-raw-failure')
        await expect(nseIndia.getEquityIntradayData('TCS')).rejects.toThrow('intraday-raw-failure')
    })

    test('resolveCapitalMarketType handles missing marketState object', async () => {
        jest.spyOn(nseIndia, 'getMarketStatus').mockResolvedValue({} as never)
        await expect((nseIndia as any).resolveCapitalMarketType()).resolves.toBe('NM')
    })

    test('isAuthError and warmNsePage handle axios errors without response object', async () => {
        const anyNse = nseIndia as any
        const errNoResponse = {}
        jest.spyOn(axios, 'isAxiosError').mockImplementation((e) => e === errNoResponse)
        expect(anyNse.isAuthError(errNoResponse)).toBe(false)
        anyNse.nseClient = { get: jest.fn().mockRejectedValue(errNoResponse) }
        await expect(anyNse.warmNsePage('/market-data')).rejects.toThrow(
            'Request failed with status code unknown (unknown URL)'
        )
    })

    test('getEquitySymbolInfo exact-match handles row without symbol', async () => {
        jest.spyOn(nseIndia, 'getData').mockResolvedValue([
            { scripcode: 'x' },
            { symbol: 'ONGC', scripcode: '2475' }
        ])
        const info = await nseIndia.getEquitySymbolInfo('ONGC')
        expect(info.scripcode).toBe('2475')
    })

    test('fetch enrichment covers charting and corporate empty-field branches', async () => {
        jest.spyOn(nseIndia, 'getEquitySymbolInfo').mockResolvedValue({
            companyName: '  ',
            description: 'Desc',
            isin: '  '
        } as never)
        jest.spyOn(nseIndia, 'getDataByEndpoint').mockResolvedValue([
            { companyName: 'Corp', isin: 'INE555', industry: '  ' }
        ] as never)
        const enrichment = await (nseIndia as any).fetchEquityDetailsEnrichment('TCS')
        expect(enrichment).toEqual({ companyName: 'Corp', isin: 'INE555' })
    })

    test('getEquityDetails and trade info handle pre-open object without data', async () => {
        getDataByEndpointSpy
            .mockResolvedValueOnce({})
            .mockResolvedValueOnce({})
            .mockResolvedValueOnce({})
            .mockResolvedValueOnce({})
        await expect(nseIndia.getEquityDetails('TCS')).rejects.toThrow('symbol not found in market-data-pre-open')
        await expect(nseIndia.getEquityTradeInfo('TCS')).rejects.toThrow('symbol not found in market-data-pre-open')
    })

    test('intraday fallback handles chart object without data and range mode keeps EQ series', async () => {
        getDataByEndpointSpy.mockResolvedValueOnce({}).mockResolvedValueOnce({})
        jest.spyOn(nseIndia, 'getEquityChartHistoricalData').mockResolvedValueOnce({} as never)
        await expect(nseIndia.getEquityIntradayData('TCS')).rejects.toThrow('charting: empty data')

        jest.spyOn(nseIndia, 'getEquitySeries').mockResolvedValue({ data: ['EQ', 'BE'] } as never)
        getDataByEndpointSpy.mockResolvedValue([])
        const result = await nseIndia.getEquityHistoricalData('TCS', {
            start: new Date('2025-01-01'),
            end: new Date('2025-01-03')
        })
        expect(result[0].meta.series).toEqual(['EQ'])
    })

    test('getEquityStockIndices returns normalized legacy data branch', async () => {
        const getDataSpy = jest.spyOn(nseIndia, 'getData')
        getDataSpy.mockResolvedValueOnce({ data: [{ symbol: 'LEGACY' }] } as never)
        const data = await nseIndia.getEquityStockIndices('NIFTY 50')
        expect(data.data).toEqual([{ symbol: 'LEGACY' }])
    })

    test('fetch enrichment returns charting values when corporate rows are empty', async () => {
        jest.spyOn(nseIndia, 'getEquitySymbolInfo').mockResolvedValue({
            companyName: 'Charting Co',
            isin: 'CHART123'
        } as never)
        jest.spyOn(nseIndia, 'getDataByEndpoint').mockResolvedValue([] as never)
        const enrichment = await (nseIndia as any).fetchEquityDetailsEnrichment('TCS')
        expect(enrichment).toEqual({ companyName: 'Charting Co', isin: 'CHART123' })
    })

    test('fetch enrichment handles sparse corporate rows', async () => {
        jest.spyOn(nseIndia, 'getEquitySymbolInfo').mockResolvedValue({
            companyName: '',
            description: '',
            isin: ''
        } as never)
        jest.spyOn(nseIndia, 'getDataByEndpoint').mockResolvedValue([
            {}
        ] as never)
        const enrichment = await (nseIndia as any).fetchEquityDetailsEnrichment('TCS')
        expect(enrichment).toEqual({})
    })

    test('intraday fallback captures non-Error charting failure message', async () => {
        getDataByEndpointSpy.mockResolvedValueOnce({}).mockResolvedValueOnce({})
        jest.spyOn(nseIndia, 'getEquityChartHistoricalData').mockRejectedValueOnce('chart-raw')
        await expect(nseIndia.getEquityIntradayData('TCS')).rejects.toThrow('charting: chart-raw')
    })

    test('stock indices falls back when normalized legacy has undefined data', async () => {
        const getDataSpy = jest.spyOn(nseIndia, 'getData')
        getDataSpy
            .mockResolvedValueOnce({ records: null } as never)
            .mockResolvedValueOnce({ data: [{ symbol: 'SUMMARY' }] } as never)
        const data = await nseIndia.getEquityStockIndices('NIFTY 50')
        expect(data.data).toEqual([{ symbol: 'SUMMARY' }])
    })

    test('fetch enrichment charting field assignment branches', async () => {
        jest.spyOn(nseIndia, 'getDataByEndpoint').mockResolvedValue([] as never)

        jest.spyOn(nseIndia, 'getEquitySymbolInfo').mockResolvedValueOnce({
            companyName: 'Primary Name',
            description: 'Secondary',
            isin: 'ISIN1'
        } as never)
        await expect((nseIndia as any).fetchEquityDetailsEnrichment('TCS')).resolves.toEqual({
            companyName: 'Primary Name',
            isin: 'ISIN1'
        })

        jest.spyOn(nseIndia, 'getEquitySymbolInfo').mockResolvedValueOnce({
            companyName: '',
            description: '',
            isin: ''
        } as never)
        await expect((nseIndia as any).fetchEquityDetailsEnrichment('TCS')).resolves.toEqual({})
    })

    test('pre-open fallback branches for row-found paths in details and trade', async () => {
        const row = {
            metadata: { symbol: 'TCS' },
            detail: { preOpenMarket: { totalTradedVolume: 1, totalBuyQuantity: 1, totalSellQuantity: 1 } }
        }
        jest.spyOn(nseIndia as any, 'enrichPreOpenEquityDetails').mockImplementation(async (d: any) => d)

        getDataByEndpointSpy
            .mockResolvedValueOnce({})
            .mockResolvedValueOnce({ data: [row] })
            .mockResolvedValueOnce({})
            .mockResolvedValueOnce({ data: [row] })

        await expect(nseIndia.getEquityDetails('TCS')).resolves.toHaveProperty('info.symbol', 'TCS')
        await expect(nseIndia.getEquityTradeInfo('TCS')).resolves.toHaveProperty('securityWiseDP')
    })

    test('intraday fallback handles undefined chart response branch', async () => {
        getDataByEndpointSpy.mockResolvedValueOnce({}).mockResolvedValueOnce({})
        jest.spyOn(nseIndia, 'getEquityChartHistoricalData').mockResolvedValueOnce(undefined as never)
        await expect(nseIndia.getEquityIntradayData('TCS')).rejects.toThrow('charting: empty data')
    })

    test('stock indices legacy empty-array branch triggers summary fallback', async () => {
        const getDataSpy = jest.spyOn(nseIndia, 'getData')
        getDataSpy
            .mockResolvedValueOnce({ data: [] } as never)
            .mockResolvedValueOnce({ data: [{ symbol: 'SUM2' }] } as never)
        const data = await nseIndia.getEquityStockIndices('NIFTY 50')
        expect(data.data).toEqual([{ symbol: 'SUM2' }])
    })

    test('fetch enrichment uses description when companyName is absent', async () => {
        jest.spyOn(nseIndia, 'getEquitySymbolInfo').mockResolvedValue({
            description: 'Description Only'
        } as never)
        jest.spyOn(nseIndia, 'getDataByEndpoint').mockResolvedValue([] as never)
        const enrichment = await (nseIndia as any).fetchEquityDetailsEnrichment('TCS')
        expect(enrichment).toEqual({ companyName: 'Description Only' })
    })

    test('fetch enrichment prefers companyName over description when both exist', async () => {
        jest.spyOn(nseIndia, 'getEquitySymbolInfo').mockResolvedValue({
            companyName: 'Primary Name',
            description: 'Secondary Name',
            isin: 'INE111'
        } as never)
        jest.spyOn(nseIndia, 'getDataByEndpoint').mockResolvedValue([] as never)
        const enrichment = await (nseIndia as any).fetchEquityDetailsEnrichment('TCS')
        expect(enrichment).toEqual({ companyName: 'Primary Name', isin: 'INE111' })
    })

    test('fetch enrichment uses description when companyName trims to empty', async () => {
        jest.spyOn(nseIndia, 'getEquitySymbolInfo').mockResolvedValue({
            companyName: '   ',
            description: 'Trim Fallback'
        } as never)
        jest.spyOn(nseIndia, 'getDataByEndpoint').mockResolvedValue([] as never)
        const enrichment = await (nseIndia as any).fetchEquityDetailsEnrichment('TCS')
        expect(enrichment).toEqual({ companyName: 'Trim Fallback' })
    })

    test('fetch enrichment handles missing description after empty companyName', async () => {
        jest.spyOn(nseIndia, 'getEquitySymbolInfo').mockResolvedValue({
            companyName: ''
        } as never)
        jest.spyOn(nseIndia, 'getDataByEndpoint').mockResolvedValue([] as never)
        const enrichment = await (nseIndia as any).fetchEquityDetailsEnrichment('TCS')
        expect(enrichment).toEqual({})
    })

    test('getEquityDetails find skips entries with missing metadata.symbol', async () => {
        jest.spyOn(nseIndia as any, 'enrichPreOpenEquityDetails').mockImplementation(async (d: any) => d)
        getDataByEndpointSpy
            .mockResolvedValueOnce({})
            .mockResolvedValueOnce({
                data: [
                    { metadata: undefined },
                    { metadata: { symbol: 'OTHER' } },
                    {
                        metadata: { symbol: 'TCS' },
                        detail: { preOpenMarket: { totalTradedVolume: 1, totalBuyQuantity: 1, totalSellQuantity: 1 } }
                    }
                ]
            })
        const details = await nseIndia.getEquityDetails('TCS')
        expect(details.info.symbol).toBe('TCS')
    })

    test('getEquityTradeInfo find matches row via pre-open cache', async () => {
        getDataByEndpointSpy
            .mockResolvedValueOnce({})
            .mockResolvedValueOnce({
                data: [
                    { metadata: { symbol: 'OTHER' } },
                    {
                        metadata: { symbol: 'TCS' },
                        detail: { preOpenMarket: { totalTradedVolume: 5, totalBuyQuantity: 2, totalSellQuantity: 3 } }
                    }
                ]
            })
        const trade = await nseIndia.getEquityTradeInfo('TCS')
        expect(trade.securityWiseDP.quantityTraded).toBe(5)
    })

    test('getEquityTradeInfo uses cached pre-open row when quote trade_info fails', async () => {
        const preOpenRow = {
            metadata: { symbol: 'TCS' },
            detail: { preOpenMarket: { totalTradedVolume: 9, totalBuyQuantity: 4, totalSellQuantity: 4 } }
        }
        jest.spyOn(nseIndia as any, 'getPreOpenMarketCached').mockResolvedValue({
            data: [{ metadata: undefined }, preOpenRow]
        })
        getDataByEndpointSpy.mockResolvedValueOnce({})

        const trade = await nseIndia.getEquityTradeInfo('TCS')
        expect(trade.securityWiseDP.quantityTraded).toBe(9)
    })

    test('getEquityTradeInfo skips find when cached pre-open has no data array', async () => {
        jest.spyOn(nseIndia as any, 'getPreOpenMarketCached').mockResolvedValue({})
        getDataByEndpointSpy.mockResolvedValueOnce({})

        await expect(nseIndia.getEquityTradeInfo('TCS')).rejects.toThrow('symbol not found in market-data-pre-open')
    })

    test('getEquityDetails skips find when pre-open payload has no data array', async () => {
        getDataByEndpointSpy
            .mockResolvedValueOnce({})
            .mockResolvedValueOnce({})
        await expect(nseIndia.getEquityDetails('TCS')).rejects.toThrow('symbol not found in market-data-pre-open')
    })

    test('getEquityStockIndices falls back when normalized legacy data is undefined', async () => {
        const getDataSpy = jest.spyOn(nseIndia, 'getData')
        const normalizeSpy = jest.spyOn(nseIndia as any, 'normalizeIndexDetails')
        getDataSpy
            .mockResolvedValueOnce({ legacy: true } as never)
            .mockResolvedValueOnce({ data: [{ symbol: 'FROM_SUMMARY' }] } as never)
        normalizeSpy
            .mockReturnValueOnce({ data: undefined } as never)
            .mockReturnValueOnce({ data: [{ symbol: 'FROM_SUMMARY' }] } as never)

        const data = await nseIndia.getEquityStockIndices('NIFTY 50')
        expect(data.data).toEqual([{ symbol: 'FROM_SUMMARY' }])
    })

    describe('ApiList', () => {
        Object.entries(ApiList).forEach(([name, endpoint]) => {
            test(`getDataByEndpoint returns content for ${name}`, async () => {
                getDataByEndpointSpy.mockResolvedValue({ endpoint, ok: true })

                const data = await nseIndia.getDataByEndpoint(endpoint)

                expect(data).toEqual({ endpoint, ok: true })
                expect(getDataByEndpointSpy).toHaveBeenCalledWith(endpoint)
            })
        })
    })
})
