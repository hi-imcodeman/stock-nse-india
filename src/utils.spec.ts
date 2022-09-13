import { getDataSchema } from './utils'
describe('Utils', () => {
    test('getDataSchema for date value having typeStrict:false',()=>{
        const data={
            date: new Date('2022-09-12')
        }
        expect(getDataSchema(data,false)).toMatchSnapshot()
    })
})