import React, { useState, useEffect } from 'react';
import { Layout, Menu, Typography, Card, Row, Col, Statistic, Table, Tag, Button } from 'antd';
import { 
  DashboardOutlined, 
  ShoppingOutlined, 
  ShoppingCartOutlined, 
  UserOutlined, 
  BarChartOutlined,
  LogoutOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { salesService, productService, customersService } from '../services/api';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [analyticsData, topProductsData, lowStockData] = await Promise.all([
        salesService.getAnalytics(),
        salesService.getTopProducts(5),
        productService.getLowStock()
      ]);
      setAnalytics(analyticsData);
      setTopProducts(topProductsData);
      setLowStockProducts(lowStockData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { key: '/', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/products', icon: <ShoppingOutlined />, label: 'Products' },
    { key: '/sales', icon: <ShoppingCartOutlined />, label: 'Sales' },
    { key: '/purchases', icon: <PlusOutlined />, label: 'Purchases' },
    { key: '/customers', icon: <UserOutlined />, label: 'Customers' },
    { key: '/reports', icon: <BarChartOutlined />, label: 'Reports' },
  ];

  const topProductsColumns = [
    { title: 'Product', dataIndex: 'productName', key: 'productName' },
    { title: 'Category', dataIndex: 'category', key: 'category' },
    { 
      title: 'Qty Sold', 
      dataIndex: 'totalQuantitySold', 
      key: 'totalQuantitySold',
      sorter: (a, b) => a.totalQuantitySold - b.totalQuantitySold
    },
    { 
      title: 'Revenue', 
      dataIndex: 'totalRevenue', 
      key: 'totalRevenue',
      render: (amount) => `৳${amount.toFixed(2)}`
    },
    { 
      title: 'Profit', 
      dataIndex: 'totalProfit', 
      key: 'totalProfit',
      render: (amount) => `৳${amount.toFixed(2)}`,
      sorter: (a, b) => a.totalProfit - b.totalProfit
    }
  ];

  const lowStockColumns = [
    { title: 'Product', dataIndex: 'name', key: 'name' },
    { title: 'Current Stock', dataIndex: 'currentStock', key: 'currentStock' },
    { title: 'Min Level', dataIndex: 'minStockLevel', key: 'minStockLevel' },
    { 
      title: 'Status', 
      key: 'status',
      render: (_, record) => (
        <Tag color="red">Low Stock</Tag>
      )
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider theme="dark" collapsible>
        <div style={{ padding: 16, textAlign: 'center' }}>
          <Title level={4} style={{ color: 'white', margin: 0 }}>Grocery ERP</Title>
          <Typography.Text style={{ color: 'rgba(255,255,255,0.7)' }}>{user?.name}</Typography.Text>
        </div>
        <Menu theme="dark" mode="inline" items={menuItems} />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={4} style={{ margin: 0 }}>Dashboard</Title>
          <Button icon={<LogoutOutlined />} onClick={logout}>Logout</Button>
        </Header>
        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic 
                  title="Total Sales Today" 
                  value={analytics?.totalSales || 0} 
                  precision={2}
                  prefix="৳"
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic 
                  title="Total Profit" 
                  value={analytics?.totalProfit || 0} 
                  precision={2}
                  prefix="৳"
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic 
                  title="Transactions" 
                  value={analytics?.totalTransactions || 0}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic 
                  title="Low Stock Items" 
                  value={lowStockProducts.length}
                  valueStyle={{ color: '#cf1322' }}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
            <Col xs={24} lg={12}>
              <Card title="Top Selling Products">
                <Table 
                  columns={topProductsColumns} 
                  dataSource={topProducts} 
                  pagination={false}
                  size="small"
                />
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="Low Stock Alert">
                <Table 
                  columns={lowStockColumns} 
                  dataSource={lowStockProducts} 
                  pagination={false}
                  size="small"
                />
                {lowStockProducts.length > 0 && (
                  <Button type="primary" onClick={() => navigate('/purchases')} style={{ marginTop: 16 }}>
                    Restock Now
                  </Button>
                )}
              </Card>
            </Col>
          </Row>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Dashboard;
