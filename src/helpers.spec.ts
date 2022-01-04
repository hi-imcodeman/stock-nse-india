import {
    getGainersAndLosersByIndex,
    getMostActiveEquities
} from './helpers'

jest.setTimeout(999999)

describe('Helpers', () => {
    test('getGainersAndLosersByIndex', async () => {
        const data = await getGainersAndLosersByIndex("NIFTY 50")
        const isLosers = data.losers.every((equityDetails) => equityDetails.pChange <= 0)
        const isGainers = data.gainers.every((equityDetails) => equityDetails.pChange > 0)
        expect(isLosers).toBeTruthy()
        expect(isGainers).toBeTruthy()
    })

    test('getMostActiveEquities', async () => {
        const data = await getMostActiveEquities("NIFTY 50")
        expect(data.byVolume[0] >= data.byVolume[1]).toBeTruthy()
        expect(data.byValue[0] >= data.byValue[1]).toBeTruthy()
    })
})
