#!/usr/bin/env node
/**
 * Probe NSE equity quote endpoints with an established session.
 * Usage: npm run build && npm run probe:nse-equity -- TCS
 */
/* eslint-disable no-console */
const { NseIndia } = require('../build/index.js')

const symbol = (process.argv[2] || 'TCS').toUpperCase()

const candidates = [
    `/api/quote-equity?symbol=${symbol}`,
    `/api/quote-equity?symbol=${symbol}&section=trade_info`,
    `/api/equity-meta-info?symbol=${symbol}`,
    `/api/NextApi/apiClient/GetQuoteApi?functionName=getSymbolChartData&symbol=${symbol}-EQ&days=1D`,
    `/api/NextApi/apiClient/GetQuoteApi?functionName=getSymbolDerivativesData&symbol=${symbol}`,
    `/api/market-data-pre-open?key=ALL`
]

async function main() {
    const nse = new NseIndia()
    console.log(`Probing NSE equity endpoints for ${symbol}...\n`)

    for (const path of candidates) {
        try {
            const data = await nse.getDataByEndpoint(path)
            const preview = JSON.stringify(data).slice(0, 100)
            const shape = data?.info ? 'quote-equity-shape' :
                data?.data?.length ? `list(${data.data.length})` : typeof data
            console.log(`OK  ${path}`)
            console.log(`    ${shape}: ${preview}\n`)
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error)
            console.log(`FAIL ${path}`)
            console.log(`    ${message}\n`)
        }
    }
}

main().catch((err) => {
    console.error(err)
    process.exit(1)
})
