/* eslint-disable max-len */
/* eslint-disable no-console */
import { NseIndia } from './index'

async function testAllApis() {
    const nse = new NseIndia()
    
    try {
        // Test glossary
        console.log('Testing Glossary API...')
        const glossary = await nse.getDataByEndpoint('/api/cmsContent?url=/glossary')
        console.log('Glossary Response:', JSON.stringify(glossary, null, 2))

        // Test holiday trading
        console.log('\nTesting Holiday Trading API...')
        const holidayTrading = await nse.getDataByEndpoint('/api/holiday-master?type=trading')
        console.log('Holiday Trading Response:', JSON.stringify(holidayTrading, null, 2))

        // Test holiday clearing
        console.log('\nTesting Holiday Clearing API...')
        const holidayClearing = await nse.getDataByEndpoint('/api/holiday-master?type=clearing')
        console.log('Holiday Clearing Response:', JSON.stringify(holidayClearing, null, 2))

        // Test market status
        console.log('\nTesting Market Status API...')
        const marketStatus = await nse.getDataByEndpoint('/api/marketStatus')
        console.log('Market Status Response:', JSON.stringify(marketStatus, null, 2))

        // Test market turnover
        console.log('\nTesting Market Turnover API...')
        const marketTurnover = await nse.getDataByEndpoint('/api/market-turnover')
        console.log('Market Turnover Response:', JSON.stringify(marketTurnover, null, 2))

        // Test all indices
        console.log('\nTesting All Indices API...')
        const allIndices = await nse.getDataByEndpoint('/api/allIndices')
        console.log('All Indices Response:', JSON.stringify(allIndices, null, 2))

        // Test index names
        console.log('\nTesting Index Names API...')
        const indexNames = await nse.getDataByEndpoint('/api/index-names')
        console.log('Index Names Response:', JSON.stringify(indexNames, null, 2))

        // Test circulars
        console.log('\nTesting Circulars API...')
        const circulars = await nse.getDataByEndpoint('/api/circulars')
        console.log('Circulars Response:', JSON.stringify(circulars, null, 2))

        // Test latest circular
        console.log('\nTesting Latest Circular API...')
        const latestCircular = await nse.getDataByEndpoint('/api/latest-circular')
        console.log('Latest Circular Response:', JSON.stringify(latestCircular, null, 2))

        // Test equity master
        console.log('\nTesting Equity Master API...')
        const equityMaster = await nse.getDataByEndpoint('/api/equity-master')
        console.log('Equity Master Response:', JSON.stringify(equityMaster, null, 2))

        // Test market data pre open
        console.log('\nTesting Market Data Pre Open API...')
        const marketDataPreOpen = await nse.getDataByEndpoint('/api/market-data-pre-open?key=ALL')
        console.log('Market Data Pre Open Response:', JSON.stringify(marketDataPreOpen, null, 2))

        // Test merged daily reports capital
        console.log('\nTesting Merged Daily Reports Capital API...')
        const mergedDailyReportsCapital = await nse.getDataByEndpoint('/api/merged-daily-reports?key=favCapital')
        console.log('Merged Daily Reports Capital Response:', JSON.stringify(mergedDailyReportsCapital, null, 2))

        // Test merged daily reports derivatives
        console.log('\nTesting Merged Daily Reports Derivatives API...')
        const mergedDailyReportsDerivatives = await nse.getDataByEndpoint('/api/merged-daily-reports?key=favDerivatives')
        console.log('Merged Daily Reports Derivatives Response:', JSON.stringify(mergedDailyReportsDerivatives, null, 2))

        // Test merged daily reports debt
        console.log('\nTesting Merged Daily Reports Debt API...')
        const mergedDailyReportsDebt = await nse.getDataByEndpoint('/api/merged-daily-reports?key=favDebt')
        console.log('Merged Daily Reports Debt Response:', JSON.stringify(mergedDailyReportsDebt, null, 2))

        // Test specific equity details (using TCS as example)
        console.log('\nTesting Equity Details API...')
        const equityDetails = await nse.getEquityDetails('TCS')
        console.log('Equity Details Response:', JSON.stringify(equityDetails, null, 2))

        // Test equity trade info
        console.log('\nTesting Equity Trade Info API...')
        const equityTradeInfo = await nse.getEquityTradeInfo('TCS')
        console.log('Equity Trade Info Response:', JSON.stringify(equityTradeInfo, null, 2))

        // Test equity corporate info
        console.log('\nTesting Equity Corporate Info API...')
        const equityCorporateInfo = await nse.getEquityCorporateInfo('TCS')
        console.log('Equity Corporate Info Response:', JSON.stringify(equityCorporateInfo, null, 2))

        // Test equity intraday data
        console.log('\nTesting Equity Intraday Data API...')
        const equityIntradayData = await nse.getEquityIntradayData('TCS')
        console.log('Equity Intraday Data Response:', JSON.stringify(equityIntradayData, null, 2))

        // Test equity historical data
        console.log('\nTesting Equity Historical Data API...')
        const equityHistoricalData = await nse.getEquityHistoricalData('TCS', {
            start: new Date('2024-01-01'),
            end: new Date()
        })
        console.log('Equity Historical Data Response:', JSON.stringify(equityHistoricalData, null, 2))

        // Test equity series
        console.log('\nTesting Equity Series API...')
        const equitySeries = await nse.getEquitySeries('TCS')
        console.log('Equity Series Response:', JSON.stringify(equitySeries, null, 2))

        // Test equity stock indices
        console.log('\nTesting Equity Stock Indices API...')
        const equityStockIndices = await nse.getEquityStockIndices('NIFTY 50')
        console.log('Equity Stock Indices Response:', JSON.stringify(equityStockIndices, null, 2))

        // Test index intraday data
        console.log('\nTesting Index Intraday Data API...')
        const indexIntradayData = await nse.getIndexIntradayData('NIFTY 50')
        console.log('Index Intraday Data Response:', JSON.stringify(indexIntradayData, null, 2))

        // Test index historical data
        console.log('\nTesting Index Historical Data API...')
        const indexHistoricalData = await nse.getIndexHistoricalData('NIFTY 50', {
            start: new Date('2024-01-01'),
            end: new Date()
        })
        console.log('Index Historical Data Response:', JSON.stringify(indexHistoricalData, null, 2))

        // Test index option chain
        console.log('\nTesting Index Option Chain API...')
        const indexOptionChain = await nse.getIndexOptionChain('NIFTY')
        console.log('Index Option Chain Response:', JSON.stringify(indexOptionChain, null, 2))

        // Test equity option chain
        console.log('\nTesting Equity Option Chain API...')
        const equityOptionChain = await nse.getEquityOptionChain('TCS')
        console.log('Equity Option Chain Response:', JSON.stringify(equityOptionChain, null, 2))

        // Test commodity option chain
        console.log('\nTesting Commodity Option Chain API...')
        const commodityOptionChain = await nse.getCommodityOptionChain('GOLD')
        console.log('Commodity Option Chain Response:', JSON.stringify(commodityOptionChain, null, 2))

    } catch (error) {
        console.error('Error testing APIs:', error)
    }
}

testAllApis() 