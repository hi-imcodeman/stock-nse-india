import NseIndia, { ApiList } from "./index";

jest.setTimeout(999999)

const sleep = (ms: number) => {
    return new Promise<void>(resolve => {
        setTimeout(() => {
            resolve()
        }, ms)
    })
}

describe('class: NseIndia', () => {
    const nseIndia = new NseIndia()
    test('getAllStockSymbols', async () => {
        const symbols = await nseIndia.getAllStockSymbols()
        expect(symbols.length).toBeGreaterThan(1000)
    })

    Object.values(ApiList).forEach(apiEndpoint => {
        test(`should return content for ${apiEndpoint}`, async () => {
            const data = await nseIndia.getDataByEndpoint(apiEndpoint)
            const contentLength = JSON.stringify(data).length
            expect(contentLength).not.toBe(0)
        })
    })
})