/* eslint-disable @typescript-eslint/no-explicit-any */
import { Router } from 'express'
import { openapiSpecification } from './swaggerDocOptions'
import { NseIndia, ApiList } from './index'
import {
    getGainersAndLosersByIndex,
    getMostActiveEquities
} from './helpers'
import { Message, UsageInfo, appendMessage, getUsageCost, runConversation } from './openai'
import { toolsData } from './tools'

const mainRouter: Router = Router()

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
 *       500:
 *         description: Returns a JSON error object of API call
 */
mainRouter.get('/', async (_req, res) => {
    try {
        res.json(await nseIndia.getDataByEndpoint(ApiList.MARKET_STATUS))
    } catch (error: any) {
        res.status(500).json({error: error.message})
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
 *       500:
 *         description: Returns a JSON error object of API call
 */
mainRouter.get('/api/glossary', async (_req, res) => {
    try {
        res.json(await nseIndia.getDataByEndpoint(ApiList.GLOSSARY))
    } catch (error: any) {
        res.status(500).json({error: error.message})
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
 *       500:
 *         description: Returns a JSON error object of API call
 */
mainRouter.get('/api/marketStatus', async (_req, res) => {
    try {
        res.json(await nseIndia.getDataByEndpoint(ApiList.MARKET_STATUS))
    } catch (error: any) {
        res.status(500).json({error: error.message})
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
 *       500:
 *         description: Returns a JSON error object of API call
 */
mainRouter.get('/api/marketTurnover', async (_req, res) => {
    try {
        res.json(await nseIndia.getDataByEndpoint(ApiList.MARKET_TURNOVER))
    } catch (error: any) {
        res.status(500).json({error: error.message})
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
 *       500:
 *         description: Returns a JSON error object of API call
 */
mainRouter.get('/api/equityMaster', async (_req, res) => {
    try {
        res.json(await nseIndia.getDataByEndpoint(ApiList.EQUITY_MASTER))
    } catch (error: any) {
        res.status(500).json({error: error.message})
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
 *       500:
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
    } catch (error: any) {
        res.status(500).json({error: error.message})
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
 *       500:
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
    } catch (error: any) {
        res.status(500).json({error: error.message})
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
 *       500:
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
    } catch (error: any) {
        res.status(500).json({error: error.message})
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
 *       500:
 *         description: Returns a JSON error object of API call
 */
mainRouter.get('/api/allIndices', async (_req, res) => {
    try {
        const allIndices = await nseIndia.getDataByEndpoint(ApiList.ALL_INDICES)
        res.json(allIndices)
    } catch (error: any) {
        res.status(500).json({error: error.message})
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
 *       500:
 *         description: Returns a JSON error object of API call
 */
mainRouter.get('/api/indexNames', async (_req, res) => {
    try {
        const indexNames = await nseIndia.getDataByEndpoint(ApiList.INDEX_NAMES)
        res.json(indexNames)
    } catch (error: any) {
        res.status(500).json({error: error.message})
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
 *       500:
 *         description: Returns a JSON error object of API call
 */
mainRouter.get('/api/allSymbols', async (_req, res) => {
    try {
        const symbols = await nseIndia.getAllStockSymbols()
        res.json(symbols)
    } catch (error: any) {
        res.status(500).json({error: error.message})
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
 *       500:
 *         description: Returns a JSON error object of API call
 */
mainRouter.get('/api/equity/:symbol', async (req, res) => {
    try {
        const { symbol } = req.params;
        const data = await nseIndia.getEquityDetails(symbol);
        res.json(data);
    } catch (error: any) {
        res.status(500).json({error: error.message});
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
 *       500:
 *         description: Returns a JSON error object of API call
 */
mainRouter.get('/api/equity/series/:symbol', async (req, res) => {
    try {
        res.json(await nseIndia.getEquitySeries(req.params.symbol))
    } catch (error: any) {
        res.status(500).json({error: error.message})
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
 *       500:
 *         description: Returns a JSON error object of API call
 */
mainRouter.get('/api/equity/tradeInfo/:symbol', async (req, res) => {
    try {
        res.json(await nseIndia.getEquityTradeInfo(req.params.symbol))
    } catch (error: any) {
        res.status(500).json({error: error.message})
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
 *       500:
 *         description: Returns a JSON error object of API call
 */
mainRouter.get('/api/equity/corporateInfo/:symbol', async (req, res) => {
    try {
        res.json(await nseIndia.getEquityCorporateInfo(req.params.symbol))
    } catch (error: any) {
        res.status(500).json({error: error.message})
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
 *       500:
 *         description: Returns a JSON error object of API call
 */
mainRouter.get('/api/equity/options/:symbol', async (req, res) => {
    try {
        res.json(await nseIndia.getEquityOptionChain(req.params.symbol))
    } catch (error: any) {
        res.status(500).json({error: error.message})
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
 *       - name: preOpen
 *         in: query
 *         description: Boolean to get preOpen data
 *         required: false
 *         schema:
 *           type: boolean
 *           default: false
 *     responses:
 *       200:
 *         description: Returns a intraday trade info of the NSE symbol
 *       500:
 *         description: Returns a JSON error object of API call
 */
mainRouter.get('/api/equity/intraday/:symbol', async (req, res) => {
    try {
        const { symbol } = req.params;
        const { preOpen } = req.query;
        const data = await nseIndia.getEquityIntradayData(symbol, preOpen === 'true');
        res.json(data);
    } catch (error: any) {
        res.status(500).json({error: error.message});
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
 *       500:
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
    } catch (error: any) {
        res.status(500).json({error: error.message})
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
 *       500:
 *         description: Returns a JSON error object of API call
 */
mainRouter.get('/api/index/:indexSymbol', async (req, res) => {
    try {
        res.json(await nseIndia.getEquityStockIndices(req.params.indexSymbol))
    } catch (error: any) {
        res.status(500).json({error: error.message})
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
 *       500:
 *         description: Returns a JSON error object of API call
 */

mainRouter.get('/api/index/options/:indexSymbol', async (req, res) => {
    try {
        res.json(await nseIndia.getIndexOptionChain(req.params.indexSymbol))
    } catch (error: any) {
        res.status(500).json({error: error.message})
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
 *       500:
 *         description: Returns a JSON error object of API call
 */

mainRouter.get('/api/commodity/options/:commoditySymbol', async (req, res) => {
    try {
        res.json(await nseIndia.getCommodityOptionChain(req.params.commoditySymbol))
    } catch (error: any) {
        res.status(500).json({error: error.message})
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
 *       - name: preOpen
 *         in: query
 *         description: Boolean to get preOpen data
 *         required: false
 *         schema:
 *           type: boolean
 *           default: false
 *     responses:
 *       200:
 *         description: Returns a intraday trade info of the NSE index symbol
 *       500:
 *         description: Returns a JSON error object of API call
 */
mainRouter.get('/api/index/intraday/:indexSymbol', async (req, res) => {
    try {
        const isPreOpen = req.query.preOpen as string
        if (isPreOpen === "true") {
            res.json(await nseIndia.getIndexIntradayData(req.params.indexSymbol, true))
        } else {
            res.json(await nseIndia.getIndexIntradayData(req.params.indexSymbol))
        }
    } catch (error: any) {
        res.status(500).json({error: error.message})
    }
})

/**
 * @openapi
 * /api/index/historical/{indexSymbol}:
 *   get:
 *     description: To get the historical data for the NSE index symbol
 *     tags:
 *       - Index
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: indexSymbol
 *         in: path
 *         description: NSE Index Symbol of the Equity
 *         required: true
 *         schema:
 *           type: string
 *           format: any
 *       - name: dateStart
 *         in: query
 *         description: "Start date to pull historical data (format: YYYY-MM-DD)"
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - name: dateEnd
 *         in: query
 *         description: "End date to pull historical data (format: YYYY-MM-DD)"
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Returns a historical data of the NSE index symbol
 *       500:
 *         description: Returns a JSON error object of API call
 */
mainRouter.get('/api/index/historical/:indexSymbol', async (req, res) => {
    try {
        const dateStart = req.query.dateStart as string
        const dateEnd = req.query.dateEnd as string
        if (dateStart && dateEnd) {
            const start = new Date(dateStart)
            const end = new Date(dateEnd)
            if (start.getTime() > 0 && end.getTime() > 0) {
                const range = {
                    start,
                    end
                }
                res.json(await nseIndia.getIndexHistoricalData(req.params.indexSymbol, range))
            } else {
                res.status(400).json({ error: 'Invalid date format. Please use the format (YYYY-MM-DD)' })
            }
        } else {
            res.status(400).json({ error: 'Missing arguments "dateStart" or "dateEnd". Please pass those argumets.' })
        }
    } catch (error: any) {
        res.status(500).json({error: error.message})
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
 *       500:
 *         description: Returns a JSON error object of API call
 */
mainRouter.get('/api/gainersAndLosers/:indexSymbol', async (req, res) => {
    try {
        res.json(await getGainersAndLosersByIndex(req.params.indexSymbol))
    } catch (error: any) {
        res.status(500).json({error: error.message})
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
 *       500:
 *         description: Returns a JSON error object of API call
 */
mainRouter.get('/api/mostActive/:indexSymbol', async (req, res) => {
    try {
        res.json(await getMostActiveEquities(req.params.indexSymbol))
    } catch (error: any) {
        res.status(500).json({error: error.message})
    }
})

/**
 * @openapi
 * /api/ai/trading:
 *   post:
 *     description: To get AI response related to trading
 *     tags:
 *       - AI
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               query:
 *                 type: string
 *                 description: Query to ask AI
 *                 required: true
 *                 example: "What is the current market sentiment?"
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Returns a AI response
 *       401:
 *         description: Returns a JSON error object of API call when API key is invalid
 *       500:
 *         description: Returns a JSON error object of API call
 */
mainRouter.post('/api/ai/trading', async (req, res) => {
    try {
        if(req.body.query === undefined) {
            res.status(400).json('Missing argument "query". Please pass that argumet.')
            return
        }
        const messages: Message[] = []
        const usage: UsageInfo[] = []
        appendMessage(messages, 'You are a trading advisor.', 'system')
        appendMessage(messages, req.body.query, 'user')
        const result = await runConversation(messages,toolsData, usage)
        res.json({
            result,
            usage: getUsageCost(usage)
        })
    } catch (error: any) {
        if(error.status) {
            res.status(error.status).json(error)
            return
        }
        res.status(500).json(error)
    }
})

/**
 * @openapi
 * /api/ai/general:
 *   post:
 *     description: To get AI response
 *     tags:
 *       - AI
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               query:
 *                 type: string
 *                 description: Query to ask AI
 *                 required: true
 *                 example: "What you can do?"
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Returns a AI response
 *       401:
 *         description: Returns a JSON error object of API call when API key is invalid
 *       500:
 *         description: Returns a JSON error object of API call
 */
mainRouter.post('/api/ai/general', async (req, res) => {
    try {
        if(req.body.query === undefined) {
            res.status(400).json('Missing argument "query". Please pass that argumet.')
            return
        }
        const messages: Message[] = []
        const usage: UsageInfo[] = []
        appendMessage(messages, 'You are a AI assistant.', 'system')
        appendMessage(messages, req.body.query, 'user')
        const result = await runConversation(messages, undefined, usage)
        res.json({
            result,
            usage: getUsageCost(usage)
        })
    } catch (error: any) {
        if(error.status) {
            res.status(error.status).json(error)
            return
        }
        res.status(500).json(error)
    }
})

export { mainRouter }
