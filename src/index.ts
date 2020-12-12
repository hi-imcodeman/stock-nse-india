import { EventEmitter } from 'events'
export default class Calculation extends EventEmitter {
    add(a: number, b: number): number {
        this.emit('done', 'addition')
        return a + b
    }
    subtrct(a: number, b: number): number {
        this.emit('done', 'subtraction')
        return a - b
    }
}