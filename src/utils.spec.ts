import { getDataSchema } from './utils'
describe('Utils', () => {
    test('getDataSchema with type strict',()=>{
        const data={
            a:1,
            b: 'b',
            c: [1,2,3],
            d: {a:1,b:[2,3,4],c:{d:1}},
            e: new Date('2022-09-12')
        }
        expect(getDataSchema(data)).toMatchSnapshot()
        expect(getDataSchema(['hi'])).toMatchSnapshot('array_validation')
    })
    test('getDataSchema for date value having typeStrict:false',()=>{
        const data={
            date: new Date('2022-09-12')
        }
        expect(getDataSchema(data,false)).toMatchSnapshot()
    })
})