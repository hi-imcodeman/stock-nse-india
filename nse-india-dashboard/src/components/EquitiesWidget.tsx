import React, { useEffect, useState } from 'react';
import { Card, Select, Spin, Row, Col, Statistic, Tag, Typography, Tooltip, Input, Popover } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// Configure dayjs plugins
dayjs.extend(utc);
dayjs.extend(timezone);

// Set default timezone to IST
dayjs.tz.setDefault('Asia/Kolkata');

type SortField = 'symbol' | 'lastPrice' | 'change' | 'pChange' | 'totalMarketCap';
type SortOrder = 'ascend' | 'descend';

interface IndexEquity {
  symbol: string;
  lastPrice: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  volume: number;
}

interface EquityInfo {
  symbol: string;
  lastPrice: number;
  change: number;
  pChange: number;
  totalTradedVolume: number;
  totalTradedValue: number;
  totalMarketCap?: number;
  marketCapLoading: boolean;
  companyName: string;
  industry: string;
  detailsLoading: boolean;
  technicalIndicators?: {
    sma5: number;
    sma10: number;
    sma20: number;
    sma50: number;
    sma100: number;
    sma200: number;
    ema5: number;
    ema10: number;
    ema20: number;
    ema50: number;
    ema100: number;
    ema200: number;
  };
  signals?: {
    buy: number;
    sell: number;
  };
}

const EquitiesWidget: React.FC = () => {
  const navigate = useNavigate();
  const [selectedIndex, setSelectedIndex] = useState<string>('NIFTY 50');
  const [equities, setEquities] = useState<EquityInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [sortField, setSortField] = useState<SortField>('symbol');
  const [sortOrder, setSortOrder] = useState<SortOrder>('descend');
  const [searchText, setSearchText] = useState<string>('');
  const [filteredEquities, setFilteredEquities] = useState<EquityInfo[]>([]);

  // Calculate SMA
  const calculateSMA = (data: number[], period: number): number[] => {
    const sma: number[] = [];
    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
        sma.push(NaN);
        continue;
      }
      const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      sma.push(sum / period);
    }
    return sma;
  };

  // Calculate EMA
  const calculateEMA = (data: number[], period: number): number[] => {
    const ema: number[] = [];
    const multiplier = 2 / (period + 1);
    
    // Start with SMA for the first EMA value
    const sma = calculateSMA(data, period);
    ema[period - 1] = sma[period - 1];
    
    for (let i = period; i < data.length; i++) {
      ema[i] = (data[i] - ema[i - 1]) * multiplier + ema[i - 1];
    }
    
    return ema;
  };

  // Calculate technical indicators for an equity
  const calculateTechnicalIndicators = async (symbol: string, lastPrice: number) => {
    try {
      const response = await api.getEquityHistorical(symbol, 
        new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        new Date().toISOString().split('T')[0]
      );
      
      if (!response || !Array.isArray(response) || response.length === 0) {
        return null;
      }

      // Process historical data exactly like in Equities.tsx
      const allData = response.reduce((acc, curr) => {
        if (curr.data) {
          return [...acc, ...curr.data];
        }
        return acc;
      }, [] as typeof response[0]['data']);

      const transformedData = allData.map(item => ({
        date: dayjs(item.TIMESTAMP).tz('Asia/Kolkata').format('DD-MM-YYYY'),
        open: item.CH_OPENING_PRICE,
        high: item.CH_TRADE_HIGH_PRICE,
        low: item.CH_TRADE_LOW_PRICE,
        close: item.CH_CLOSING_PRICE,
        change: item.CH_LAST_TRADED_PRICE - item.CH_PREVIOUS_CLS_PRICE,
        changePercent: ((item.CH_LAST_TRADED_PRICE - item.CH_PREVIOUS_CLS_PRICE) / item.CH_PREVIOUS_CLS_PRICE) * 100
      }))
      .sort((a, b) => dayjs(b.date, 'DD-MM-YYYY').valueOf() - dayjs(a.date, 'DD-MM-YYYY').valueOf());

      const closePrices = transformedData.map(item => item.close).reverse();

      // Calculate all indicators
      const sma5 = calculateSMA(closePrices, 5);
      const sma10 = calculateSMA(closePrices, 10);
      const sma20 = calculateSMA(closePrices, 20);
      const sma50 = calculateSMA(closePrices, 50);
      const sma100 = calculateSMA(closePrices, 100);
      const sma200 = calculateSMA(closePrices, 200);
      const ema5 = calculateEMA(closePrices, 5);
      const ema10 = calculateEMA(closePrices, 10);
      const ema20 = calculateEMA(closePrices, 20);
      const ema50 = calculateEMA(closePrices, 50);
      const ema100 = calculateEMA(closePrices, 100);
      const ema200 = calculateEMA(closePrices, 200);

      // Get the latest values
      const indicators = {
        sma5: sma5[sma5.length - 1],
        sma10: sma10[sma10.length - 1],
        sma20: sma20[sma20.length - 1],
        sma50: sma50[sma50.length - 1],
        sma100: sma100[sma100.length - 1],
        sma200: sma200[sma200.length - 1],
        ema5: ema5[ema5.length - 1],
        ema10: ema10[ema10.length - 1],
        ema20: ema20[ema20.length - 1],
        ema50: ema50[ema50.length - 1],
        ema100: ema100[ema100.length - 1],
        ema200: ema200[ema200.length - 1],
      };

      // Count buy and sell signals
      const allIndicators = Object.values(indicators);
      const buySignals = allIndicators.filter(value => value && value < lastPrice).length;
      const sellSignals = allIndicators.filter(value => value && value > lastPrice).length;

      return {
        technicalIndicators: indicators,
        signals: {
          buy: buySignals,
          sell: sellSignals
        }
      };
    } catch (error) {
      console.error(`Error calculating technical indicators for ${symbol}:`, error);
      return null;
    }
  };

  useEffect(() => {
    fetchEquities();
  }, [selectedIndex]);

  useEffect(() => {
    // Apply filtering when search text changes
    if (searchText.trim() === '') {
      setFilteredEquities(equities);
    } else {
      const filtered = equities.filter(equity => 
        equity.symbol.toLowerCase().includes(searchText.toLowerCase()) ||
        (equity.companyName && equity.companyName.toLowerCase().includes(searchText.toLowerCase())) ||
        (equity.industry && equity.industry.toLowerCase().includes(searchText.toLowerCase()))
      );
      setFilteredEquities(filtered);
    }
  }, [searchText, equities]);

  const fetchEquities = async () => {
    setLoading(true);
    try {
      const response = await api.getIndexEquities(selectedIndex);
      const equitiesData = response
        .filter((equity: IndexEquity) => equity.symbol !== selectedIndex)
        .map((equity: IndexEquity) => ({
          symbol: equity.symbol,
          lastPrice: equity.lastPrice,
          change: equity.change,
          pChange: equity.changePercent,
          totalTradedVolume: equity.volume,
          totalTradedValue: 0, // This field is not available in the API response
          marketCapLoading: true,
          companyName: equity.symbol,
          industry: 'Loading...',
          detailsLoading: true
        }));
      setEquities(equitiesData);

      // Fetch market cap, equity details, and technical indicators in parallel
      equitiesData.forEach(async (equity) => {
        try {
          // Fetch market cap data
          const tradeInfo = await api.getEquityTradeInfo(equity.symbol);
          if (tradeInfo && tradeInfo.marketDeptOrderBook?.tradeInfo?.totalMarketCap) {
            setEquities(prev => prev.map(e => 
              e.symbol === equity.symbol 
                ? { ...e, totalMarketCap: tradeInfo.marketDeptOrderBook.tradeInfo.totalMarketCap, marketCapLoading: false }
                : e
            ));
          } else {
            console.warn(`No market cap data available for ${equity.symbol}`);
            setEquities(prev => prev.map(e => 
              e.symbol === equity.symbol 
                ? { ...e, marketCapLoading: false }
                : e
            ));
          }

          // Fetch equity details
          const equityDetails = await api.getEquityDetails(equity.symbol);
          setEquities(prev => prev.map(e => 
            e.symbol === equity.symbol 
              ? { 
                  ...e, 
                  companyName: equityDetails?.info?.companyName || equity.symbol,
                  industry: equityDetails?.info?.industry || 'N/A',
                  detailsLoading: false
                }
              : e
          ));

          // Calculate technical indicators
          const technicalData = await calculateTechnicalIndicators(equity.symbol, equity.lastPrice);
          if (technicalData) {
            setEquities(prev => prev.map(e => 
              e.symbol === equity.symbol 
                ? { 
                    ...e,
                    technicalIndicators: technicalData.technicalIndicators,
                    signals: technicalData.signals
                  }
                : e
            ));
          }
        } catch (error) {
          console.error(`Error fetching data for ${equity.symbol}:`, error);
          setEquities(prev => prev.map(e => 
            e.symbol === equity.symbol 
              ? { 
                  ...e, 
                  marketCapLoading: false,
                  detailsLoading: false,
                  industry: 'N/A'
                }
              : e
          ));
        }
      });
    } catch (error) {
      console.error('Error fetching equities:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatVolume = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      notation: 'compact',
      compactDisplay: 'short',
    }).format(value);
  };

  const formatMarketCap = (value: number) => {
    if (!value) return 'N/A';
    
    if (value >= 100000) { // 1 lakh crores
      return `${(value / 100000).toFixed(2)}L Cr`;
    } else if (value >= 1000) { // 1 thousand crores
      return `${(value / 1000).toFixed(2)}K Cr`;
    } else {
      return `${value.toFixed(2)} Cr`;
    }
  };

  const sortedEquities = [...filteredEquities].sort((a, b) => {
    // Handle different sort fields
    let comparison = 0;
    let aMarketCap, bMarketCap;
    
    switch (sortField) {
      case 'symbol':
        comparison = a.symbol.localeCompare(b.symbol);
        break;
      case 'lastPrice':
        comparison = a.lastPrice - b.lastPrice;
        break;
      case 'change':
        comparison = a.change - b.change;
        break;
      case 'pChange':
        comparison = a.pChange - b.pChange;
        break;
      case 'totalMarketCap':
        // Handle undefined market cap values
        aMarketCap = a.totalMarketCap || 0;
        bMarketCap = b.totalMarketCap || 0;
        comparison = aMarketCap - bMarketCap;
        break;
      default:
        comparison = a.symbol.localeCompare(b.symbol);
    }
    
    // Apply sort order
    return sortOrder === 'ascend' ? comparison : -comparison;
  });

  const handleCardClick = (symbol: string) => {
    navigate(`/equity/${symbol}`);
  };

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <Select
          value={selectedIndex}
          onChange={setSelectedIndex}
          style={{ width: 200 }}
          options={[
            { value: 'NIFTY 50', label: 'NIFTY 50' },
            { value: 'NIFTY NEXT 50', label: 'NIFTY NEXT 50' },
            { value: 'NIFTY 100', label: 'NIFTY 100' },
            { value: 'NIFTY 200', label: 'NIFTY 200' },
            { value: 'NIFTY 500', label: 'NIFTY 500' },
          ]}
        />
        <Input
          placeholder="Search by symbol, company, or industry"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 250 }}
          allowClear
        />
        <Select
          value={sortField}
          onChange={setSortField}
          style={{ width: 150 }}
          options={[
            { value: 'symbol', label: 'Symbol' },
            { value: 'lastPrice', label: 'Price' },
            { value: 'change', label: 'Change' },
            { value: 'pChange', label: 'Change %' },
            { value: 'totalMarketCap', label: 'Market Cap' },
          ]}
        />
        <Select
          value={sortOrder}
          onChange={setSortOrder}
          style={{ width: 120 }}
          options={[
            { value: 'ascend', label: 'Ascending' },
            { value: 'descend', label: 'Descending' },
          ]}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      ) : (
        <Row gutter={[16, 16]}>
          {sortedEquities.length > 0 ? (
            sortedEquities.map((equity) => (
              <Col xs={24} sm={12} md={8} lg={6} key={equity.symbol}>
                <Card 
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography.Text strong>{equity.symbol}</Typography.Text>
                      <Tag color={equity.pChange >= 0 ? 'success' : 'error'}>
                        {equity.pChange >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                        {Math.abs(equity.pChange).toFixed(2)}%
                      </Tag>
                    </div>
                  } 
                  size="small"
                  hoverable
                  onClick={() => handleCardClick(equity.symbol)}
                  style={{ cursor: 'pointer' }}
                >
                  <div style={{ marginBottom: 16 }}>
                    <Tooltip title={equity.detailsLoading ? 'Loading...' : equity.companyName}>
                      <Typography.Text type="secondary" style={{ 
                        display: 'block', 
                        fontSize: '14px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {equity.detailsLoading ? <Spin size="small" /> : equity.companyName}
                      </Typography.Text>
                    </Tooltip>
                    <Tooltip title={equity.detailsLoading ? 'Loading...' : equity.industry}>
                      <Typography.Text type="secondary" style={{ 
                        display: 'block', 
                        fontSize: '12px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {equity.detailsLoading ? <Spin size="small" /> : equity.industry}
                      </Typography.Text>
                    </Tooltip>
                  </div>
                  <Statistic
                    title="Price"
                    value={equity.lastPrice}
                    precision={2}
                    prefix="₹"
                  />
                  <Statistic
                    title="Change"
                    value={equity.change}
                    precision={2}
                    valueStyle={{ color: equity.pChange >= 0 ? '#3f8600' : '#cf1322' }}
                    prefix={equity.pChange >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                    suffix="₹"
                  />
                  <Statistic
                    title="Volume"
                    value={equity.totalTradedVolume}
                    formatter={(value) => formatVolume(value as number)}
                  />
                  <Statistic
                    title="Market Cap"
                    value={equity.totalMarketCap}
                    formatter={(value) => value ? formatMarketCap(value as number) : 'N/A'}
                    suffix={equity.marketCapLoading ? <Spin size="small" /> : null}
                  />
                  {equity.signals && (
                    <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between' }}>
                      <Popover 
                        content={
                          <div style={{ maxWidth: 300 }}>
                            <div style={{ marginBottom: 8, fontWeight: 'bold' }}>Technical Indicators (Buy):</div>
                            {equity.technicalIndicators && Object.entries(equity.technicalIndicators)
                              .filter(([, value]) => value && value < equity.lastPrice)
                              .map(([key, value]) => (
                                <div key={key} style={{ fontSize: '12px', marginBottom: 4, color: '#3f8600' }}>
                                  {key.toUpperCase()}: {value.toFixed(2)}
                                </div>
                              ))}
                          </div>
                        }
                        title="Buy Signal Details"
                        trigger="hover"
                        placement="topLeft"
                        mouseEnterDelay={0.3}
                        mouseLeaveDelay={0.3}
                        overlayStyle={{ maxWidth: 300 }}
                      >
                        <div onClick={(e) => e.stopPropagation()}>
                          <Statistic
                            title="Buy Signals"
                            value={equity.signals.buy}
                            valueStyle={{ color: '#3f8600', fontSize: '16px' }}
                          />
                        </div>
                      </Popover>
                      <Popover 
                        content={
                          <div style={{ maxWidth: 300 }}>
                            <div style={{ marginBottom: 8, fontWeight: 'bold' }}>Technical Indicators (Sell):</div>
                            {equity.technicalIndicators && Object.entries(equity.technicalIndicators)
                              .filter(([, value]) => value && value > equity.lastPrice)
                              .map(([key, value]) => (
                                <div key={key} style={{ fontSize: '12px', marginBottom: 4, color: '#cf1322' }}>
                                  {key.toUpperCase()}: {value.toFixed(2)}
                                </div>
                              ))}
                          </div>
                        }
                        title="Sell Signal Details"
                        trigger="hover"
                        placement="topRight"
                        mouseEnterDelay={0.3}
                        mouseLeaveDelay={0.3}
                        overlayStyle={{ maxWidth: 300 }}
                      >
                        <div onClick={(e) => e.stopPropagation()}>
                          <Statistic
                            title="Sell Signals"
                            value={equity.signals.sell}
                            valueStyle={{ color: '#cf1322', fontSize: '16px' }}
                          />
                        </div>
                      </Popover>
                    </div>
                  )}
                </Card>
              </Col>
            ))
          ) : (
            <Col span={24} style={{ textAlign: 'center', padding: '50px' }}>
              <Typography.Text type="secondary">No equities found matching your search criteria</Typography.Text>
            </Col>
          )}
        </Row>
      )}
    </div>
  );
};

export default EquitiesWidget; 