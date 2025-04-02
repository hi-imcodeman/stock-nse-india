import React, { useEffect, useState, useCallback } from 'react';
import { Card, Input, DatePicker, Table, Statistic, Row, Col, Tag } from 'antd';
import { SearchOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import api, { EquityDetails } from '../services/api';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import debounce from 'lodash/debounce';

// Configure dayjs plugins
dayjs.extend(utc);
dayjs.extend(timezone);

// Set default timezone to IST
dayjs.tz.setDefault('Asia/Kolkata');

interface HistoricalData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  change: number;
  changePercent: number;
}

const { RangePicker } = DatePicker;

const Equities: React.FC = () => {
  const [equity, setEquity] = useState<EquityDetails | null>(null);
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [searchText, setSearchText] = useState('');

  const fetchEquityDetails = async (symbol: string) => {
    if (!symbol) return;
    try {
      setLoading(true);
      const response = await api.getEquityDetails(symbol);
      setEquity(response);
    } catch (error) {
      console.error('Error fetching equity details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistoricalData = async (symbol: string, startDate: string, endDate: string) => {
    if (!symbol || !startDate || !endDate) return;
    try {
      setLoading(true);
      // Convert dates to IST and format for API call
      const istStartDate = dayjs(startDate, 'DD-MM-YYYY').tz('Asia/Kolkata').format('YYYY-MM-DD');
      const istEndDate = dayjs(endDate, 'DD-MM-YYYY').tz('Asia/Kolkata').format('YYYY-MM-DD');
      
      const response = await api.getEquityHistorical(symbol, istStartDate, istEndDate);
      
      // Transform the API response into the expected format
      const transformedData = response.data.map(item => ({
        date: dayjs(item.TIMESTAMP).tz('Asia/Kolkata').format('DD-MM-YYYY'),
        open: item.CH_OPENING_PRICE,
        high: item.CH_TRADE_HIGH_PRICE,
        low: item.CH_TRADE_LOW_PRICE,
        close: item.CH_CLOSING_PRICE,
        change: item.CH_LAST_TRADED_PRICE - item.CH_PREVIOUS_CLS_PRICE,
        changePercent: ((item.CH_LAST_TRADED_PRICE - item.CH_PREVIOUS_CLS_PRICE) / item.CH_PREVIOUS_CLS_PRICE) * 100
      }));
      
      setHistoricalData(transformedData);
    } catch (error) {
      console.error('Error fetching historical data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create debounced versions of the fetch functions
  const debouncedFetchEquity = useCallback(
    debounce((symbol: string) => {
      fetchEquityDetails(symbol);
    }, 2000),
    []
  );

  const debouncedFetchHistorical = useCallback(
    debounce((symbol: string, startDate: string, endDate: string) => {
      fetchHistoricalData(symbol, startDate, endDate);
    }, 2000),
    []
  );

  useEffect(() => {
    if (searchText) {
      debouncedFetchEquity(searchText);
    }
    // Cleanup function to cancel any pending debounced calls
    return () => {
      debouncedFetchEquity.cancel();
    };
  }, [searchText, debouncedFetchEquity]);

  useEffect(() => {
    if (searchText && dateRange) {
      debouncedFetchHistorical(
        searchText,
        dateRange[0].tz('Asia/Kolkata').format('DD-MM-YYYY'),
        dateRange[1].tz('Asia/Kolkata').format('DD-MM-YYYY')
      );
    }
    // Cleanup function to cancel any pending debounced calls
    return () => {
      debouncedFetchHistorical.cancel();
    };
  }, [searchText, dateRange, debouncedFetchHistorical]);

  const formatPrice = (value: number) => {
    if (value === undefined || value === null) return '0.00';
    return value.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const equityColumns = [
    {
      title: 'Symbol',
      dataIndex: ['info', 'symbol'],
      key: 'symbol',
    },
    {
      title: 'Company Name',
      dataIndex: ['info', 'companyName'],
      key: 'companyName',
    },
    {
      title: 'Industry',
      dataIndex: ['info', 'industry'],
      key: 'industry',
    },
    {
      title: 'Series',
      dataIndex: ['metadata', 'series'],
      key: 'series',
    },
    {
      title: 'ISIN Code',
      dataIndex: ['info', 'isin'],
      key: 'isinCode',
    },
    {
      title: 'Face Value',
      dataIndex: ['securityInfo', 'faceValue'],
      key: 'faceValue',
      render: (value: number) => formatPrice(value),
    },
    {
      title: 'Market Lot',
      dataIndex: 'marketLot',
      key: 'marketLot',
      render: (value: number) => value?.toLocaleString('en-IN') || '0',
    },
    {
      title: 'Issue Price',
      dataIndex: ['priceInfo', 'basePrice'],
      key: 'issuePrice',
      render: (value: number) => formatPrice(value),
    },
    {
      title: 'Issue Date',
      dataIndex: ['metadata', 'listingDate'],
      key: 'issueDate',
      render: (date: string) => date ? dayjs(date).tz('Asia/Kolkata').format('DD-MM-YYYY') : '-',
    },
    {
      title: 'Listing Date',
      dataIndex: ['info', 'listingDate'],
      key: 'listingDate',
      render: (date: string) => date ? dayjs(date).tz('Asia/Kolkata').format('DD-MM-YYYY') : '-',
    },
  ];

  const historicalColumns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Open',
      dataIndex: 'open',
      key: 'open',
      render: (value: number) => formatPrice(value),
    },
    {
      title: 'High',
      dataIndex: 'high',
      key: 'high',
      render: (value: number) => formatPrice(value),
    },
    {
      title: 'Low',
      dataIndex: 'low',
      key: 'low',
      render: (value: number) => formatPrice(value),
    },
    {
      title: 'Close',
      dataIndex: 'close',
      key: 'close',
      render: (value: number) => formatPrice(value),
    },
    {
      title: 'Change',
      dataIndex: 'change',
      key: 'change',
      render: (value: number) => (
        <Tag color={value >= 0 ? 'success' : 'error'}>
          {value >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
          {Math.abs(value).toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}
        </Tag>
      ),
    },
    {
      title: 'Change %',
      dataIndex: 'changePercent',
      key: 'changePercent',
      render: (value: number) => (
        <Tag color={value >= 0 ? 'success' : 'error'}>
          {value >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
          {Math.abs(value).toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}%
        </Tag>
      ),
    },
  ];

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Input
            placeholder="Enter equity symbol"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onPressEnter={() => {
              fetchEquityDetails(searchText);
              if (dateRange) {
                fetchHistoricalData(
                  searchText,
                  dateRange[0].tz('Asia/Kolkata').format('DD-MM-YYYY'),
                  dateRange[1].tz('Asia/Kolkata').format('DD-MM-YYYY')
                );
              }
            }}
          />
        </Col>
        <Col span={12}>
          <RangePicker
            onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
            style={{ width: '100%' }}
            format="DD-MM-YYYY"
          />
        </Col>
      </Row>

      {equity?.info && (
        <Card style={{ marginTop: 16 }}>
          <Row gutter={[16, 16]}>
            <Col span={8}>
              <Statistic
                title="Symbol"
                value={equity.info.symbol}
                valueStyle={{ color: '#1890ff' }}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="Company Name"
                value={equity.info.companyName}
                valueStyle={{ color: '#1890ff' }}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="Industry"
                value={equity.info.industry}
                valueStyle={{ color: '#1890ff' }}
              />
            </Col>
          </Row>
        </Card>
      )}

      <Card style={{ marginTop: 16 }}>
        <Table
          columns={equityColumns}
          dataSource={equity ? [equity] : []}
          rowKey={(record) => record?.info?.symbol && record?.metadata?.series ? `${record.info.symbol}-${record.metadata.series}` : 'key'}
          loading={loading}
          pagination={false}
        />
      </Card>

      {historicalData.length > 0 && (
        <Card style={{ marginTop: 16 }}>
          <Table
            columns={historicalColumns}
            dataSource={historicalData}
            rowKey={(record) => record.date}
            loading={loading}
            pagination={false}
          />
        </Card>
      )}
    </div>
  );
};

export default Equities; 