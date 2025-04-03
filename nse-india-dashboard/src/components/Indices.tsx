import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, DatePicker, Select, Space, Spin } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import api from '../services/api';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line } from 'recharts';

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

const Indices: React.FC = () => {
  const [indices, setIndices] = useState<IndexData[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<string>('');
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
        
        // Only set the first index if no index is currently selected
        if (data.length > 0 && !selectedIndex) {
          console.log('Setting first index as selected:', data[0].name);
          setSelectedIndex(data[0].name);
        }
      } catch (error) {
        console.error('Error fetching indices:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchIndices();
    const interval = setInterval(fetchIndices, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [selectedIndex]); // Add selectedIndex to dependencies

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

      setEquitiesLoading(true);
      try {
        console.log('Fetching equities for index:', selectedIndex);
        const data = await api.getIndexEquities(selectedIndex);
        console.log('Received equities data:', data);
        
        const transformedData = data.map(equity => ({
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

  const indexOptions = indices.map(index => ({
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
                />
              </Space>
              {selectedIndexData && (
                <Row gutter={16}>
                  <Col span={6}>
                    <Statistic
                      title="Open"
                      value={selectedIndexData.metadata.open}
                      precision={2}
                      loading={loading}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="High"
                      value={selectedIndexData.metadata.high}
                      precision={2}
                      loading={loading}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="Low"
                      value={selectedIndexData.metadata.low}
                      precision={2}
                      loading={loading}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="Close"
                      value={selectedIndexData.metadata.last}
                      precision={2}
                      loading={loading}
                      valueStyle={{
                        color: selectedIndexData.metadata.change >= 0
                          ? '#3f8600'
                          : '#cf1322',
                      }}
                    />
                  </Col>
                </Row>
              )}
            </Space>
          </Card>
        </Col>
      </Row>

      {selectedIndex && (
        <Card title="Index Constituents" style={{ marginTop: 16 }}>
          <Table
            columns={equityColumns}
            dataSource={equities}
            rowKey="symbol"
            loading={equitiesLoading}
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
      )}

      {dateRange && (
        <>
          <Card title="Price Chart" style={{ marginTop: 16 }}>
            <div style={{ height: 600, paddingLeft: 20, paddingBottom: 20, position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    domain={[(dataMin: number) => dataMin * 0.999, (dataMax: number) => dataMax * 1.001]}
                    tickFormatter={(value) => formatInteger(value)}
                    width={80}
                  />
                  <Tooltip 
                    formatter={(value: number, name: string) => [formatNumber(value), name]}
                  />
                  <Legend 
                    verticalAlign="top"
                    height={36}
                    wrapperStyle={{ paddingBottom: 20 }}
                  />
                  {/* Open price line */}
                  <Line
                    type="monotone"
                    dataKey="open"
                    name="Open"
                    stroke="#1890ff"
                    strokeWidth={2}
                    dot={false}
                  />
                  {/* Close price line */}
                  <Line
                    type="monotone"
                    dataKey="close"
                    name="Close"
                    stroke="#722ed1"
                    strokeWidth={2}
                    dot={false}
                  />
                  {/* High-Low wicks */}
                  <Line
                    type="monotone"
                    dataKey="high"
                    name="High"
                    stroke="#82ca9d"
                    strokeWidth={1}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="low"
                    name="Low"
                    stroke="#ff7875"
                    strokeWidth={1}
                    dot={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
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
          </Card>

          <Card title="Historical Data" style={{ marginTop: 16 }}>
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
          </Card>
        </>
      )}
    </div>
  );
};

export default Indices; 