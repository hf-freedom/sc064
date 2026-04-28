import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Row, Col, Tag, Modal, Form, Select, Input, message, Popconfirm, Space } from 'antd';
import { ReloadOutlined, PlusOutlined, ToolOutlined, CheckOutlined, WarningOutlined } from '@ant-design/icons';
import { maintenanceApi, studentApi, dormitoryApi } from '../api';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

const MaintenanceRequests = () => {
  const [requests, setRequests] = useState([]);
  const [students, setStudents] = useState([]);
  const [staff, setStaff] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [beds, setBeds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await maintenanceApi.getAllRequests();
      if (response.data.code === 200) {
        setRequests(response.data.data || []);
      }
    } catch (error) {
      message.error('获取报修单列表失败');
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

  const fetchStaff = async () => {
    try {
      const response = await maintenanceApi.getAllStaff();
      if (response.data.code === 200) {
        setStaff(response.data.data || []);
      }
    } catch (error) {
      message.error('获取维修人员列表失败');
    }
  };

  const fetchBuildings = async () => {
    try {
      const response = await dormitoryApi.getBuildings();
      if (response.data.code === 200) {
        setBuildings(response.data.data || []);
      }
    } catch (error) {
      message.error('获取宿舍楼列表失败');
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchStudents();
    fetchStaff();
    fetchBuildings();
  }, []);

  const handleBuildingChange = async (buildingId) => {
    try {
      const response = await dormitoryApi.getRooms(buildingId);
      if (response.data.code === 200) {
        setRooms(response.data.data || []);
      }
    } catch (error) {
      message.error('获取房间列表失败');
    }
  };

  const handleRoomChange = async (roomId) => {
    try {
      const response = await dormitoryApi.getBeds(roomId);
      if (response.data.code === 200) {
        setBeds(response.data.data || []);
      }
    } catch (error) {
      message.error('获取床位列表失败');
    }
  };

  const handleStudentChange = async (studentId) => {
    const student = students.find(s => s.studentId === studentId);
    if (student && student.currentBedId) {
      try {
        const bedResponse = await dormitoryApi.getBed(student.currentBedId);
        if (bedResponse.data.code === 200) {
          const bed = bedResponse.data.data;
          const roomId = bed.roomId;
          const buildingId = bed.buildingId;

          form.setFieldsValue({
            buildingId: buildingId,
            roomId: roomId,
            bedId: bed.bedId,
          });

          const roomResponse = await dormitoryApi.getRooms(buildingId);
          if (roomResponse.data.code === 200) {
            setRooms(roomResponse.data.data || []);
          }

          const bedsResponse = await dormitoryApi.getBeds(roomId);
          if (bedsResponse.data.code === 200) {
            setBeds(bedsResponse.data.data || []);
          }
        }
      } catch (error) {
        console.error('获取学生床位信息失败', error);
      }
    } else {
      form.setFieldsValue({
        buildingId: undefined,
        roomId: undefined,
        bedId: undefined,
      });
      setRooms([]);
      setBeds([]);
    }
  };

  const handleCreate = () => {
    form.resetFields();
    setRooms([]);
    setBeds([]);
    setModalVisible(true);
  };

  const handleSubmit = async (values) => {
    const submitData = {
      studentId: values.studentId,
      roomId: values.roomId,
      bedId: values.bedId,
      type: values.type,
      description: values.description,
    };

    try {
      const response = await maintenanceApi.create(submitData);
      if (response.data.code === 200) {
        message.success('报修单提交成功');
        setModalVisible(false);
        fetchRequests();
        fetchStaff();
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      message.error('提交失败');
    }
  };

  const handleStart = async (requestId) => {
    try {
      const response = await maintenanceApi.start(requestId, null);
      if (response.data.code === 200) {
        message.success('开始维修');
        fetchRequests();
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleComplete = async (requestId) => {
    try {
      const response = await maintenanceApi.complete(requestId, '维修完成');
      if (response.data.code === 200) {
        message.success('维修完成');
        fetchRequests();
        fetchStaff();
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleCheckEscalation = async () => {
    try {
      const response = await maintenanceApi.checkEscalation();
      if (response.data.code === 200) {
        message.success('报修单升级检查完成');
        fetchRequests();
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      message.error('检查失败');
    }
  };

  const getStatusTag = (status, escalated) => {
    const statusMap = {
      SUBMITTED: { color: 'blue', text: '已提交' },
      ASSIGNED: { color: 'orange', text: '已分配' },
      IN_PROGRESS: { color: 'processing', text: '处理中' },
      COMPLETED: { color: 'green', text: '已完成' },
      ESCALATED: { color: 'red', text: '已升级' },
    };
    const info = statusMap[status] || { color: 'default', text: status };
    return (
      <Space>
        <Tag color={info.color}>{info.text}</Tag>
        {escalated && <Tag color="red" icon={<WarningOutlined />}>已升级</Tag>}
      </Space>
    );
  };

  const getTypeText = (type) => {
    const typeMap = {
      ELECTRICAL: '电路故障',
      PLUMBING: '水管故障',
      FURNITURE: '家具损坏',
      AIR_CONDITIONING: '空调故障',
      DOOR_LOCK: '门锁故障',
      LIGHTING: '照明故障',
      OTHER: '其他',
    };
    return typeMap[type] || type;
  };

  const columns = [
    {
      title: '报修单ID',
      dataIndex: 'requestId',
      key: 'requestId',
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
      title: '维修类型',
      dataIndex: 'type',
      key: 'type',
      render: (type) => getTypeText(type),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '状态',
      key: 'status',
      render: (_, record) => getStatusTag(record.status, record.escalated),
    },
    {
      title: '分配维修人员',
      dataIndex: 'assignedStaffId',
      key: 'assignedStaffId',
      render: (staffId) => {
        const s = staff.find(item => item.staffId === staffId);
        return s ? s.name : staffId || '-';
      },
    },
    {
      title: '提交时间',
      dataIndex: 'submitTime',
      key: 'submitTime',
      render: (time) => time ? dayjs(time).format('YYYY-MM-DD HH:mm') : '-',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => {
        if (record.status === 'SUBMITTED' || record.status === 'ASSIGNED' || record.status === 'ESCALATED') {
          return (
            <Space>
              <Popconfirm
                title="确认开始维修？"
                onConfirm={() => handleStart(record.requestId)}
                okText="确认"
                cancelText="取消"
              >
                <Button type="link" size="small" icon={<ToolOutlined />}>
                  开始维修
                </Button>
              </Popconfirm>
            </Space>
          );
        }
        if (record.status === 'IN_PROGRESS') {
          return (
            <Space>
              <Popconfirm
                title="确认维修完成？"
                onConfirm={() => handleComplete(record.requestId)}
                okText="确认"
                cancelText="取消"
              >
                <Button type="link" size="small" icon={<CheckOutlined />}>
                  完成维修
                </Button>
              </Popconfirm>
            </Space>
          );
        }
        return <Tag color="default">已完成</Tag>;
      },
    },
  ];

  const maintenanceTypes = [
    { value: 'ELECTRICAL', label: '电路故障' },
    { value: 'PLUMBING', label: '水管故障' },
    { value: 'FURNITURE', label: '家具损坏' },
    { value: 'AIR_CONDITIONING', label: '空调故障' },
    { value: 'DOOR_LOCK', label: '门锁故障' },
    { value: 'LIGHTING', label: '照明故障' },
    { value: 'OTHER', label: '其他' },
  ];

  return (
    <Card 
      title="维修报修管理" 
      extra={
        <Row gutter={16}>
          <Col>
            <Button icon={<ReloadOutlined />} onClick={fetchRequests}>
              刷新
            </Button>
          </Col>
          <Col>
            <Button icon={<WarningOutlined />} onClick={handleCheckEscalation}>
              检查升级
            </Button>
          </Col>
          <Col>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
              提交报修
            </Button>
          </Col>
        </Row>
      }
    >
      <Table
        columns={columns}
        dataSource={requests}
        rowKey="requestId"
        loading={loading}
        scroll={{ x: 1200 }}
      />

      <Modal
        title="提交报修单"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={700}
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
                  {student.accommodationStatus === 'ACCOMMODATED' && student.currentBedId && (
                    <span style={{ color: '#52c41a', marginLeft: 8 }}>
                      (已入住)
                    </span>
                  )}
                  {student.accommodationStatus !== 'ACCOMMODATED' && (
                    <span style={{ color: '#999', marginLeft: 8 }}>
                      (未入住)
                    </span>
                  )}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="buildingId"
                label="选择宿舍楼"
                rules={[{ required: true, message: '请选择宿舍楼' }]}
              >
                <Select
                  placeholder="请选择宿舍楼"
                  onChange={handleBuildingChange}
                >
                  {buildings.map(building => (
                    <Option key={building.buildingId} value={building.buildingId}>
                      {building.buildingName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="roomId"
                label="选择房间"
                rules={[{ required: true, message: '请选择房间' }]}
              >
                <Select
                  placeholder="请选择房间"
                  onChange={handleRoomChange}
                >
                  {rooms.map(room => (
                    <Option key={room.roomId} value={room.roomId}>
                      {room.roomNumber}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="bedId"
                label="选择床位"
              >
                <Select placeholder="请选择床位（可选）">
                  {beds.map(bed => (
                    <Option key={bed.bedId} value={bed.bedId}>
                      {bed.bedNumber}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="type"
            label="维修类型"
            rules={[{ required: true, message: '请选择维修类型' }]}
          >
            <Select placeholder="请选择维修类型">
              {maintenanceTypes.map(type => (
                <Option key={type.value} value={type.value}>
                  {type.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="问题描述"
            rules={[{ required: true, message: '请输入问题描述' }]}
          >
            <TextArea
              rows={4}
              placeholder="请详细描述问题"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              提交报修
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default MaintenanceRequests;
