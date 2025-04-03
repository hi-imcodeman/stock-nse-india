import React, { useEffect, useState } from 'react';
import { Card, Select, Spin, Row, Col, Statistic, Tag, Typography, Tooltip } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

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
}

const EquitiesWidget: React.FC = () => {
  const navigate = useNavigate();
  const [selectedIndex, setSelectedIndex] = useState<string>('NIFTY 50');
  const [equities, setEquities] = useState<EquityInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [sortField, setSortField] = useState<SortField>('symbol');
  const [sortOrder, setSortOrder] = useState<SortOrder>('descend');

  useEffect(() => {
    fetchEquities();
  }, [selectedIndex]);

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

      // Fetch market cap and equity details in parallel
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

  const sortedEquities = [...equities].sort((a, b) => {
    const comparison = Math.abs(b.pChange) - Math.abs(a.pChange);
    return sortOrder === 'ascend' ? -comparison : comparison;
  });

  const handleCardClick = (symbol: string) => {
    navigate(`/equity/${symbol}`);
  };

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
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
          {sortedEquities.map((equity) => (
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
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default EquitiesWidget; 