import React, { useState, useEffect } from 'react';
import { 
  Table, Button, Card, Form, Input, InputNumber, 
  Modal, Space, Typography, Tag, message, Drawer 
} from 'antd';
import { PlusOutlined, BookOutlined, MoneyCollectOutlined } from '@ant-design/icons';
import { customersService } from '../services/api';

const { Title } = Typography;

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [ledgerDrawer, setLedgerDrawer] = useState(false);
  const [paymentDrawer, setPaymentDrawer] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [ledger, setLedger] = useState([]);
  const [form] = Form.useForm();
  const [paymentForm] = Form.useForm();

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const data = await customersService.getAll();
      setCustomers(data);
    } catch (error) {
      message.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    form.resetFields();
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await customersService.add(values);
      message.success('Customer added successfully');
      setModalVisible(false);
      loadCustomers();
    } catch (error) {
      message.error('Failed to add customer');
    }
  };

  const viewLedger = async (customer) => {
    setSelectedCustomer(customer);
    try {
      const data = await customersService.getLedger(customer._id);
      setLedger(data);
      setLedgerDrawer(true);
    } catch (error) {
      message.error('Failed to load ledger');
    }
  };

  const openPaymentDrawer = (customer) => {
    setSelectedCustomer(customer);
    paymentForm.resetFields();
    setPaymentDrawer(true);
  };

  const handlePayment = async () => {
    try {
      const values = await paymentForm.validateFields();
      await customersService.recordPayment(selectedCustomer._id, values);
      message.success('Payment recorded successfully');
      setPaymentDrawer(false);
      loadCustomers();
    } catch (error) {
      message.error('Failed to record payment');
    }
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Phone', dataIndex: 'phone', key: 'phone' },
    { title: 'Address', dataIndex: 'address', key: 'address' },
    { 
      title: 'Total Due', 
      dataIndex: 'totalDue', 
      key: 'totalDue',
      render: (due) => <Tag color={due > 0 ? 'red' : 'green'}>৳{due.toFixed(2)}</Tag>,
      sorter: (a, b) => a.totalDue - b.totalDue
    },
    { 
      title: 'Credit Limit', 
      dataIndex: 'creditLimit', 
      key: 'creditLimit',
      render: (limit) => `৳${limit.toFixed(2)}`
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            icon={<BookOutlined />} 
            size="small" 
            onClick={() => viewLedger(record)}
          >
            Ledger
          </Button>
          {record.totalDue > 0 && (
            <Button 
              icon={<MoneyCollectOutlined />} 
              size="small" 
              type="primary"
              onClick={() => openPaymentDrawer(record)}
            >
              Payment
            </Button>
          )}
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card 
        title={<Title level={4}>Customer Management</Title>}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Add Customer
          </Button>
        }
      >
        <Table 
          columns={columns} 
          dataSource={customers} 
          loading={loading}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="Add New Customer"
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input placeholder="Customer name" />
          </Form.Item>
          <Form.Item name="phone" label="Phone" rules={[{ required: true }]}>
            <Input placeholder="Phone number" />
          </Form.Item>
          <Form.Item name="address" label="Address">
            <Input.TextArea placeholder="Address" />
          </Form.Item>
          <Form.Item name="creditLimit" label="Credit Limit" initialValue={10000}>
            <InputNumber min={0} style={{ width: '100%' }} prefix="৳" />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        title={`Ledger - ${selectedCustomer?.name}`}
        placement="right"
        width={600}
        open={ledgerDrawer}
        onClose={() => setLedgerDrawer(false)}
      >
        <Table
          columns={[
            { title: 'Date', dataIndex: 'transactionDate', key: 'date', render: (d) => new Date(d).toLocaleDateString() },
            { title: 'Type', dataIndex: 'type', key: 'type' },
            { title: 'Description', dataIndex: 'description', key: 'description' },
            { 
              title: 'Amount', 
              dataIndex: 'amount', 
              key: 'amount',
              render: (amt) => <Tag color={amt > 0 ? 'red' : 'green'}>{amt > 0 ? '+' : ''}৳{amt.toFixed(2)}</Tag>
            },
            { title: 'Balance', dataIndex: 'balanceAfter', key: 'balance', render: (bal) => `৳${bal.toFixed(2)}` }
          ]}
          dataSource={ledger}
          rowKey="_id"
          pagination={false}
        />
      </Drawer>

      <Drawer
        title={`Receive Payment - ${selectedCustomer?.name}`}
        placement="right"
        width={400}
        open={paymentDrawer}
        onClose={() => setPaymentDrawer(false)}
      >
        <Form paymentForm={paymentForm} layout="vertical">
          <Form.Item name="amount" label="Amount" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} prefix="৳" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea placeholder="Payment notes" />
          </Form.Item>
          <Button type="primary" onClick={handlePayment} block>Record Payment</Button>
        </Form>
      </Drawer>
    </div>
  );
};

export default Customers;
