const {
    NseIndia
} = require('../dist/index')
const ora = require('ora')
const chalk = require('chalk')
const ohlc = require('ohlc')
const moment = require('moment')
const asciichart = require('asciichart')

const rupee = '₹'
const nse = new NseIndia()

async function showEquityDetails(argv) {
    const {
        symbol
    } = argv
    const spinner = ora()
    spinner.text = 'Loading Equity details'
    spinner.start()
    try {
        const {
            info,
            priceInfo,
            metadata,
            securityInfo
        } = await nse.getEquityDetails(symbol)
        spinner.text = 'Loading Trading details'
        const {
            marketDeptOrderBook
        } = await nse.getEquityTradeInfo(symbol)
        spinner.text = ''
        spinner.stop()
        if (info && marketDeptOrderBook) {
            const {
                tradeInfo
            } = marketDeptOrderBook
            const changePrice = Number(priceInfo.change.toFixed(2))
            const changePercent = Number(priceInfo.pChange.toFixed(2))
            const tableData = {
                'Last Updated Time': metadata.lastUpdateTime,
                'Symbol': symbol,
                'Company Name': info.companyName,
                'Industry': metadata.industry,
                'Sectoral Index': metadata.pdSectorInd.trim(),
                'Sectoral PE': metadata.pdSectorPe,
                'Symbol PE': metadata.pdSymbolPe,
                'Listing Status': metadata.status,
                'Listing Since': metadata.listingDate,
                [`Price Change (in ${rupee})`]: changePrice,
                'Change Percentage (in %)': changePercent,
                'Open': priceInfo.open,
                'High': priceInfo.intraDayHighLow.max,
                'Low': priceInfo.intraDayHighLow.min,
                'Close': priceInfo.close,
                'Previous Close': priceInfo.previousClose,
                'Last Traded Price': priceInfo.lastPrice,
                'Volume Weighted Average Price (VWAP)': priceInfo.vwap,
                'Total Traded Volume': tradeInfo.totalTradedVolume,
                [`Total Traded Value (${rupee} Lakhs)`]: tradeInfo.totalTradedValue,
                [`Total Market Capital (${rupee} Lakhs)`]: tradeInfo.totalMarketCap
            }

            console.table(tableData)

            const changeStatus = changePrice <= 0 ? `${rupee}${changePrice} (${changePercent}%)${chalk.red('▼')}` :
                `${rupee}${changePrice} (${changePercent}%)${chalk.green('▲')}`

            const derivativeStatus = securityInfo.derivatives === 'Yes' ? chalk.black.bgGreen(' Derivatives ') : chalk.black.bgRed(' Derivatives ')
            const slbStatus = securityInfo.slb === 'Yes' ? chalk.black.bgGreen(' SLB ') : chalk.black.bgRed(' SLB ')
            const ltpStatus = changePrice <= 0 ? chalk.black.bgRed(` LTP: ${priceInfo.lastPrice} `) : chalk.black.bgGreen(` LTP: ${priceInfo.lastPrice} `)

            console.log(`Change: ${changeStatus}`)
            console.log(`${ltpStatus} ${derivativeStatus} ${slbStatus}`);
        } else {
            console.log(chalk.red('Please provide valid NSE symbol.'));
        }
    } catch (error) {
        spinner.text = ''
        spinner.stop()
        console.log(chalk.red(error.message))
    }
}

async function showHistorical(argv) {
    console.time('Done In')
    const {
        symbol
    } = argv
    const spinner = ora()
    spinner.text = 'Loading Historical Data'
    spinner.start()
    const results = await nse.getEquityHistoricalData(symbol)
    spinner.text = ''
    spinner.stop()
    const ohlcData = []
    results.forEach(({
        data: historicalData
    }) => {
        historicalData.forEach(info => {
            ohlcData.push([
                info.CH_TIMESTAMP,
                info.CH_OPENING_PRICE,
                info.CH_TRADE_HIGH_PRICE,
                info.CH_TRADE_LOW_PRICE,
                info.CH_CLOSING_PRICE,
                info.CH_TOT_TRADED_VAL
            ])
        })
    })
    const fullOhlcData = ohlc(ohlcData)
    console.log();
    const dateBefore3Months = moment().subtract(3, 'months').format('YYYY-MM-DD')
    const last3MonthsOhlc = fullOhlcData.start(dateBefore3Months).sma(5).toDaily()
    const sma5 = last3MonthsOhlc.map(obj => obj.sma5)
    const Volume = last3MonthsOhlc.map(obj => obj.Volume / 100000)
    const chartConfig = {
        height: 10
    }
    console.log(chalk.black.bgCyan(' Price Chart - SMA5 (Last 3 months) '));
    console.log();
    console.log(asciichart.plot(sma5, {...chartConfig,colors:[asciichart.cyan]}));
    console.log();
    console.log(chalk.black.bgYellow(' Volume Chart - In Lakhs (Last 3 months) '));
    console.log();
    console.log(asciichart.plot(Volume, {...chartConfig,colors:[asciichart.yellow]}));
    console.log();
    console.timeEnd('Done In')
}

module.exports = {
    showEquityDetails,
    showHistorical
}
