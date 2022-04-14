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
