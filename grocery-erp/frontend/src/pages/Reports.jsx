import React, { useState, useEffect } from 'react';
import { Card, Row, Col, DatePicker, Select, Statistic, Table, Typography } from 'antd';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { salesService } from '../services/api';
import dayjs from 'dayjs';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const Reports = () => {
  const [analytics, setAnalytics] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [trend, setTrend] = useState([]);
  const [period, setPeriod] = useState('daily');
  const [dateRange, setDateRange] = useState([dayjs().subtract(30, 'day'), dayjs()]);

  useEffect(() => {
    loadReports();
  }, [period, dateRange]);

  const loadReports = async () => {
    try {
      const [analyticsData, topProductsData, trendData] = await Promise.all([
        salesService.getAnalytics({
          startDate: dateRange[0].toISOString(),
          endDate: dateRange[1].toISOString()
        }),
        salesService.getTopProducts(10),
        salesService.getTrend(period, 30)
      ]);
      setAnalytics(analyticsData);
      setTopProducts(topProductsData);
      setTrend(trendData);
    } catch (error) {
      console.error('Error loading reports:', error);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  const profitData = topProducts.map(p => ({
    name: p.productName.substring(0, 15),
    profit: p.totalProfit
  }));

  return (
    <div style={{ padding: 24 }}>
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16} align="middle">
          <Col><Title level={4}>Business Intelligence Reports</Title></Col>
          <Col>
            <Select value={period} onChange={setPeriod} style={{ width: 120 }}>
              <Option value="daily">Daily</Option>
              <Option value="weekly">Weekly</Option>
              <Option value="monthly">Monthly</Option>
            </Select>
          </Col>
          <Col>
            <RangePicker value={dateRange} onChange={setDateRange} />
          </Col>
        </Row>
      </Card>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title="Total Sales" value={analytics?.totalSales || 0} precision={2} prefix="৳" />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title="Total Profit" value={analytics?.totalProfit || 0} precision={2} prefix="৳" valueStyle={{ color: '#3f8600' }} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title="Transactions" value={analytics?.totalTransactions || 0} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Sales Trend">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="totalSales" stroke="#8884d8" name="Sales" />
                <Line type="monotone" dataKey="totalProfit" stroke="#82ca9d" name="Profit" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Profit by Product">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={profitData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="profit" fill="#8884d8" name="Profit" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24}>
          <Card title="Top Selling Products">
            <Table
              columns={[
                { title: 'Product', dataIndex: 'productName', key: 'productName' },
                { title: 'Category', dataIndex: 'category', key: 'category' },
                { title: 'Quantity Sold', dataIndex: 'totalQuantitySold', key: 'totalQuantitySold', sorter: (a, b) => a.totalQuantitySold - b.totalQuantitySold },
                { title: 'Revenue', dataIndex: 'totalRevenue', key: 'totalRevenue', render: (v) => `৳${v.toFixed(2)}` },
                { title: 'Profit', dataIndex: 'totalProfit', key: 'totalProfit', render: (v) => `৳${v.toFixed(2)}`, sorter: (a, b) => a.totalProfit - b.totalProfit }
              ]}
              dataSource={topProducts}
              rowKey="productId"
              pagination={false}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Reports;
