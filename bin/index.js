#!/usr/bin/env node

const {
    showEquityDetails,
    showHistorical
} = require('./api')


const _argv = require('yargs')
    .command('equity <symbol>', 'Get details of the symbol', (yargs) => {
        yargs.positional('symbol', {
            type: 'string',
            demandOption: true,
            describe: 'Symbol of NSE equities.'
        })
    }, showEquityDetails)
    .command('historical <symbol>', 'Get historical chart of the symbol', (yargs) => {
        yargs.positional('symbol', {
            type: 'string',
            demandOption: true,
            describe: 'Symbol of NSE equities.'
        })
    }, showHistorical)
    .check((argv) => {
        const [command] = argv._
        if (command === 'equity' && !argv.symbol) {
            throw 'Please provide symbol.'
        }
        return true
    })
    .help()
    .argv