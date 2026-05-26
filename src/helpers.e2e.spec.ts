import {
    getGainersAndLosersByIndex,
    getMostActiveEquities
} from './helpers'

describe('Helpers (live NSE e2e)', () => {
    test('getGainersAndLosersByIndex', async () => {
        const data = await getGainersAndLosersByIndex("NIFTY 50")
        // expect(getDataSchema(data, IS_TYPE_STRICT)).toMatchSnapshot(API_RESPONSE_VALIDATION)
        const isLosers = data.losers.every((equityDetails) => equityDetails.pChange <= 0)
        const isGainers = data.gainers.every((equityDetails) => equityDetails.pChange > 0)
        expect(isLosers).toBeTruthy()
        expect(isGainers).toBeTruthy()
    })

    test('getMostActiveEquities', async () => {
        const data = await getMostActiveEquities("NIFTY 50")
        // expect(getDataSchema(data, IS_TYPE_STRICT)).toMatchSnapshot(API_RESPONSE_VALIDATION)
        expect(Array.isArray(data.byVolume)).toBeTruthy()
        expect(Array.isArray(data.byValue)).toBeTruthy()
        if (data.byVolume.length > 1) {
            expect(data.byVolume[0].totalTradedVolume >= data.byVolume[1].totalTradedVolume).toBeTruthy()
        }
        if (data.byValue.length > 1) {
            expect(data.byValue[0].totalTradedValue >= data.byValue[1].totalTradedValue).toBeTruthy()
        }
    })
})
