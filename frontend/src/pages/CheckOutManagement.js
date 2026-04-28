import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Row, Col, Tag, Modal, Form, Select, Input, message, Popconfirm, Descriptions, Alert } from 'antd';
import { ReloadOutlined, LogoutOutlined, WarningOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { checkoutApi, studentApi, billApi } from '../api';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

const CheckOutManagement = () => {
  const [students, setStudents] = useState([]);
  const [accommodatedStudents, setAccommodatedStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentBills, setStudentBills] = useState([]);
  const [hasOutstandingBills, setHasOutstandingBills] = useState(false);
  const [form] = Form.useForm();

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await studentApi.getAll();
      if (response.data.code === 200) {
        const allStudents = response.data.data || [];
        setStudents(allStudents);
        setAccommodatedStudents(allStudents.filter(s => s.accommodationStatus === 'ACCOMMODATED'));
      }
    } catch (error) {
      message.error('获取学生列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleStudentChange = async (studentId) => {
    const student = accommodatedStudents.find(s => s.studentId === studentId);
    setSelectedStudent(student);

    if (student) {
      try {
        const response = await billApi.getByStudent(studentId);
        if (response.data.code === 200) {
          const bills = response.data.data || [];
          setStudentBills(bills);
          const outstanding = bills.some(b => b.status === 'PENDING' || b.status === 'OVERDUE');
          setHasOutstandingBills(outstanding);
        }
      } catch (error) {
        message.error('获取学生账单失败');
      }
    }
  };

  const handleCheckOut = () => {
    if (!selectedStudent) {
      message.warning('请先选择学生');
      return;
    }
    form.resetFields();
    setModalVisible(true);
  };

  const handleSubmit = async (values) => {
    const submitData = {
      studentId: selectedStudent.studentId,
      bedId: selectedStudent.currentBedId,
      remark: values.remark,
    };

    try {
      const response = await checkoutApi.checkout(submitData);
      if (response.data.code === 200) {
        message.success('退宿成功');
        setModalVisible(false);
        setSelectedStudent(null);
        setStudentBills([]);
        setHasOutstandingBills(false);
        fetchStudents();
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      message.error('退宿失败');
    }
  };

  const columns = [
    {
      title: '学号',
      dataIndex: 'studentId',
      key: 'studentId',
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '性别',
      dataIndex: 'gender',
      key: 'gender',
      render: (gender) => gender === 'MALE' ? '男' : '女',
    },
    {
      title: '学院',
      dataIndex: 'college',
      key: 'college',
    },
    {
      title: '年级',
      dataIndex: 'grade',
      key: 'grade',
    },
    {
      title: '当前床位',
      dataIndex: 'currentBedId',
      key: 'currentBedId',
    },
    {
      title: '入住日期',
      dataIndex: 'checkInDate',
      key: 'checkInDate',
      render: (date) => date ? dayjs(date).format('YYYY-MM-DD') : '-',
    },
    {
      title: '欠费状态',
      dataIndex: 'arrearsStatus',
      key: 'arrearsStatus',
      render: (status) => {
        const statusMap = {
          NO_ARREARS: { color: 'green', text: '无欠费' },
          ARREARS: { color: 'orange', text: '有欠费' },
          OVERDUE_ARREARS: { color: 'red', text: '逾期欠费' },
        };
        const info = statusMap[status] || { color: 'default', text: status };
        return <Tag color={info.color}>{info.text}</Tag>;
      },
    },
  ];

  const billColumns = [
    {
      title: '账单ID',
      dataIndex: 'billId',
      key: 'billId',
    },
    {
      title: '账期',
      key: 'period',
      render: (_, record) => `${record.billingYear}年${record.billingMonth}月`,
    },
    {
      title: '总金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (val) => `¥${val}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusMap = {
          PENDING: { color: 'orange', text: '待支付' },
          PAID: { color: 'green', text: '已支付' },
          OVERDUE: { color: 'red', text: '已逾期' },
        };
        const info = statusMap[status] || { color: 'default', text: status };
        return <Tag color={info.color}>{info.text}</Tag>;
      },
    },
  ];

  return (
    <div>
      <Card 
        title="退宿管理" 
        extra={
          <Row gutter={16}>
            <Col>
              <Button icon={<ReloadOutlined />} onClick={fetchStudents}>
                刷新
              </Button>
            </Col>
            <Col>
              <Button 
                type="primary" 
                icon={<LogoutOutlined />} 
                onClick={handleCheckOut}
                disabled={!selectedStudent || hasOutstandingBills}
              >
                办理退宿
              </Button>
            </Col>
          </Row>
        }
      >
        <Row gutter={16}>
          <Col span={10}>
            <Card 
              title="已入住学生列表" 
              size="small"
              style={{ marginBottom: 16 }}
            >
              <Table
                columns={columns}
                dataSource={accommodatedStudents}
                rowKey="studentId"
                loading={loading}
                size="small"
                pagination={{ pageSize: 5 }}
                onRow={(record) => ({
                  onClick: () => handleStudentChange(record.studentId),
                  style: { cursor: 'pointer' },
                })}
                rowClassName={(record) => 
                  selectedStudent?.studentId === record.studentId ? 'table-row-selected' : ''
                }
              />
            </Card>
          </Col>

          <Col span={14}>
            {selectedStudent ? (
              <div>
                {hasOutstandingBills && (
                  <Alert
                    message="该学生存在未结清的水电费，无法办理退宿"
                    description="请先结清所有账单后再办理退宿手续"
                    type="error"
                    showIcon
                    icon={<WarningOutlined />}
                    style={{ marginBottom: 16 }}
                  />
                )}
                {!hasOutstandingBills && (
                  <Alert
                    message="该学生水电费已结清，可以办理退宿"
                    type="success"
                    showIcon
                    icon={<CheckCircleOutlined />}
                    style={{ marginBottom: 16 }}
                  />
                )}

                <Card title="学生信息" size="small" style={{ marginBottom: 16 }}>
                  <Descriptions column={2} size="small">
                    <Descriptions.Item label="学号">{selectedStudent.studentId}</Descriptions.Item>
                    <Descriptions.Item label="姓名">{selectedStudent.name}</Descriptions.Item>
                    <Descriptions.Item label="性别">{selectedStudent.gender === 'MALE' ? '男' : '女'}</Descriptions.Item>
                    <Descriptions.Item label="学院">{selectedStudent.college}</Descriptions.Item>
                    <Descriptions.Item label="当前床位">{selectedStudent.currentBedId}</Descriptions.Item>
                    <Descriptions.Item label="入住日期">
                      {selectedStudent.checkInDate ? dayjs(selectedStudent.checkInDate).format('YYYY-MM-DD') : '-'}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>

                <Card title="水电费账单" size="small">
                  <Table
                    columns={billColumns}
                    dataSource={studentBills}
                    rowKey="billId"
                    size="small"
                    pagination={{ pageSize: 5 }}
                  />
                </Card>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 50, color: '#999' }}>
                请从左侧选择一名学生查看详情
              </div>
            )}
          </Col>
        </Row>
      </Card>

      <Modal
        title="办理退宿"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          {selectedStudent && (
            <div style={{ marginBottom: 16, padding: 16, background: '#f5f5f5', borderRadius: 4 }}>
              <p><strong>学号：</strong>{selectedStudent.studentId}</p>
              <p><strong>姓名：</strong>{selectedStudent.name}</p>
              <p><strong>当前床位：</strong>{selectedStudent.currentBedId}</p>
            </div>
          )}

          <Form.Item
            name="remark"
            label="退宿备注"
          >
            <TextArea
              rows={3}
              placeholder="请输入退宿备注（可选）"
            />
          </Form.Item>

          <Alert
            message="退宿确认"
            description="退宿后将：1. 结清水电费；2. 关闭门禁权限；3. 释放床位。此操作不可撤销，请确认后再提交。"
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Form.Item>
            <Button type="primary" htmlType="submit">
              确认退宿
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <style>{`
        .table-row-selected {
          background-color: #e6f7ff !important;
        }
      `}</style>
    </div>
  );
};

export default CheckOutManagement;
