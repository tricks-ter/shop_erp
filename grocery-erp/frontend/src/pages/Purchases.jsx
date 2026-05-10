import React, { useState, useEffect } from 'react';
import { 
  Table, Button, Card, Form, Input, InputNumber, Select, 
  Modal, Space, Typography, message, Row, Col 
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { purchasesService, productService } from '../services/api';

const { Title } = Typography;
const { Option } = Select;

const Purchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [purchaseItems, setPurchaseItems] = useState([]);
  const [form] = Form.useForm();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [purchasesData, productsData] = await Promise.all([
        purchasesService.getAll(),
        productService.getAll()
      ]);
      setPurchases(purchasesData);
      setProducts(productsData);
    } catch (error) {
      message.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleNewPurchase = () => {
    setPurchaseItems([]);
    form.resetFields();
    setModalVisible(true);
  };

  const addPurchaseItem = () => {
    setPurchaseItems([...purchaseItems, { productId: '', quantity: 1, costPrice: 0 }]);
  };

  const updatePurchaseItem = (index, field, value) => {
    const newItems = [...purchaseItems];
    newItems[index][field] = value;
    
    if (field === 'productId') {
      const product = products.find(p => p._id === value);
      if (product) {
        newItems[index].costPrice = product.costPrice;
      }
    }
    
    setPurchaseItems(newItems);
  };

  const removePurchaseItem = (index) => {
    setPurchaseItems(purchaseItems.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return purchaseItems.reduce((sum, item) => sum + (item.quantity * item.costPrice), 0);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (purchaseItems.length === 0) {
        message.error('Please add at least one item');
        return;
      }

      const purchaseData = {
        supplier: values.supplier || 'SR',
        items: purchaseItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          costPrice: item.costPrice
        })),
        paymentStatus: values.paymentStatus
      };

      await purchasesService.record(purchaseData);
      message.success('Purchase recorded successfully');
      setModalVisible(false);
      loadData();
    } catch (error) {
      message.error('Failed to record purchase');
    }
  };

  const columns = [
    { 
      title: 'Date', 
      dataIndex: 'purchaseDate', 
      key: 'purchaseDate',
      render: (date) => new Date(date).toLocaleDateString()
    },
    { title: 'Supplier', dataIndex: 'supplier', key: 'supplier' },
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
      title: 'Payment Status', 
      dataIndex: 'paymentStatus', 
      key: 'paymentStatus',
      render: (status) => {
        const colors = { paid: 'green', pending: 'orange' };
        return <Tag color={colors[status]}>{status.toUpperCase()}</Tag>;
      }
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card 
        title={<Title level={4}>Purchase from Supplier</Title>}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleNewPurchase}>
            New Purchase
          </Button>
        }
      >
        <Table 
          columns={columns} 
          dataSource={purchases} 
          loading={loading}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="Record New Purchase"
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={800}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="supplier" label="Supplier" initialValue="SR">
            <Select>
              <Option value="SR">SR (Main Supplier)</Option>
              <Option value="Other">Other</Option>
            </Select>
          </Form.Item>

          <Card title="Purchase Items" size="small" style={{ marginBottom: 16 }}>
            {purchaseItems.map((item, index) => (
              <Row gutter={8} key={index} style={{ marginBottom: 8 }}>
                <Col span={8}>
                  <Select
                    value={item.productId}
                    onChange={(value) => updatePurchaseItem(index, 'productId', value)}
                    placeholder="Product"
                    style={{ width: '100%' }}
                  >
                    {products.map(product => (
                      <Option key={product._id} value={product._id}>{product.name}</Option>
                    ))}
                  </Select>
                </Col>
                <Col span={5}>
                  <InputNumber
                    min={1}
                    value={item.quantity}
                    onChange={(value) => updatePurchaseItem(index, 'quantity', value)}
                    style={{ width: '100%' }}
                    placeholder="Qty"
                  />
                </Col>
                <Col span={5}>
                  <InputNumber
                    value={item.costPrice}
                    onChange={(value) => updatePurchaseItem(index, 'costPrice', value)}
                    style={{ width: '100%' }}
                    prefix="৳"
                    placeholder="Cost"
                  />
                </Col>
                <Col span={4}>
                  <InputNumber
                    value={item.quantity * item.costPrice}
                    disabled
                    style={{ width: '100%' }}
                    prefix="৳"
                  />
                </Col>
                <Col span={2}>
                  <Button danger onClick={() => removePurchaseItem(index)}>×</Button>
                </Col>
              </Row>
            ))}
            <Button type="dashed" onClick={addPurchaseItem} block>+ Add Item</Button>
          </Card>

          <Form.Item name="paymentStatus" label="Payment Status" initialValue="pending">
            <Select>
              <Option value="paid">Paid</Option>
              <Option value="pending">Pending</Option>
            </Select>
          </Form.Item>

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

export default Purchases;
