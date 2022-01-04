import express from 'express'
import { NseIndia, ApiList } from './index'

const app = express()
const port = process.env.PORT || 3000
const nseIndia = new NseIndia()

app.get('/', async (_req, res) => {
    try {
        const marketStatus = await nseIndia.getDataByEndpoint(ApiList.MARKET_STATUS)
        res.json(marketStatus)
    } catch (error:any) {
        res.json({
            axiosError:error
        })
    }
})

app.listen(port, () => {
    console.log(`NseIndia App started in port ${port}`);
})
