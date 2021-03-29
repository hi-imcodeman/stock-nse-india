// import { NseIndia } from 'stock-nse-india'

const {
    NseIndia
} = require('../dist/index')

const nse = new NseIndia()

nse.getAllStockSymbols().then(symbols => {
    console.log(symbols);
})