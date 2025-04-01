import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';

export interface MarketStatus {
  marketState: string;
  marketStatus: string;
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

export interface IndexDetails {
  indexSymbol: string;
  indexName: string;
  open: number;
  high: number;
  low: number;
  close: number;
  change: number;
  changePercent: number;
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

const api = {
  // Market Status
  getMarketStatus: async (): Promise<MarketStatus> => {
    const response = await axios.get(`${BASE_URL}/marketStatus`);
    // Transform the response to match our interface
    const data = response.data;
    // Handle array response and extract first market state
    const marketState = Array.isArray(data) && data.length > 0 ? data[0].marketState || 'Unknown' : 'Unknown';
    const marketStatus = Array.isArray(data) && data.length > 0 ? data[0].marketStatus || 'Unknown' : 'Unknown';
    
    return {
      marketState,
      marketStatus
    };
  },

  // Equity
  getEquityDetails: async (symbol: string): Promise<EquityDetails> => {
    const response = await axios.get(`${BASE_URL}/equity/${symbol}`);
    return response.data;
  },

  getEquityIntraday: async (symbol: string, preOpen: boolean = false): Promise<any> => {
    const response = await axios.get(`${BASE_URL}/equity/intraday/${symbol}`, {
      params: { preOpen }
    });
    return response.data;
  },

  getEquityHistorical: async (symbol: string, startDate?: string, endDate?: string): Promise<any> => {
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

  getIndexIntraday: async (indexSymbol: string, preOpen: boolean = false): Promise<any> => {
    const response = await axios.get(`${BASE_URL}/index/intraday/${indexSymbol}`, {
      params: { preOpen }
    });
    return response.data;
  },

  getIndexHistorical: async (indexSymbol: string, startDate: string, endDate: string): Promise<any> => {
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
    // Transform the response to match our interface
    const indices = response.data.data || [];
    return indices.map((index: any) => ({
      indexSymbol: index.indexSymbol || '',
      indexName: index.indexName || '',
      open: parseFloat(index.open) || 0,
      high: parseFloat(index.high) || 0,
      low: parseFloat(index.low) || 0,
      close: parseFloat(index.close) || 0,
      change: parseFloat(index.change) || 0,
      changePercent: parseFloat(index.changePercent) || 0
    }));
  },

  getGainersAndLosers: async (indexSymbol: string): Promise<any> => {
    const response = await axios.get(`${BASE_URL}/gainersAndLosers/${indexSymbol}`);
    return response.data;
  },

  getMostActive: async (indexSymbol: string): Promise<any> => {
    const response = await axios.get(`${BASE_URL}/mostActive/${indexSymbol}`);
    return response.data;
  }
};

export default api; 