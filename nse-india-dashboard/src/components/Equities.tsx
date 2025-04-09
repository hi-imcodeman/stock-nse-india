import React, { useEffect, useState, useCallback } from 'react';
import { Card, Input, DatePicker, Table, Statistic, Row, Col, Tag, Spin } from 'antd';
import { SearchOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import api, { EquityDetails, EquityHistoricalData } from '../services/api';
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

interface EquityTableRow {
  field: string;
  value: string | number;
}

const { RangePicker } = DatePicker;

const Equities: React.FC = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  const [equity, setEquity] = useState<EquityDetails | null>(null);
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [historicalLoading, setHistoricalLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(1, 'month'),
    dayjs()
  ]);
  const [searchText, setSearchText] = useState(symbol || '');
  const [pageSize, setPageSize] = useState(10);

  const fetchEquityDetails = async (symbol: string) => {
    if (!symbol) return;
    try {
      setDetailsLoading(true);
      const response = await api.getEquityDetails(symbol);
      setEquity(response);
    } catch (error) {
      console.error('Error fetching equity details:', error);
    } finally {
      setDetailsLoading(false);
    }
  };

  const fetchHistoricalData = async (symbol: string, startDate: string, endDate: string) => {
    if (!symbol || !startDate || !endDate) return;
    try {
      setHistoricalLoading(true);
      // Convert dates to IST and format for API call
      const istStartDate = dayjs(startDate, 'DD-MM-YYYY').tz('Asia/Kolkata').format('YYYY-MM-DD');
      const istEndDate = dayjs(endDate, 'DD-MM-YYYY').tz('Asia/Kolkata').format('YYYY-MM-DD');
      
      const response: EquityHistoricalData[] = await api.getEquityHistorical(symbol, istStartDate, istEndDate);
      
      // Add logging and validation
      console.log('Historical data response:', response);
      
      if (!response || !Array.isArray(response) || response.length === 0) {
        console.error('Invalid response format:', response);
        setHistoricalData([]);
        return;
      }
      
      // Combine data from all response objects
      const allData = response.reduce((acc, curr) => {
        if (curr.data) {
          return [...acc, ...curr.data];
        }
        return acc;
      }, [] as typeof response[0]['data']);
      
      // Transform the combined data into the expected format
      const transformedData = allData.map(item => ({
        date: dayjs(item.TIMESTAMP).tz('Asia/Kolkata').format('DD-MM-YYYY'),
        open: item.CH_OPENING_PRICE,
        high: item.CH_TRADE_HIGH_PRICE,
        low: item.CH_TRADE_LOW_PRICE,
        close: item.CH_CLOSING_PRICE,
        change: item.CH_LAST_TRADED_PRICE - item.CH_PREVIOUS_CLS_PRICE,
        changePercent: ((item.CH_LAST_TRADED_PRICE - item.CH_PREVIOUS_CLS_PRICE) / item.CH_PREVIOUS_CLS_PRICE) * 100
      }))
      // Sort by date in descending order (most recent first)
      .sort((a, b) => dayjs(b.date, 'DD-MM-YYYY').valueOf() - dayjs(a.date, 'DD-MM-YYYY').valueOf());
      
      setHistoricalData(transformedData);
    } catch (error) {
      console.error('Error fetching historical data:', error);
    } finally {
      setHistoricalLoading(false);
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

  // Add new useEffect for initial data fetch
  useEffect(() => {
    if (symbol) {
      setSearchText(symbol);
      fetchEquityDetails(symbol);
      fetchHistoricalData(
        symbol,
        dateRange[0].tz('Asia/Kolkata').format('DD-MM-YYYY'),
        dateRange[1].tz('Asia/Kolkata').format('DD-MM-YYYY')
      );
    }
  }, [symbol]); // Run when symbol changes

  const formatPrice = (value: number) => {
    if (value === undefined || value === null) return '0.00';
    return value.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const getEquityTableData = (equity: EquityDetails): EquityTableRow[] => {
    if (!equity) return [];
    return [
      { field: 'Symbol', value: equity.info.symbol },
      { field: 'Company Name', value: equity.info.companyName },
      { field: 'Industry', value: equity.info.industry },
      { field: 'Series', value: equity.metadata.series },
      { field: 'ISIN Code', value: equity.info.isin },
      { field: 'Face Value', value: formatPrice(equity.securityInfo.faceValue) },
      { field: 'Market Lot', value: equity.securityInfo.issuedSize?.toLocaleString('en-IN') || '0' },
      { field: 'Issue Price', value: formatPrice(equity.priceInfo.basePrice) },
      { field: 'Issue Date', value: equity.metadata.listingDate ? dayjs(equity.metadata.listingDate).tz('Asia/Kolkata').format('DD-MM-YYYY') : '-' },
      { field: 'Listing Date', value: equity.info.listingDate ? dayjs(equity.info.listingDate).tz('Asia/Kolkata').format('DD-MM-YYYY') : '-' },
    ];
  };

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

  // Update the search handler to use navigation
  const handleSearch = (value: string) => {
    if (value) {
      navigate(`/equity/${value}`);
    }
  };

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Input
            placeholder="Enter equity symbol"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onPressEnter={() => handleSearch(searchText)}
            disabled={detailsLoading || historicalLoading}
          />
        </Col>
        <Col span={12}>
          <RangePicker
            value={dateRange}
            onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
            style={{ width: '100%' }}
            format="DD-MM-YYYY"
            disabledDate={(current) => current && current > dayjs().endOf('day')}
            disabled={detailsLoading || historicalLoading}
          />
        </Col>
      </Row>

      {equity?.info && (
        <Card style={{ marginTop: 16 }}>
          <Spin spinning={detailsLoading}>
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
          </Spin>
        </Card>
      )}

      {equity?.priceInfo && (
        <Card style={{ marginTop: 16 }}>
          <Spin spinning={detailsLoading}>
            <Row gutter={[16, 16]}>
              <Col span={4}>
                <Statistic
                  title={<span style={{ fontWeight: 'bold' }}>Last Price</span>}
                  value={formatPrice(equity.priceInfo.lastPrice)}
                  valueStyle={{
                    fontSize: '24px',
                    color: equity.priceInfo.change >= 0 ? '#3f8600' : '#cf1322'
                  }}
                />
              </Col>
              <Col span={4}>
                <Statistic
                  title={<span style={{ fontWeight: 'bold' }}>Open</span>}
                  value={formatPrice(equity.priceInfo.open)}
                  valueStyle={{ fontSize: '20px' }}
                />
              </Col>
              <Col span={4}>
                <Statistic
                  title={<span style={{ fontWeight: 'bold' }}>High</span>}
                  value={formatPrice(equity.priceInfo.stockIndClosePrice)}
                  valueStyle={{ fontSize: '20px', color: '#3f8600' }}
                />
              </Col>
              <Col span={4}>
                <Statistic
                  title={<span style={{ fontWeight: 'bold' }}>Low</span>}
                  value={formatPrice(parseFloat(equity.priceInfo.lowerCP))}
                  valueStyle={{ fontSize: '20px', color: '#cf1322' }}
                />
              </Col>
              <Col span={4}>
                <Statistic
                  title={<span style={{ fontWeight: 'bold' }}>Change</span>}
                  value={formatPrice(equity.priceInfo.change)}
                  valueStyle={{
                    fontSize: '20px',
                    color: equity.priceInfo.change >= 0 ? '#3f8600' : '#cf1322'
                  }}
                  prefix={equity.priceInfo.change >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                />
              </Col>
              <Col span={4}>
                <Statistic
                  title={<span style={{ fontWeight: 'bold' }}>Change %</span>}
                  value={equity.priceInfo.pChange.toFixed(2)}
                  valueStyle={{
                    fontSize: '20px',
                    color: equity.priceInfo.change >= 0 ? '#3f8600' : '#cf1322'
                  }}
                  prefix={equity.priceInfo.change >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                  suffix="%"
                />
              </Col>
            </Row>
          </Spin>
        </Card>
      )}

      {equity && (
        <Card style={{ marginTop: 16 }}>
          <Spin spinning={detailsLoading}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Table
                  columns={[
                    {
                      title: 'Field',
                      dataIndex: 'field',
                      key: 'field',
                      width: '40%',
                      render: (text: string) => <span style={{ fontWeight: 'bold' }}>{text}</span>
                    },
                    {
                      title: 'Value',
                      dataIndex: 'value',
                      key: 'value',
                      width: '60%',
                    },
                  ]}
                  dataSource={getEquityTableData(equity).slice(0, 5)}
                  rowKey={(record) => record.field}
                  pagination={false}
                  showHeader={false}
                />
              </Col>
              <Col span={12}>
                <Table
                  columns={[
                    {
                      title: 'Field',
                      dataIndex: 'field',
                      key: 'field',
                      width: '40%',
                      render: (text: string) => <span style={{ fontWeight: 'bold' }}>{text}</span>
                    },
                    {
                      title: 'Value',
                      dataIndex: 'value',
                      key: 'value',
                      width: '60%',
                    },
                  ]}
                  dataSource={getEquityTableData(equity).slice(5)}
                  rowKey={(record) => record.field}
                  pagination={false}
                  showHeader={false}
                />
              </Col>
            </Row>
          </Spin>
        </Card>
      )}

      {historicalData.length > 0 && (
        <Card style={{ marginTop: 16 }}>
          <Spin spinning={historicalLoading}>
            <Table
              columns={historicalColumns}
              dataSource={historicalData}
              rowKey={(record) => record.date}
              pagination={{
                pageSize: pageSize,
                pageSizeOptions: ['10', '20', '50', '100'],
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `Total ${total} records`,
                onShowSizeChange: (current, size) => {
                  setPageSize(size);
                }
              }}
            />
          </Spin>
        </Card>
      )}

      {!equity && !historicalData.length && (detailsLoading || historicalLoading) && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '400px' 
        }}>
          <Spin size="large" />
        </div>
      )}
    </div>
  );
};

export default Equities; 