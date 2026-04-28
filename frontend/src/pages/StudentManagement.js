import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Card, Row, Col } from 'antd';
import { PlusOutlined, ReloadOutlined, EditOutlined } from '@ant-design/icons';
import { studentApi } from '../api';

const { Option } = Select;

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [form] = Form.useForm();

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await studentApi.getAll();
      if (response.data.code === 200) {
        setStudents(response.data.data || []);
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

  const handleAdd = () => {
    setEditingStudent(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingStudent(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleSubmit = async (values) => {
    const submitData = {
      ...values,
      grade: parseInt(values.grade),
    };

    if (editingStudent) {
      try {
        const response = await studentApi.update(editingStudent.studentId, submitData);
        if (response.data.code === 200) {
          message.success('学生信息更新成功');
          setModalVisible(false);
          fetchStudents();
        } else {
          message.error(response.data.message);
        }
      } catch (error) {
        message.error('更新失败');
      }
    } else {
      try {
        const response = await studentApi.add(submitData);
        if (response.data.code === 200) {
          message.success('学生添加成功');
          setModalVisible(false);
          fetchStudents();
        } else {
          message.error(response.data.message);
        }
      } catch (error) {
        message.error('添加失败');
      }
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
      title: '电话',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: '住宿状态',
      dataIndex: 'accommodationStatus',
      key: 'accommodationStatus',
      render: (status) => {
        const statusMap = {
          NOT_ACCOMMODATED: '未入住',
          ACCOMMODATED: '已入住',
          CHECKED_OUT: '已退宿',
        };
        return statusMap[status] || status;
      },
    },
    {
      title: '欠费状态',
      dataIndex: 'arrearsStatus',
      key: 'arrearsStatus',
      render: (status) => {
        const statusMap = {
          NO_ARREARS: '无欠费',
          ARREARS: '有欠费',
          OVERDUE_ARREARS: '逾期欠费',
        };
        return statusMap[status] || status;
      },
    },
    {
      title: '违纪次数',
      dataIndex: 'disciplineCount',
      key: 'disciplineCount',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button
          type="link"
          icon={<EditOutlined />}
          onClick={() => handleEdit(record)}
        >
          编辑
        </Button>
      ),
    },
  ];

  return (
    <Card title="学生管理" extra={
      <Row gutter={16}>
        <Col>
          <Button icon={<ReloadOutlined />} onClick={fetchStudents}>
            刷新
          </Button>
        </Col>
        <Col>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            添加学生
          </Button>
        </Col>
      </Row>
    }>
      <Table
        columns={columns}
        dataSource={students}
        rowKey="studentId"
        loading={loading}
      />

      <Modal
        title={editingStudent ? '编辑学生' : '添加学生'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="studentId"
            label="学号"
            rules={[{ required: true, message: '请输入学号' }]}
          >
            <Input placeholder="请输入学号" disabled={!!editingStudent} />
          </Form.Item>

          <Form.Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input placeholder="请输入姓名" />
          </Form.Item>

          <Form.Item
            name="gender"
            label="性别"
            rules={[{ required: true, message: '请选择性别' }]}
          >
            <Select placeholder="请选择性别">
              <Option value="MALE">男</Option>
              <Option value="FEMALE">女</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="college"
            label="学院"
            rules={[{ required: true, message: '请输入学院' }]}
          >
            <Input placeholder="请输入学院" />
          </Form.Item>

          <Form.Item
            name="grade"
            label="年级"
            rules={[{ required: true, message: '请输入年级' }]}
          >
            <Input type="number" placeholder="请输入年级" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="电话"
          >
            <Input placeholder="请输入电话" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              提交
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default StudentManagement;
