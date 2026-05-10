import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { ShopOutlined, UserOutlined, PhoneOutlined, MailOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { authService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const { Title } = Typography;

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await authService.register(values);
      login(response.shop, response.token);
      message.success('Registration successful!');
      navigate('/');
    } catch (error) {
      message.error(error.response?.data?.message || 'Registration failed');
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
      <Card style={{ width: 500, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <ShopOutlined style={{ fontSize: 48, color: '#667eea' }} />
          <Title level={2} style={{ marginTop: 10 }}>Register Your Shop</Title>
          <Typography.Text type="secondary">Join Grocery ERP System</Typography.Text>
        </div>

        <Form
          name="register"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="name"
            label="Shop Name"
            rules={[{ required: true, message: 'Please enter shop name' }]}
          >
            <Input prefix={<ShopOutlined />} placeholder="Enter shop name" />
          </Form.Item>

          <Form.Item
            name="owner"
            label="Owner Name"
            rules={[{ required: true, message: 'Please enter owner name' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Enter owner name" />
          </Form.Item>

          <Form.Item
            name="location"
            label="Location"
            rules={[{ required: true, message: 'Please enter location' }]}
          >
            <Input prefix={<EnvironmentOutlined />} placeholder="Enter shop location" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Phone Number"
          >
            <Input prefix={<PhoneOutlined />} placeholder="Enter phone number" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
          >
            <Input prefix={<MailOutlined />} placeholder="Enter email address" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Register
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            Already have an account? <Link to="/login">Login here</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Register;
