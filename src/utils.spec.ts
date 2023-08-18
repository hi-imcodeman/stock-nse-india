import { getDataSchema } from './utils'
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
})
