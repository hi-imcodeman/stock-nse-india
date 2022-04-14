
[![NPM](https://nodei.co/npm/stock-nse-india.png)](https://nodei.co/npm/stock-nse-india/)

# National Stock Exchange - India (Unofficial)

![](https://github.com/hi-imcodeman/stock-nse-india/workflows/CI/badge.svg)

This package will help us to get equity/index details and historical data from National Stock Exchange of India.

Please refer [Documentation](https://hi-imcodeman.github.io/stock-nse-india) here.

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

## Run locally

Clone the repo locally using below command

```sh

git clone https://github.com/hi-imcodeman/stock-nse-india.git

```

Goto 'stock-nse-india' folder

```sh

cd stock-nse-india

```

Then install packages using 'npm' or 'yarn'

```sh

npm install

```

or

```sh

yarn

```

Start the application using 'npm' or 'yarn'

```sh

npm start

```

or

```sh

yarn start

```

**Then open the URL http://localhost:3000 in browser.**

For API service documentation please hit http://localhoast:3000/api-docs

## Usage

```javascript
import { NseIndia } from  "stock-nse-india";
const  nseIndia = new  NseIndia()
// To get all symbols from NSE
nseIndia.getAllStockSymbols().then(symbols  => {
console.log(symbols)
})

// To get equity details for specific symbol
nseIndia.getEquityDetails('IRCTC').then(details  => {
console.log(details)
})
```

## API Methods

### Common Methods
[getAllStockSymbols](https://hi-imcodeman.github.io/stock-nse-india/classes/index.nseindia.html#getallstocksymbols)
[getData](https://hi-imcodeman.github.io/stock-nse-india/classes/index.nseindia.html#getdata)
[getDataByEndpoint](https://hi-imcodeman.github.io/stock-nse-india/classes/index.nseindia.html#getdatabyendpoint) - Get data by NSE API endpoints. [API Endpoints list](https://hi-imcodeman.github.io/stock-nse-india/enums/index.apilist.html)

### Equity Methods
[getEquityCorporateInfo](https://hi-imcodeman.github.io/stock-nse-india/classes/index.nseindia.html#getequitycorporateinfo)
[getEquityDetails](https://hi-imcodeman.github.io/stock-nse-india/classes/index.nseindia.html#getequitydetails)
[getEquityHistoricalData](https://hi-imcodeman.github.io/stock-nse-india/classes/index.nseindia.html#getequityhistoricaldata)
[getEquityIntradayData](https://hi-imcodeman.github.io/stock-nse-india/classes/index.nseindia.html#getequityintradaydata)
[getEquitySeries](https://hi-imcodeman.github.io/stock-nse-india/classes/index.nseindia.html#getequityseries)
[getEquityTradeInfo](https://hi-imcodeman.github.io/stock-nse-india/classes/index.nseindia.html#getequitytradeinfo)

### Index Methods
[getEquityStockIndices](https://hi-imcodeman.github.io/stock-nse-india/classes/index.nseindia.html#getequitystockindices)
[getIndexIntradayData](https://hi-imcodeman.github.io/stock-nse-india/classes/index.nseindia.html#getindexintradaydata)
[getIndexHistoricalData](https://hi-imcodeman.github.io/stock-nse-india/classes/index.nseindia.html#getindexhistoricaldata)

### Helper Methods
[getGainersAndLosersByIndex](https://hi-imcodeman.github.io/stock-nse-india/modules/helpers.html#getgainersandlosersbyindex)
[getMostActiveEquities](https://hi-imcodeman.github.io/stock-nse-india/modules/helpers.html#getmostactiveequities)

## CLI

We can use this package in CLI.

Install for CLI

```sh

npm i -g stock-nse-india

```

### CLI Usage

To get CLI help

```sh

nseindia --help

```

To get market status

```sh

nseindia

```

To get the current equity details of the NSE symbol

```sh

nseindia equity IRCTC

```

To get the historical details of the NSE symbol

```sh

nseindia historical IRCTC

```

To get the details of the indices

```sh

nseindia index

```

To get the details of the specific index

```sh

nseindia index "NIFTY AUTO"

```

## Docker

### Build & Run in local

Build and run the docker instance in local machine.

```sh

docker build -t nseindia . && docker run --rm -d -p 3001:3001 nseindia:latest

```

### Start a instance

```sh

docker run --rm -d -p 3001:3001 imcodeman/nseindia

```

### Test the instance

Open the browser and hit http://localhoast:3001

For API service documentation please hit http://localhoast:3001/api-docs

### Docker Hub link

https://hub.docker.com/r/imcodeman/nseindia

## Demo

Please the use below links for the demo.

**Demo URL:** https://stock-nse-india.herokuapp.com/

**API Docs URL:** https://stock-nse-india.herokuapp.com/api-docs

## Testing

Run the below command for testing and coverage.

```sh

yarn test

```
