import React, { useEffect, useState } from 'react';
import { Card, Input, DatePicker, Table, Statistic, Row, Col } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import api, { EquityDetails } from '../services/api';
import dayjs from 'dayjs';

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

  useEffect(() => {
    if (searchText) {
      fetchEquityDetails();
    }
  }, [searchText]);

  useEffect(() => {
    if (searchText && dateRange) {
      fetchHistoricalData();
    }
  }, [searchText, dateRange]);

  const fetchEquityDetails = async () => {
    try {
      setLoading(true);
      const data = await api.getEquityDetails(searchText);
      setEquity(data);
    } catch (error) {
      console.error('Error fetching equity details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistoricalData = async () => {
    if (!dateRange) return;
    try {
      setLoading(true);
      const data = await api.getEquityHistorical(
        searchText,
        dateRange[0].format('YYYY-MM-DD'),
        dateRange[1].format('YYYY-MM-DD')
      );
      setHistoricalData(data);
    } catch (error) {
      console.error('Error fetching historical data:', error);
    } finally {
      setLoading(false);
    }
  };

  const equityColumns = [
    {
      title: 'Symbol',
      dataIndex: 'symbol',
      key: 'symbol',
    },
    {
      title: 'Company Name',
      dataIndex: 'companyName',
      key: 'companyName',
    },
    {
      title: 'Industry',
      dataIndex: 'industry',
      key: 'industry',
    },
    {
      title: 'Series',
      dataIndex: 'series',
      key: 'series',
    },
    {
      title: 'ISIN Code',
      dataIndex: 'isinCode',
      key: 'isinCode',
    },
    {
      title: 'Face Value',
      dataIndex: 'faceValue',
      key: 'faceValue',
      render: (value: number) => value?.toFixed(2) || '0.00',
    },
    {
      title: 'Market Lot',
      dataIndex: 'marketLot',
      key: 'marketLot',
      render: (value: number) => value || '0',
    },
    {
      title: 'Issue Price',
      dataIndex: 'issuePrice',
      key: 'issuePrice',
      render: (value: number) => value?.toFixed(2) || '0.00',
    },
    {
      title: 'Issue Date',
      dataIndex: 'issueDate',
      key: 'issueDate',
    },
    {
      title: 'Listing Date',
      dataIndex: 'listingDate',
      key: 'listingDate',
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
      render: (value: number) => value?.toFixed(2) || '0.00',
    },
    {
      title: 'High',
      dataIndex: 'high',
      key: 'high',
      render: (value: number) => value?.toFixed(2) || '0.00',
    },
    {
      title: 'Low',
      dataIndex: 'low',
      key: 'low',
      render: (value: number) => value?.toFixed(2) || '0.00',
    },
    {
      title: 'Close',
      dataIndex: 'close',
      key: 'close',
      render: (value: number) => value?.toFixed(2) || '0.00',
    },
    {
      title: 'Change',
      dataIndex: 'change',
      key: 'change',
      render: (value: number) => value?.toFixed(2) || '0.00',
    },
    {
      title: 'Change %',
      dataIndex: 'changePercent',
      key: 'changePercent',
      render: (value: number) => value?.toFixed(2) || '0.00',
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
            onPressEnter={fetchEquityDetails}
          />
        </Col>
        <Col span={12}>
          <RangePicker
            onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
            style={{ width: '100%' }}
          />
        </Col>
      </Row>

      {equity && (
        <Card style={{ marginTop: 16 }}>
          <Row gutter={[16, 16]}>
            <Col span={8}>
              <Statistic
                title="Symbol"
                value={equity.symbol}
                valueStyle={{ color: '#1890ff' }}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="Company Name"
                value={equity.companyName}
                valueStyle={{ color: '#1890ff' }}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="Industry"
                value={equity.industry}
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
          rowKey="symbol"
          loading={loading}
          pagination={false}
        />
      </Card>

      {historicalData.length > 0 && (
        <Card style={{ marginTop: 16 }}>
          <Table
            columns={historicalColumns}
            dataSource={historicalData}
            rowKey="date"
            loading={loading}
            pagination={false}
          />
        </Card>
      )}
    </div>
  );
};

export default Equities; 