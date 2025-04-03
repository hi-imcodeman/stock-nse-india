import React, { useState, useMemo } from 'react';
import { Card, Table, Tag, Space, Input, Tabs, Select } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import api, { OptionChainData, OptionDetails } from '../services/api';

const { Search } = Input;
const { Option } = Select;

interface TransformedOption extends OptionDetails {
  optionType: 'CE' | 'PE';
}

const Options: React.FC = () => {
  const [equityOptions, setEquityOptions] = useState<TransformedOption[]>([]);
  const [indexOptions, setIndexOptions] = useState<TransformedOption[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('equity');
  const [selectedExpiry, setSelectedExpiry] = useState<string>('');
  const [activeOptionType, setActiveOptionType] = useState<'CE' | 'PE'>('CE');

  // Get unique expiry dates from the current options data
  const expiryDates = useMemo(() => {
    const options = activeTab === 'equity' ? equityOptions : indexOptions;
    const uniqueDates = new Set(options.map(opt => opt.expiryDate));
    return Array.from(uniqueDates).sort();
  }, [equityOptions, indexOptions, activeTab]);

  // Filter options based on selected expiry date and option type
  const filteredOptions = useMemo(() => {
    const options = activeTab === 'equity' ? equityOptions : indexOptions;
    return options.filter(opt => {
      const matchesExpiry = !selectedExpiry || opt.expiryDate === selectedExpiry;
      const matchesType = opt.optionType === activeOptionType;
      return matchesExpiry && matchesType;
    });
  }, [equityOptions, indexOptions, activeTab, selectedExpiry, activeOptionType]);

  const columns = [
    {
      title: 'Strike Price',
      dataIndex: 'strikePrice',
      key: 'strikePrice',
      render: (value: number | undefined) => value?.toFixed(2) || '-',
    },
    {
      title: 'Expiry Date',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      render: (value: string | undefined) => value || '-',
    },
    {
      title: 'Open Interest',
      dataIndex: 'openInterest',
      key: 'openInterest',
      render: (value: number | undefined) => value?.toLocaleString() || '0',
    },
    {
      title: 'Change in OI',
      dataIndex: 'changeinOpenInterest',
      key: 'changeinOpenInterest',
      render: (value: number | undefined) => (
        <Tag color={(value || 0) >= 0 ? 'success' : 'error'}>
          {(value || 0).toLocaleString()}
        </Tag>
      ),
    },
    {
      title: 'IV',
      dataIndex: 'impliedVolatility',
      key: 'impliedVolatility',
      render: (value: number | undefined) => value ? `${value.toFixed(2)}%` : '-',
    },
    {
      title: 'LTP',
      dataIndex: 'lastPrice',
      key: 'lastPrice',
      render: (value: number | undefined) => value?.toFixed(2) || '-',
    },
    {
      title: 'Change',
      dataIndex: 'change',
      key: 'change',
      render: (value: number | undefined) => (
        <Tag color={(value || 0) >= 0 ? 'success' : 'error'}>
          {(value || 0).toFixed(2)}
        </Tag>
      ),
    },
    {
      title: 'Bid',
      dataIndex: 'bidprice',
      key: 'bidprice',
      render: (value: number | undefined) => value?.toFixed(2) || '-',
    },
    {
      title: 'Bid Qty',
      dataIndex: 'bidQty',
      key: 'bidQty',
      render: (value: number | undefined) => value?.toLocaleString() || '0',
    },
    {
      title: 'Ask',
      dataIndex: 'askPrice',
      key: 'askPrice',
      render: (value: number | undefined) => value?.toFixed(2) || '-',
    },
    {
      title: 'Ask Qty',
      dataIndex: 'askQty',
      key: 'askQty',
      render: (value: number | undefined) => value?.toLocaleString() || '0',
    },
  ];

  const transformOptionsData = (data: OptionChainData): TransformedOption[] => {
    console.log('Transforming options data:', data);
    if (!data.records || !data.records.data) {
      console.error('Invalid data structure:', data);
      return [];
    }

    return data.records.data.flatMap((record) => {
      const options: TransformedOption[] = [];
      if (record.CE) {
        console.log('CE record before transform:', record.CE);
        const transformedCE: TransformedOption = {
          ...record.CE,
          optionType: 'CE' as const,
          changeinOpenInterest: Number(record.CE.changeinOpenInterest) || 0,
          change: Number(record.CE.change) || 0,
          askPrice: Number(record.CE.askPrice) || 0,
          askQty: Number(record.CE.askQty) || 0,
          bidprice: Number(record.CE.bidprice) || 0,
          bidQty: Number(record.CE.bidQty) || 0,
          lastPrice: Number(record.CE.lastPrice) || 0,
          openInterest: Number(record.CE.openInterest) || 0,
          impliedVolatility: Number(record.CE.impliedVolatility) || 0,
        };
        console.log('CE record after transform:', transformedCE);
        options.push(transformedCE);
      }
      if (record.PE) {
        console.log('PE record before transform:', record.PE);
        const transformedPE: TransformedOption = {
          ...record.PE,
          optionType: 'PE' as const,
          changeinOpenInterest: Number(record.PE.changeinOpenInterest) || 0,
          change: Number(record.PE.change) || 0,
          askPrice: Number(record.PE.askPrice) || 0,
          askQty: Number(record.PE.askQty) || 0,
          bidprice: Number(record.PE.bidprice) || 0,
          bidQty: Number(record.PE.bidQty) || 0,
          lastPrice: Number(record.PE.lastPrice) || 0,
          openInterest: Number(record.PE.openInterest) || 0,
          impliedVolatility: Number(record.PE.impliedVolatility) || 0,
        };
        console.log('PE record after transform:', transformedPE);
        options.push(transformedPE);
      }
      return options;
    });
  };

  const fetchOptions = async (symbol: string, type: 'equity' | 'index') => {
    if (!symbol) return;

    setLoading(true);
    try {
      const data = await (type === 'equity' ? api.getEquityOptions(symbol) : api.getIndexOptions(symbol));
      console.log(`Raw ${type} options data:`, data);
      if (type === 'equity') {
        setEquityOptions(transformOptionsData(data));
      } else {
        const transformedData = transformOptionsData(data);
        console.log('Final transformed index options:', transformedData);
        setIndexOptions(transformedData);
      }
    } catch (error) {
      console.error(`Error fetching ${type} options:`, error);
      if (type === 'equity') {
        setEquityOptions([]);
      } else {
        setIndexOptions([]);
      }
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
    setSelectedExpiry(''); // Reset expiry filter when changing tabs
    if (selectedSymbol) {
      fetchOptions(selectedSymbol, key as 'equity' | 'index');
    }
  };

  const handleExpiryChange = (value: string) => {
    setSelectedExpiry(value);
  };

  const handleOptionTypeChange = (key: string) => {
    setActiveOptionType(key as 'CE' | 'PE');
  };

  const optionTypeItems = [
    {
      key: 'CE',
      label: 'Call Options',
      children: (
        <Table
          columns={columns}
          dataSource={filteredOptions}
          rowKey={(record) => `${record.strikePrice}-${record.expiryDate}`}
          loading={loading}
          pagination={false}
          scroll={{ x: true }}
        />
      ),
    },
    {
      key: 'PE',
      label: 'Put Options',
      children: (
        <Table
          columns={columns}
          dataSource={filteredOptions}
          rowKey={(record) => `${record.strikePrice}-${record.expiryDate}`}
          loading={loading}
          pagination={false}
          scroll={{ x: true }}
        />
      ),
    },
  ];

  const items = [
    {
      key: 'equity',
      label: 'Equity Options',
      children: (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Tabs
            activeKey={activeOptionType}
            onChange={handleOptionTypeChange}
            items={optionTypeItems}
          />
        </Space>
      ),
    },
    {
      key: 'index',
      label: 'Index Options',
      children: (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Tabs
            activeKey={activeOptionType}
            onChange={handleOptionTypeChange}
            items={optionTypeItems}
          />
        </Space>
      ),
    },
  ];

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
            <Select
              placeholder="Select Expiry Date"
              allowClear
              style={{ width: 200 }}
              onChange={handleExpiryChange}
              value={selectedExpiry}
            >
              {expiryDates.map(date => (
                <Option key={date} value={date}>{date}</Option>
              ))}
            </Select>
          </Space>

          <Tabs activeKey={activeTab} onChange={handleTabChange} items={items} />
        </Space>
      </Card>
    </div>
  );
};

export default Options; 