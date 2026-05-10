import React, { useState, useEffect } from 'react';
import { 
  Table, Button, Card, Form, Input, InputNumber, Select, 
  Modal, Space, Typography, Tag, message, DatePicker, Row, Col 
} from 'antd';
import { PlusOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { salesService, productService, customersService } from '../services/api';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [saleItems, setSaleItems] = useState([]);
  const [form] = Form.useForm();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [salesData, productsData, customersData] = await Promise.all([
        salesService.getAll(),
        productService.getAll(),
        customersService.getAll()
      ]);
      setSales(salesData);
      setProducts(productsData);
      setCustomers(customersData);
    } catch (error) {
      message.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleNewSale = () => {
    setSaleItems([]);
    form.resetFields();
    setModalVisible(true);
  };

  const addSaleItem = () => {
    setSaleItems([...saleItems, { productId: '', quantity: 1, costPrice: 0, sellingPrice: 0 }]);
  };

  const updateSaleItem = (index, field, value) => {
    const newItems = [...saleItems];
    newItems[index][field] = value;
    
    if (field === 'productId') {
      const product = products.find(p => p._id === value);
      if (product) {
        newItems[index].costPrice = product.costPrice;
        newItems[index].sellingPrice = product.sellingPrice;
      }
    }
    
    setSaleItems(newItems);
  };

  const removeSaleItem = (index) => {
    setSaleItems(saleItems.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return saleItems.reduce((sum, item) => sum + (item.quantity * item.sellingPrice), 0);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (saleItems.length === 0) {
        message.error('Please add at least one item');
        return;
      }

      const saleData = {
        customerId: values.customerId || null,
        items: saleItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          costPrice: item.costPrice,
          sellingPrice: item.sellingPrice
        })),
        paymentStatus: values.paymentStatus,
        paidAmount: values.paidAmount
      };

      await salesService.record(saleData);
      message.success('Sale recorded successfully');
      setModalVisible(false);
      loadData();
    } catch (error) {
      message.error(error.message || 'Failed to record sale');
    }
  };

  const columns = [
    { 
      title: 'Date', 
      dataIndex: 'saleDate', 
      key: 'saleDate',
      render: (date) => dayjs(date).format('YYYY-MM-DD HH:mm')
    },
    { 
      title: 'Customer', 
      dataIndex: 'customer', 
      key: 'customer',
      render: (customer) => customer ? customer.name : 'Walk-in'
    },
    { 
      title: 'Items', 
      dataIndex: 'items', 
      key: 'items',
      render: (items) => `${items.length} items`
    },
    { 
      title: 'Total Amount', 
      dataIndex: 'totalAmount', 
      key: 'totalAmount',
      render: (amount) => `৳${amount.toFixed(2)}`
    },
    { 
      title: 'Profit', 
      dataIndex: 'totalProfit', 
      key: 'totalProfit',
      render: (profit) => <Tag color="green">৳{profit.toFixed(2)}</Tag>
    },
    { 
      title: 'Payment Status', 
      dataIndex: 'paymentStatus', 
      key: 'paymentStatus',
      render: (status) => {
        const colors = { paid: 'green', pending: 'red', partial: 'orange' };
        return <Tag color={colors[status]}>{status.toUpperCase()}</Tag>;
      }
    },
    { 
      title: 'Due', 
      dataIndex: 'dueAmount', 
      key: 'dueAmount',
      render: (due) => due > 0 ? `৳${due.toFixed(2)}` : '-'
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card 
        title={<Title level={4}>Sales Management</Title>}
        extra={
          <Button type="primary" icon={<ShoppingCartOutlined />} onClick={handleNewSale}>
            New Sale
          </Button>
        }
      >
        <Table 
          columns={columns} 
          dataSource={sales} 
          loading={loading}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="Record New Sale"
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={800}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="customerId" label="Customer (Optional)">
            <Select placeholder="Select customer (leave empty for walk-in)" allowClear>
              {customers.map(customer => (
                <Option key={customer._id} value={customer._id}>{customer.name} - {customer.phone}</Option>
              ))}
            </Select>
          </Form.Item>

          <Card title="Sale Items" size="small" style={{ marginBottom: 16 }}>
            {saleItems.map((item, index) => (
              <Row gutter={8} key={index} style={{ marginBottom: 8 }}>
                <Col span={6}>
                  <Select
                    value={item.productId}
                    onChange={(value) => updateSaleItem(index, 'productId', value)}
                    placeholder="Product"
                    style={{ width: '100%' }}
                  >
                    {products.filter(p => p.currentStock > 0).map(product => (
                      <Option key={product._id} value={product._id}>
                        {product.name} (Stock: {product.currentStock})
                      </Option>
                    ))}
                  </Select>
                </Col>
                <Col span={4}>
                  <InputNumber
                    min={1}
                    max={products.find(p => p._id === item.productId)?.currentStock || 999}
                    value={item.quantity}
                    onChange={(value) => updateSaleItem(index, 'quantity', value)}
                    style={{ width: '100%' }}
                    placeholder="Qty"
                  />
                </Col>
                <Col span={4}>
                  <InputNumber
                    value={item.sellingPrice}
                    onChange={(value) => updateSaleItem(index, 'sellingPrice', value)}
                    style={{ width: '100%' }}
                    prefix="৳"
                    placeholder="Price"
                  />
                </Col>
                <Col span={4}>
                  <InputNumber
                    value={item.quantity * item.sellingPrice}
                    disabled
                    style={{ width: '100%' }}
                    prefix="৳"
                  />
                </Col>
                <Col span={4}>
                  <Button danger onClick={() => removeSaleItem(index)}>Remove</Button>
                </Col>
              </Row>
            ))}
            <Button type="dashed" onClick={addSaleItem} block>+ Add Item</Button>
          </Card>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="paymentStatus" label="Payment Status" initialValue="paid">
                <Select>
                  <Option value="paid">Paid</Option>
                  <Option value="partial">Partial</Option>
                  <Option value="pending">Pending</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="paidAmount" label="Amount Paid">
                <InputNumber min={0} style={{ width: '100%' }} prefix="৳" />
              </Form.Item>
            </Col>
          </Row>

          <Card size="small">
            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
              <Title level={5}>Total: ৳{calculateTotal().toFixed(2)}</Title>
            </Space>
          </Card>
        </Form>
      </Modal>
    </div>
  );
};

export default Sales;
