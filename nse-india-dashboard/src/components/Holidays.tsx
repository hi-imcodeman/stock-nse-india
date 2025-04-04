import React, { useEffect, useState } from 'react';
import { Card, Table, Typography, Tag } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import api from '../services/api';
import { Holiday } from '../../../src/interface';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;

interface HolidayWithType extends Holiday {
  type: 'trading' | 'clearing';
  id: string; // Add a unique identifier
}

interface HolidayResponse {
  [key: string]: Holiday[];
}

const Holidays: React.FC = () => {
  const [holidays, setHolidays] = useState<HolidayWithType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        console.log('Fetching holidays...');
        const tradingResponse = (await api.getHolidays('trading')) as unknown as HolidayResponse;
        const clearingResponse = (await api.getHolidays('clearing')) as unknown as HolidayResponse;
        
        console.log('Trading holidays response:', tradingResponse);
        console.log('Clearing holidays response:', clearingResponse);
        
        // Extract all holidays from each market segment
        const tradingHolidays: Holiday[] = [];
        const clearingHolidays: Holiday[] = [];
        
        // Process trading holidays
        Object.values(tradingResponse).forEach(segmentHolidays => {
          if (Array.isArray(segmentHolidays)) {
            tradingHolidays.push(...segmentHolidays);
          }
        });
        
        // Process clearing holidays
        Object.values(clearingResponse).forEach(segmentHolidays => {
          if (Array.isArray(segmentHolidays)) {
            clearingHolidays.push(...segmentHolidays);
          }
        });
        
        console.log('Processed trading holidays:', tradingHolidays);
        console.log('Processed clearing holidays:', clearingHolidays);

        // Add type to each holiday and create a unique ID
        const tradingWithType = tradingHolidays.map(h => ({ 
          ...h, 
          type: 'trading' as const,
          id: `${h.tradingDate}-trading`
        }));
        
        const clearingWithType = clearingHolidays.map(h => ({ 
          ...h, 
          type: 'clearing' as const,
          id: `${h.tradingDate}-clearing`
        }));
        
        // Combine all holidays
        const allHolidays = [...tradingWithType, ...clearingWithType];
        
        // Remove duplicates based on tradingDate and type
        const uniqueHolidays = allHolidays.reduce((acc, current) => {
          const x = acc.find(item => 
            item.tradingDate === current.tradingDate && 
            item.type === current.type
          );
          if (!x) {
            return acc.concat([current]);
          } else {
            return acc;
          }
        }, [] as HolidayWithType[]);
        
        // Sort by date
        const sortedHolidays = uniqueHolidays.sort((a, b) => 
          dayjs(a.tradingDate).valueOf() - dayjs(b.tradingDate).valueOf()
        );
        
        console.log('Combined unique holidays:', sortedHolidays);
        
        setHolidays(sortedHolidays);
      } catch (error) {
        console.error('Error fetching holiday data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHolidays();
  }, []);

  const columns: ColumnsType<HolidayWithType> = [
    {
      title: 'Date',
      dataIndex: 'tradingDate',
      key: 'tradingDate',
      render: (date: string) => dayjs(date).format('DD MMM YYYY'),
      sorter: (a: HolidayWithType, b: HolidayWithType) => dayjs(a.tradingDate).valueOf() - dayjs(b.tradingDate).valueOf(),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text: string, record: HolidayWithType) => text || record.holiday || 'Holiday',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: 'trading' | 'clearing') => (
        <Tag color={type === 'trading' ? 'blue' : 'orange'}>
          {type === 'trading' ? 'Trading Holiday' : 'Clearing Holiday'}
        </Tag>
      ),
      filters: [
        { text: 'Trading Holiday', value: 'trading' },
        { text: 'Clearing Holiday', value: 'clearing' },
      ],
      onFilter: (value, record) => record.type === value,
    },
  ];

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>
        <CalendarOutlined style={{ marginRight: 12 }} />
        NSE India Holidays
      </Title>

      <Card loading={loading}>
        <Table
          columns={columns}
          dataSource={holidays}
          rowKey="id"
          pagination={{
            defaultPageSize: 10,
            pageSizeOptions: ['10', '20', '50', '100'],
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Total ${total} holidays`,
            position: ['bottomRight'],
            size: 'default',
          }}
        />
      </Card>
    </div>
  );
};

export default Holidays; 