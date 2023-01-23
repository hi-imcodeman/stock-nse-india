import { ApiList, NseIndia } from './index'

const nseIndia = new NseIndia()

interface StringArrayFilter {
    startsWith?: string
    regex?: string
    in?: string[]
    nin?: string[]
    eq?: string
    neq?: string
    offset?: number
    limit?: number
}

function stringArrayFilter(input: string[], filter: StringArrayFilter) {
    let data = [...input]
    const { offset, limit, eq, neq, in: inside, nin, startsWith, regex } = filter
    if (startsWith) {
        data = data.filter(item => item.startsWith(startsWith))
    }
    if (regex) {
        const re = new RegExp(regex)
        data = data.filter(item => re.test(item))
    }
    if (inside?.length) {
        data = data.filter(item => inside.includes(item))
    }
    if (nin?.length) {
        data = data.filter(item => !nin.includes(item))
    }
    if (eq) {
        data = data.filter(item => item === eq)
    }
    if (neq) {
        data = data.filter(item => item !== neq)
    }
    if (offset !== undefined) {
        data = data.filter((_, index) => index > offset)
    }
    if (limit !== undefined) {
        data = data.filter((_, index) => index < limit)
    }
    return data
}

function objectArrayFilter(input: any, filterBy: string, filter: StringArrayFilter) {
    const { regex } = filter
    let data = [...input]
    if (regex) {
        const re = new RegExp(regex)
        data = data.filter((item: { [x: string]: string }) => re.test(item[filterBy]))
    }
    return data
}

export default {
    Query: {
        equities: async (_parent: any, { symbolFilter }: { symbolFilter: StringArrayFilter }) => {
            const results = await nseIndia.getAllStockSymbols()
            return stringArrayFilter(results, symbolFilter)
        },
        indices: async (_parent: any, { filter }: { filter: any }) => {
            const indices = await nseIndia.getDataByEndpoint(ApiList.ALL_INDICES)
            if (filter)
                return objectArrayFilter(indices.data, filter.filterBy, filter.criteria)
            return indices.data
        }
    },
    Equity: {
        symbol: (parent: string) => {
            return parent
        },
        details: async (parent: string) => {
            const result = await nseIndia.getEquityDetails(parent)
            return result
        }
    }
}