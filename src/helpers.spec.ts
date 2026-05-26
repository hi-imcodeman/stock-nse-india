import { NseIndia } from './index'
import { getGainersAndLosersByIndex, getMostActiveEquities } from './helpers'
import { getTechnicalIndicators } from './helpers'

describe('Helpers (mocked)', () => {
    const indexEquities = [
        { symbol: 'A', pChange: 2, totalTradedVolume: 100, totalTradedValue: 1000 },
        { symbol: 'B', pChange: -1, totalTradedVolume: 200, totalTradedValue: 500 },
        { symbol: 'C', pChange: 1, totalTradedVolume: 50, totalTradedValue: 2000 },
        { symbol: 'D', pChange: -3, totalTradedVolume: 20, totalTradedValue: 100 }
    ]

    beforeEach(() => {
        jest.spyOn(NseIndia.prototype, 'getEquityStockIndices').mockResolvedValue({
            metadata: { indexName: 'NIFTY 50' },
            data: indexEquities
        } as never)
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    test('getGainersAndLosersByIndex splits and sorts gainers and losers', async () => {
        const data = await getGainersAndLosersByIndex('NIFTY 50')

        expect(data.gainers.every((equityDetails) => equityDetails.pChange > 0)).toBe(true)
        expect(data.losers.every((equityDetails) => equityDetails.pChange <= 0)).toBe(true)
        expect(data.gainers.map((entry) => entry.symbol)).toEqual(['A', 'C'])
        expect(data.losers.map((entry) => entry.symbol)).toEqual(['D', 'B'])
    })

    test('getMostActiveEquities sorts by volume and value', async () => {
        const data = await getMostActiveEquities('NIFTY 50')

        expect(Array.isArray(data.byVolume)).toBe(true)
        expect(Array.isArray(data.byValue)).toBe(true)
        expect(data.byVolume.map((entry) => entry.symbol)).toEqual(['B', 'A', 'C', 'D'])
        expect(data.byValue.map((entry) => entry.symbol)).toEqual(['C', 'A', 'B', 'D'])
    })

    test('getTechnicalIndicators returns calculated indicator payload', async () => {
        jest.spyOn(NseIndia.prototype, 'getEquityHistoricalData').mockResolvedValue([
            {
                data: [
                    {
                        mtimestamp: '2025-01-01',
                        chClosingPrice: 100,
                        chTradeHighPrice: 105,
                        chTradeLowPrice: 95,
                        chTotTradedQty: 1000
                    },
                    {
                        mtimestamp: '2025-01-02',
                        chClosingPrice: 110,
                        chTradeHighPrice: 112,
                        chTradeLowPrice: 99,
                        chTotTradedQty: 1500
                    }
                ]
            }
        ] as never)

        const result = await getTechnicalIndicators('TCS', 10, {
            smaPeriods: [5],
            emaPeriods: [5]
        })

        expect(Array.isArray(result.sma.sma5)).toBe(true)
        expect(Array.isArray(result.ema.ema5)).toBe(true)
        expect(Array.isArray(result.macd.histogram)).toBe(true)
        expect(Array.isArray(result.vwap)).toBe(true)
    })

    test('getTechnicalIndicators throws wrapped error when historical data is empty', async () => {
        jest.spyOn(NseIndia.prototype, 'getEquityHistoricalData').mockResolvedValue([{ data: [] }] as never)

        await expect(getTechnicalIndicators('TCS')).rejects.toThrow(
            'Failed to calculate technical indicators for TCS: No historical data found for symbol: TCS'
        )
    })

    test('getTechnicalIndicators uses default indicator periods when options are omitted', async () => {
        jest.spyOn(NseIndia.prototype, 'getEquityHistoricalData').mockResolvedValue([
            {
                data: [
                    {
                        mtimestamp: '2025-01-01',
                        chClosingPrice: 100,
                        chTradeHighPrice: 101,
                        chTradeLowPrice: 99,
                        chTotTradedQty: 100
                    },
                    {
                        mtimestamp: '2025-01-02',
                        chClosingPrice: 101,
                        chTradeHighPrice: 102,
                        chTradeLowPrice: 100,
                        chTotTradedQty: 120
                    },
                    {
                        mtimestamp: '2025-01-03',
                        chClosingPrice: 102,
                        chTradeHighPrice: 103,
                        chTradeLowPrice: 101,
                        chTotTradedQty: 130
                    }
                ]
            }
        ] as never)

        const result = await getTechnicalIndicators('TCS')
        expect(result.sma).toHaveProperty('sma5')
        expect(result.ema).toHaveProperty('ema5')
    })
})
