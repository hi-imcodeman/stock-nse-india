import {
    getGainersAndLosersByIndex,
    getMostActiveEquities
} from './helpers'
import { getDataSchema } from './utils'
import { API_RESPONSE_VALIDATION, IS_TYPE_STRICT } from './constants'

describe('Helpers', () => {
    test('getGainersAndLosersByIndex', async () => {
        const data = await getGainersAndLosersByIndex("NIFTY 50")
        expect(getDataSchema(data, IS_TYPE_STRICT)).toMatchSnapshot(API_RESPONSE_VALIDATION)
        const isLosers = data.losers.every((equityDetails) => equityDetails.pChange <= 0)
        const isGainers = data.gainers.every((equityDetails) => equityDetails.pChange > 0)
        expect(isLosers).toBeTruthy()
        expect(isGainers).toBeTruthy()
    })

    test('getMostActiveEquities', async () => {
        const data = await getMostActiveEquities("NIFTY 50")
        expect(getDataSchema(data, IS_TYPE_STRICT)).toMatchSnapshot(API_RESPONSE_VALIDATION)
        expect(data.byVolume[0] >= data.byVolume[1]).toBeTruthy()
        expect(data.byValue[0] >= data.byValue[1]).toBeTruthy()
    })
})
