import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Table, Statistic } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import api, { MarketStatus, IndexDetails } from '../services/api';

const Dashboard: React.FC = () => {
  const [marketStatus, setMarketStatus] = useState<MarketStatus>({
    marketState: 'Unknown',
    marketStatus: 'Unknown'
  });
  const [indices, setIndices] = useState<IndexDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statusData, indicesData] = await Promise.all([
          api.getMarketStatus(),
          api.getAllIndices()
        ]);
        console.log('Market Status:', statusData); // Debug log
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

  const columns = [
    {
      title: 'Index',
      dataIndex: 'indexSymbol',
      key: 'indexSymbol',
    },
    {
      title: 'Name',
      dataIndex: 'indexName',
      key: 'indexName',
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
        <span style={{ color: value >= 0 ? '#3f8600' : '#cf1322' }}>
          {value >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />} {Math.abs(value).toFixed(2)}
        </span>
      ),
    },
    {
      title: 'Change %',
      dataIndex: 'changePercent',
      key: 'changePercent',
      render: (value: number) => (
        <span style={{ color: value >= 0 ? '#3f8600' : '#cf1322' }}>
          {value >= 0 ? '+' : ''}{value.toFixed(2)}%
        </span>
      ),
    },
  ];

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Market State"
              value={String(marketStatus.marketState)}
              valueStyle={{ color: marketStatus.marketState === 'Open' ? '#3f8600' : '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Market Status"
              value={String(marketStatus.marketStatus)}
              valueStyle={{ color: marketStatus.marketStatus === 'Open' ? '#3f8600' : '#cf1322' }}
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
      </Row>
      <Card style={{ marginTop: 16 }}>
        <Table
          columns={columns}
          dataSource={indices}
          rowKey="indexSymbol"
          loading={loading}
          pagination={false}
        />
      </Card>
    </div>
  );
};

export default Dashboard; 