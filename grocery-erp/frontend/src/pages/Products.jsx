import React, { useState, useEffect } from 'react';
import { 
  Table, Button, Card, Form, Input, InputNumber, Select, 
  Modal, Space, Typography, Tag, message, Popconfirm 
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { productService } from '../services/api';

const { Title } = Typography;
const { Option } = Select;

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await productService.getAll();
      setProducts(data);
    } catch (error) {
      message.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingProduct(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingProduct(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await productService.delete(id);
      message.success('Product deleted successfully');
      loadProducts();
    } catch (error) {
      message.error('Failed to delete product');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingProduct) {
        await productService.update(editingProduct._id, values);
        message.success('Product updated successfully');
      } else {
        await productService.add(values);
        message.success('Product added successfully');
      }
      
      setModalVisible(false);
      loadProducts();
    } catch (error) {
      message.error(error.message || 'Operation failed');
    }
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name', sorter: (a, b) => a.name.localeCompare(b.name) },
    { title: 'Category', dataIndex: 'category', key: 'category', filters: [...new Set(products.map(p => p.category))].map(c => ({ text: c, value: c })), onFilter: (value, record) => record.category === value },
    { title: 'Unit', dataIndex: 'unit', key: 'unit' },
    { 
      title: 'Cost Price', 
      dataIndex: 'costPrice', 
      key: 'costPrice',
      render: (price) => `৳${price.toFixed(2)}`
    },
    { 
      title: 'Selling Price', 
      dataIndex: 'sellingPrice', 
      key: 'sellingPrice',
      render: (price) => `৳${price.toFixed(2)}`
    },
    { 
      title: 'Profit Margin', 
      key: 'profit',
      render: (_, record) => {
        const profit = record.sellingPrice - record.costPrice;
        const margin = ((profit / record.costPrice) * 100).toFixed(1);
        return <Tag color="green">{margin}%</Tag>;
      }
    },
    { 
      title: 'Stock', 
      dataIndex: 'currentStock', 
      key: 'currentStock',
      render: (stock, record) => (
        <Tag color={stock <= record.minStockLevel ? 'red' : 'green'}>
          {stock} {record.unit}
        </Tag>
      ),
      sorter: (a, b) => a.currentStock - b.currentStock
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)}>Edit</Button>
          <Popconfirm title="Are you sure?" onConfirm={() => handleDelete(record._id)}>
            <Button icon={<DeleteOutlined />} size="small" danger>Delete</Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card 
        title={<Title level={4}>Product Management</Title>}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Add Product
          </Button>
        }
      >
        <Table 
          columns={columns} 
          dataSource={products} 
          loading={loading}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Product Name" rules={[{ required: true }]}>
            <Input placeholder="Enter product name" />
          </Form.Item>
          
          <Form.Item name="category" label="Category" rules={[{ required: true }]}>
            <Select placeholder="Select category">
              <Option value="Rice & Grains">Rice & Grains</Option>
              <Option value="Oil & Spices">Oil & Spices</Option>
              <Option value="Pulses">Pulses</Option>
              <Option value="Tea & Coffee">Tea & Coffee</Option>
              <Option value="Snacks">Snacks</Option>
              <Option value="Beverages">Beverages</Option>
              <Option value="Dairy">Dairy</Option>
              <Option value="Household">Household</Option>
              <Option value="Personal Care">Personal Care</Option>
              <Option value="Others">Others</Option>
            </Select>
          </Form.Item>
          
          <Form.Item name="unit" label="Unit" initialValue="pcs">
            <Select>
              <Option value="pcs">Pieces (pcs)</Option>
              <Option value="kg">Kilogram (kg)</Option>
              <Option value="liter">Liter (L)</Option>
              <Option value="packet">Packet</Option>
              <Option value="box">Box</Option>
            </Select>
          </Form.Item>
          
          <Form.Item name="costPrice" label="Cost Price (from SR)" rules={[{ required: true }]}>
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} placeholder="Purchase price" addonBefore="৳" />
          </Form.Item>
          
          <Form.Item name="sellingPrice" label="Selling Price" rules={[{ required: true }]}>
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} placeholder="Selling price" addonBefore="৳" />
          </Form.Item>
          
          <Form.Item name="currentStock" label="Current Stock" initialValue={0}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item name="minStockLevel" label="Minimum Stock Level" initialValue={10}>
            <InputNumber min={1} style={{ width: '100%' }} placeholder="Alert when stock goes below this" />
          </Form.Item>
          
          <Form.Item name="reorderQuantity" label="Reorder Quantity" initialValue={50}>
            <InputNumber min={1} style={{ width: '100%' }} placeholder="Suggested order quantity" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Products;
