[![NPM](https://nodei.co/npm/stock-nse-india.png)](https://nodei.co/npm/stock-nse-india/)

# National Stock Exchange - India (Unofficial) 
![](https://github.com/hi-imcodeman/stock-nse-india/workflows/CI/badge.svg)

This package will help us to get equity details and historical data from National Stock Exchange of India.

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
## Run
Start the application using 'npm'

```sh
npm start
```

Start the application using 'yarn'

```sh
yarn start
```

**Then open the URL http://localhost:3000 in browser.**
For API service documentation please hit http://localhoast:3000/api-docs

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

**Demo URL:** http://stock-nse-india.herokuapp.com/
**API Docs URL:** http://stock-nse-india.herokuapp.com/api-docs

## Testing

Run the below command for testing and coverage.

```sh
yarn test
```