import {
    ChartingOHLCResponse,
    EquityDetails,
    EquityPreOpenMarket,
    EquityTradeInfo,
    IntradayData,
    PreOpenMarketData
} from './interface'

type PreOpenRow = PreOpenMarketData['data'][number]

function num(value: unknown, fallback = 0): number {
    return typeof value === 'number' && !Number.isNaN(value) ? value : fallback
}

function str(value: unknown, fallback = ''): string {
    return typeof value === 'string' ? value : fallback
}

export function isEquityDetailsShape(raw: unknown): raw is EquityDetails {
    if (!raw || typeof raw !== 'object') return false
    const o = raw as Record<string, unknown>
    return typeof o.info === 'object' && o.info !== null && typeof o.priceInfo === 'object'
}

/** Pass-through when NSE returns standard quote-equity JSON. */
export function mapQuoteEquityResponse(raw: unknown): EquityDetails {
    if (!isEquityDetailsShape(raw)) {
        throw new Error('Response is not a valid quote-equity payload')
    }
    return raw
}

function normalizePreOpenMarket(detail: PreOpenRow['detail']): EquityPreOpenMarket {
    const po = detail?.preOpenMarket ?? {}
    const atoRaw = po.ato ?? {}
    return {
        preopen: po.preopen ?? [],
        ato: {
            buy: atoRaw.buy ?? atoRaw.totalBuyQuantity ?? 0,
            sell: atoRaw.sell ?? atoRaw.totalSellQuantity ?? 0
        },
        IEP: po.IEP ?? 0,
        totalTradedVolume: po.totalTradedVolume ?? 0,
        finalPrice: po.finalPrice ?? 0,
        finalQuantity: po.finalQuantity ?? 0,
        lastUpdateTime: po.lastUpdateTime ?? '',
        totalBuyQuantity: po.totalBuyQuantity ?? 0,
        totalSellQuantity: po.totalSellQuantity ?? 0,
        atoBuyQty: po.atoBuyQty ?? 0,
        atoSellQty: po.atoSellQty ?? 0
    }
}

/**
 * Build EquityDetails from /api/market-data-pre-open row when quote-equity is blocked.
 * Fields not present in pre-open are filled with safe defaults.
 */
export interface EquityDetailsEnrichment {
    companyName?: string
    isin?: string
    industry?: string
    currentMarketType?: string
}

export function applyEquityDetailsEnrichment(
    details: EquityDetails,
    enrichment: EquityDetailsEnrichment
): EquityDetails {
    const companyName = enrichment.companyName?.trim()
    const isin = enrichment.isin?.trim()
    const industry = enrichment.industry?.trim()

    const next: EquityDetails = {
        ...details,
        info: { ...details.info },
        metadata: { ...details.metadata },
        industryInfo: { ...details.industryInfo }
    }

    if (enrichment.currentMarketType) {
        next.currentMarketType = enrichment.currentMarketType
    }
    if (companyName) {
        next.info.companyName = companyName
    }
    if (isin) {
        next.info.isin = isin
        next.metadata.isin = isin
    }
    if (industry && industry !== '-') {
        next.info.industry = industry
        next.metadata.industry = industry
        next.industryInfo.industry = industry
        next.industryInfo.basicIndustry = industry
    }

    return next
}

export function mapPreOpenRowToEquityDetails(
    row: PreOpenRow,
    symbol: string,
    currentMarketType = 'preOpen'
): EquityDetails {
    const meta = (row.metadata ?? {}) as PreOpenRow['metadata'] & Record<string, unknown>
    const upper = symbol.toUpperCase()
    const series = str(meta.series, 'EQ')
    const lastPrice = num(meta.lastPrice, num(row.priceInfo?.lastPrice))
    const change = num(meta.change, num(row.priceInfo?.change))
    const pChange = num(meta.pChange, num(row.priceInfo?.pChange))
    const previousClose = num(meta.previousClose, num(row.priceInfo?.prevClose, lastPrice))
    const yearHigh = num(meta.yearHigh, lastPrice)
    const yearLow = num(meta.yearLow, lastPrice)

    return {
        info: {
            symbol: upper,
            companyName: str(meta.companyName, upper),
            industry: str(meta.industry),
            activeSeries: [series],
            debtSeries: [],
            tempSuspendedSeries: [],
            isFNOSec: false,
            isCASec: false,
            isSLBSec: false,
            isDebtSec: false,
            isSuspended: false,
            isETFSec: false,
            isDelisted: false,
            isin: str(meta.isinCode),
            slb_isin: '',
            listingDate: str(meta.listingDate),
            isMunicipalBond: false,
            isHybridSymbol: false,
            segment: 'CM',
            isTop10: false,
            identifier: str(meta.identifier, `${upper}${series}`)
        },
        metadata: {
            series,
            symbol: upper,
            isin: str(meta.isinCode),
            status: str(meta.status, 'Active'),
            listingDate: str(meta.listingDate),
            industry: str(meta.industry),
            lastUpdateTime: str(meta.lastUpdateTime),
            pdSectorPe: 0,
            pdSymbolPe: 0,
            pdSectorInd: '',
            pdSectorIndAll: []
        },
        securityInfo: {
            boardStatus: 'Active',
            tradingStatus: 'Active',
            tradingSegment: 'CM',
            sessionNo: '',
            slb: 'No',
            classOfShare: 'Equity',
            derivatives: 'Yes',
            surveillance: { surv: null, desc: null },
            faceValue: 0,
            issuedSize: 0
        },
        sddDetails: { SDDAuditor: '', SDDStatus: '' },
        currentMarketType,
        priceInfo: {
            lastPrice,
            change,
            pChange,
            previousClose,
            open: row.priceInfo?.open ?? lastPrice,
            close: row.priceInfo?.close ?? lastPrice,
            vwap: lastPrice,
            stockIndClosePrice: 0,
            lowerCP: '',
            upperCP: '',
            pPriceBand: '',
            basePrice: previousClose,
            intraDayHighLow: { min: yearLow, max: yearHigh, value: lastPrice },
            weekHighLow: {
                min: yearLow,
                minDate: '',
                max: yearHigh,
                maxDate: '',
                value: lastPrice
            },
            iNavValue: null,
            checkINAV: false,
            tickSize: 0.05,
            ieq: ''
        },
        industryInfo: {
            macro: '',
            sector: '',
            industry: str(meta.industry),
            basicIndustry: str(meta.industry)
        },
        preOpenMarket: normalizePreOpenMarket(row.detail)
    }
}

export function isEquityTradeInfoShape(raw: unknown): raw is EquityTradeInfo {
    if (!raw || typeof raw !== 'object') return false
    const o = raw as Record<string, unknown>
    return typeof o.marketDeptOrderBook === 'object' && o.marketDeptOrderBook !== null
}

/** Pass-through when NSE returns standard quote-equity trade_info JSON. */
export function mapQuoteEquityTradeInfoResponse(raw: unknown): EquityTradeInfo {
    if (!isEquityTradeInfoShape(raw)) {
        throw new Error('Response is not a valid quote-equity trade_info payload')
    }
    return raw
}

const emptyValueAtRisk = {
    securityVar: 0,
    indexVar: 0,
    varMargin: 0,
    extremeLossMargin: 0,
    adhocMargin: 0,
    applicableMargin: 0
}

/**
 * Build EquityTradeInfo from pre-open row when quote-equity trade_info is blocked.
 */
export function mapPreOpenRowToEquityTradeInfo(row: PreOpenRow, symbol: string): EquityTradeInfo {
    const meta = (row.metadata ?? {}) as PreOpenRow['metadata'] & Record<string, unknown>
    const po = normalizePreOpenMarket(row.detail)
    const series = str(meta.series, 'EQ')
    const preopen = po.preopen

    const bid = preopen
        .filter((level) => level.buyQty > 0)
        .map((level) => ({ price: level.price, quantity: level.buyQty }))
    const ask = preopen
        .filter((level) => level.sellQty > 0)
        .map((level) => ({ price: level.price, quantity: level.sellQty }))

    const totalTradedVolume = num(po.totalTradedVolume, num(meta.finalQuantity))
    const totalTurnover = num(meta.totalTurnover)
    const totalTradedValue = totalTurnover > 0 ? totalTurnover / 100000 : 0
    const marketCapRaw = meta.marketCap
    const totalMarketCap = typeof marketCapRaw === 'number'
        ? marketCapRaw
        : num(marketCapRaw, 0)
    const open = num(po.finalPrice, num(meta.iep, num(meta.lastPrice)))

    return {
        noBlockDeals: true,
        bulkBlockDeals: [],
        marketDeptOrderBook: {
            totalBuyQuantity: po.totalBuyQuantity,
            totalSellQuantity: po.totalSellQuantity,
            open,
            bid,
            ask,
            tradeInfo: {
                totalTradedVolume,
                totalTradedValue,
                totalMarketCap,
                ffmc: 0,
                impactCost: 0,
                cmDailyVolatility: '',
                cmAnnualVolatility: '',
                marketLot: '',
                activeSeries: series
            },
            valueAtRisk: { ...emptyValueAtRisk }
        },
        securityWiseDP: {
            quantityTraded: totalTradedVolume,
            deliveryQuantity: 0,
            deliveryToTradedQuantity: 0,
            seriesRemarks: null,
            secWiseDelPosDate: po.lastUpdateTime || ''
        }
    }
}

/** Map NSE API/charting symbol param to equity page symbol for Referer warm-up. */
export function equityRefererSymbol(apiSymbol: string): string {
    const s = apiSymbol.trim().toUpperCase()
    if (/^[A-Z0-9&-]+-EQ$/i.test(s)) {
        return s.replace(/-EQ$/i, '')
    }
    const identifierMatch = /^(.*?)(EQ|BE|BL|BZ|IL|RL|W3|GB|GS|SM|ST)N$/i.exec(s)
    if (identifierMatch && identifierMatch[1].length > 0) {
        return identifierMatch[1]
    }
    return s
}

export function isIntradayDataShape(raw: unknown): raw is IntradayData {
    if (!raw || typeof raw !== 'object') return false
    const o = raw as Record<string, unknown>
    return Array.isArray(o.grapthData)
}

export function mapIntradayApiResponse(raw: unknown, symbol: string): IntradayData {
    if (!isIntradayDataShape(raw)) {
        throw new Error('Response is not a valid intraday chart payload')
    }
    return {
        ...raw,
        name: raw.name || symbol.toUpperCase()
    }
}

export function mapChartingToIntradayData(
    chart: ChartingOHLCResponse,
    symbol: string
): IntradayData {
    const upper = symbol.toUpperCase()
    const points = chart.data ?? []
    const grapthData: [number, number, string][] = points.map((point) => [
        point.time,
        point.close,
        'NM'
    ])
    const closePrice = points.length ? points[points.length - 1].close : 0
    return {
        identifier: `${upper}EQN`,
        name: upper,
        grapthData,
        closePrice
    }
}

export function isRetryableEquityEndpointError(error: unknown): boolean {
    if (!(error instanceof Error)) return false
    return /status code (401|403|404|502|503)/.test(error.message)
}
