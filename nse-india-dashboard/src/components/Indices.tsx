import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, DatePicker, Select, Space } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import api, { IndexDetails } from '../services/api';
import type { Dayjs } from 'dayjs';

const { RangePicker } = DatePicker;

const Indices: React.FC = () => {
  const [indices, setIndices] = useState<IndexDetails[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<string>('');
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);

  useEffect(() => {
    const fetchIndices = async () => {
      try {
        const data = await api.getAllIndices();
        setIndices(data);
        if (data.length > 0) {
          setSelectedIndex(data[0].indexSymbol);
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
  }, []);

  useEffect(() => {
    const fetchHistoricalData = async () => {
      if (!selectedIndex || !dateRange) return;

      try {
        const [startDate, endDate] = dateRange;
        const data = await api.getIndexHistorical(
          selectedIndex,
          startDate.format('YYYY-MM-DD'),
          endDate.format('YYYY-MM-DD')
        );
        setHistoricalData(data);
      } catch (error) {
        console.error('Error fetching historical data:', error);
      }
    };

    fetchHistoricalData();
  }, [selectedIndex, dateRange]);

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
    value: index.indexSymbol,
    label: `${index.indexSymbol} - ${index.indexName}`,
  }));

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
                />
                <RangePicker onChange={setDateRange} />
              </Space>
              {selectedIndex && indices.find(i => i.indexSymbol === selectedIndex) && (
                <Row gutter={16}>
                  <Col span={6}>
                    <Statistic
                      title="Open"
                      value={indices.find(i => i.indexSymbol === selectedIndex)?.open}
                      precision={2}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="High"
                      value={indices.find(i => i.indexSymbol === selectedIndex)?.high}
                      precision={2}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="Low"
                      value={indices.find(i => i.indexSymbol === selectedIndex)?.low}
                      precision={2}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="Close"
                      value={indices.find(i => i.indexSymbol === selectedIndex)?.close}
                      precision={2}
                      valueStyle={{
                        color: indices.find(i => i.indexSymbol === selectedIndex)?.change >= 0
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

      {dateRange && (
        <Card title="Historical Data" style={{ marginTop: 16 }}>
          <Table
            columns={columns}
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

export default Indices; 