import React, { useEffect, useState, useRef } from 'react';
import { Typography, Space } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import api from '../services/api';
import './TopGainersTicker.css';

const { Text } = Typography;

interface StockData {
  symbol: string;
  lastPrice: number;
  change: number;
  changePercent: number;
  isGainer: boolean;
}

const TopGainersTicker: React.FC = () => {
  const [displayData, setDisplayData] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const dataRef = useRef<{
    gainers: StockData[];
    losers: StockData[];
  }>({ gainers: [], losers: [] });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.getIndexEquities('NIFTY 500');
        
        // Process gainers
        const gainers = data
          .filter(equity => equity.changePercent > 0)
          .sort((a, b) => b.changePercent - a.changePercent)
          .slice(0, 20)
          .map(equity => ({
            symbol: equity.symbol,
            lastPrice: equity.lastPrice,
            change: equity.change,
            changePercent: equity.changePercent,
            isGainer: true
          }));

        // Process losers
        const losers = data
          .filter(equity => equity.changePercent < 0)
          .sort((a, b) => a.changePercent - b.changePercent)
          .slice(0, 20)
          .map(equity => ({
            symbol: equity.symbol,
            lastPrice: equity.lastPrice,
            change: equity.change,
            changePercent: equity.changePercent,
            isGainer: false
          }));

        // Update the ref
        dataRef.current = { gainers, losers };
        
        // Combine gainers and losers for continuous display
        const combinedData = [...gainers, ...losers];
        setDisplayData(combinedData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching stock data:', error);
        setLoading(false);
      }
    };

    // Initial data fetch
    fetchData();
    
    // Set up interval for data refresh
    const refreshInterval = setInterval(fetchData, 30000);
    
    return () => {
      clearInterval(refreshInterval);
    };
  }, []);

  if (loading) {
    return null;
  }

  const renderStock = (stock: StockData, index: number) => (
    <Space key={index} size="small">
      <Text strong>{stock.symbol}</Text>
      <Text>{stock.lastPrice.toFixed(2)}</Text>
      <Text style={{ color: stock.isGainer ? '#237804' : '#cf1322' }}>
        {stock.isGainer ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
        {Math.abs(stock.change).toFixed(2)} ({Math.abs(stock.changePercent).toFixed(2)}%)
      </Text>
    </Space>
  );

  return (
    <div className="ticker-container">
      <div className="ticker-content">
        <Space size="large" style={{ marginRight: 24 }}>
          {displayData.map(renderStock)}
          {displayData.map(renderStock)}
        </Space>
      </div>
    </div>
  );
};

export default TopGainersTicker; 