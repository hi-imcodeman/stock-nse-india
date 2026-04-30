import axios from 'axios'
import { NseIndia } from './index'

jest.mock('axios')

describe('NseIndia charting API tests', () => {
    const mockedAxios = axios as jest.Mocked<typeof axios>

    beforeEach(() => {
        mockedAxios.get.mockReset()
    })

    test('getChartingCookies refreshes and then reuses cached cookies', async () => {
        const nseIndia = new NseIndia() as any

        mockedAxios.get.mockResolvedValueOnce({
            headers: {
                'set-cookie': ['nsit=abc; Path=/', 'ak_bmsc=xyz; Path=/']
            }
        } as any)

        const first = await nseIndia.getChartingCookies()
        expect(first).toBe('nsit=abc; ak_bmsc=xyz')
        expect(mockedAxios.get).toHaveBeenCalledTimes(1)

        const second = await nseIndia.getChartingCookies()
        expect(second).toBe('nsit=abc; ak_bmsc=xyz')
        expect(mockedAxios.get).toHaveBeenCalledTimes(1)
    })

    test('getData falls back to charting cookies when NSE cookies fail', async () => {
        const nseIndia = new NseIndia() as any
        jest.spyOn(nseIndia, 'getNseCookies').mockResolvedValue('nse_cookie=primary')
        jest.spyOn(nseIndia, 'getChartingCookies').mockResolvedValue('chart_cookie=fallback')

        mockedAxios.get
            .mockRejectedValueOnce(new Error('primary cookie failed'))
            .mockResolvedValueOnce({ data: { status: true, data: [] } } as any)

        const result = await nseIndia.getData('https://charting.nseindia.com/v1/test', 'charting')

        expect(result).toEqual({ status: true, data: [] })
        expect(mockedAxios.get).toHaveBeenCalledTimes(2)
        expect(mockedAxios.get.mock.calls[1][1]?.headers?.Cookie).toBe('chart_cookie=fallback')
    })

    test('getEquitySymbolInfo throws when charting API returns empty list', async () => {
        const nseIndia = new NseIndia() as any
        jest.spyOn(nseIndia, 'getData').mockResolvedValue([])

        await expect(nseIndia.getEquitySymbolInfo('ONGC')).rejects.toThrow(
            'No symbol info found for: ONGC'
        )
    })

    test('getEquityChartHistoricalData uses default date range when range is omitted', async () => {
        const nseIndia = new NseIndia() as any
        jest.spyOn(nseIndia, 'getData').mockResolvedValue({ status: true, data: [] })

        const response = await nseIndia.getEquityChartHistoricalData('ONGC', undefined, '2475')

        expect(response).toEqual({ status: true, data: [] })
        expect(nseIndia.getData).toHaveBeenCalledWith(
            expect.stringContaining('symbolHistoricalData?fromDate='),
            'charting'
        )
    })

    test('getEquitySymbolInfo falls back to first item when exact symbol is missing', async () => {
        const nseIndia = new NseIndia() as any
        jest.spyOn(nseIndia, 'getData').mockResolvedValue([
            {
                symbol: 'ONGC',
                scripcode: '2475',
                companyName: 'Oil & Natural Gas Corporation',
                isin: 'INE213A01029',
                segment: 'CM',
                series: 'EQ'
            }
        ])

        const info = await nseIndia.getEquitySymbolInfo('UNKNOWN')

        expect(info.symbol).toBe('ONGC')
        expect(info.scripcode).toBe('2475')
    })
})
