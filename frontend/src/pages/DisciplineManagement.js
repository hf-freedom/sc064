import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Row, Col, Tag, Modal, Form, Select, Input, message, Descriptions, Alert, Space } from 'antd';
import { ReloadOutlined, PlusOutlined, WarningOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { disciplineApi, studentApi } from '../api';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

const MAX_DISCIPLINE_COUNT = 3;

const DisciplineManagement = () => {
  const [records, setRecords] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [form] = Form.useForm();

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const response = await disciplineApi.getAll();
      if (response.data.code === 200) {
        setRecords(response.data.data || []);
      }
    } catch (error) {
      message.error('获取违纪记录失败');
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
    fetchRecords();
    fetchStudents();
  }, []);

  const handleAdd = () => {
    setSelectedStudent(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleStudentChange = (studentId) => {
    const student = students.find(s => s.studentId === studentId);
    setSelectedStudent(student);
  };

  const handleSubmit = async (values) => {
    const submitData = {
      studentId: values.studentId,
      bedId: null,
      roomId: null,
      violationType: values.violationType,
      description: values.description,
      penalty: values.penalty,
    };

    try {
      const response = await disciplineApi.add(submitData);
      if (response.data.code === 200) {
        message.success('违纪记录添加成功');
        setModalVisible(false);
        fetchRecords();
        fetchStudents();
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      message.error('添加失败');
    }
  };

  const violationTypes = [
    { value: '晚归', label: '晚归' },
    { value: '夜不归宿', label: '夜不归宿' },
    { value: '使用违规电器', label: '使用违规电器' },
    { value: '大声喧哗', label: '大声喧哗' },
    { value: '打架斗殴', label: '打架斗殴' },
    { value: '酗酒', label: '酗酒' },
    { value: '其他违纪', label: '其他违纪' },
  ];

  const penalties = [
    { value: '口头警告', label: '口头警告' },
    { value: '书面警告', label: '书面警告' },
    { value: '通报批评', label: '通报批评' },
    { value: '记过', label: '记过' },
    { value: '留校察看', label: '留校察看' },
  ];

  const columns = [
    {
      title: '记录ID',
      dataIndex: 'recordId',
      key: 'recordId',
    },
    {
      title: '学生ID',
      dataIndex: 'studentId',
      key: 'studentId',
      render: (studentId) => {
        const student = students.find(s => s.studentId === studentId);
        return (
          <div>
            <div>{studentId}</div>
            {student && (
              <div style={{ fontSize: 12, color: '#666' }}>
                {student.name}
                {student.disciplineCount >= MAX_DISCIPLINE_COUNT && (
                  <Tag color="red" style={{ marginLeft: 4 }}>
                    限制换宿
                  </Tag>
                )}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: '违纪类型',
      dataIndex: 'violationType',
      key: 'violationType',
      render: (type) => (
        <Tag color="orange">{type}</Tag>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '日期',
      dataIndex: 'violationDate',
      key: 'violationDate',
      render: (date) => date ? dayjs(date).format('YYYY-MM-DD') : '-',
    },
    {
      title: '处罚',
      dataIndex: 'penalty',
      key: 'penalty',
      render: (penalty) => (
        <Tag color="red">{penalty}</Tag>
      ),
    },
  ];

  const getDisciplineStats = () => {
    const stats = {
      total: students.length,
      withDiscipline: 0,
      restricted: 0,
    };
    students.forEach(student => {
      if (student.disciplineCount > 0) {
        stats.withDiscipline++;
      }
      if (student.disciplineCount >= MAX_DISCIPLINE_COUNT) {
        stats.restricted++;
      }
    });
    return stats;
  };

  const stats = getDisciplineStats();

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card size="small">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold' }}>
                {stats.total}
              </div>
              <div style={{ color: '#666' }}>学生总数</div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#fa8c16' }}>
                {stats.withDiscipline}
              </div>
              <div style={{ color: '#666' }}>有违纪记录</div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#f5222d' }}>
                {stats.restricted}
              </div>
              <div style={{ color: '#666' }}>限制换宿</div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#722ed1' }}>
                {MAX_DISCIPLINE_COUNT}
              </div>
              <div style={{ color: '#666' }}>限制阈值（次）</div>
            </div>
          </Card>
        </Col>
      </Row>

      <Card 
        title="违纪管理" 
        extra={
          <Row gutter={16}>
            <Col>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={() => { fetchRecords(); fetchStudents(); }}
              >
                刷新
              </Button>
            </Col>
            <Col>
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={handleAdd}
              >
                添加违纪记录
              </Button>
            </Col>
          </Row>
        }
      >
        <Alert
          message="违纪次数超过阈值将限制学生换宿权限"
          description={`当前限制阈值：${MAX_DISCIPLINE_COUNT} 次。学生违纪次数达到或超过${MAX_DISCIPLINE_COUNT}次后，将无法申请换宿。`}
          type="info"
          showIcon
          icon={<ExclamationCircleOutlined />}
          style={{ marginBottom: 16 }}
        />

        <Table
          columns={columns}
          dataSource={records}
          rowKey="recordId"
          loading={loading}
          scroll={{ x: 800 }}
        />
      </Card>

      <Modal
        title="添加违纪记录"
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
            label="选择学生"
            rules={[{ required: true, message: '请选择学生' }]}
          >
            <Select
              placeholder="请选择学生"
              showSearch
              optionFilterProp="children"
              onChange={handleStudentChange}
            >
              {students.map(student => (
                <Option key={student.studentId} value={student.studentId}>
                  {student.studentId} - {student.name} 
                  <span style={{ color: '#999', marginLeft: 8 }}>
                    (违纪: {student.disciplineCount}次)
                  </span>
                </Option>
              ))}
            </Select>
          </Form.Item>

          {selectedStudent && selectedStudent.disciplineCount >= MAX_DISCIPLINE_COUNT && (
            <Alert
              message="该学生违纪次数已超过阈值"
              description={`该学生当前违纪次数为 ${selectedStudent.disciplineCount} 次，已达到或超过限制阈值 ${MAX_DISCIPLINE_COUNT} 次，将无法申请换宿。`}
              type="error"
              showIcon
              icon={<WarningOutlined />}
              style={{ marginBottom: 16 }}
            />
          )}

          {selectedStudent && (
            <div style={{ marginBottom: 16, padding: 12, background: '#fafafa', borderRadius: 4 }}>
              <Descriptions column={3} size="small">
                <Descriptions.Item label="学号">{selectedStudent.studentId}</Descriptions.Item>
                <Descriptions.Item label="姓名">{selectedStudent.name}</Descriptions.Item>
                <Descriptions.Item label="当前违纪次数">
                  <Tag color={selectedStudent.disciplineCount >= MAX_DISCIPLINE_COUNT ? 'red' : 'blue'}>
                    {selectedStudent.disciplineCount} 次
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            </div>
          )}

          <Form.Item
            name="violationType"
            label="违纪类型"
            rules={[{ required: true, message: '请选择违纪类型' }]}
          >
            <Select placeholder="请选择违纪类型">
              {violationTypes.map(type => (
                <Option key={type.value} value={type.value}>
                  {type.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="违纪描述"
            rules={[{ required: true, message: '请输入违纪描述' }]}
          >
            <TextArea
              rows={3}
              placeholder="请详细描述违纪情况"
            />
          </Form.Item>

          <Form.Item
            name="penalty"
            label="处罚决定"
            rules={[{ required: true, message: '请选择处罚决定' }]}
          >
            <Select placeholder="请选择处罚决定">
              {penalties.map(penalty => (
                <Option key={penalty.value} value={penalty.value}>
                  {penalty.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              提交记录
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DisciplineManagement;
