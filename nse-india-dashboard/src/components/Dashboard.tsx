import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Table, Statistic, Typography } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, InfoCircleOutlined } from '@ant-design/icons';
import api, { MarketState } from '../services/api';

const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
  const [marketStatus, setMarketStatus] = useState<{
    marketState: MarketState[];
    marketcap: {
      timeStamp: string;
      marketCapinTRDollars: number;
      marketCapinLACCRRupees: number;
      marketCapinCRRupees: number;
      marketCapinCRRupeesFormatted: string;
      marketCapinLACCRRupeesFormatted: string;
      underlying: string;
    };
    indicativenifty50: {
      last: number;
      change: number;
      pChange: number;
    };
    giftnifty: {
      last: number;
      change: number;
      pChange: number;
    };
  }>({
    marketState: [],
    marketcap: {
      timeStamp: '',
      marketCapinTRDollars: 0,
      marketCapinLACCRRupees: 0,
      marketCapinCRRupees: 0,
      marketCapinCRRupeesFormatted: '',
      marketCapinLACCRRupeesFormatted: '',
      underlying: ''
    },
    indicativenifty50: {
      last: 0,
      change: 0,
      pChange: 0
    },
    giftnifty: {
      last: 0,
      change: 0,
      pChange: 0
    }
  });
  const [indices, setIndices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statusData, indicesData] = await Promise.all([
          api.getMarketStatus(),
          api.getAllIndices()
        ]);
        setMarketStatus(statusData);
        setIndices(indicesData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    }).format(value);
  };

  const formatPercentage = (value: number): string => {
    return `${value >= 0 ? '+' : ''}${formatNumber(value)}%`;
  };

  const getChangeColor = (value: number): string => {
    return value >= 0 ? '#3f8600' : '#cf1322';
  };

  const marketStateColumns = [
    {
      title: 'Market',
      dataIndex: 'market',
      key: 'market',
      width: 120,
    },
    {
      title: 'Status',
      dataIndex: 'marketStatus',
      key: 'marketStatus',
      width: 120,
      render: (status: string) => (
        <span style={{ color: getChangeColor(status === 'Open' ? 1 : -1) }}>
          {status}
        </span>
      ),
    },
    {
      title: 'Trade Date',
      dataIndex: 'tradeDate',
      key: 'tradeDate',
      width: 150,
    },
    {
      title: 'Index',
      dataIndex: 'index',
      key: 'index',
      width: 120,
    },
    {
      title: 'Last',
      dataIndex: 'last',
      key: 'last',
      render: (value: number) => formatNumber(value),
      align: 'right' as const,
      width: 120,
    },
    {
      title: 'Change',
      dataIndex: 'variation',
      key: 'variation',
      render: (value: number) => (
        <span style={{ color: getChangeColor(value) }}>
          {value >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />} {Math.abs(value).toFixed(2)}
        </span>
      ),
      align: 'right' as const,
      width: 120,
    },
    {
      title: 'Change %',
      dataIndex: 'percentChange',
      key: 'percentChange',
      render: (value: number) => (
        <span style={{ color: getChangeColor(value) }}>
          {formatPercentage(value)}
        </span>
      ),
      align: 'right' as const,
      width: 120,
    },
    {
      title: 'Message',
      dataIndex: 'marketStatusMessage',
      key: 'marketStatusMessage',
    },
  ];

  const indicesColumns = [
    {
      title: 'Index',
      dataIndex: 'indexSymbol',
      key: 'indexSymbol',
      fixed: 'left' as const,
      width: 100,
    },
    {
      title: 'Name',
      dataIndex: 'indexName',
      key: 'indexName',
      fixed: 'left' as const,
      width: 200,
    },
    {
      title: 'Open',
      dataIndex: 'open',
      key: 'open',
      render: (value: number) => formatNumber(value),
      align: 'right' as const,
    },
    {
      title: 'High',
      dataIndex: 'high',
      key: 'high',
      render: (value: number) => formatNumber(value),
      align: 'right' as const,
    },
    {
      title: 'Low',
      dataIndex: 'low',
      key: 'low',
      render: (value: number) => formatNumber(value),
      align: 'right' as const,
    },
    {
      title: 'Close',
      dataIndex: 'close',
      key: 'close',
      render: (value: number) => formatNumber(value),
      align: 'right' as const,
    },
    {
      title: 'Change',
      dataIndex: 'change',
      key: 'change',
      render: (value: number) => (
        <span style={{ color: getChangeColor(value) }}>
          {value >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />} {Math.abs(value).toFixed(2)}
        </span>
      ),
      align: 'right' as const,
    },
    {
      title: 'Change %',
      dataIndex: 'changePercent',
      key: 'changePercent',
      render: (value: number) => (
        <span style={{ color: getChangeColor(value) }}>
          {formatPercentage(value)}
        </span>
      ),
      align: 'right' as const,
    },
  ];

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>
        NSE India Market Dashboard
        <Text type="secondary" style={{ marginLeft: 12, fontSize: 16 }}>
          Last Updated: {new Date().toLocaleTimeString()}
        </Text>
      </Title>

      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Market Cap"
              value={marketStatus.marketcap.marketCapinCRRupeesFormatted}
              valueStyle={{ color: '#1890ff' }}
              prefix="₹"
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Indices"
              value={indices.length}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Active Markets"
              value={marketStatus.marketState.filter(state => state.marketStatus === 'Open').length}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card 
            title="Indicative Nifty 50"
            extra={<Text type="secondary">Pre-market indicator</Text>}
          >
            <Statistic
              value={marketStatus.indicativenifty50.last}
              precision={2}
              suffix={
                <span style={{ color: getChangeColor(marketStatus.indicativenifty50.change) }}>
                  {formatPercentage(marketStatus.indicativenifty50.pChange)}
                </span>
              }
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card 
            title="Gift Nifty"
            extra={<Text type="secondary">SGX Nifty</Text>}
          >
            <Statistic
              value={marketStatus.giftnifty.last}
              precision={2}
              suffix={
                <span style={{ color: getChangeColor(marketStatus.giftnifty.change) }}>
                  {formatPercentage(marketStatus.giftnifty.pChange)}
                </span>
              }
            />
          </Card>
        </Col>
      </Row>

      <Card 
        style={{ marginTop: 16 }}
        title="Market States"
        extra={<Text type="secondary">Real-time data</Text>}
      >
        <Table
          columns={marketStateColumns}
          dataSource={marketStatus.marketState}
          rowKey="market"
          loading={loading}
          pagination={false}
          scroll={{ x: 1200 }}
          size="middle"
        />
      </Card>

      <Card 
        style={{ marginTop: 16 }}
        title="Market Indices"
        extra={<Text type="secondary">Real-time data</Text>}
      >
        <Table
          columns={indicesColumns}
          dataSource={indices}
          rowKey="indexSymbol"
          loading={loading}
          pagination={false}
          scroll={{ x: 1200 }}
          size="middle"
        />
      </Card>
    </div>
  );
};

export default Dashboard; 