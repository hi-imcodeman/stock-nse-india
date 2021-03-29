[![NPM](https://nodei.co/npm/stock-nse-india.png)](https://nodei.co/npm/stock-nse-india/)

# National Stock Exchange - India (Unofficial) 
![](https://github.com/hi-imcodeman/stock-nse-india/workflows/CI/badge.svg)

This package will help us to get equity details and historical data from National Stock Exchange of India.

Please refer [API Documentation](https://hi-imcodeman.github.io/stock-nse-india) here.

See the [Examples](https://github.com/hi-imcodeman/stock-nse-india/tree/master/examples) here

## Installation

Install using 'npm'

```sh
npm i stock-nse-india
```

Install using 'yarn'

```sh
yarn add stock-nse-india
```

## Usage
```javascript
import { NseIndia } from "stock-nse-india";

const nseIndia = new NseIndia()

// To get all symbols from NSE
nseIndia.getAllStockSymbols().then(symbols => {
    console.log(symbols)
})

// To get equity details for specific symbol
nseIndia.getEquityDetails('IRCTC').then(details => {
    console.log(details)
})
```