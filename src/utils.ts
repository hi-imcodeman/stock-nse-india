import * as Moment from 'moment';
import { extendMoment } from 'moment-range';

const moment = extendMoment(Moment);
/**
 * @private
 */
export const getDateRangeChunks = (startDate: Date, endDate: Date, chunkInDays: number) => {
    const range = moment.range(startDate, endDate)
    const chunks = Array.from(range.by('days', { step: chunkInDays }))
    const dateRanges = []
    for (let i = 0; i < chunks.length; i++) {
        dateRanges.push({
            start: i > 0 ? chunks[i].add(1, 'day').format('DD-MM-YYYY') : chunks[i].format('DD-MM-YYYY'),
            end: chunks[i + 1] ? chunks[i + 1].format('DD-MM-YYYY') : range.end.format('DD-MM-YYYY')
        })
    }
    return dateRanges
}
/**
 * 
 * @private
 */
export const sleep = (ms: number) => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve('')
        }, ms)
    })
}

export const getObjectKeysDeep = (obj: any): any[] | string => {
    if (typeof obj !== 'object')
        return `${typeof obj}`

    return Object.entries(obj).map(([key, value]) => {
        if (value === null)
            return `${key}: null`

        if (Moment.isDate(value))
            return `${key}: Date`

        if (typeof value !== 'string' && Array.isArray(value)) {
            return {
                [`${key}`]: value.length ? getObjectKeysDeep(value[0]) : []
            }
        }

        if (typeof value === 'object') {
            return {
                [`${key}`]: getObjectKeysDeep(value)
            }
        }

        return `${key}: ${typeof value}`
    })
}

// const getStatergyDate = (date: Date) => {
//     const mnt = moment.default
//     const tMinus1 = mnt(date).subtract(2, 'months').endOf('month').format('YYYY-MM-DD')
//     const tMinus12 = mnt(date).subtract(12, 'months').startOf('month').format('YYYY-MM-DD')
//     return {
//         tMinus1,
//         tMinus12
//     }
// }
// export const momentumStatergy = async (indexSymbol: string, startDate: Date) => {
//     const mnt = moment.default
//     const nseIndia = new NseIndia()
//     console.log('Index Symbol:', indexSymbol);
//     console.log('StartDate:', startDate);
//     const indexEquities = (await nseIndia.getEquityStockIndices(indexSymbol)).data
//         .map(item => item.symbol)
//         .filter(symbol => symbol !== indexSymbol)
//     console.log(indexEquities);

//     // do {
//     //     startDate=mnt(startDate).add(1,'month').toDate()

//     // } while (startDate<new Date());
// }
