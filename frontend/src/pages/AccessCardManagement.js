import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Row, Col, Tag, Select, message } from 'antd';
import { ReloadOutlined, LockOutlined, UnlockOutlined } from '@ant-design/icons';
import { accessCardApi, studentApi } from '../api';
import dayjs from 'dayjs';

const { Option } = Select;

const AccessCardManagement = () => {
  const [cards, setCards] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const fetchCards = async (studentId = null) => {
    setLoading(true);
    try {
      let response;
      if (studentId) {
        response = await accessCardApi.getByStudent(studentId);
      } else {
        response = await accessCardApi.getAll();
      }
      if (response.data.code === 200) {
        setCards(response.data.data || []);
      }
    } catch (error) {
      message.error('获取门禁卡列表失败');
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
    fetchCards();
    fetchStudents();
  }, []);

  const handleStudentChange = (studentId) => {
    setSelectedStudent(studentId);
    fetchCards(studentId);
  };

  const handleRefresh = () => {
    setSelectedStudent(null);
    fetchCards();
  };

  const getStatusTag = (status) => {
    const statusMap = {
      ACTIVE: { color: 'green', text: '正常', icon: <UnlockOutlined /> },
      RESTRICTED: { color: 'orange', text: '受限', icon: <LockOutlined /> },
      INACTIVE: { color: 'default', text: '已失效', icon: null },
    };
    const info = statusMap[status] || { color: 'default', text: status };
    return (
      <Tag color={info.color}>
        {info.icon} {info.text}
      </Tag>
    );
  };

  const columns = [
    {
      title: '门禁卡ID',
      dataIndex: 'cardId',
      key: 'cardId',
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
            {student && <div style={{ fontSize: 12, color: '#666' }}>{student.name}</div>}
          </div>
        );
      },
    },
    {
      title: '床位ID',
      dataIndex: 'bedId',
      key: 'bedId',
    },
    {
      title: '宿舍楼ID',
      dataIndex: 'buildingId',
      key: 'buildingId',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
    },
    {
      title: '发卡日期',
      dataIndex: 'issueDate',
      key: 'issueDate',
      render: (date) => date ? dayjs(date).format('YYYY-MM-DD HH:mm') : '-',
    },
    {
      title: '到期日期',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      render: (date) => date ? dayjs(date).format('YYYY-MM-DD HH:mm') : '-',
    },
  ];

  const statusStats = () => {
    const stats = {
      ACTIVE: 0,
      RESTRICTED: 0,
      INACTIVE: 0,
    };
    cards.forEach(card => {
      if (stats[card.status] !== undefined) {
        stats[card.status]++;
      }
    });
    return stats;
  };

  const stats = statusStats();

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card size="small">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#52c41a' }}>
                {stats.ACTIVE}
              </div>
              <div style={{ color: '#666' }}>正常门禁</div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#fa8c16' }}>
                {stats.RESTRICTED}
              </div>
              <div style={{ color: '#666' }}>受限门禁</div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#999' }}>
                {stats.INACTIVE}
              </div>
              <div style={{ color: '#666' }}>已失效</div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold' }}>
                {cards.length}
              </div>
              <div style={{ color: '#666' }}>总计</div>
            </div>
          </Card>
        </Col>
      </Row>

      <Card 
        title="门禁管理" 
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
          </Row>
        }
      >
        <Table
          columns={columns}
          dataSource={cards}
          rowKey="cardId"
          loading={loading}
        />
      </Card>
    </div>
  );
};

export default AccessCardManagement;
