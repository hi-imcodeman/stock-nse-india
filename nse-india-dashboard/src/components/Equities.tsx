import React, { useEffect, useState, useCallback } from 'react';
import { Card, Input, DatePicker, Table, Statistic, Row, Col, Tag, Spin, Tabs, Space, Button } from 'antd';
import { SearchOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import api, { EquityDetails, EquityHistoricalData } from '../services/api';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import debounce from 'lodash/debounce';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import 'highcharts/modules/stock';

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

interface HighchartsPoint {
  x: string;
  open: number;
  high: number;
  low: number;
  close: number;
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
    dayjs().subtract(1, 'year'),
    dayjs()
  ]);
  const [searchText, setSearchText] = useState(symbol || '');
  const [pageSize, setPageSize] = useState(10);
  const [activeTab, setActiveTab] = useState('chart');
  const [technicalIndicators, setTechnicalIndicators] = useState<{
    sma5: number[];
    sma10: number[];
    sma20: number[];
    sma50: number[];
    sma100: number[];
    sma200: number[];
    ema5: number[];
    ema10: number[];
    ema20: number[];
    ema50: number[];
    ema100: number[];
    ema200: number[];
  }>({
    sma5: [],
    sma10: [],
    sma20: [],
    sma50: [],
    sma100: [],
    sma200: [],
    ema5: [],
    ema10: [],
    ema20: [],
    ema50: [],
    ema100: [],
    ema200: [],
  });
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

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

  // Update technical indicators when historical data changes
  useEffect(() => {
    if (historicalData.length > 0) {
      // Reverse the data to calculate from oldest to newest
      const reversedData = [...historicalData].reverse();
      const closePrices = reversedData.map(d => d.close);
      
      setTechnicalIndicators({
        sma5: calculateSMA(closePrices, 5),
        sma10: calculateSMA(closePrices, 10),
        sma20: calculateSMA(closePrices, 20),
        sma50: calculateSMA(closePrices, 50),
        sma100: calculateSMA(closePrices, 100),
        sma200: calculateSMA(closePrices, 200),
        ema5: calculateEMA(closePrices, 5),
        ema10: calculateEMA(closePrices, 10),
        ema20: calculateEMA(closePrices, 20),
        ema50: calculateEMA(closePrices, 50),
        ema100: calculateEMA(closePrices, 100),
        ema200: calculateEMA(closePrices, 200),
      });
    }
  }, [historicalData]);

  const formatPrice = (value: number) => {
    if (value === undefined || value === null) return '0.00';
    return value.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    }).format(value);
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

  const chartOptions = {
    chart: {
      type: 'candlestick',
      height: 600,
    },
    title: {
      text: `${equity?.info.symbol} Price Chart`,
    },
    legend: {
      enabled: false,
    },
    xAxis: {
      type: 'datetime',
      labels: {
        rotation: -45,
        style: {
          fontSize: '10px',
        },
        formatter: function(this: { value: number }): string {
          return dayjs(this.value).format('DD-MMM-YYYY');
        },
      },
      ordinal: true,
    },
    yAxis: {
      title: {
        text: 'Price',
      },
      labels: {
        formatter: function(this: { value: number }): string {
          return formatNumber(this.value);
        },
      },
    },
    tooltip: {
      formatter: function(this: { point: HighchartsPoint }): string {
        const point = this.point;
        return `<b>${dayjs(point.x).format('DD-MMM-YYYY')}</b><br/>
          Open: ${formatNumber(point.open)}<br/>
          High: ${formatNumber(point.high)}<br/>
          Low: ${formatNumber(point.low)}<br/>
          Close: ${formatNumber(point.close)}`;
      },
    },
    series: [{
      name: equity?.info.symbol,
      data: historicalData.map(record => ({
        x: dayjs(record.date, 'DD-MM-YYYY').valueOf(),
        open: record.open,
        high: record.high,
        low: record.low,
        close: record.close,
        color: record.change >= 0 ? '#3f8600' : '#cf1322',
      })),
      upColor: '#3f8600',
      color: '#cf1322',
    }],
    credits: {
      enabled: false,
    },
  };

  const technicalColumns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Close',
      dataIndex: 'close',
      key: 'close',
      render: (value: number) => formatNumber(value),
    },
    {
      title: 'SMA5',
      dataIndex: 'sma5',
      key: 'sma5',
      render: (value: number) => value ? formatNumber(value) : '-',
    },
    {
      title: 'SMA10',
      dataIndex: 'sma10',
      key: 'sma10',
      render: (value: number) => value ? formatNumber(value) : '-',
    },
    {
      title: 'SMA20',
      dataIndex: 'sma20',
      key: 'sma20',
      render: (value: number) => value ? formatNumber(value) : '-',
    },
    {
      title: 'SMA50',
      dataIndex: 'sma50',
      key: 'sma50',
      render: (value: number) => value ? formatNumber(value) : '-',
    },
    {
      title: 'SMA100',
      dataIndex: 'sma100',
      key: 'sma100',
      render: (value: number) => value ? formatNumber(value) : '-',
    },
    {
      title: 'SMA200',
      dataIndex: 'sma200',
      key: 'sma200',
      render: (value: number) => value ? formatNumber(value) : '-',
    },
    {
      title: 'EMA5',
      dataIndex: 'ema5',
      key: 'ema5',
      render: (value: number) => value ? formatNumber(value) : '-',
    },
    {
      title: 'EMA10',
      dataIndex: 'ema10',
      key: 'ema10',
      render: (value: number) => value ? formatNumber(value) : '-',
    },
    {
      title: 'EMA20',
      dataIndex: 'ema20',
      key: 'ema20',
      render: (value: number) => value ? formatNumber(value) : '-',
    },
    {
      title: 'EMA50',
      dataIndex: 'ema50',
      key: 'ema50',
      render: (value: number) => value ? formatNumber(value) : '-',
    },
    {
      title: 'EMA100',
      dataIndex: 'ema100',
      key: 'ema100',
      render: (value: number) => value ? formatNumber(value) : '-',
    },
    {
      title: 'EMA200',
      dataIndex: 'ema200',
      key: 'ema200',
      render: (value: number) => value ? formatNumber(value) : '-',
    },
  ];

  const technicalData = historicalData.map((record, index) => {
    // Get the reversed index for technical indicators only
    const reversedIndex = historicalData.length - 1 - index;
    return {
      date: record.date,
      close: record.close,
      sma5: technicalIndicators.sma5[reversedIndex],
      sma10: technicalIndicators.sma10[reversedIndex],
      sma20: technicalIndicators.sma20[reversedIndex],
      sma50: technicalIndicators.sma50[reversedIndex],
      sma100: technicalIndicators.sma100[reversedIndex],
      sma200: technicalIndicators.sma200[reversedIndex],
      ema5: technicalIndicators.ema5[reversedIndex],
      ema10: technicalIndicators.ema10[reversedIndex],
      ema20: technicalIndicators.ema20[reversedIndex],
      ema50: technicalIndicators.ema50[reversedIndex],
      ema100: technicalIndicators.ema100[reversedIndex],
      ema200: technicalIndicators.ema200[reversedIndex],
    };
  });

  const getLatestTechnicalIndicators = () => {
    if (technicalData.length === 0) return null;
    const latest = technicalData[0];
    const latestClose = latest.close;
    
    const getValueStyle = (value: number) => {
      if (!value) return {};
      return {
        color: value < latestClose ? '#3f8600' : '#cf1322',
        fontSize: '16px'
      };
    };

    const indicators = {
      sma: [
        { title: 'SMA5', value: latest.sma5, valueStyle: getValueStyle(latest.sma5) },
        { title: 'SMA10', value: latest.sma10, valueStyle: getValueStyle(latest.sma10) },
        { title: 'SMA20', value: latest.sma20, valueStyle: getValueStyle(latest.sma20) },
        { title: 'SMA50', value: latest.sma50, valueStyle: getValueStyle(latest.sma50) },
        { title: 'SMA100', value: latest.sma100, valueStyle: getValueStyle(latest.sma100) },
        { title: 'SMA200', value: latest.sma200, valueStyle: getValueStyle(latest.sma200) },
      ],
      ema: [
        { title: 'EMA5', value: latest.ema5, valueStyle: getValueStyle(latest.ema5) },
        { title: 'EMA10', value: latest.ema10, valueStyle: getValueStyle(latest.ema10) },
        { title: 'EMA20', value: latest.ema20, valueStyle: getValueStyle(latest.ema20) },
        { title: 'EMA50', value: latest.ema50, valueStyle: getValueStyle(latest.ema50) },
        { title: 'EMA100', value: latest.ema100, valueStyle: getValueStyle(latest.ema100) },
        { title: 'EMA200', value: latest.ema200, valueStyle: getValueStyle(latest.ema200) },
      ]
    };

    // Count buy and sell signals
    const allIndicators = [...indicators.sma, ...indicators.ema];
    const buySignals = allIndicators.filter(ind => ind.value && ind.value < latestClose).length;
    const sellSignals = allIndicators.filter(ind => ind.value && ind.value > latestClose).length;

    return {
      ...indicators,
      signals: {
        buy: buySignals,
        sell: sellSignals
      }
    };
  };

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Input
            placeholder="Enter equity symbol"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onPressEnter={() => handleSearch(searchText)}
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
                  value={formatPrice(equity.priceInfo.intraDayHighLow.max)}
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
        <Card title="Price Data" style={{ marginTop: 16 }}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Space>
              <RangePicker
                value={dateRange}
                onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
                style={{ width: '100%' }}
                format="DD-MM-YYYY"
                disabledDate={(current) => current && current > dayjs().endOf('day')}
                disabled={detailsLoading || historicalLoading}
              />
              {historicalLoading && <Spin size="small" />}
            </Space>
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={[
                {
                  key: 'chart',
                  label: 'Chart',
                  children: (
                    <div style={{ height: 600, paddingLeft: 20, paddingBottom: 20, position: 'relative' }}>
                      <HighchartsReact
                        highcharts={Highcharts}
                        options={chartOptions}
                      />
                      {historicalLoading && (
                        <div style={{ 
                          position: 'absolute', 
                          top: 0, 
                          left: 0, 
                          right: 0, 
                          bottom: 0, 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          backgroundColor: 'rgba(255, 255, 255, 0.7)',
                          zIndex: 1
                        }}>
                          <Spin size="large" />
                        </div>
                      )}
                    </div>
                  ),
                },
                {
                  key: 'technical',
                  label: 'Technical Indicators',
                  children: (
                    <>
                      <Card style={{ marginBottom: 16 }}>
                        <Row justify="center" gutter={[32, 0]}>
                          <Col>
                            <Statistic
                              title="Latest Close Price"
                              value={technicalData[0]?.close ? formatNumber(technicalData[0].close) : '-'}
                              valueStyle={{ fontSize: '24px', color: '#1890ff' }}
                            />
                          </Col>
                          <Col>
                            <Statistic
                              title="Buy Signals"
                              value={getLatestTechnicalIndicators()?.signals.buy || 0}
                              valueStyle={{ fontSize: '24px', color: '#3f8600' }}
                            />
                          </Col>
                          <Col>
                            <Statistic
                              title="Sell Signals"
                              value={getLatestTechnicalIndicators()?.signals.sell || 0}
                              valueStyle={{ fontSize: '24px', color: '#cf1322' }}
                            />
                          </Col>
                        </Row>
                      </Card>
                      <Row gutter={[16, 16]}>
                        <Col span={12}>
                          <Card title="Simple Moving Averages (SMA)">
                            <Row gutter={[16, 16]}>
                              {getLatestTechnicalIndicators()?.sma.map((indicator, index) => (
                                <Col span={8} key={index}>
                                  <Statistic
                                    title={indicator.title}
                                    value={indicator.value ? formatNumber(indicator.value) : '-'}
                                    valueStyle={indicator.valueStyle}
                                  />
                                </Col>
                              ))}
                            </Row>
                          </Card>
                        </Col>
                        <Col span={12}>
                          <Card title="Exponential Moving Averages (EMA)">
                            <Row gutter={[16, 16]}>
                              {getLatestTechnicalIndicators()?.ema.map((indicator, index) => (
                                <Col span={8} key={index}>
                                  <Statistic
                                    title={indicator.title}
                                    value={indicator.value ? formatNumber(indicator.value) : '-'}
                                    valueStyle={indicator.valueStyle}
                                  />
                                </Col>
                              ))}
                            </Row>
                          </Card>
                        </Col>
                      </Row>
                      <div style={{ marginTop: 16, textAlign: 'center' }}>
                        <Button 
                          type="primary" 
                          onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                        >
                          {showTechnicalDetails ? 'Hide Details' : 'Show Details'}
                        </Button>
                      </div>
                      {showTechnicalDetails && (
                        <Table
                          columns={technicalColumns}
                          dataSource={technicalData}
                          rowKey="date"
                          loading={historicalLoading}
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
                          scroll={{ x: 1500 }}
                        />
                      )}
                    </>
                  ),
                },
                {
                  key: 'table',
                  label: 'Historical Data',
                  children: (
                    <Table
                      columns={historicalColumns}
                      dataSource={historicalData}
                      rowKey={(record) => record.date}
                      loading={historicalLoading}
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
                  ),
                },
              ]}
            />
          </Space>
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