import React from 'react';
import { Layout, Menu, Typography } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  LineChartOutlined,
  StockOutlined,
  SettingOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;

interface LayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  // Function to get the base path from the current location
  const getBasePath = (path: string) => {
    const segments = path.split('/');
    const basePath = segments[1] || '';
    
    // Handle parameterized routes
    if (basePath === 'index' || basePath === 'equity') {
      return basePath === 'index' ? 'indices' : 'equities';
    }
    
    return basePath;
  };

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: <Link to="/">Dashboard</Link>,
    },
    {
      key: 'indices',
      icon: <LineChartOutlined />,
      label: <Link to="/indices">Indices</Link>,
    },
    {
      key: 'equities',
      icon: <StockOutlined />,
      label: <Link to="/equities">Equities</Link>,
    },
    {
      key: 'equities-widget',
      icon: <AppstoreOutlined />,
      label: <Link to="/equities-widget">Equities Widget</Link>,
    },
    {
      key: 'options',
      icon: <SettingOutlined />,
      label: <Link to="/options">Options</Link>,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={200} theme="dark">
        <div style={{ 
          height: 64, 
          margin: 16, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: 4
        }}>
          <Typography.Title level={4} style={{ color: '#fff', margin: 0 }}>
            NSE India
          </Typography.Title>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[getBasePath(location.pathname)]}
          items={menuItems}
          style={{ height: '100%', borderRight: 0 }}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: '#fff' }} />
        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout; 