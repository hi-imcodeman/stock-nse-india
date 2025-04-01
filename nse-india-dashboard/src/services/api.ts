import axios from 'axios';
import { MarketStatus, IndexDetails, AllIndicesData, IndexEquityInfo } from '../../../src/interface';

const BASE_URL = 'http://localhost:3000/api';

export interface MarketState {
  market: string;
  marketStatus: string;
  tradeDate: string;
  index: string;
  last: number;
  variation: number;
  percentChange: number;
  marketStatusMessage: string;
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

const api = {
  // Market Status
  getMarketStatus: async (): Promise<MarketStatus> => {
    const response = await axios.get(`${BASE_URL}/marketStatus`);
    const data = response.data;
    
    // Transform the response to match our interface
    return {
      marketState: Array.isArray(data.marketState) ? data.marketState.map((state: Partial<MarketState>) => ({
        market: state.market || '',
        marketStatus: state.marketStatus || '',
        tradeDate: state.tradeDate || '',
        index: state.index || '',
        last: Number(state.last) || 0,
        variation: Number(state.variation) || 0,
        percentChange: Number(state.percentChange) || 0,
        marketStatusMessage: state.marketStatusMessage || ''
      })) : [],
      marketcap: {
        timeStamp: data.marketcap?.timeStamp || '',
        marketCapinTRDollars: Number(data.marketcap?.marketCapinTRDollars) || 0,
        marketCapinLACCRRupees: Number(data.marketcap?.marketCapinLACCRRupees) || 0,
        marketCapinCRRupees: Number(data.marketcap?.marketCapinCRRupees) || 0,
        marketCapinCRRupeesFormatted: data.marketcap?.marketCapinCRRupeesFormatted || '',
        marketCapinLACCRRupeesFormatted: data.marketcap?.marketCapinLACCRRupeesFormatted || '',
        underlying: data.marketcap?.underlying || ''
      },
      indicativenifty50: {
        last: Number(data.indicativenifty50?.last) || 0,
        change: Number(data.indicativenifty50?.change) || 0,
        pChange: Number(data.indicativenifty50?.pChange) || 0
      },
      giftnifty: {
        last: Number(data.giftnifty?.last) || 0,
        change: Number(data.giftnifty?.change) || 0,
        pChange: Number(data.giftnifty?.pChange) || 0
      }
    };
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

  getIndexHistorical: async (indexSymbol: string, startDate: string, endDate: string): Promise<IndexHistoricalData> => {
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
    const response = await axios.get(`${BASE_URL}/allIndices`);
    const data = response.data as AllIndicesData;
    // Transform the response to match our interface
    const indices = data.data || [];
    return indices.map((index) => ({
      indexSymbol: index.indexSymbol || '',
      indexName: index.index || '',
      open: index.open || 0,
      high: index.high || 0,
      low: index.low || 0,
      close: index.last || 0,
      change: index.variation || 0,
      changePercent: index.percentChange || 0
    }));
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