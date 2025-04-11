import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, DatePicker, Select, Space, Spin, Tooltip, Typography, Tabs } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import 'highcharts/modules/stock';

// Configure dayjs plugins
dayjs.extend(utc);
dayjs.extend(timezone);

const { RangePicker } = DatePicker;

interface IndexData {
  name: string;
  metadata: {
    indexName: string;
    open: number;
    high: number;
    low: number;
    last: number;
    change: number;
    percChange: number;
  };
}

interface HistoricalDataRecord {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  change: number;
  changePercent: number;
}

interface ChartDataRecord {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  body: number;
  bodyStart: number;
  bodyEnd: number;
  isUp: boolean;
}

interface EquityData {
  symbol: string;
  companyName: string;
  lastPrice: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  volume: number;
}

interface HighchartsPoint {
  x: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

const StatisticTitle = ({ children }: { children: React.ReactNode }) => (
  <span style={{ fontSize: '12px' }}>{children}</span>
);

const Indices: React.FC = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  const [indices, setIndices] = useState<IndexData[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<string>(symbol || '');
  const [historicalData, setHistoricalData] = useState<HistoricalDataRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [historicalLoading, setHistoricalLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(1, 'month'),
    dayjs()
  ]);
  const [equities, setEquities] = useState<EquityData[]>([]);
  const [equitiesLoading, setEquitiesLoading] = useState(false);
  const [equitiesPageSize, setEquitiesPageSize] = useState(10);
  const [historicalPageSize, setHistoricalPageSize] = useState(10);
  const [activeTab, setActiveTab] = useState('chart');

  // Add effect to scroll to top when component mounts or symbol changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [symbol]);

  useEffect(() => {
    const fetchIndices = async () => {
      try {
        console.log('Fetching indices...');
        const data = await api.getAllIndices();
        console.log('Raw indices data:', data);
        
        if (!data || data.length === 0) {
          console.error('No indices data received');
          return;
        }
        
        setIndices(data);
        console.log('Indices set in state:', data);
        
        // Set the index from URL parameter or first index if no parameter
        if (data.length > 0) {
          const indexToSelect = symbol || data[0].name;
          console.log('Setting selected index:', indexToSelect);
          setSelectedIndex(indexToSelect);
        }
      } catch (error) {
        console.error('Error fetching indices:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchIndices();
  }, [symbol]); // Only fetch when symbol changes or component mounts

  useEffect(() => {
    const fetchHistoricalData = async () => {
      if (!selectedIndex || !dateRange) return;

      setHistoricalLoading(true);
      try {
        const [startDate, endDate] = dateRange;
        console.log('Fetching historical data for:', {
          index: selectedIndex,
          startDate: startDate.format('YYYY-MM-DD'),
          endDate: endDate.format('YYYY-MM-DD')
        });
        
        const data = await api.getIndexHistorical(
          selectedIndex,
          startDate.format('YYYY-MM-DD'),
          endDate.format('YYYY-MM-DD')
        );
        
        console.log('Received historical data:', data);
        
        // Handle array of historical data records and sort by date in descending order
        const transformedData = data.flatMap(record => 
          record.data.indexCloseOnlineRecords.map(record => ({
            date: dayjs(record.TIMESTAMP).tz('Asia/Kolkata').format('DD-MMM-YYYY'),
            open: record.EOD_OPEN_INDEX_VAL,
            high: record.EOD_HIGH_INDEX_VAL,
            low: record.EOD_LOW_INDEX_VAL,
            close: record.EOD_CLOSE_INDEX_VAL,
            change: record.EOD_CLOSE_INDEX_VAL - record.EOD_OPEN_INDEX_VAL,
            changePercent: ((record.EOD_CLOSE_INDEX_VAL - record.EOD_OPEN_INDEX_VAL) / record.EOD_OPEN_INDEX_VAL) * 100
          }))
        ).sort((a, b) => dayjs(b.date, 'DD-MMM-YYYY').valueOf() - dayjs(a.date, 'DD-MMM-YYYY').valueOf());
        
        console.log('Transformed historical data:', transformedData);
        setHistoricalData(transformedData);
      } catch (error) {
        console.error('Error fetching historical data:', error);
      } finally {
        setHistoricalLoading(false);
      }
    };

    fetchHistoricalData();
  }, [selectedIndex, dateRange]);

  useEffect(() => {
    const fetchEquities = async () => {
      if (!selectedIndex) return;

      // Only set loading state on initial load
      if (equities.length === 0) {
        setEquitiesLoading(true);
      }

      try {
        console.log('Fetching equities for index:', selectedIndex);
        const data = await api.getIndexEquities(selectedIndex);
        console.log('Received equities data:', data);
        
        const transformedData = data
          .filter(equity => equity.symbol !== selectedIndex)
          .map(equity => ({
            symbol: equity.symbol,
            companyName: equity.companyName,
            lastPrice: equity.lastPrice,
            change: equity.change,
            changePercent: equity.changePercent,
            open: equity.open,
            high: equity.high,
            low: equity.low,
            volume: equity.volume
          }));
        
        setEquities(transformedData);
      } catch (error) {
        console.error('Error fetching equities:', error);
      } finally {
        setEquitiesLoading(false);
      }
    };

    fetchEquities();
    const interval = setInterval(fetchEquities, 5000);
    return () => clearInterval(interval);
  }, [selectedIndex]);

  useEffect(() => {
    const fetchSelectedIndexData = async () => {
      if (!selectedIndex) return;

      try {
        const data = await api.getIndexEquities(selectedIndex);
        if (data && data.length > 0) {
          const selectedData = data.find(equity => equity.symbol === selectedIndex);
          if (selectedData) {
            setIndices(prevIndices => 
              prevIndices.map(index => 
                index.name === selectedIndex ? {
                  ...index,
                  metadata: {
                    ...index.metadata,
                    last: selectedData.lastPrice,
                    change: selectedData.change,
                    percChange: selectedData.changePercent,
                    open: selectedData.open,
                    high: selectedData.high,
                    low: selectedData.low
                  }
                } : index
              )
            );
          }
        }
      } catch (error) {
        console.error('Error refreshing selected index data:', error);
      }
    };

    fetchSelectedIndexData();
    const interval = setInterval(fetchSelectedIndexData, 5000);
    return () => clearInterval(interval);
  }, [selectedIndex]);

  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Open',
      dataIndex: 'open',
      key: 'open',
      render: (value: number) => value.toFixed(2),
    },
    {
      title: 'High',
      dataIndex: 'high',
      key: 'high',
      render: (value: number) => value.toFixed(2),
    },
    {
      title: 'Low',
      dataIndex: 'low',
      key: 'low',
      render: (value: number) => value.toFixed(2),
    },
    {
      title: 'Close',
      dataIndex: 'close',
      key: 'close',
      render: (value: number) => value.toFixed(2),
    },
    {
      title: 'Change',
      dataIndex: 'change',
      key: 'change',
      render: (value: number) => (
        <Tag color={value >= 0 ? 'success' : 'error'}>
          {value >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
          {Math.abs(value).toFixed(2)}
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
          {Math.abs(value).toFixed(2)}%
        </Tag>
      ),
    },
  ];

  const indexOptions = indices
    .filter(index => index.name !== selectedIndex)
    .map(index => ({
      value: index.name,
      label: `${index.name} - ${index.metadata.indexName}`,
    }));

  console.log('Current indices:', indices);
  console.log('Index options:', indexOptions);

  const chartData = historicalData
    .slice()
    .reverse()
    .map(record => ({
      date: record.date,
      open: record.open,
      high: record.high,
      low: record.low,
      close: record.close,
      body: Math.abs(record.close - record.open),
      bodyStart: Math.min(record.open, record.close),
      bodyEnd: Math.max(record.open, record.close),
      isUp: record.close > record.open
    })) as ChartDataRecord[];

  const selectedIndexData = indices.find(i => i.name === selectedIndex);

  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    }).format(value);
  };

  const formatInteger = (value: number): string => {
    return new Intl.NumberFormat('en-IN').format(Math.round(value));
  };

  const equityColumns = [
    {
      title: 'Symbol',
      dataIndex: 'symbol',
      key: 'symbol',
      render: (text: string) => (
        <a onClick={() => navigate(`/equity/${text}`)}>{text}</a>
      ),
      sorter: (a: EquityData, b: EquityData) => a.symbol.localeCompare(b.symbol),
    },
    {
      title: 'Company Name',
      dataIndex: 'companyName',
      key: 'companyName',
      sorter: (a: EquityData, b: EquityData) => a.companyName.localeCompare(b.companyName),
    },
    {
      title: 'Last Price',
      dataIndex: 'lastPrice',
      key: 'lastPrice',
      render: (value: number) => formatNumber(value),
      sorter: (a: EquityData, b: EquityData) => a.lastPrice - b.lastPrice,
    },
    {
      title: 'Change',
      dataIndex: 'change',
      key: 'change',
      render: (value: number) => (
        <Tag color={value >= 0 ? 'success' : 'error'}>
          {value >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
          {Math.abs(value).toFixed(2)}
        </Tag>
      ),
      sorter: (a: EquityData, b: EquityData) => a.change - b.change,
    },
    {
      title: 'Change %',
      dataIndex: 'changePercent',
      key: 'changePercent',
      render: (value: number) => (
        <Tag color={value >= 0 ? 'success' : 'error'}>
          {value >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
          {Math.abs(value).toFixed(2)}%
        </Tag>
      ),
      sorter: (a: EquityData, b: EquityData) => a.changePercent - b.changePercent,
    },
    {
      title: 'Open',
      dataIndex: 'open',
      key: 'open',
      render: (value: number) => formatNumber(value),
      sorter: (a: EquityData, b: EquityData) => a.open - b.open,
    },
    {
      title: 'High',
      dataIndex: 'high',
      key: 'high',
      render: (value: number) => formatNumber(value),
      sorter: (a: EquityData, b: EquityData) => a.high - b.high,
    },
    {
      title: 'Low',
      dataIndex: 'low',
      key: 'low',
      render: (value: number) => formatNumber(value),
      sorter: (a: EquityData, b: EquityData) => a.low - b.low,
    },
    {
      title: 'Volume',
      dataIndex: 'volume',
      key: 'volume',
      render: (value: number) => formatInteger(value),
      sorter: (a: EquityData, b: EquityData) => a.volume - b.volume,
    },
  ];

  const chartOptions = {
    chart: {
      type: 'candlestick',
      height: 600,
    },
    title: {
      text: `${selectedIndex} Price Chart`,
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
      name: selectedIndex,
      data: chartData.map(record => ({
        x: dayjs(record.date, 'DD-MMM-YYYY').valueOf(),
        open: record.open,
        high: record.high,
        low: record.low,
        close: record.close,
        color: record.isUp ? '#3f8600' : '#cf1322',
      })),
      upColor: '#3f8600',
      color: '#cf1322',
    }],
    credits: {
      enabled: false,
    },
  };

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Space>
                <Select
                  style={{ width: 300 }}
                  options={indexOptions}
                  value={selectedIndex}
                  onChange={setSelectedIndex}
                  loading={loading}
                />
              </Space>
              {selectedIndexData && (
                <Row gutter={16}>
                  <Col span={12}>
                    <Card size="small" style={{ height: '100%' }}>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Space>
                          <Typography.Text strong>Market Breadth</Typography.Text>
                          {equities.length > 0 && (
                            <>
                              <Tag color={equities.filter(e => e.change > 0).length > equities.filter(e => e.change < 0).length ? 'success' : 'error'}>
                                {equities.filter(e => e.change > 0).length > equities.filter(e => e.change < 0).length ? 
                                  <ArrowUpOutlined /> : <ArrowDownOutlined />}
                                {((equities.filter(e => e.change > 0).length / (equities.filter(e => e.change > 0).length + equities.filter(e => e.change < 0).length)) * 100).toFixed(1)}%
                              </Tag>
                              <Tooltip title="Market breadth shows the ratio of advancing to declining stocks. A percentage above 50% indicates more stocks are rising than falling, while below 50% indicates more stocks are falling than rising. This helps gauge overall market sentiment.">
                                <InfoCircleOutlined style={{ color: '#8c8c8c' }} />
                              </Tooltip>
                            </>
                          )}
                        </Space>
                        <Row gutter={8}>
                          <Col span={8}>
                            <Statistic
                              title="Advances"
                              value={equities.filter(e => e.change > 0).length}
                              loading={equitiesLoading && equities.length === 0}
                              valueStyle={{ color: '#3f8600' }}
                            />
                          </Col>
                          <Col span={8}>
                            <Statistic
                              title="Declines"
                              value={equities.filter(e => e.change < 0).length}
                              loading={equitiesLoading && equities.length === 0}
                              valueStyle={{ color: '#cf1322' }}
                            />
                          </Col>
                          <Col span={8}>
                            <Statistic
                              title="Unchanged"
                              value={equities.filter(e => e.change === 0).length}
                              loading={equitiesLoading && equities.length === 0}
                              valueStyle={{ color: '#8c8c8c' }}
                            />
                          </Col>
                        </Row>
                      </Space>
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card size="small" style={{ height: '100%' }}>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Space>
                          <Typography.Text strong>Index Statistics</Typography.Text>
                        </Space>
                        <Row gutter={4}>
                          <Col span={4}>
                            <Statistic
                              title={<StatisticTitle>Open</StatisticTitle>}
                              value={selectedIndexData.metadata.open}
                              precision={2}
                              loading={loading}
                              valueStyle={{ fontSize: '14px' }}
                            />
                          </Col>
                          <Col span={4}>
                            <Statistic
                              title={<StatisticTitle>High</StatisticTitle>}
                              value={selectedIndexData.metadata.high}
                              precision={2}
                              loading={loading}
                              valueStyle={{ fontSize: '14px' }}
                            />
                          </Col>
                          <Col span={4}>
                            <Statistic
                              title={<StatisticTitle>Low</StatisticTitle>}
                              value={selectedIndexData.metadata.low}
                              precision={2}
                              loading={loading}
                              valueStyle={{ fontSize: '14px' }}
                            />
                          </Col>
                          <Col span={4}>
                            <Statistic
                              title={<StatisticTitle>Close</StatisticTitle>}
                              value={selectedIndexData.metadata.last}
                              precision={2}
                              loading={loading}
                              valueStyle={{
                                fontSize: '14px',
                                color: selectedIndexData.metadata.change >= 0
                                  ? '#3f8600'
                                  : '#cf1322',
                              }}
                            />
                          </Col>
                          <Col span={4}>
                            <Statistic
                              title={<StatisticTitle>Change</StatisticTitle>}
                              value={selectedIndexData.metadata.change}
                              precision={2}
                              loading={loading}
                              valueStyle={{
                                fontSize: '14px',
                                color: selectedIndexData.metadata.change >= 0
                                  ? '#3f8600'
                                  : '#cf1322',
                              }}
                              prefix={selectedIndexData.metadata.change >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                            />
                          </Col>
                          <Col span={4}>
                            <Statistic
                              title={<StatisticTitle>Change %</StatisticTitle>}
                              value={selectedIndexData.metadata.percChange}
                              precision={2}
                              loading={loading}
                              valueStyle={{
                                fontSize: '14px',
                                color: selectedIndexData.metadata.change >= 0
                                  ? '#3f8600'
                                  : '#cf1322',
                              }}
                              prefix={selectedIndexData.metadata.change >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                              suffix="%"
                            />
                          </Col>
                        </Row>
                      </Space>
                    </Card>
                  </Col>
                </Row>
              )}
            </Space>
          </Card>
        </Col>
      </Row>

      {selectedIndex && (
        <>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Card 
                    title={
                      <Space>
                        Top Gainers
                        <Tag color="success">
                          <ArrowUpOutlined />
                          {equities.length > 0 ? equities.filter(e => e.change > 0).length : 0}
                        </Tag>
                      </Space>
                    }
                  >
                    <Table
                      size="small"
                      dataSource={[...equities]
                        .filter(e => e.change > 0)
                        .sort((a, b) => b.changePercent - a.changePercent)
                        .slice(0, 5)}
                      columns={[
                        {
                          title: 'Symbol',
                          dataIndex: 'symbol',
                          key: 'symbol',
                          render: (text: string) => (
                            <a onClick={() => navigate(`/equity/${text}`)}>{text}</a>
                          ),
                        },
                        {
                          title: 'Change %',
                          dataIndex: 'changePercent',
                          key: 'changePercent',
                          render: (value: number) => (
                            <Tag color="success">
                              <ArrowUpOutlined />
                              {value.toFixed(2)}%
                            </Tag>
                          ),
                        },
                        {
                          title: 'Price',
                          dataIndex: 'lastPrice',
                          key: 'lastPrice',
                          render: (value: number) => formatNumber(value),
                        },
                      ]}
                      pagination={false}
                      loading={equitiesLoading && equities.length === 0}
                    />
                  </Card>
                </Col>

                <Col span={12}>
                  <Card 
                    title={
                      <Space>
                        Top Losers
                        <Tag color="error">
                          <ArrowDownOutlined />
                          {equities.length > 0 ? equities.filter(e => e.change < 0).length : 0}
                        </Tag>
                      </Space>
                    }
                  >
                    <Table
                      size="small"
                      dataSource={[...equities]
                        .filter(e => e.change < 0)
                        .sort((a, b) => a.changePercent - b.changePercent)
                        .slice(0, 5)}
                      columns={[
                        {
                          title: 'Symbol',
                          dataIndex: 'symbol',
                          key: 'symbol',
                          render: (text: string) => (
                            <a onClick={() => navigate(`/equity/${text}`)}>{text}</a>
                          ),
                        },
                        {
                          title: 'Change %',
                          dataIndex: 'changePercent',
                          key: 'changePercent',
                          render: (value: number) => (
                            <Tag color="error">
                              <ArrowDownOutlined />
                              {Math.abs(value).toFixed(2)}%
                            </Tag>
                          ),
                        },
                        {
                          title: 'Price',
                          dataIndex: 'lastPrice',
                          key: 'lastPrice',
                          render: (value: number) => formatNumber(value),
                        },
                      ]}
                      pagination={false}
                      loading={equitiesLoading && equities.length === 0}
                    />
                  </Card>
                </Col>
              </Row>

              <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col span={12}>
                  <Card 
                    title={
                      <Space>
                        Most Active by Value
                      </Space>
                    }
                    bodyStyle={{ padding: 0 }}
                  >
                    <Table
                      size="small"
                      dataSource={[...equities]
                        .sort((a, b) => (b.lastPrice * b.volume) - (a.lastPrice * a.volume))
                        .slice(0, 5)}
                      columns={[
                        {
                          title: 'Symbol',
                          dataIndex: 'symbol',
                          key: 'symbol',
                          render: (text: string) => (
                            <a onClick={() => navigate(`/equity/${text}`)} style={{ fontSize: '12px' }}>{text}</a>
                          ),
                        },
                        {
                          title: 'LTP',
                          dataIndex: 'lastPrice',
                          key: 'lastPrice',
                          render: (value: number) => <span style={{ fontSize: '12px' }}>{formatNumber(value)}</span>,
                        },
                        {
                          title: 'Change',
                          dataIndex: 'change',
                          key: 'change',
                          render: (value: number) => (
                            <Tag color={value >= 0 ? 'success' : 'error'} style={{ fontSize: '12px' }}>
                              {value >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                              {Math.abs(value).toFixed(2)}
                            </Tag>
                          ),
                        },
                        {
                          title: 'Change %',
                          dataIndex: 'changePercent',
                          key: 'changePercent',
                          render: (value: number) => (
                            <Tag color={value >= 0 ? 'success' : 'error'} style={{ fontSize: '12px' }}>
                              {value >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                              {Math.abs(value).toFixed(2)}%
                            </Tag>
                          ),
                        },
                        {
                          title: 'Volume',
                          dataIndex: 'volume',
                          key: 'volume',
                          render: (value: number) => <span style={{ fontSize: '12px' }}>{formatInteger(value)}</span>,
                        },
                        {
                          title: 'Value (₹ Cr)',
                          dataIndex: 'lastPrice',
                          key: 'value',
                          render: (value: number, record: EquityData) => (
                            <span style={{ fontSize: '12px' }}>{(value * record.volume / 10000000).toFixed(2)}</span>
                          ),
                        },
                      ]}
                      pagination={false}
                      loading={equitiesLoading && equities.length === 0}
                      style={{ fontSize: '12px' }}
                    />
                  </Card>
                </Col>

                <Col span={12}>
                  <Card 
                    title={
                      <Space>
                        Most Active by Volume
                      </Space>
                    }
                    bodyStyle={{ padding: 0 }}
                  >
                    <Table
                      size="small"
                      dataSource={[...equities]
                        .sort((a, b) => b.volume - a.volume)
                        .slice(0, 5)}
                      columns={[
                        {
                          title: 'Symbol',
                          dataIndex: 'symbol',
                          key: 'symbol',
                          render: (text: string) => (
                            <a onClick={() => navigate(`/equity/${text}`)} style={{ fontSize: '12px' }}>{text}</a>
                          ),
                        },
                        {
                          title: 'LTP',
                          dataIndex: 'lastPrice',
                          key: 'lastPrice',
                          render: (value: number) => <span style={{ fontSize: '12px' }}>{formatNumber(value)}</span>,
                        },
                        {
                          title: 'Change',
                          dataIndex: 'change',
                          key: 'change',
                          render: (value: number) => (
                            <Tag color={value >= 0 ? 'success' : 'error'} style={{ fontSize: '12px' }}>
                              {value >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                              {Math.abs(value).toFixed(2)}
                            </Tag>
                          ),
                        },
                        {
                          title: 'Change %',
                          dataIndex: 'changePercent',
                          key: 'changePercent',
                          render: (value: number) => (
                            <Tag color={value >= 0 ? 'success' : 'error'} style={{ fontSize: '12px' }}>
                              {value >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                              {Math.abs(value).toFixed(2)}%
                            </Tag>
                          ),
                        },
                        {
                          title: 'Volume',
                          dataIndex: 'volume',
                          key: 'volume',
                          render: (value: number) => <span style={{ fontSize: '12px' }}>{formatInteger(value)}</span>,
                        },
                        {
                          title: 'Value (₹ Cr)',
                          dataIndex: 'lastPrice',
                          key: 'value',
                          render: (value: number, record: EquityData) => (
                            <span style={{ fontSize: '12px' }}>{(value * record.volume / 10000000).toFixed(2)}</span>
                          ),
                        },
                      ]}
                      pagination={false}
                      loading={equitiesLoading && equities.length === 0}
                      style={{ fontSize: '12px' }}
                    />
                  </Card>
                </Col>
              </Row>
            </Col>
          </Row>

          <Card title="Index Constituents" style={{ marginTop: 16 }}>
            <Table
              columns={equityColumns}
              dataSource={equities}
              rowKey="symbol"
              loading={equitiesLoading && equities.length === 0}
              pagination={{
                pageSize: equitiesPageSize,
                pageSizeOptions: ['10', '20', '50', '100'],
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `Total ${total} records`,
                position: ['bottomCenter'],
                onShowSizeChange: (current, size) => {
                  setEquitiesPageSize(size);
                }
              }}
            />
          </Card>
        </>
      )}

      {dateRange && (
        <Card title="Price Data" style={{ marginTop: 16 }}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Space>
              <RangePicker 
                value={dateRange}
                onChange={(dates) => {
                  if (dates && dates[0] && dates[1]) {
                    setDateRange([dates[0], dates[1]]);
                  }
                }}
                disabledDate={(current) => {
                  return current && current > dayjs().endOf('day');
                }}
                disabled={loading || historicalLoading}
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
                  key: 'table',
                  label: 'Historical Data',
                  children: (
                    <Table
                      columns={columns}
                      dataSource={historicalData}
                      rowKey="date"
                      loading={historicalLoading}
                      pagination={{
                        pageSize: historicalPageSize,
                        pageSizeOptions: ['10', '20', '50', '100'],
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total) => `Total ${total} records`,
                        position: ['bottomCenter'],
                        onShowSizeChange: (current, size) => {
                          setHistoricalPageSize(size);
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
    </div>
  );
};

export default Indices; 