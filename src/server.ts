import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerJsDoc from "swagger-jsdoc";
import { swaggerDocOptions } from "./swaggerDocOptions";
import { NseIndia, ApiList } from "./index";
import { getGainersAndLosersByIndex, getMostActiveEquities } from "./helpers";
import cors from "cors";
const app = express();
app.use(cors());
const port = process.env.PORT || 3000;
const hostUrl = process.env.HOST_URL || `http://localhost:${port}`;
const nseIndia = new NseIndia();

const openapiSpecification = swaggerJsDoc(swaggerDocOptions);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openapiSpecification));

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
app.get("/", async (_req, res) => {
  try {
    res.json(await nseIndia.getDataByEndpoint(ApiList.MARKET_STATUS));
  } catch (error) {
    res.status(400).json(error);
  }
});

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
app.get("/api/v1/swagger.json", (_req, res) => {
  res.json(openapiSpecification);
});

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
app.get("/api/glossary", async (_req, res) => {
  try {
    res.json(await nseIndia.getDataByEndpoint(ApiList.GLOSSARY));
  } catch (error) {
    res.status(400).json(error);
  }
});

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
app.get("/api/marketStatus", async (_req, res) => {
  try {
    res.json(await nseIndia.getDataByEndpoint(ApiList.MARKET_STATUS));
  } catch (error) {
    res.status(400).json(error);
  }
});

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
app.get("/api/marketTurnover", async (_req, res) => {
  try {
    res.json(await nseIndia.getDataByEndpoint(ApiList.MARKET_TURNOVER));
  } catch (error) {
    res.status(400).json(error);
  }
});

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
app.get("/api/equityMaster", async (_req, res) => {
  try {
    res.json(await nseIndia.getDataByEndpoint(ApiList.EQUITY_MASTER));
  } catch (error) {
    res.status(400).json(error);
  }
});

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
app.get("/api/holidays", async (req, res) => {
  try {
    const { type } = req.query;
    if (type === "clearing") {
      res.json(await nseIndia.getDataByEndpoint(ApiList.HOLIDAY_CLEARING));
    } else {
      res.json(await nseIndia.getDataByEndpoint(ApiList.HOLIDAY_TRADING));
    }
  } catch (error) {
    res.status(400).json(error);
  }
});

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
app.get("/api/circulars", async (req, res) => {
  try {
    const { isLatest } = req.query;
    if (isLatest === "true") {
      res.json(await nseIndia.getDataByEndpoint(ApiList.LATEST_CIRCULARS));
    } else {
      res.json(await nseIndia.getDataByEndpoint(ApiList.CIRCULARS));
    }
  } catch (error) {
    res.status(400).json(error);
  }
});

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
app.get("/api/mergedDailyReports", async (req, res) => {
  try {
    const { key } = req.query;
    if (key === "debt") {
      res.json(
        await nseIndia.getDataByEndpoint(ApiList.MERGED_DAILY_REPORTS_DEBT)
      );
    } else if (key === "derivatives") {
      res.json(
        await nseIndia.getDataByEndpoint(
          ApiList.MERGED_DAILY_REPORTS_DERIVATIVES
        )
      );
    } else {
      res.json(
        await nseIndia.getDataByEndpoint(ApiList.MERGED_DAILY_REPORTS_CAPITAL)
      );
    }
  } catch (error) {
    res.status(400).json(error);
  }
});

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
app.get("/api/allIndices", async (_req, res) => {
  try {
    const allIndices = await nseIndia.getDataByEndpoint(ApiList.ALL_INDICES);
    res.json(allIndices);
  } catch (error) {
    res.status(400).json(error);
  }
});

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
app.get("/api/indexNames", async (_req, res) => {
  try {
    const indexNames = await nseIndia.getDataByEndpoint(ApiList.INDEX_NAMES);
    res.json(indexNames);
  } catch (error) {
    res.status(400).json(error);
  }
});

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
app.get("/api/allSymbols", async (_req, res) => {
  try {
    const symbols = await nseIndia.getAllStockSymbols();
    res.json(symbols);
  } catch (error) {
    res.status(400).json(error);
  }
});

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
app.get("/api/equity/:symbol", async (req, res) => {
  try {
    res.json(await nseIndia.getEquityDetails(req.params.symbol));
  } catch (error) {
    res.status(400).json(error);
  }
});

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
app.get("/api/equity/series/:symbol", async (req, res) => {
  try {
    res.json(await nseIndia.getEquitySeries(req.params.symbol));
  } catch (error) {
    res.status(400).json(error);
  }
});

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
app.get("/api/equity/tradeInfo/:symbol", async (req, res) => {
  try {
    res.json(await nseIndia.getEquityTradeInfo(req.params.symbol));
  } catch (error) {
    res.status(400).json(error);
  }
});

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
app.get("/api/equity/corporateInfo/:symbol", async (req, res) => {
  try {
    res.json(await nseIndia.getEquityCorporateInfo(req.params.symbol));
  } catch (error) {
    res.status(400).json(error);
  }
});

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
 *         description: Returns a corporate info of the NSE symbol
 *       400:
 *         description: Returns a JSON error object of API call
 */
app.get("/api/equity/options/:symbol", async (req, res) => {
  try {
    res.json(await nseIndia.getEquityOptionChain(req.params.symbol));
  } catch (error) {
    res.status(400).json(error);
  }
});

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
 *       400:
 *         description: Returns a JSON error object of API call
 */
app.get("/api/equity/intraday/:symbol", async (req, res) => {
  try {
    const isPreOpen = req.query.preOpen as string;
    if (isPreOpen === "true") {
      res.json(await nseIndia.getEquityIntradayData(req.params.symbol, true));
    } else {
      res.json(await nseIndia.getEquityIntradayData(req.params.symbol));
    }
  } catch (error) {
    res.status(400).json(error);
  }
});

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
app.get("/api/equity/historical/:symbol", async (req, res) => {
  try {
    const dateStart = req.query.dateStart as string;
    const dateEnd = req.query.dateEnd as string;
    if (dateStart && dateEnd) {
      const start = new Date(dateStart);
      const end = new Date(dateEnd);
      if (start.getTime() > 0 && end.getTime() > 0) {
        const range = {
          start,
          end,
        };
        res.json(
          await nseIndia.getEquityHistoricalData(req.params.symbol, range)
        );
      } else {
        res.status(400).json({
          error: "Invalid date format. Please use the format (YYYY-MM-DD)",
        });
      }
    } else {
      res.json(await nseIndia.getEquityHistoricalData(req.params.symbol));
    }
  } catch (error) {
    res.status(400).json(error);
  }
});

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
 *         description: Returns Data for OPTION CHAIN
 *       400:
 *         description: Returns a JSON error object of API call
 */
app.get("/api/index/:indexSymbol", async (req, res) => {
  try {
    res.json(await nseIndia.getEquityStockIndices(req.params.indexSymbol));
  } catch (error) {
    res.status(400).json(error);
  }
});

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
 *         description: Returns a intraday trade info of the NSE index symbol
 *       400:
 *         description: Returns a JSON error object of API call
 */

app.get("/api/index/options/:indexSymbol", async (req, res) => {
  try {
    res.json(await nseIndia.getIndexOptionChain(req.params.indexSymbol));
  } catch (error) {
    res.status(400).json(error);
  }
});

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
 *       400:
 *         description: Returns a JSON error object of API call
 */
app.get("/api/index/intraday/:indexSymbol", async (req, res) => {
  try {
    const isPreOpen = req.query.preOpen as string;
    if (isPreOpen === "true") {
      res.json(
        await nseIndia.getIndexIntradayData(req.params.indexSymbol, true)
      );
    } else {
      res.json(await nseIndia.getIndexIntradayData(req.params.indexSymbol));
    }
  } catch (error) {
    res.status(400).json(error);
  }
});

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
 *       400:
 *         description: Returns a JSON error object of API call
 */
app.get("/api/index/historical/:indexSymbol", async (req, res) => {
  try {
    const dateStart = req.query.dateStart as string;
    const dateEnd = req.query.dateEnd as string;
    if (dateStart && dateEnd) {
      const start = new Date(dateStart);
      const end = new Date(dateEnd);
      if (start.getTime() > 0 && end.getTime() > 0) {
        const range = {
          start,
          end,
        };
        res.json(
          await nseIndia.getIndexHistoricalData(req.params.indexSymbol, range)
        );
      } else {
        res.status(400).json({
          error: "Invalid date format. Please use the format (YYYY-MM-DD)",
        });
      }
    } else {
      res.status(400).json({
        error:
          'Missing arguments "dateStart" or "dateEnd". Please pass those argumets.',
      });
    }
  } catch (error) {
    res.status(400).json(error);
  }
});

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
app.get("/api/gainersAndLosers/:indexSymbol", async (req, res) => {
  try {
    res.json(await getGainersAndLosersByIndex(req.params.indexSymbol));
  } catch (error) {
    res.status(400).json(error);
  }
});

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
app.get("/api/mostActive/:indexSymbol", async (req, res) => {
  try {
    res.json(await getMostActiveEquities(req.params.indexSymbol));
  } catch (error) {
    res.status(400).json(error);
  }
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`NseIndia App started in port ${port}`);
  // eslint-disable-next-line no-console
  console.log(`Open ${hostUrl} in browser.`);
  // eslint-disable-next-line no-console
  console.log(`For API docs: ${hostUrl}/api-docs`);
});
