import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, message, Space } from 'antd';
import { UserOutlined, LockOutlined, ShopOutlined } from '@ant-design/icons';
import { authService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const { Title } = Typography;

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await authService.login(values);
      login(response.shop, response.token);
      message.success('Login successful!');
      navigate('/');
    } catch (error) {
      message.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <Card style={{ width: 400, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <ShopOutlined style={{ fontSize: 48, color: '#667eea' }} />
          <Title level={2} style={{ marginTop: 10 }}>Grocery ERP</Title>
          <Typography.Text type="secondary">Shop Management System</Typography.Text>
        </div>

        <Form
          name="login"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="shopId"
            rules={[{ required: true, message: 'Please enter your Shop ID' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Shop ID" />
          </Form.Item>

          <Form.Item
            name="owner"
            rules={[{ required: true, message: 'Please enter owner name' }]}
          >
            <Input prefix={<LockOutlined />} placeholder="Owner Name" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Login
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <Space>
              <Typography.Text>Don't have an account?</Typography.Text>
              <Link to="/register">Register here</Link>
            </Space>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
