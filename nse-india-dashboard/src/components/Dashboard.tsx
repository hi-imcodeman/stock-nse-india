import React, { useEffect, useState, useRef } from 'react';
import { Card, Row, Col, Table, Statistic, Typography, Space, Tag } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, CalendarOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { IndexDetails, MarketStatus, Holiday } from '../../../src/interface';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [marketStatus, setMarketStatus] = useState<MarketStatus>({
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
      dateTime: '',
      indicativeTime: null,
      indexName: '',
      indexLast: null,
      indexPercChange: null,
      indexTimeVal: null,
      closingValue: 0,
      finalClosingValue: 0,
      change: 0,
      perChange: 0,
      status: ''
    },
    giftnifty: {
      INSTRUMENTTYPE: '',
      SYMBOL: '',
      EXPIRYDATE: '',
      OPTIONTYPE: '',
      STRIKEPRICE: '',
      LASTPRICE: 0,
      DAYCHANGE: '',
      PERCHANGE: '',
      CONTRACTSTRADED: 0,
      TIMESTMP: '',
      id: ''
    }
  });
  const [indices, setIndices] = useState<IndexDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [pageSize, setPageSize] = useState(10);
  const isLoadingRef = useRef(false);
  const mountedRef = useRef(true);
  const [holidays, setHolidays] = useState<Holiday[]>([]);

  useEffect(() => {
    mountedRef.current = true;
    const intervalId = setInterval(() => {
      if (!mountedRef.current) return;
      fetchData();
    }, 5000);

    const fetchData = async () => {
      if (isLoadingRef.current) {
        console.log('Skipping fetch - previous request still loading');
        return;
      }
      
      try {
        console.log('Starting data fetch');
        isLoadingRef.current = true;
        if (isInitialLoad) {
          setLoading(true);
        }
        const [statusData, indicesData] = await Promise.all([
          api.getMarketStatus(),
          api.getAllIndices()
        ]);
        if (mountedRef.current) {
          setMarketStatus(statusData);
          setIndices(indicesData);
          if (isInitialLoad) {
            setIsInitialLoad(false);
            setLoading(false);
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        if (mountedRef.current && isInitialLoad) {
          setLoading(false);
        }
      } finally {
        if (mountedRef.current) {
          console.log('Setting loading to false');
          isLoadingRef.current = false;
        }
      }
    };

    // Initial fetch
    fetchData();

    // Cleanup function
    return () => {
      console.log('Component unmounting, waiting for fetch to complete');
      mountedRef.current = false;
      // Don't clear interval immediately, let the fetch complete
      const cleanupInterval = () => {
        console.log('Cleaning up interval');
        clearInterval(intervalId);
      };
      // Wait for any pending fetch to complete
      if (isLoadingRef.current) {
        setTimeout(cleanupInterval, 1000);
      } else {
        cleanupInterval();
      }
    };
  }, [isInitialLoad]); // Add isInitialLoad to dependencies

  // Separate effect for fetching holiday data only once
  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const holidaysData = await api.getHolidays();
        console.log('Holidays data:', holidaysData);
        // Combine all holiday arrays into a single array
        const allHolidays = Object.values(holidaysData).flat();
        console.log('Combined holidays:', allHolidays);
        setHolidays(Array.isArray(allHolidays) ? allHolidays : []);
      } catch (error) {
        console.error('Error fetching holiday data:', error);
      }
    };

    fetchHolidays();
  }, []); // Empty dependency array means this effect runs only once on mount

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
      dataIndex: 'name',
      key: 'name',
      fixed: 'left' as const,
      width: 100,
      render: (text: string) => (
        <a onClick={() => navigate(`/index/${text}`)} style={{ cursor: 'pointer' }}>
          {text}
        </a>
      ),
    },
    {
      title: 'Name',
      dataIndex: ['metadata', 'indexName'],
      key: 'indexName',
      fixed: 'left' as const,
      width: 200,
    },
    {
      title: 'Open',
      dataIndex: ['metadata', 'open'],
      key: 'open',
      render: (value: number) => formatNumber(value),
      align: 'right' as const,
    },
    {
      title: 'High',
      dataIndex: ['metadata', 'high'],
      key: 'high',
      render: (value: number) => formatNumber(value),
      align: 'right' as const,
    },
    {
      title: 'Low',
      dataIndex: ['metadata', 'low'],
      key: 'low',
      render: (value: number) => formatNumber(value),
      align: 'right' as const,
    },
    {
      title: 'Close',
      dataIndex: ['metadata', 'last'],
      key: 'last',
      render: (value: number) => formatNumber(value),
      align: 'right' as const,
    },
    {
      title: 'Change',
      dataIndex: ['metadata', 'change'],
      key: 'change',
      render: (value: number) => (
        <span style={{ color: getChangeColor(value) }}>
          {value >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />} {Math.abs(value).toFixed(2)}
        </span>
      ),
      align: 'right' as const,
      sorter: (a: IndexDetails, b: IndexDetails) => (a.metadata?.change || 0) - (b.metadata?.change || 0),
    },
    {
      title: 'Change %',
      dataIndex: ['metadata', 'percChange'],
      key: 'percChange',
      render: (value: number) => (
        <span style={{ color: getChangeColor(value) }}>
          {formatPercentage(value)}
        </span>
      ),
      align: 'right' as const,
      sorter: (a: IndexDetails, b: IndexDetails) => (a.metadata?.percChange || 0) - (b.metadata?.percChange || 0),
    },
  ];

  const getNextHoliday = () => {
    if (!Array.isArray(holidays) || holidays.length === 0) {
      console.log('No holidays available:', holidays);
      return null;
    }
    const today = dayjs();
    console.log('Today:', today.format('YYYY-MM-DD'));
    const upcomingHolidays = holidays
      .filter(holiday => {
        const holidayDate = dayjs(holiday.tradingDate);
        const isAfterToday = holidayDate.isAfter(today);
        console.log('Holiday:', holiday.holiday, 'Date:', holidayDate.format('YYYY-MM-DD'), 'Is after today:', isAfterToday);
        return isAfterToday;
      })
      .sort((a, b) => dayjs(a.tradingDate).valueOf() - dayjs(b.tradingDate).valueOf());
    
    console.log('Upcoming holidays:', upcomingHolidays);
    return upcomingHolidays[0] || null;
  };

  const nextHoliday = getNextHoliday();
  console.log('Next holiday:', nextHoliday);

  const isTodayHoliday = () => {
    if (!Array.isArray(holidays) || holidays.length === 0) {
      return false;
    }
    const today = dayjs().format('YYYY-MM-DD');
    return holidays.find(holiday => dayjs(holiday.tradingDate).format('YYYY-MM-DD') === today);
  };

  const todayHoliday = isTodayHoliday();

  return (
    <div>
      {todayHoliday && (
        <div style={{
          backgroundColor: '#ff4d4f',
          color: 'white',
          padding: '12px 24px',
          textAlign: 'center',
          marginBottom: '16px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}>
          <CalendarOutlined style={{ fontSize: '16px' }} />
          <Text strong style={{ color: 'white' }}>
            Market Holiday: {todayHoliday.description || todayHoliday.holiday || 'Holiday'}
          </Text>
          <Tag color="white" style={{ color: '#ff4d4f', marginLeft: '8px' }}>
            Trading Holiday
          </Tag>
        </div>
      )}
      <Title level={2} style={{ marginBottom: 24 }}>
        NSE India Market Dashboard
        <Space style={{ marginLeft: 12, fontSize: 16 }}>
          <Text type="secondary">
            Last Updated: {new Date().toLocaleTimeString()}
          </Text>
          {nextHoliday && (
            <>
              <Text type="secondary">|</Text>
              <Space 
                style={{ cursor: 'pointer' }}
                onClick={() => navigate('/holidays')}
              >
                <CalendarOutlined style={{ fontSize: 16, color: '#1890ff' }} />
                <Text type="secondary">
                  Next Holiday: {dayjs(nextHoliday.tradingDate).format('DD MMM YYYY')} ({nextHoliday.description || nextHoliday.holiday || 'Holiday'})
                </Text>
              </Space>
            </>
          )}
        </Space>
      </Title>

      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card loading={loading}>
            <Statistic
              title="Active Markets"
              value={marketStatus.marketState.filter(state => state.marketStatus === 'Open').length}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card loading={loading}>
            <Statistic
              title="NIFTY50 Advances/Declines"
              value={indices.find(index => index.name === 'NIFTY 50')?.advance.advances || 0}
              suffix={` / ${indices.find(index => index.name === 'NIFTY 50')?.advance.declines || 0}`}
              valueStyle={{ 
                color: (indices.find(index => index.name === 'NIFTY 50')?.advance.advances || 0) > (indices.find(index => index.name === 'NIFTY 50')?.advance.declines || 0) ? '#3f8600' : '#cf1322',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            />
          </Card>
        </Col>
      </Row>

      <Card 
        style={{ marginTop: 16 }}
        title="Market States"
        extra={<Text type="secondary">Real-time data</Text>}
        loading={loading}
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
        loading={loading}
      >
        <Table
          columns={indicesColumns}
          dataSource={indices}
          rowKey="indexSymbol"
          loading={loading}
          pagination={{
            pageSize: pageSize,
            pageSizeOptions: ['10', '20', '50', '100'],
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Total ${total} indices`,
            onShowSizeChange: (current, size) => {
              setPageSize(size);
            }
          }}
          scroll={{ x: 1200 }}
          size="middle"
        />
      </Card>
    </div>
  );
};

export default Dashboard; 