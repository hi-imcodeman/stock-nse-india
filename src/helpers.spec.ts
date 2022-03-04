import {
    getGainersAndLosersByIndex,
    getMostActiveEquities
} from './helpers'
import { IndexEquityInfo } from './interface'

jest.setTimeout(999999)

describe('Helpers', () => {
    test('getGainersAndLosersByIndex', async () => {
        const data = await getGainersAndLosersByIndex("NIFTY 50")
        const isLosers = data.loosers.every((equityDetails:IndexEquityInfo) => equityDetails.pChange <= 0)
        const isGainers = data.gainers.every((equityDetails:IndexEquityInfo) => equityDetails.pChange > 0)
        expect(isLosers).toBeTruthy()
        expect(isGainers).toBeTruthy()
        const equityGainersLoosers = await getGainersAndLosersByIndex("all")
        expect(equityGainersLoosers.gainers.length).toBe(20)
        expect(equityGainersLoosers.loosers.length).toBe(20)

    })

    test('getMostActiveEquities', async () => {
        const data = await getMostActiveEquities("NIFTY 50")
        expect(data.byVolume[0] >= data.byVolume[1]).toBeTruthy()
        expect(data.byValue[0] >= data.byValue[1]).toBeTruthy()
    })
})
