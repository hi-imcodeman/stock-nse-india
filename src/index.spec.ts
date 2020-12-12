import Calculation from './index'
describe('class: Caluculation', () => {
    const calc = new Calculation()
    const a = 10
    test('add()', () => {
        expect(calc.add(a, 20)).toBe(30)
    })
    test('subtract()', () => {
        expect(calc.subtrct(a, 5)).toBe(5)
    })
})