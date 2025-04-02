import axios from 'axios';
import { MarketStatus, IndexDetails, IndexEquityInfo } from '../../../src/interface';

const BASE_URL = 'http://localhost:3000/api';

export interface MarketState {
  market: string;
  marketStatus: string;
  tradeDate: string;
  index: string;
  last: number | string;
  variation: number | string;
  percentChange: number | string;
  marketStatusMessage: string;
  expiryDate?: string;
  underlying?: string;
  updated_time?: string;
  tradeDateFormatted?: string;
  slickclass?: string;
}

export interface EquityDetails {
  symbol: string;
  companyName: string;
  industry: string;
  series: string;
  isinCode: string;
  faceValue: number;
  marketLot: number;
  issuePrice: number;
  issueDate: string;
  listingDate: string;
}

export interface OptionChain {
  strikePrice: number;
  expiryDate: string;
  calls: Option[];
  puts: Option[];
}

export interface Option {
  strikePrice: number;
  expiryDate: string;
  optionType: string;
  openInterest: number;
  changeInOpenInterest: number;
  impliedVolatility: number;
  lastPrice: number;
  change: number;
  bidPrice: number;
  bidQty: number;
  askPrice: number;
  askQty: number;
}

export interface IntradayData {
  identifier: string;
  name: string;
  graphData: [number, number];
  closePrice: number;
}

export interface EquityHistoricalData {
  data: {
    CH_SYMBOL: string;
    CH_SERIES: string;
    CH_MARKET_TYPE: string;
    CH_TRADE_HIGH_PRICE: number;
    CH_TRADE_LOW_PRICE: number;
    CH_OPENING_PRICE: number;
    CH_CLOSING_PRICE: number;
    CH_LAST_TRADED_PRICE: number;
    CH_PREVIOUS_CLS_PRICE: number;
    CH_TOT_TRADED_QTY: number;
    CH_TOT_TRADED_VAL: number;
    CH_52WEEK_HIGH_PRICE: number;
    CH_52WEEK_LOW_PRICE: number;
    CH_TOTAL_TRADES: number | null;
    CH_ISIN: string;
    CH_TIMESTAMP: string;
    TIMESTAMP: string;
    VWAP: number;
  }[];
  meta: {
    series: string[];
    fromDate: string;
    toDate: string;
    symbols: string[];
  };
}

export interface IndexHistoricalData {
  data: {
    indexCloseOnlineRecords: {
      EOD_CLOSE_INDEX_VAL: number;
      EOD_HIGH_INDEX_VAL: number;
      EOD_INDEX_NAME: string;
      EOD_LOW_INDEX_VAL: number;
      EOD_OPEN_INDEX_VAL: number;
      EOD_TIMESTAMP: string;
      TIMESTAMP: string;
    }[];
    indexTurnoverRecords: {
      HIT_INDEX_NAME_UPPER: string;
      HIT_TIMESTAMP: string;
      HIT_TRADED_QTY: number;
      HIT_TURN_OVER: number;
      TIMESTAMP: string;
    }[];
  };
}

interface GainersAndLosers {
  gainers: IndexEquityInfo[];
  losers: IndexEquityInfo[];
}

interface MostActive {
  byVolume: IndexEquityInfo[];
  byValue: IndexEquityInfo[];
}

interface NSEIndexData {
  indexSymbol: string;
  index: string;
  last: string;
  variation: string;
  percentChange: string;
  open: string;
  high: string;
  low: string;
  previousClose: string;
  yearHigh: string;
  yearLow: string;
  pe: string;
  pb: string;
  dy: string;
  declines: string;
  advances: string;
  unchanged: string;
  timeVal: string;
  totalTradedVolume: string;
  totalTradedValue: string;
  ffmc_sum: string;
  market: string;
  marketStatus: string;
  tradeDate: string;
  marketStatusMessage: string;
}

const api = {
  // Market Status
  getMarketStatus: async (): Promise<MarketStatus> => {
    const response = await axios.get(`${BASE_URL}/marketStatus`);
    return response.data;
  },

  // Equity
  getEquityDetails: async (symbol: string): Promise<EquityDetails> => {
    const response = await axios.get(`${BASE_URL}/equity/${symbol}`);
    return response.data;
  },

  getEquityIntraday: async (symbol: string, preOpen: boolean = false): Promise<IntradayData> => {
    const response = await axios.get(`${BASE_URL}/equity/intraday/${symbol}`, {
      params: { preOpen }
    });
    return response.data;
  },

  getEquityHistorical: async (symbol: string, startDate?: string, endDate?: string): Promise<EquityHistoricalData> => {
    const response = await axios.get(`${BASE_URL}/equity/historical/${symbol}`, {
      params: { dateStart: startDate, dateEnd: endDate }
    });
    return response.data;
  },

  // Index
  getIndexDetails: async (indexSymbol: string): Promise<IndexDetails> => {
    const response = await axios.get(`${BASE_URL}/index/${indexSymbol}`);
    return response.data;
  },

  getIndexIntraday: async (indexSymbol: string, preOpen: boolean = false): Promise<IntradayData> => {
    const response = await axios.get(`${BASE_URL}/index/intraday/${indexSymbol}`, {
      params: { preOpen }
    });
    return response.data;
  },

  getIndexHistorical: async (indexSymbol: string, startDate: string, endDate: string): Promise<IndexHistoricalData[]> => {
    const response = await axios.get(`${BASE_URL}/index/historical/${indexSymbol}`, {
      params: { dateStart: startDate, dateEnd: endDate }
    });
    return response.data;
  },

  // Options
  getEquityOptions: async (symbol: string): Promise<OptionChain[]> => {
    const response = await axios.get(`${BASE_URL}/equity/options/${symbol}`);
    return response.data;
  },

  getIndexOptions: async (indexSymbol: string): Promise<OptionChain[]> => {
    const response = await axios.get(`${BASE_URL}/index/options/${indexSymbol}`);
    return response.data;
  },

  // Market Overview
  getAllIndices: async (): Promise<IndexDetails[]> => {
    try {
      console.log('Fetching indices from API');
      const response = await axios.get(`${BASE_URL}/allIndices`);
      const data = response.data;
      
      console.log('Raw API response:', data);
      
      if (!data || !data.data || !Array.isArray(data.data)) {
        console.error('Invalid data format received from API');
        return [];
      }
      
      const transformedData = data.data.map((index: NSEIndexData) => ({
        name: index.indexSymbol,
        advance: {
          advances: index.advances,
          declines: index.declines,
          unchanged: index.unchanged
        },
        timestamp: new Date().toISOString(),
        data: [],
        metadata: {
          indexName: index.index,
          open: Number(index.open) || 0,
          high: Number(index.high) || 0,
          low: Number(index.low) || 0,
          previousClose: Number(index.previousClose) || 0,
          last: Number(index.last) || 0,
          change: Number(index.variation) || 0,
          percChange: Number(index.percentChange) || 0,
          timeVal: index.timeVal || '',
          yearHigh: Number(index.yearHigh) || 0,
          yearLow: Number(index.yearLow) || 0,
          totalTradedVolume: Number(index.totalTradedVolume) || 0,
          totalTradedValue: Number(index.totalTradedValue) || 0,
          ffmc_sum: Number(index.ffmc_sum) || 0
        },
        marketStatus: {
          market: index.market || '',
          marketStatus: index.marketStatus || '',
          tradeDate: index.tradeDate || '',
          index: index.index || '',
          last: Number(index.last) || 0,
          variation: Number(index.variation) || 0,
          percentChange: Number(index.percentChange) || 0,
          marketStatusMessage: index.marketStatusMessage || ''
        },
        date30dAgo: '',
        date365dAgo: ''
      }));

      console.log('Transformed indices data:', transformedData);
      return transformedData;
    } catch (error) {
      console.error('Error in getAllIndices:', error);
      throw error;
    }
  },

  getGainersAndLosers: async (indexSymbol: string): Promise<GainersAndLosers> => {
    const response = await axios.get(`${BASE_URL}/gainersAndLosers/${indexSymbol}`);
    return response.data;
  },

  getMostActive: async (indexSymbol: string): Promise<MostActive> => {
    const response = await axios.get(`${BASE_URL}/mostActive/${indexSymbol}`);
    return response.data;
  }
};

export default api; 