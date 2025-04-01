import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Table, Tag, Select, Space, Input, Tabs } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import api, { OptionChain } from '../services/api';

const { Search } = Input;
const { TabPane } = Tabs;

const Options: React.FC = () => {
  const [equityOptions, setEquityOptions] = useState<OptionChain[]>([]);
  const [indexOptions, setIndexOptions] = useState<OptionChain[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('equity');

  const columns = [
    {
      title: 'Strike Price',
      dataIndex: 'strikePrice',
      key: 'strikePrice',
      render: (value: number) => value.toFixed(2),
    },
    {
      title: 'Expiry Date',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
    },
    {
      title: 'Open Interest',
      dataIndex: 'openInterest',
      key: 'openInterest',
      render: (value: number) => value.toLocaleString(),
    },
    {
      title: 'Change in OI',
      dataIndex: 'changeInOpenInterest',
      key: 'changeInOpenInterest',
      render: (value: number) => (
        <Tag color={value >= 0 ? 'success' : 'error'}>
          {value.toLocaleString()}
        </Tag>
      ),
    },
    {
      title: 'IV',
      dataIndex: 'impliedVolatility',
      key: 'impliedVolatility',
      render: (value: number) => `${value.toFixed(2)}%`,
    },
    {
      title: 'LTP',
      dataIndex: 'lastPrice',
      key: 'lastPrice',
      render: (value: number) => value.toFixed(2),
    },
    {
      title: 'Change',
      dataIndex: 'change',
      key: 'change',
      render: (value: number) => (
        <Tag color={value >= 0 ? 'success' : 'error'}>
          {value.toFixed(2)}
        </Tag>
      ),
    },
    {
      title: 'Bid',
      dataIndex: 'bidPrice',
      key: 'bidPrice',
      render: (value: number) => value.toFixed(2),
    },
    {
      title: 'Bid Qty',
      dataIndex: 'bidQty',
      key: 'bidQty',
      render: (value: number) => value.toLocaleString(),
    },
    {
      title: 'Ask',
      dataIndex: 'askPrice',
      key: 'askPrice',
      render: (value: number) => value.toFixed(2),
    },
    {
      title: 'Ask Qty',
      dataIndex: 'askQty',
      key: 'askQty',
      render: (value: number) => value.toLocaleString(),
    },
  ];

  const fetchOptions = async (symbol: string, type: 'equity' | 'index') => {
    if (!symbol) return;

    setLoading(true);
    try {
      const data = await (type === 'equity' ? api.getEquityOptions(symbol) : api.getIndexOptions(symbol));
      if (type === 'equity') {
        setEquityOptions(data);
      } else {
        setIndexOptions(data);
      }
    } catch (error) {
      console.error(`Error fetching ${type} options:`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSelectedSymbol(value);
    if (value) {
      fetchOptions(value.toUpperCase(), activeTab as 'equity' | 'index');
    }
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    if (selectedSymbol) {
      fetchOptions(selectedSymbol, key as 'equity' | 'index');
    }
  };

  return (
    <div>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Space>
            <Search
              placeholder={`Enter ${activeTab} symbol`}
              allowClear
              enterButton={<SearchOutlined />}
              onSearch={handleSearch}
              style={{ width: 300 }}
            />
          </Space>

          <Tabs activeKey={activeTab} onChange={handleTabChange}>
            <TabPane tab="Equity Options" key="equity">
              <Table
                columns={columns}
                dataSource={equityOptions}
                rowKey={(record) => `${record.strikePrice}-${record.expiryDate}`}
                loading={loading}
                pagination={false}
                scroll={{ x: true }}
              />
            </TabPane>
            <TabPane tab="Index Options" key="index">
              <Table
                columns={columns}
                dataSource={indexOptions}
                rowKey={(record) => `${record.strikePrice}-${record.expiryDate}`}
                loading={loading}
                pagination={false}
                scroll={{ x: true }}
              />
            </TabPane>
          </Tabs>
        </Space>
      </Card>
    </div>
  );
};

export default Options; 