import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Row, Col, Tag, Modal, Form, Select, message, Space, Popconfirm } from 'antd';
import { ReloadOutlined, CreditCardOutlined, SyncOutlined } from '@ant-design/icons';
import { billApi, studentApi } from '../api';
import dayjs from 'dayjs';

const { Option } = Select;

const UtilityBills = () => {
  const [bills, setBills] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const fetchBills = async (studentId = null) => {
    setLoading(true);
    try {
      let response;
      if (studentId) {
        response = await billApi.getByStudent(studentId);
      } else {
        response = await billApi.getAll();
      }
      if (response.data.code === 200) {
        setBills(response.data.data || []);
      }
    } catch (error) {
      message.error('获取账单列表失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await studentApi.getAll();
      if (response.data.code === 200) {
        setStudents(response.data.data || []);
      }
    } catch (error) {
      message.error('获取学生列表失败');
    }
  };

  useEffect(() => {
    fetchBills();
    fetchStudents();
  }, []);

  const handlePay = async (billId, studentId) => {
    try {
      const response = await billApi.pay({ billId, studentId });
      if (response.data.code === 200) {
        message.success('账单支付成功');
        fetchBills(selectedStudent);
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      message.error('支付失败');
    }
  };

  const handleGenerateBills = async () => {
    try {
      const response = await billApi.generate();
      if (response.data.code === 200) {
        message.success('账单生成成功');
        fetchBills(selectedStudent);
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      message.error('生成账单失败');
    }
  };

  const handleCheckOverdue = async () => {
    try {
      const response = await billApi.checkOverdue();
      if (response.data.code === 200) {
        message.success('逾期账单检查完成');
        fetchBills(selectedStudent);
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      message.error('检查逾期账单失败');
    }
  };

  const handleStudentChange = (studentId) => {
    setSelectedStudent(studentId);
    fetchBills(studentId);
  };

  const handleRefresh = () => {
    setSelectedStudent(null);
    fetchBills();
  };

  const getStatusTag = (status) => {
    const statusMap = {
      PENDING: { color: 'orange', text: '待支付' },
      PAID: { color: 'green', text: '已支付' },
      OVERDUE: { color: 'red', text: '已逾期' },
    };
    const info = statusMap[status] || { color: 'default', text: status };
    return <Tag color={info.color}>{info.text}</Tag>;
  };

  const columns = [
    {
      title: '账单ID',
      dataIndex: 'billId',
      key: 'billId',
    },
    {
      title: '学生ID',
      dataIndex: 'studentId',
      key: 'studentId',
    },
    {
      title: '房间ID',
      dataIndex: 'roomId',
      key: 'roomId',
    },
    {
      title: '账期',
      key: 'billingPeriod',
      render: (_, record) => `${record.billingYear}年${record.billingMonth}月`,
    },
    {
      title: '电费(度)',
      dataIndex: 'electricityUsage',
      key: 'electricityUsage',
    },
    {
      title: '水费(吨)',
      dataIndex: 'waterUsage',
      key: 'waterUsage',
    },
    {
      title: '电费金额',
      dataIndex: 'electricityCost',
      key: 'electricityCost',
      render: (val) => `¥${val}`,
    },
    {
      title: '水费金额',
      dataIndex: 'waterCost',
      key: 'waterCost',
      render: (val) => `¥${val}`,
    },
    {
      title: '总金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (val) => <span style={{ fontWeight: 'bold' }}>¥{val}</span>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
    },
    {
      title: '到期日期',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date) => date ? dayjs(date).format('YYYY-MM-DD') : '-',
    },
    {
      title: '支付日期',
      dataIndex: 'paidDate',
      key: 'paidDate',
      render: (date) => date ? dayjs(date).format('YYYY-MM-DD') : '-',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        record.status === 'PENDING' || record.status === 'OVERDUE' ? (
          <Popconfirm
            title="确认支付此账单？"
            onConfirm={() => handlePay(record.billId, record.studentId)}
            okText="确认"
            cancelText="取消"
          >
            <Button type="link" size="small">
              支付
            </Button>
          </Popconfirm>
        ) : (
          <Tag color="default">已处理</Tag>
        )
      ),
    },
  ];

  return (
    <Card 
      title="水电账单管理" 
      extra={
        <Row gutter={16}>
          <Col>
            <Select
              placeholder="按学生筛选"
              style={{ width: 250 }}
              allowClear
              showSearch
              optionFilterProp="children"
              onChange={handleStudentChange}
              value={selectedStudent}
            >
              {students.map(student => (
                <Option key={student.studentId} value={student.studentId}>
                  {student.studentId} - {student.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col>
            <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
              刷新
            </Button>
          </Col>
          <Col>
            <Button icon={<SyncOutlined />} onClick={handleGenerateBills}>
              生成账单
            </Button>
          </Col>
          <Col>
            <Button icon={<CreditCardOutlined />} onClick={handleCheckOverdue}>
              检查逾期
            </Button>
          </Col>
        </Row>
      }
    >
      <Table
        columns={columns}
        dataSource={bills}
        rowKey="billId"
        loading={loading}
        scroll={{ x: 1200 }}
      />
    </Card>
  );
};

export default UtilityBills;
