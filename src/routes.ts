import { Router } from 'express'
import { openapiSpecification } from './swaggerDocOptions'
import { NseIndia, ApiList } from './index'
import {
    getGainersAndLosersByIndex,
    getMostActiveEquities
} from './helpers'
import { mcpClient, MCPClientRequest, MCPClient } from './mcp/client/mcp-client.js'

const mainRouter:Router = Router()

const nseIndia = new NseIndia()


/**
 * @openapi
 * /:
 *   get:
 *     description: To get market status
 *     tags:
 *       - Base
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Returns a JSON object of NSE market status
 *       400:
 *         description: Returns a JSON error object of API call
 */
 mainRouter.get('/', async (_req, res) => {
    try {
        res.json(await nseIndia.getDataByEndpoint(ApiList.MARKET_STATUS))
    } catch (error) {
        res.status(400).json(error)
    }
})

/**
 * @openapi
 * /api/v1/swagger.json:
 *   get:
 *     description: To get open api specification for swagger documentation
 *     tags:
 *       - Base
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Returns a JSON object of open api specification
 */
mainRouter.get('/api/v1/swagger.json', (_req, res) => {
    res.json(openapiSpecification)
})

/**
 * @openapi
 * /api/glossary:
 *   get:
 *     description: To get glossary of NSE India
 *     tags:
 *       - Common
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Returns a JSON object of glossary for NSE India
 *       400:
 *         description: Returns a JSON error object of API call
 */
mainRouter.get('/api/glossary', async (_req, res) => {
    try {
        res.json(await nseIndia.getDataByEndpoint(ApiList.GLOSSARY))
    } catch (error) {
        res.status(400).json(error)
    }
})

/**
 * @openapi
 * /api/marketStatus:
 *   get:
 *     description: To get market status
 *     tags:
 *       - Common
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Returns a JSON object of NSE market status
 *       400:
 *         description: Returns a JSON error object of API call
 */
mainRouter.get('/api/marketStatus', async (_req, res) => {
    try {
        res.json(await nseIndia.getDataByEndpoint(ApiList.MARKET_STATUS))
    } catch (error) {
        res.status(400).json(error)
    }
})

/**
 * @openapi
 * /api/marketTurnover:
 *   get:
 *     description: To get market turn over
 *     tags:
 *       - Common
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Returns a JSON object of NSE market turn over
 *       400:
 *         description: Returns a JSON error object of API call
 */
mainRouter.get('/api/marketTurnover', async (_req, res) => {
    try {
        res.json(await nseIndia.getDataByEndpoint(ApiList.MARKET_TURNOVER))
    } catch (error) {
        res.status(400).json(error)
    }
})

/**
 * @openapi
 * /api/equityMaster:
 *   get:
 *     description: To get equity master
 *     tags:
 *       - Common
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Returns a JSON object of NSE equity master
 *       400:
 *         description: Returns a JSON error object of API call
 */
mainRouter.get('/api/equityMaster', async (_req, res) => {
    try {
        res.json(await nseIndia.getDataByEndpoint(ApiList.EQUITY_MASTER))
    } catch (error) {
        res.status(400).json(error)
    }
})

/**
 * @openapi
 * /api/holidays:
 *   get:
 *     description: To get holidays of NSE India
 *     tags:
 *       - Common
 *     parameters:
 *       - name: type
 *         in: query
 *         description: Holiday list for
 *         required: true
 *         schema:
 *           type: string
 *           enum: [trading,clearing]
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Returns a JSON object of NSE India's holidays
 *       400:
 *         description: Returns a JSON error object of API call
 */
mainRouter.get('/api/holidays', async (req, res) => {
    try {
        const { type } = req.query
        if (type === 'clearing') {
            res.json(await nseIndia.getDataByEndpoint(ApiList.HOLIDAY_CLEARING))
        } else {
            res.json(await nseIndia.getDataByEndpoint(ApiList.HOLIDAY_TRADING))
        }
    } catch (error) {
        res.status(400).json(error)
    }
})

/**
 * @openapi
 * /api/circulars:
 *   get:
 *     description: To get NSE India's circulars
 *     tags:
 *       - Common
 *     parameters:
 *       - name: isLatest
 *         in: query
 *         description: Boolean value get latest circulars
 *         required: false
 *         schema:
 *           type: boolean
 *           default: false
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Returns a JSON object of NSE India's circulars
 *       400:
 *         description: Returns a JSON error object of API call
 */
mainRouter.get('/api/circulars', async (req, res) => {
    try {
        const { isLatest } = req.query
        if (isLatest === 'true') {
            res.json(await nseIndia.getDataByEndpoint(ApiList.LATEST_CIRCULARS))
        } else {
            res.json(await nseIndia.getDataByEndpoint(ApiList.CIRCULARS))
        }
    } catch (error) {
        res.status(400).json(error)
    }
})

/**
 * @openapi
 * /api/mergedDailyReports:
 *   get:
 *     description: To get merged daily reports
 *     tags:
 *       - Common
 *     parameters:
 *       - name: key
 *         in: query
 *         description: Key for merged daily reports
 *         required: true
 *         schema:
 *           type: string
 *           enum: [capital,derivatives,debt]
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Returns a JSON object of NSE India's merged daily reports
 *       400:
 *         description: Returns a JSON error object of API call
 */
mainRouter.get('/api/mergedDailyReports', async (req, res) => {
    try {
        const { key } = req.query
        if (key === 'debt') {
            res.json(await nseIndia.getDataByEndpoint(ApiList.MERGED_DAILY_REPORTS_DEBT))
        } else if (key === 'derivatives') {
            res.json(await nseIndia.getDataByEndpoint(ApiList.MERGED_DAILY_REPORTS_DERIVATIVES))
        } else {
            res.json(await nseIndia.getDataByEndpoint(ApiList.MERGED_DAILY_REPORTS_CAPITAL))
        }
    } catch (error) {
        res.status(400).json(error)
    }
})

/**
 * @openapi
 * /api/allIndices:
 *   get:
 *     description: To get all NSE indices
 *     tags:
 *       - Common
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Returns a JSON object of all NSE indices
 *       400:
 *         description: Returns a JSON error object of API call
 */
mainRouter.get('/api/allIndices', async (_req, res) => {
    try {
        const allIndices = await nseIndia.getDataByEndpoint(ApiList.ALL_INDICES)
        res.json(allIndices)
    } catch (error) {
        res.status(400).json(error)
    }
})

/**
 * @openapi
 * /api/indexNames:
 *   get:
 *     description: To get all NSE index names
 *     tags:
 *       - Common
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Returns a JSON object of all NSE index names
 *       400:
 *         description: Returns a JSON error object of API call
 */
mainRouter.get('/api/indexNames', async (_req, res) => {
    try {
        const indexNames = await nseIndia.getDataByEndpoint(ApiList.INDEX_NAMES)
        res.json(indexNames)
    } catch (error) {
        res.status(400).json(error)
    }
})

/**
 * @openapi
 * /api/allSymbols:
 *   get:
 *     description: To get all NSE equity symbols
 *     tags:
 *       - Common
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Returns an array of NSE equity symbols
 *       400:
 *         description: Returns a JSON error object of API call
 */
mainRouter.get('/api/allSymbols', async (_req, res) => {
    try {
        const symbols = await nseIndia.getAllStockSymbols()
        res.json(symbols)
    } catch (error) {
        res.status(400).json(error)
    }
})

/**
 * @openapi
 * /api/equity/{symbol}:
 *   get:
 *     description: To get details of the NSE symbol
 *     tags:
 *       - Equity
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: symbol
 *         in: path
 *         description: NSE Symbol of the Equity
 *         required: true
 *         schema:
 *           type: string
 *           format: any
 *     responses:
 *       200:
 *         description: Returns a details of the NSE symbol
 *       400:
 *         description: Returns a JSON error object of API call
 */
mainRouter.get('/api/equity/:symbol', async (req, res) => {
    try {
        const { symbol } = req.params;
        const data = await nseIndia.getEquityDetails(symbol);
        res.json(data);
    } catch (error) {
        res.status(400).json(error);
    }
})

/**
 * @openapi
 * /api/equity/series/{symbol}:
 *   get:
 *     description: To get equity series of the NSE symbol
 *     tags:
 *       - Equity
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: symbol
 *         in: path
 *         description: NSE Symbol of the Equity
 *         required: true
 *         schema:
 *           type: string
 *           format: any
 *     responses:
 *       200:
 *         description: Returns a equity series of the NSE symbol
 *       400:
 *         description: Returns a JSON error object of API call
 */
mainRouter.get('/api/equity/series/:symbol', async (req, res) => {
    try {
        res.json(await nseIndia.getEquitySeries(req.params.symbol))
    } catch (error) {
        res.status(400).json(error)
    }
})

/**
 * @openapi
 * /api/equity/tradeInfo/{symbol}:
 *   get:
 *     description: To get trade info of the NSE symbol
 *     tags:
 *       - Equity
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: symbol
 *         in: path
 *         description: NSE Symbol of the Equity
 *         required: true
 *         schema:
 *           type: string
 *           format: any
 *     responses:
 *       200:
 *         description: Returns a trade info of the NSE symbol
 *       400:
 *         description: Returns a JSON error object of API call
 */
mainRouter.get('/api/equity/tradeInfo/:symbol', async (req, res) => {
    try {
        res.json(await nseIndia.getEquityTradeInfo(req.params.symbol))
    } catch (error) {
        res.status(400).json(error)
    }
})

/**
 * @openapi
 * /api/equity/corporateInfo/{symbol}:
 *   get:
 *     description: To get corporate info of the NSE symbol
 *     tags:
 *       - Equity
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: symbol
 *         in: path
 *         description: NSE Symbol of the Equity
 *         required: true
 *         schema:
 *           type: string
 *           format: any
 *     responses:
 *       200:
 *         description: Returns a corporate info of the NSE symbol
 *       400:
 *         description: Returns a JSON error object of API call
 */
mainRouter.get('/api/equity/corporateInfo/:symbol', async (req, res) => {
    try {
        res.json(await nseIndia.getEquityCorporateInfo(req.params.symbol))
    } catch (error) {
        res.status(400).json(error)
    }
})

/**
 * @openapi
 * /api/equity/options/{symbol}:
 *   get:
 *     description: To get options chain of the NSE symbol
 *     tags:
 *       - Equity
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: symbol
 *         in: path
 *         description: NSE Symbol of the Equity
 *         required: true
 *         schema:
 *           type: string
 *           format: any
 *     responses:
 *       200:
 *         description: Returns a options chain of the NSE symbol
 *       400:
 *         description: Returns a JSON error object of API call
 */
mainRouter.get('/api/equity/options/:symbol', async (req, res) => {
    try {
        res.json(await nseIndia.getEquityOptionChain(req.params.symbol))
    } catch (error) {
        res.status(400).json(error)
    }
})

/**
 * @openapi
 * /api/equity/intraday/{symbol}:
 *   get:
 *     description: To get intraday trade info of the NSE symbol
 *     tags:
 *       - Equity
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: symbol
 *         in: path
 *         description: NSE Symbol of the Equity
 *         required: true
 *         schema:
 *           type: string
 *           format: any
 *     responses:
 *       200:
 *         description: Returns a intraday trade info of the NSE symbol
 *       400:
 *         description: Returns a JSON error object of API call
 */
mainRouter.get('/api/equity/intraday/:symbol', async (req, res) => {
    try {
        const { symbol } = req.params;
        const data = await nseIndia.getEquityIntradayData(symbol);
        res.json(data);
    } catch (error) {
        res.status(400).json(error);
    }
})

/**
 * @openapi
 * /api/equity/historical/{symbol}:
 *   get:
 *     description: To get details of the NSE symbol
 *     tags:
 *       - Equity
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: symbol
 *         in: path
 *         description: NSE Symbol of the Equity
 *         required: true
 *         schema:
 *           type: string
 *           format: any
 *       - name: dateStart
 *         in: query
 *         description: "Start date to pull historical data (format: YYYY-MM-DD)"
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *       - name: dateEnd
 *         in: query
 *         description: "End date to pull historical data (format: YYYY-MM-DD)"
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Returns a historical data of the NSE symbol
 *       400:
 *         description: Returns a JSON error object of API call
 */
mainRouter.get('/api/equity/historical/:symbol', async (req, res) => {
    try {
        const dateStart = req.query.dateStart as string
        const dateEnd = req.query.dateEnd as string
        if (dateStart) {
            const start = new Date(dateStart)
            const end = dateEnd ? new Date(dateEnd) : new Date()
            if (start.getTime() > 0 && end.getTime() > 0) {
                const range = {
                    start,
                    end
                }
                res.json(await nseIndia.getEquityHistoricalData(req.params.symbol, range))
            } else {
                res.status(400).json({ error: 'Invalid date format. Please use the format (YYYY-MM-DD)' })
            }
        } else {
            res.json(await nseIndia.getEquityHistoricalData(req.params.symbol))
        }
    } catch (error) {
        res.status(400).json(error)
    }
})

/**
 * @openapi
 * /api/equity/technicalIndicators/{symbol}:
 *   get:
 *     description: To get technical indicators for the NSE symbol
 *     tags:
 *       - Equity
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: symbol
 *         in: path
 *         description: NSE Symbol of the Equity
 *         required: true
 *         schema:
 *           type: string
 *           format: any
 *       - name: period
 *         in: query
 *         description: "Number of days for historical data (default: 200)"
 *         required: false
 *         schema:
 *           type: integer
 *           default: 200
 *       - name: smaPeriods
 *         in: query
 *         description: "Comma-separated SMA periods (e.g., 5,10,20,50)"
 *         required: false
 *         schema:
 *           type: string
 *           default: "5,10,20,50,100,200"
 *       - name: emaPeriods
 *         in: query
 *         description: "Comma-separated EMA periods (e.g., 5,10,20,50)"
 *         required: false
 *         schema:
 *           type: string
 *           default: "5,10,20,50,100,200"
 *       - name: rsiPeriod
 *         in: query
 *         description: "RSI period (default: 14)"
 *         required: false
 *         schema:
 *           type: integer
 *           default: 14
 *       - name: bbPeriod
 *         in: query
 *         description: "Bollinger Bands period (default: 20)"
 *         required: false
 *         schema:
 *           type: integer
 *           default: 20
 *       - name: bbStdDev
 *         in: query
 *         description: "Bollinger Bands standard deviation (default: 2)"
 *         required: false
 *         schema:
 *           type: number
 *           default: 2
 *       - name: showOnlyLatest
 *         in: query
 *         description: "Show only latest values (true) or all values (false) - useful for charts (default: true)"
 *         required: false
 *         schema:
 *           type: boolean
 *           default: true
 *     responses:
 *       200:
 *         description: Returns technical indicators for the NSE symbol
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sma:
 *                   type: object
 *                   description: "Simple Moving Averages with dynamic keys (sma5, sma10, etc.)"
 *                   additionalProperties:
 *                     type: array
 *                     items:
 *                       type: number
 *                 ema:
 *                   type: object
 *                   description: "Exponential Moving Averages with dynamic keys (ema5, ema10, etc.)"
 *                   additionalProperties:
 *                     type: array
 *                     items:
 *                       type: number
 *                 rsi:
 *                   type: array
 *                   items:
 *                     type: number
 *                   description: "Relative Strength Index"
 *                 macd:
 *                   type: object
 *                   properties:
 *                     macd:
 *                       type: array
 *                       items:
 *                         type: number
 *                     signal:
 *                       type: array
 *                       items:
 *                         type: number
 *                     histogram:
 *                       type: array
 *                       items:
 *                         type: number
 *                 bollingerBands:
 *                   type: object
 *                   properties:
 *                     upper:
 *                       type: array
 *                       items:
 *                         type: number
 *                     middle:
 *                       type: array
 *                       items:
 *                         type: number
 *                     lower:
 *                       type: array
 *                       items:
 *                         type: number
 *                 stochastic:
 *                   type: object
 *                   properties:
 *                     k:
 *                       type: array
 *                       items:
 *                         type: number
 *                     d:
 *                       type: array
 *                       items:
 *                         type: number
 *                 williamsR:
 *                   type: array
 *                   items:
 *                     type: number
 *                   description: "Williams %R"
 *                 atr:
 *                   type: array
 *                   items:
 *                     type: number
 *                   description: "Average True Range"
 *                 adx:
 *                   type: array
 *                   items:
 *                     type: number
 *                   description: "Average Directional Index"
 *                 obv:
 *                   type: array
 *                   items:
 *                     type: number
 *                   description: "On-Balance Volume"
 *                 cci:
 *                   type: array
 *                   items:
 *                     type: number
 *                   description: "Commodity Channel Index"
 *                 mfi:
 *                   type: array
 *                   items:
 *                     type: number
 *                   description: "Money Flow Index"
 *                 roc:
 *                   type: array
 *                   items:
 *                     type: number
 *                   description: "Rate of Change"
 *                 momentum:
 *                   type: array
 *                   items:
 *                     type: number
 *                   description: "Momentum"
 *                 ad:
 *                   type: array
 *                   items:
 *                     type: number
 *                   description: "Accumulation/Distribution"
 *                 vwap:
 *                   type: array
 *                   items:
 *                     type: number
 *                   description: "Volume Weighted Average Price"
 *       400:
 *         description: Returns a JSON error object of API call
 */
mainRouter.get('/api/equity/technicalIndicators/:symbol', async (req, res) => {
    try {
        const { symbol } = req.params
        const { 
            period, 
            smaPeriods, 
            emaPeriods, 
            rsiPeriod, 
            bbPeriod, 
            bbStdDev,
            showOnlyLatest
        } = req.query

        // Parse query parameters
        const options: any = {}
        
        if (period) {
            options.period = parseInt(period as string)
        }
        
        if (smaPeriods) {
            options.smaPeriods = (smaPeriods as string).split(',').map(p => parseInt(p.trim()))
        }
        
        if (emaPeriods) {
            options.emaPeriods = (emaPeriods as string).split(',').map(p => parseInt(p.trim()))
        }
        
        if (rsiPeriod) {
            options.rsiPeriod = parseInt(rsiPeriod as string)
        }
        
        if (bbPeriod) {
            options.bbPeriod = parseInt(bbPeriod as string)
        }
        
        if (bbStdDev) {
            options.bbStdDev = parseFloat(bbStdDev as string)
        }

        const indicators = await nseIndia.getTechnicalIndicators(symbol, (options.period as number) || 200, options)
        
        // Parse showOnlyLatest flag (default: true)
        const showLatest = showOnlyLatest === undefined || showOnlyLatest === 'true'
        
        // Helper function to round numbers to 2 decimal places
        const roundTo2Decimals = (value: number | null): number | null => {
            return value !== null ? Math.round(value * 100) / 100 : null
        }

        // Helper function to round array of numbers to 2 decimal places
        const roundArrayTo2Decimals = (arr: number[]): number[] => {
            return arr.map(value => roundTo2Decimals(value) as number)
        }

        if (showLatest) {
            // Return only the latest values
            const latestIndicators: any = {}
            
            // Process SMA indicators
            latestIndicators.sma = {}
            Object.keys(indicators.sma).forEach(key => {
                const values = indicators.sma[key]
                latestIndicators.sma[key] = values.length > 0 ? roundTo2Decimals(values[values.length - 1]) : null
            })
            
            // Process EMA indicators
            latestIndicators.ema = {}
            Object.keys(indicators.ema).forEach(key => {
                const values = indicators.ema[key]
                latestIndicators.ema[key] = values.length > 0 ? roundTo2Decimals(values[values.length - 1]) : null
            })
            
            // Process other indicators
            latestIndicators.rsi = roundTo2Decimals(
                indicators.rsi.length > 0 ? indicators.rsi[indicators.rsi.length - 1] : null
            )
            latestIndicators.macd = {
                macd: roundTo2Decimals(
                    indicators.macd.macd.length > 0 ? indicators.macd.macd[indicators.macd.macd.length - 1] : null
                ),
                signal: roundTo2Decimals(
                    indicators.macd.signal.length > 0 ? indicators.macd.signal[indicators.macd.signal.length - 1] : null
                ),
                histogram: roundTo2Decimals(
                    indicators.macd.histogram.length > 0 ? 
                        indicators.macd.histogram[indicators.macd.histogram.length - 1] : null
                )
            }
            latestIndicators.bollingerBands = {
                upper: roundTo2Decimals(
                    indicators.bollingerBands.upper.length > 0 ? 
                        indicators.bollingerBands.upper[indicators.bollingerBands.upper.length - 1] : null
                ),
                middle: roundTo2Decimals(
                    indicators.bollingerBands.middle.length > 0 ? 
                        indicators.bollingerBands.middle[indicators.bollingerBands.middle.length - 1] : null
                ),
                lower: roundTo2Decimals(
                    indicators.bollingerBands.lower.length > 0 ? 
                        indicators.bollingerBands.lower[indicators.bollingerBands.lower.length - 1] : null
                )
            }
            latestIndicators.stochastic = {
                k: roundTo2Decimals(
                    indicators.stochastic.k.length > 0 ? 
                        indicators.stochastic.k[indicators.stochastic.k.length - 1] : null
                ),
                d: roundTo2Decimals(
                    indicators.stochastic.d.length > 0 ? 
                        indicators.stochastic.d[indicators.stochastic.d.length - 1] : null
                )
            }
            latestIndicators.williamsR = roundTo2Decimals(
                indicators.williamsR.length > 0 ? indicators.williamsR[indicators.williamsR.length - 1] : null
            )
            latestIndicators.atr = roundTo2Decimals(
                indicators.atr.length > 0 ? indicators.atr[indicators.atr.length - 1] : null
            )
            latestIndicators.adx = roundTo2Decimals(
                indicators.adx.length > 0 ? indicators.adx[indicators.adx.length - 1] : null
            )
            latestIndicators.obv = roundTo2Decimals(
                indicators.obv.length > 0 ? indicators.obv[indicators.obv.length - 1] : null
            )
            latestIndicators.cci = roundTo2Decimals(
                indicators.cci.length > 0 ? indicators.cci[indicators.cci.length - 1] : null
            )
            latestIndicators.mfi = roundTo2Decimals(
                indicators.mfi.length > 0 ? indicators.mfi[indicators.mfi.length - 1] : null
            )
            latestIndicators.roc = roundTo2Decimals(
                indicators.roc.length > 0 ? indicators.roc[indicators.roc.length - 1] : null
            )
            latestIndicators.momentum = roundTo2Decimals(
                indicators.momentum.length > 0 ? indicators.momentum[indicators.momentum.length - 1] : null
            )
            latestIndicators.ad = roundTo2Decimals(
                indicators.ad.length > 0 ? indicators.ad[indicators.ad.length - 1] : null
            )
            latestIndicators.vwap = roundTo2Decimals(
                indicators.vwap.length > 0 ? indicators.vwap[indicators.vwap.length - 1] : null
            )
            
            res.json(latestIndicators)
        } else {
            // Return all values with 2 decimal precision
            const roundedIndicators: any = {}
            
            // Process SMA indicators
            roundedIndicators.sma = {}
            Object.keys(indicators.sma).forEach(key => {
                roundedIndicators.sma[key] = roundArrayTo2Decimals(indicators.sma[key])
            })
            
            // Process EMA indicators
            roundedIndicators.ema = {}
            Object.keys(indicators.ema).forEach(key => {
                roundedIndicators.ema[key] = roundArrayTo2Decimals(indicators.ema[key])
            })
            
            // Process other indicators
            roundedIndicators.rsi = roundArrayTo2Decimals(indicators.rsi)
            roundedIndicators.macd = {
                macd: roundArrayTo2Decimals(indicators.macd.macd),
                signal: roundArrayTo2Decimals(indicators.macd.signal),
                histogram: roundArrayTo2Decimals(indicators.macd.histogram)
            }
            roundedIndicators.bollingerBands = {
                upper: roundArrayTo2Decimals(indicators.bollingerBands.upper),
                middle: roundArrayTo2Decimals(indicators.bollingerBands.middle),
                lower: roundArrayTo2Decimals(indicators.bollingerBands.lower)
            }
            roundedIndicators.stochastic = {
                k: roundArrayTo2Decimals(indicators.stochastic.k),
                d: roundArrayTo2Decimals(indicators.stochastic.d)
            }
            roundedIndicators.williamsR = roundArrayTo2Decimals(indicators.williamsR)
            roundedIndicators.atr = roundArrayTo2Decimals(indicators.atr)
            roundedIndicators.adx = roundArrayTo2Decimals(indicators.adx)
            roundedIndicators.obv = roundArrayTo2Decimals(indicators.obv)
            roundedIndicators.cci = roundArrayTo2Decimals(indicators.cci)
            roundedIndicators.mfi = roundArrayTo2Decimals(indicators.mfi)
            roundedIndicators.roc = roundArrayTo2Decimals(indicators.roc)
            roundedIndicators.momentum = roundArrayTo2Decimals(indicators.momentum)
            roundedIndicators.ad = roundArrayTo2Decimals(indicators.ad)
            roundedIndicators.vwap = roundArrayTo2Decimals(indicators.vwap)
            
            res.json(roundedIndicators)
        }
    } catch (error) {
        res.status(400).json(error)
    }
})

/**
 * @openapi
 * /api/index/{indexSymbol}:
 *   get:
 *     description: To get detailsof the NSE index
 *     tags:
 *       - Index
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: indexSymbol
 *         in: path
 *         description: NSE index symbol
 *         required: true
 *         schema:
 *           type: string
 *           format: any
 *     responses:
 *       200:
 *         description: Returns a details of the NSE index symbol
 *       400:
 *         description: Returns a JSON error object of API call
 */
mainRouter.get('/api/index/:indexSymbol', async (req, res) => {
    try {
        res.json(await nseIndia.getEquityStockIndices(req.params.indexSymbol))
    } catch (error) {
        res.status(400).json(error)
    }
})




/**
 * @openapi
 * /api/index/options/{indexSymbol}:
 *   get:
 *     description: To get index Option chain data
 *     tags:
 *       - Index
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: indexSymbol
 *         in: path
 *         description: NSE index symbol
 *         required: true
 *         schema:
 *           type: string
 *           format: any
 *     responses:
 *       200:
 *         description: Returns Data for Index OPTION CHAIN
 *       400:
 *         description: Returns a JSON error object of API call
 */

mainRouter.get('/api/index/options/:indexSymbol', async (req, res) => {
    try {
        res.json(await nseIndia.getIndexOptionChain(req.params.indexSymbol))
    } catch (error) {
        res.status(400).json(error)
    }
})

/**
 * @swagger
 * /api/index/options/contract-info/{indexSymbol}:
 *   get:
 *     summary: Get option chain contract information for an index
 *     tags: [Index]
 *     parameters:
 *       - in: path
 *         name: indexSymbol
 *         required: true
 *         schema:
 *           type: string
 *         description: Index symbol (e.g., NIFTY, BANKNIFTY)
 *     responses:
 *       200:
 *         description: Returns option chain contract information (expiry dates and strike prices)
 *       400:
 *         description: Returns a JSON error object of API call
 */

mainRouter.get('/api/index/options/contract-info/:indexSymbol', async (req, res) => {
    try {
        res.json(await nseIndia.getIndexOptionChainContractInfo(req.params.indexSymbol))
    } catch (error) {
        res.status(400).json(error)
    }
})


/**
 * @openapi
 * /api/commodity/options/{commoditySymbol}:
 *   get:
 *     description: To get commodity Option chain data
 *     tags:
 *       - Commodity
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: commoditySymbol
 *         in: path
 *         description: NSE commodity symbol
 *         required: true
 *         schema:
 *           type: string
 *           format: any
 *     responses:
 *       200:
 *         description: Returns a option chain data of the NSE commodity symbol
 *       400:
 *         description: Returns a JSON error object of API call
 */

mainRouter.get('/api/commodity/options/:commoditySymbol', async (req, res) => {
    try {
        res.json(await nseIndia.getCommodityOptionChain(req.params.commoditySymbol))
    } catch (error) {
        res.status(400).json(error)
    }
})

/**
 * @openapi
 * /api/index/intraday/{indexSymbol}:
 *   get:
 *     description: To get intraday trade info of the NSE index symbol
 *     tags:
 *       - Index
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: indexSymbol
 *         in: path
 *         description: NSE index symbol
 *         required: true
 *         schema:
 *           type: string
 *           format: any
 *     responses:
 *       200:
 *         description: Returns a intraday trade info of the NSE index symbol
 *       400:
 *         description: Returns a JSON error object of API call
 */
mainRouter.get('/api/index/intraday/:indexSymbol', async (req, res) => {
    try {
        res.json(await nseIndia.getIndexIntradayData(req.params.indexSymbol))
    } catch (error) {
        res.status(400).json(error)
    }
})

/**
 * @openapi
 * /api/gainersAndLosers/{indexSymbol}:
 *   get:
 *     description: To get gainers and losers of the specific index
 *     tags:
 *       - Helpers
 *     parameters:
 *       - name: indexSymbol
 *         in: path
 *         description: NSE index symbol
 *         required: true
 *         schema:
 *           type: string
 *           format: any
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Returns a JSON object of the specified index's gainers and losers
 *       400:
 *         description: Returns a JSON error object of API call
 */
mainRouter.get('/api/gainersAndLosers/:indexSymbol', async (req, res) => {
    try {
        res.json(await getGainersAndLosersByIndex(req.params.indexSymbol))
    } catch (error) {
        res.status(400).json(error)
    }
})

/**
 * @openapi
 * /api/mostActive/{indexSymbol}:
 *   get:
 *     description: To get most active equities of the specific index
 *     tags:
 *       - Helpers
 *     parameters:
 *       - name: indexSymbol
 *         in: path
 *         description: NSE index symbol
 *         required: true
 *         schema:
 *           type: string
 *           format: any
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Returns a JSON object of most active equities of the specified index
 *       400:
 *         description: Returns a JSON error object of API call
 */
mainRouter.get('/api/mostActive/:indexSymbol', async (req, res) => {
    try {
        res.json(await getMostActiveEquities(req.params.indexSymbol))
    } catch (error) {
        res.status(400).json(error)
    }
})

// ============================================================================
// MCP CLIENT - CORE ENDPOINTS
// ============================================================================

/**
 * @openapi
 * /api/mcp/query:
 *   post:
 *     description: Query NSE India data using natural language. Supports OpenAI function calling,
 *       memory, context summarization, and session management.
 *     tags:
 *       - MCP Client
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - query
 *             properties:
 *               query:
 *                 type: string
 *                 description: Natural language query about NSE India stock market data
 *                 example: "What is the current price of TCS stock? Also compare it with RELIANCE."
 *               sessionId:
 *                 type: string
 *                 description: Optional session identifier for memory features
 *                 example: "user123_session456"
 *               userId:
 *                 type: string
 *                 description: Optional user identifier for personalization
 *                 example: "user123"
 *               model:
 *                 type: string
 *                 description: OpenAI model to use
 *                 default: gpt-4o-mini
 *               temperature:
 *                 type: number
 *                 description: Temperature for response generation
 *                 default: 0.7
 *               max_tokens:
 *                 type: number
 *                 description: Maximum tokens in response
 *                 default: 2000
 *               includeContext:
 *                 type: boolean
 *                 description: Whether to include conversation context (requires sessionId)
 *                 default: true
 *               updatePreferences:
 *                 type: boolean
 *                 description: Whether to update user preferences based on query (requires sessionId)
 *                 default: true
 *               useMemory:
 *                 type: boolean
 *                 description: Whether to use memory features (requires sessionId)
 *                 default: true
 *               maxIterations:
 *                 type: number
 *                 description: Maximum number of iterations for complex queries
 *                 default: 5
 *               enableDebugLogging:
 *                 type: boolean
 *                 description: Enable debug logging for AI messages and tool calls
 *                 default: false
 *     responses:
 *       200:
 *         description: Returns AI-generated response with NSE data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 response:
 *                   type: string
 *                   description: AI-generated response
 *                 tools_used:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: List of unique MCP tools used across all iterations
 *                 data_sources:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: Data sources used
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   description: Response timestamp
 *                 sessionId:
 *                   type: string
 *                   description: Session identifier (if memory was used)
 *                 context_used:
 *                   type: boolean
 *                   description: Whether context was used
 *                 user_preferences_updated:
 *                   type: boolean
 *                   description: Whether user preferences were updated
 *                 conversation_length:
 *                   type: number
 *                   description: Current conversation length
 *                 context_summarized:
 *                   type: boolean
 *                   description: Whether context was summarized
 *                 context_summary:
 *                   type: object
 *                   description: Context summary (if summarized)
 *                 token_count:
 *                   type: object
 *                   description: Token count information
 *                 iterations_used:
 *                   type: number
 *                   description: Number of iterations used to process the query
 *                 iteration_details:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       iteration:
 *                         type: number
 *                       tools_called:
 *                         type: array
 *                         items:
 *                           type: string
 *                       purpose:
 *                         type: string
 *                       tool_parameters:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             tool_name:
 *                               type: string
 *                             parameters:
 *                               type: object
 *                   description: Detailed breakdown of each iteration including tool parameters
 *       400:
 *         description: Returns error if query processing fails
 *       500:
 *         description: Returns error if OpenAI API fails
 */
mainRouter.post('/api/mcp/query', async (req, res) => {
    try {
        const { 
            query, 
            sessionId: providedSessionId, 
            userId, 
            model, 
            temperature, 
            max_tokens, 
            includeContext, 
            updatePreferences, 
            useMemory,
            maxIterations,
            enableDebugLogging
        } = req.body as MCPClientRequest

        if (!query || typeof query !== 'string') {
            return res.status(400).json({ 
                error: 'Query is required and must be a string' 
            })
        }

        // Generate sessionId if not provided to enable memory features
        const sessionId = providedSessionId || `auto_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

        if (!process.env.OPENAI_API_KEY) {
            return res.status(500).json({ 
                error: 'OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.' 
            })
        }

        // Enable debug logging if requested, or check environment variable
        const shouldEnableDebug = enableDebugLogging || process.env.MCP_DEBUG_LOGGING === 'true'
        
        // Store original debug state to restore later
        const originalDebugState = mcpClient.isDebugLoggingEnabled()
        
        // Temporarily enable debug logging if requested
        if (shouldEnableDebug) {
            mcpClient.setDebugLogging(true)
        }

        try {
            const result = await mcpClient.processQuery({
                query,
                sessionId,
                userId,
                model,
                temperature,
                max_tokens,
                includeContext,
                updatePreferences,
                useMemory,
                maxIterations
            })

            res.json(result)
        } finally {
            // Restore original debug state
            mcpClient.setDebugLogging(originalDebugState)
        }
    } catch (error) {
        console.error('MCP Query Error:', error)
        res.status(500).json({ 
            error: error instanceof Error ? error.message : 'Internal server error' 
        })
    }
})

/**
 * @openapi
 * /api/mcp/tools:
 *   get:
 *     description: Get list of available MCP tools for NSE India data
 *     tags:
 *       - MCP Client
 *     responses:
 *       200:
 *         description: Returns list of available MCP tools
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tools:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         description: Tool name
 *                       description:
 *                         type: string
 *                         description: Tool description
 *                       inputSchema:
 *                         type: object
 *                         description: Tool input schema
 *       500:
 *         description: Returns error if tools cannot be retrieved
 */
mainRouter.get('/api/mcp/tools', async (_req, res) => {
    try {
        const tools = mcpClient.getAvailableTools()
        res.json({ tools })
    } catch (error) {
        console.error('MCP Tools Error:', error)
        res.status(500).json({ 
            error: error instanceof Error ? error.message : 'Internal server error' 
        })
    }
})

/**
 * @openapi
 * /api/mcp/test:
 *   get:
 *     description: Test MCP client connection and OpenAI integration
 *     tags:
 *       - MCP Client
 *     responses:
 *       200:
 *         description: Returns test result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   description: Test status
 *                 message:
 *                   type: string
 *                   description: Test message
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   description: Test timestamp
 *       500:
 *         description: Returns error if test fails
 */
mainRouter.get('/api/mcp/test', async (_req, res) => {
    try {
        if (!process.env.OPENAI_API_KEY) {
            return res.status(500).json({ 
                status: 'error',
                message: 'OpenAI API key not configured',
                timestamp: new Date().toISOString()
            })
        }

        const isConnected = await mcpClient.testConnection()
        
        if (isConnected) {
            res.json({
                status: 'success',
                message: 'MCP client is working correctly',
                timestamp: new Date().toISOString()
            })
        } else {
            res.status(500).json({
                status: 'error',
                message: 'MCP client test failed',
                timestamp: new Date().toISOString()
            })
        }
    } catch (error) {
        console.error('MCP Test Error:', error)
        res.status(500).json({ 
            status: 'error',
            message: error instanceof Error ? error.message : 'Test failed',
            timestamp: new Date().toISOString()
        })
    }
})

// ============================================================================
// MCP CLIENT - UTILITY ENDPOINTS
// ============================================================================

/**
 * @openapi
 * /api/mcp/functions:
 *   get:
 *     description: Get list of available MCP tools in OpenAI function format
 *     tags:
 *       - MCP Client
 *     responses:
 *       200:
 *         description: Returns list of available MCP tools in OpenAI function format
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 functions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         description: Function name
 *                       description:
 *                         type: string
 *                         description: Function description
 *                       parameters:
 *                         type: object
 *                         description: Function parameters schema
 *       500:
 *         description: Returns error if functions cannot be retrieved
 */
mainRouter.get('/api/mcp/functions', async (_req, res) => {
    try {
        const functions = mcpClient.getOpenAIFunctions()
        res.json({ functions })
    } catch (error) {
        console.error('MCP Functions Error:', error)
        res.status(500).json({ 
            error: error instanceof Error ? error.message : 'Internal server error' 
        })
    }
})

// ============================================================================
// MCP CLIENT - SESSION MANAGEMENT ENDPOINTS
// ============================================================================

/**
 * @openapi
 * /api/mcp/session/{sessionId}:
 *   get:
 *     description: Get session information and statistics
 *     tags:
 *       - MCP Client
 *     parameters:
 *       - name: sessionId
 *         in: path
 *         description: Session identifier
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Returns session information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sessionId:
 *                   type: string
 *                 userId:
 *                   type: string
 *                 startTime:
 *                   type: string
 *                   format: date-time
 *                 lastActivity:
 *                   type: string
 *                   format: date-time
 *                 messageCount:
 *                   type: number
 *                 recentQueriesCount:
 *                   type: number
 *                 frequentlyAccessedStocks:
 *                   type: number
 *                 frequentlyUsedTools:
 *                   type: number
 *       404:
 *         description: Session not found
 */
mainRouter.get('/api/mcp/session/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params
        const sessionInfo = mcpClient.getSessionInfo(sessionId)
        
        if (!sessionInfo) {
            return res.status(404).json({ 
                error: 'Session not found' 
            })
        }

        res.json(sessionInfo)
    } catch (error) {
        console.error('Get Session Info Error:', error)
        res.status(500).json({ 
            error: error instanceof Error ? error.message : 'Internal server error' 
        })
    }
})

/**
 * @openapi
 * /api/mcp/session/{sessionId}/history:
 *   get:
 *     description: Get conversation history for a session
 *     tags:
 *       - MCP Client
 *     parameters:
 *       - name: sessionId
 *         in: path
 *         description: Session identifier
 *         required: true
 *         schema:
 *           type: string
 *       - name: maxMessages
 *         in: query
 *         description: Maximum number of messages to return
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Returns conversation history
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 messages:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       role:
 *                         type: string
 *                         enum: [user, assistant, system]
 *                       content:
 *                         type: string
 *                       timestamp:
 *                         type: string
 *                         format: date-time
 *                       tools_used:
 *                         type: array
 *                         items:
 *                           type: string
 *                       metadata:
 *                         type: object
 *       404:
 *         description: Session not found
 */
mainRouter.get('/api/mcp/session/:sessionId/history', async (req, res) => {
    try {
        const { sessionId } = req.params
        const { maxMessages } = req.query
        
        const history = mcpClient.getConversationHistory(
            sessionId, 
            maxMessages ? parseInt(maxMessages as string) : undefined
        )
        
        if (history.length === 0) {
            return res.status(404).json({ 
                error: 'Session not found or no history available' 
            })
        }

        res.json({ messages: history })
    } catch (error) {
        console.error('Get Conversation History Error:', error)
        res.status(500).json({ 
            error: error instanceof Error ? error.message : 'Internal server error' 
        })
    }
})

/**
 * @openapi
 * /api/mcp/session/{sessionId}/preferences:
 *   put:
 *     description: Update user preferences for a session
 *     tags:
 *       - MCP Client
 *     parameters:
 *       - name: sessionId
 *         in: path
 *         description: Session identifier
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               preferredStocks:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of preferred stock symbols
 *               preferredIndices:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of preferred indices
 *               analysisStyle:
 *                 type: string
 *                 enum: [detailed, brief, technical]
 *                 description: Preferred analysis style
 *               language:
 *                 type: string
 *                 description: Preferred language
 *               timezone:
 *                 type: string
 *                 description: User timezone
 *               notificationSettings:
 *                 type: object
 *                 properties:
 *                   priceAlerts:
 *                     type: boolean
 *                   marketUpdates:
 *                     type: boolean
 *     responses:
 *       200:
 *         description: Preferences updated successfully
 *       400:
 *         description: Invalid preferences data
 *       404:
 *         description: Session not found
 */
mainRouter.put('/api/mcp/session/:sessionId/preferences', async (req, res) => {
    try {
        const { sessionId } = req.params
        const preferences = req.body

        mcpClient.updateUserPreferences(sessionId, preferences)
        
        res.json({ 
            message: 'Preferences updated successfully',
            sessionId 
        })
    } catch (error) {
        console.error('Update Preferences Error:', error)
        res.status(500).json({ 
            error: error instanceof Error ? error.message : 'Internal server error' 
        })
    }
})

/**
 * @openapi
 * /api/mcp/session/{sessionId}/clear:
 *   delete:
 *     description: Clear session data and conversation history
 *     tags:
 *       - MCP Client
 *     parameters:
 *       - name: sessionId
 *         in: path
 *         description: Session identifier
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Session cleared successfully
 *       404:
 *         description: Session not found
 */
mainRouter.delete('/api/mcp/session/:sessionId/clear', async (req, res) => {
    try {
        const { sessionId } = req.params
        
        mcpClient.clearSession(sessionId)
        
        res.json({ 
            message: 'Session cleared successfully',
            sessionId 
        })
    } catch (error) {
        console.error('Clear Session Error:', error)
        res.status(500).json({ 
            error: error instanceof Error ? error.message : 'Internal server error' 
        })
    }
})

/**
 * @openapi
 * /api/mcp/session/{sessionId}/export:
 *   get:
 *     description: Export session data
 *     tags:
 *       - MCP Client
 *     parameters:
 *       - name: sessionId
 *         in: path
 *         description: Session identifier
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Returns exported session data
 *       404:
 *         description: Session not found
 */
mainRouter.get('/api/mcp/session/:sessionId/export', async (req, res) => {
    try {
        const { sessionId } = req.params
        const sessionData = mcpClient.exportSessionData(sessionId)
        
        if (!sessionData) {
            return res.status(404).json({ 
                error: 'Session not found' 
            })
        }

        res.json(sessionData)
    } catch (error) {
        console.error('Export Session Data Error:', error)
        res.status(500).json({ 
            error: error instanceof Error ? error.message : 'Internal server error' 
        })
    }
})

/**
 * @openapi
 * /api/mcp/cleanup:
 *   post:
 *     description: Cleanup expired sessions
 *     tags:
 *       - MCP Client
 *     responses:
 *       200:
 *         description: Cleanup completed successfully
 */
mainRouter.post('/api/mcp/cleanup', async (_req, res) => {
    try {
        mcpClient.cleanupExpiredSessions()
        
        res.json({ 
            message: 'Cleanup completed successfully',
            timestamp: new Date().toISOString()
        })
    } catch (error) {
        console.error('Cleanup Error:', error)
        res.status(500).json({ 
            error: error instanceof Error ? error.message : 'Internal server error' 
        })
    }
})

// ============================================================================
// MCP CLIENT - CONTEXT MANAGEMENT ENDPOINTS
// ============================================================================

/**
 * @openapi
 * /api/mcp/session/{sessionId}/context-stats:
 *   get:
 *     description: Get context statistics for a session
 *     tags:
 *       - MCP Client
 *     parameters:
 *       - name: sessionId
 *         in: path
 *         description: Session identifier
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Returns context statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 messageCount:
 *                   type: number
 *                   description: Number of messages in conversation
 *                 tokenCount:
 *                   type: object
 *                   description: Token count breakdown
 *                 needsSummarization:
 *                   type: boolean
 *                   description: Whether context needs summarization
 *                 contextWindowUsage:
 *                   type: number
 *                   description: Context window usage percentage
 *       404:
 *         description: Session not found
 */
mainRouter.get('/api/mcp/session/:sessionId/context-stats', async (req, res) => {
    try {
        const { sessionId } = req.params
        const stats = await mcpClient.getContextStats(sessionId)
        
        res.json(stats)
    } catch (error) {
        console.error('Get Context Stats Error:', error)
        res.status(500).json({ 
            error: error instanceof Error ? error.message : 'Internal server error' 
        })
    }
})

/**
 * @openapi
 * /api/mcp/session/{sessionId}/summarize:
 *   post:
 *     description: Force context summarization for a session
 *     tags:
 *       - MCP Client
 *     parameters:
 *       - name: sessionId
 *         in: path
 *         description: Session identifier
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Context summarization completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 summary:
 *                   type: object
 *                   description: Generated context summary
 *                 message:
 *                   type: string
 *                   description: Success message
 *       404:
 *         description: Session not found
 */
mainRouter.post('/api/mcp/session/:sessionId/summarize', async (req, res) => {
    try {
        const { sessionId } = req.params
        const summary = await mcpClient.forceContextSummarization(sessionId)
        
        if (!summary) {
            return res.status(404).json({ 
                error: 'Session not found' 
            })
        }

        res.json({ 
            summary,
            message: 'Context summarization completed successfully'
        })
    } catch (error) {
        console.error('Context Summarization Error:', error)
        res.status(500).json({ 
            error: error instanceof Error ? error.message : 'Internal server error' 
        })
    }
})

/**
 * @openapi
 * /api/mcp/session/{sessionId}/context-window:
 *   get:
 *     description: Get context window configuration
 *     tags:
 *       - MCP Client
 *     parameters:
 *       - name: sessionId
 *         in: path
 *         description: Session identifier
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Returns context window configuration
 */
mainRouter.get('/api/mcp/session/:sessionId/context-window', async (req, res) => {
    try {
        const config = mcpClient.getContextWindowConfig()
        res.json(config)
    } catch (error) {
        console.error('Get Context Window Config Error:', error)
        res.status(500).json({ 
            error: error instanceof Error ? error.message : 'Internal server error' 
        })
    }
})

/**
 * @openapi
 * /api/mcp/session/{sessionId}/context-window:
 *   put:
 *     description: Update context window configuration
 *     tags:
 *       - MCP Client
 *     parameters:
 *       - name: sessionId
 *         in: path
 *         description: Session identifier
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               maxTokens:
 *                 type: number
 *                 description: Maximum tokens in context window
 *               reservedTokens:
 *                 type: number
 *                 description: Reserved tokens for system prompt and response
 *               summarizationThreshold:
 *                 type: number
 *                 description: Threshold for triggering summarization (0-1)
 *               minMessagesToSummarize:
 *                 type: number
 *                 description: Minimum messages before summarization
 *               summaryCompressionRatio:
 *                 type: number
 *                 description: Compression ratio for summaries (0-1)
 *     responses:
 *       200:
 *         description: Context window configuration updated
 */
mainRouter.put('/api/mcp/session/:sessionId/context-window', async (req, res) => {
    try {
        const config = req.body
        mcpClient.updateContextWindowConfig(config)
        
        res.json({ 
            message: 'Context window configuration updated successfully',
            config: mcpClient.getContextWindowConfig()
        })
    } catch (error) {
        console.error('Update Context Window Config Error:', error)
        res.status(500).json({ 
            error: error instanceof Error ? error.message : 'Internal server error' 
        })
    }
})

// ============================================================================
// SUMMARIZATION HISTORY ENDPOINTS
// ============================================================================

/**
 * @openapi
 * /api/mcp/session/{sessionId}/summarization/last:
 *   get:
 *     description: Get the last summarization details for a session
 *     tags:
 *       - MCP Memory
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Session identifier
 *     responses:
 *       200:
 *         description: Returns last summarization details
 *       404:
 *         description: No summarization found
 */
mainRouter.get('/api/mcp/session/:sessionId/summarization/last', async (req, res) => {
    try {
        const { sessionId } = req.params
        
        if (!mcpClient.isMemoryEnabled()) {
            return res.status(500).json({ error: 'Memory manager not enabled' })
        }

        const lastSummarization = mcpClient.getLastSummarization(sessionId)
        
        if (!lastSummarization) {
            return res.status(404).json({ 
                message: 'No summarization found for this session' 
            })
        }

        res.json(lastSummarization)
    } catch (error) {
        console.error('Get Last Summarization Error:', error)
        res.status(500).json({ 
            error: error instanceof Error ? error.message : 'Internal server error' 
        })
    }
})

/**
 * @openapi
 * /api/mcp/session/{sessionId}/summarization/history:
 *   get:
 *     description: Get summarization history for a session
 *     tags:
 *       - MCP Memory
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Session identifier
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *         description: Limit number of records returned
 *     responses:
 *       200:
 *         description: Returns summarization history
 */
mainRouter.get('/api/mcp/session/:sessionId/summarization/history', async (req, res) => {
    try {
        const { sessionId } = req.params
        const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined
        
        if (!mcpClient.isMemoryEnabled()) {
            return res.status(500).json({ error: 'Memory manager not enabled' })
        }

        const history = mcpClient.getSummarizationHistory(sessionId, limit)
        
        res.json({
            sessionId,
            count: history.length,
            history
        })
    } catch (error) {
        console.error('Get Summarization History Error:', error)
        res.status(500).json({ 
            error: error instanceof Error ? error.message : 'Internal server error' 
        })
    }
})

/**
 * @openapi
 * /api/mcp/session/{sessionId}/summarization/summary:
 *   get:
 *     description: Get summarization summary (overview without full message history)
 *     tags:
 *       - MCP Memory
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Session identifier
 *     responses:
 *       200:
 *         description: Returns summarization summary
 */
mainRouter.get('/api/mcp/session/:sessionId/summarization/summary', async (req, res) => {
    try {
        const { sessionId } = req.params
        
        if (!mcpClient.isMemoryEnabled()) {
            return res.status(500).json({ error: 'Memory manager not enabled' })
        }

        const summary = mcpClient.getSummarizationSummary(sessionId)
        
        if (!summary) {
            return res.status(404).json({ 
                message: 'Session not found' 
            })
        }

        res.json(summary)
    } catch (error) {
        console.error('Get Summarization Summary Error:', error)
        res.status(500).json({ 
            error: error instanceof Error ? error.message : 'Internal server error' 
        })
    }
})

/**
 * @openapi
 * /api/mcp/session/{sessionId}/openai-messages:
 *   get:
 *     description: Get the exact messages that would be sent to OpenAI (including system message)
 *     tags:
 *       - MCP Memory
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Session identifier
 *     responses:
 *       200:
 *         description: Returns messages in OpenAI format
 */
mainRouter.get('/api/mcp/session/:sessionId/openai-messages', async (req, res) => {
    try {
        const { sessionId } = req.params
        
        if (!mcpClient.isMemoryEnabled()) {
            return res.status(500).json({ error: 'Memory manager not enabled' })
        }

        const data = mcpClient.getOpenAIMessages(sessionId)
        
        if (!data) {
            return res.status(404).json({ error: 'Session not found' })
        }
        
        // Format messages as they would be sent to OpenAI
            const openaiMessages = [
            {
                role: 'system',
                content: data.systemPrompt,
                metadata: {
                    type: 'system_prompt',
                    includes_user_context: true
                }
            },
            ...data.conversationHistory.map((msg: any) => ({
                role: msg.role,
                content: msg.content,
                timestamp: msg.timestamp,
                metadata: {
                    ...msg.metadata,
                    is_summary: msg.metadata?.isSummary || false,
                    tools_used: msg.tools_used || []
                }
            }))
        ]

        // Calculate statistics
        const summaryMessages = openaiMessages.filter(
          m => m.metadata && 'is_summary' in m.metadata && m.metadata.is_summary
        )
        const stats = {
            total_messages: openaiMessages.length,
            system_messages: 1,
            summary_messages: summaryMessages.length,
            user_messages: openaiMessages.filter(m => m.role === 'user').length,
            assistant_messages: openaiMessages.filter(m => m.role === 'assistant').length
        }

        res.json({
            sessionId,
            messages: openaiMessages,
            statistics: stats,
            note: 'This is exactly what OpenAI would receive for the next query'
        })
    } catch (error) {
        console.error('Get OpenAI Messages Error:', error)
        res.status(500).json({ 
            error: error instanceof Error ? error.message : 'Internal server error' 
        })
    }
})

export { mainRouter }
