#!/usr/bin/env node

import { showEquityDetails, showHistorical } from './api'
import yargs from 'yargs'

const _argv = yargs
    .command('$0', 'the default command', {}, () => {
        console.log('Default Command');
    })
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
    .argv
    