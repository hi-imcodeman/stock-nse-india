import { getDataSchema, getDateRangeChunks, sleep } from './utils'
describe('Utils', () => {
    const data={
        a: 1,
        b: 'b',
        c: [1,2,3],
        d: {a:1,b:[2,3,4],c:{d:1},e:[]},
        e: new Date('2022-09-12'),
        f: [[1,2],[3,4]]
    }
    test('getDataSchema with type strict',()=>{
        expect(getDataSchema(data)).toMatchSnapshot()
        expect(getDataSchema(['hi'])).toMatchSnapshot('array_validation')
    })
    test('getDataSchema for date value having typeStrict:false',()=>{
        expect(getDataSchema(data,false)).toMatchSnapshot()
        expect(getDataSchema(['hi'],false)).toMatchSnapshot('array_validation')
    })

    test('getDataSchema handles primitives and empty arrays', () => {
        expect(getDataSchema('text')).toBe('string')
        expect(getDataSchema('text', false)).toBe('any')
        expect(getDataSchema([])).toBe('undefined[]')
    })

    test('getDateRangeChunks splits ranges into formatted chunks', () => {
        const chunks = getDateRangeChunks(
            new Date('2021-03-01'),
            new Date('2021-03-20'),
            5
        )
        expect(chunks.length).toBeGreaterThan(0)
        expect(chunks[0].start).toMatch(/^\d{2}-\d{2}-\d{4}$/)
        expect(chunks[chunks.length - 1].end).toBe('20-03-2021')
    })

    test('sleep resolves after delay', async () => {
        jest.useFakeTimers()
        const promise = sleep(100)
        jest.advanceTimersByTime(100)
        await expect(promise).resolves.toBeUndefined()
        jest.useRealTimers()
    })
})
