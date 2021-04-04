#!/usr/bin/env node

import {
    showEquityDetails,
    showHistorical,
    showMarketStatus,
    showIndexDetails,
    showIndexOverview
} from './api'
import yargs from 'yargs'

const _argv = yargs
    .command('$0', 'the default command', {}, showMarketStatus)
    .command('equity <symbol>', 'Get details of the symbol', (yargsBuilder: any) => {
        yargsBuilder.positional('symbol', {
            type: 'string',
            demandOption: true,
            describe: 'Symbol of NSE equities.'
        })
    }, showEquityDetails)
    .command('historical <symbol>', 'Get historical chart of the symbol', (yargsBuilder: any) => {
        yargsBuilder.positional('symbol', {
            type: 'string',
            demandOption: true,
            describe: 'Symbol of NSE equities.'
        })
    }, showHistorical)
    .command('index [indexSymbol]', 'Get details of the index.', (yargsBuilder: any) => {
        yargsBuilder.positional('indexSymbol', {
            type: 'string',
            demandOption: true,
            describe: 'Symbol of NSE Indices.'
        })
    }, (argv: any) => {
        const { indexSymbol: index } = argv
        if (index)
            showIndexDetails(argv)
        else
            showIndexOverview()
    })
    .argv
