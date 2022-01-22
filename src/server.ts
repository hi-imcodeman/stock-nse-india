import express from 'express'
import swaggerUi from 'swagger-ui-express'
import swaggerJsDoc from 'swagger-jsdoc'
import {swaggerDocOptions} from './swaggerDocOptions'
import { NseIndia, ApiList } from './index'

const app = express()
const port = process.env.PORT || 3000
const nseIndia = new NseIndia()

const openapiSpecification = swaggerJsDoc(swaggerDocOptions);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpecification));

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
app.get('/', async (_req, res) => {
    try {
        const marketStatus = await nseIndia.getDataByEndpoint(ApiList.MARKET_STATUS)
        res.json(marketStatus)
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
 app.get('/api/marketStatus', async (_req, res) => {
    try {
        const marketStatus = await nseIndia.getDataByEndpoint(ApiList.MARKET_STATUS)
        res.json(marketStatus)
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
 *         description: Returns an array of equity symbols
 *       400:
 *         description: Returns a JSON error object of API call
 */
 app.get('/api/allSymbols', async (_req, res) => {
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
 *       - Common
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: symbol
 *         in: path
 *         description: NSE Symbol of the Equity
 *         required: true
 *         schema:
 *           type: string
 *           format: string
 *     responses:
 *       200:
 *         description: Returns a details of NSE symbol
 *       400:
 *         description: Returns a JSON error object of API call
 */
 app.get('/api/equity/:symbol', async (req, res) => {
    try {
        res.json(await nseIndia.getEquityDetails(req.params.symbol))
    } catch (error) {
        res.status(400).json(error)
    }
})

app.listen(port, () => {
    console.log(`NseIndia App started in port ${port}`);
})
