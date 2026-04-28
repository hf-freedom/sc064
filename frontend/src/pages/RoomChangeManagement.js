import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Row, Col, Tag, Modal, Form, Select, Input, message, Descriptions, Alert, Cascader, Space } from 'antd';
import { ReloadOutlined, SwapOutlined, WarningOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { roomChangeApi, studentApi, dormitoryApi, billApi, disciplineApi } from '../api';
import dayjs from 'dayjs';

const { Option } = Select;

const RoomChangeManagement = () => {
  const [students, setStudents] = useState([]);
  const [accommodatedStudents, setAccommodatedStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [cascaderOptions, setCascaderOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [studentBills, setStudentBills] = useState([]);
  const [studentDisciplines, setStudentDisciplines] = useState([]);
  const [canChangeRoom, setCanChangeRoom] = useState(true);
  const [form] = Form.useForm();

  const MAX_DISCIPLINE_COUNT = 3;

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

  const buildCascaderOptions = async (gender) => {
    try {
      const buildingRes = await dormitoryApi.getBuildings();
      if (buildingRes.data.code === 200) {
        const buildingList = buildingRes.data.data || [];
        const options = [];
        
        for (const building of buildingList) {
          if (gender && building.genderRestriction !== gender) {
            continue;
          }

          const roomRes = await dormitoryApi.getRooms(building.buildingId);
          if (roomRes.data.code === 200) {
            const roomList = roomRes.data.data || [];
            const roomOptions = [];
            
            for (const room of roomList) {
              const bedRes = await dormitoryApi.getBeds(room.roomId);
              if (bedRes.data.code === 200) {
                const bedList = bedRes.data.data || [];
                const bedOptions = bedList
                  .filter(bed => bed.status === 'AVAILABLE')
                  .map(bed => ({
                    value: bed.bedId,
                    label: `床位 ${bed.bedNumber}`,
                  }));
                
                if (bedOptions.length > 0) {
                  roomOptions.push({
                    value: room.roomId,
                    label: `房间 ${room.roomNumber}`,
                    children: bedOptions,
                  });
                }
              }
            }
            
            if (roomOptions.length > 0) {
              options.push({
                value: building.buildingId,
                label: building.buildingName,
                children: roomOptions,
              });
            }
          }
        }
        setCascaderOptions(options);
      }
    } catch (error) {
      console.error('构建级联选项失败', error);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleStudentChange = async (studentId) => {
    const student = accommodatedStudents.find(s => s.studentId === studentId);
    setSelectedStudent(student);

    if (student) {
      await buildCascaderOptions(student.gender);

      try {
        const billResponse = await billApi.getByStudent(studentId);
        if (billResponse.data.code === 200) {
          const bills = billResponse.data.data || [];
          setStudentBills(bills);
        }

        const disciplineResponse = await disciplineApi.getByStudent(studentId);
        if (disciplineResponse.data.code === 200) {
          const disciplines = disciplineResponse.data.data || [];
          setStudentDisciplines(disciplines);

          const hasArrears = student.arrearsStatus !== 'NO_ARREARS';
          const tooManyDisciplines = student.disciplineCount >= MAX_DISCIPLINE_COUNT;
          setCanChangeRoom(!hasArrears && !tooManyDisciplines);
        }
      } catch (error) {
        message.error('获取学生信息失败');
      }
    }
  };

  const handleChangeRoom = () => {
    if (!selectedStudent) {
      message.warning('请先选择学生');
      return;
    }
    if (!canChangeRoom) {
      message.warning('该学生不符合换宿条件');
      return;
    }
    form.resetFields();
    setModalVisible(true);
  };

  const handleSubmit = async (values) => {
    const newBedId = values.newBedSelection[2];

    const submitData = {
      studentId: selectedStudent.studentId,
      oldBedId: selectedStudent.currentBedId,
      newBedId: newBedId,
      reason: values.reason,
    };

    try {
      const response = await roomChangeApi.change(submitData);
      if (response.data.code === 200) {
        message.success('换宿成功');
        setModalVisible(false);
        setSelectedStudent(null);
        fetchStudents();
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      message.error('换宿失败');
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
      title: '当前床位',
      dataIndex: 'currentBedId',
      key: 'currentBedId',
    },
    {
      title: '违纪次数',
      dataIndex: 'disciplineCount',
      key: 'disciplineCount',
      render: (count) => (
        <Tag color={count >= MAX_DISCIPLINE_COUNT ? 'red' : 'blue'}>
          {count} 次
        </Tag>
      ),
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

  const disciplineColumns = [
    {
      title: '记录ID',
      dataIndex: 'recordId',
      key: 'recordId',
    },
    {
      title: '违纪类型',
      dataIndex: 'violationType',
      key: 'violationType',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
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
    },
  ];

  return (
    <div>
      <Card 
        title="换宿管理" 
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
                icon={<SwapOutlined />} 
                onClick={handleChangeRoom}
                disabled={!selectedStudent || !canChangeRoom}
              >
                申请换宿
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
            >
              <Table
                columns={columns}
                dataSource={accommodatedStudents}
                rowKey="studentId"
                loading={loading}
                size="small"
                pagination={{ pageSize: 6 }}
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
                {!canChangeRoom && (
                  <Alert
                    message="该学生不符合换宿条件"
                    description={
                      <Space direction="vertical">
                        {selectedStudent.disciplineCount >= MAX_DISCIPLINE_COUNT && (
                          <span>• 违纪次数过多（{selectedStudent.disciplineCount}次 ≥ {MAX_DISCIPLINE_COUNT}次）</span>
                        )}
                        {selectedStudent.arrearsStatus !== 'NO_ARREARS' && (
                          <span>• 存在欠费情况</span>
                        )}
                      </Space>
                    }
                    type="error"
                    showIcon
                    icon={<WarningOutlined />}
                    style={{ marginBottom: 16 }}
                  />
                )}
                {canChangeRoom && (
                  <Alert
                    message="该学生符合换宿条件"
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
                    <Descriptions.Item label="违纪次数">{selectedStudent.disciplineCount} 次</Descriptions.Item>
                  </Descriptions>
                </Card>

                {studentDisciplines.length > 0 && (
                  <Card title="违纪记录" size="small" style={{ marginBottom: 16 }}>
                    <Table
                      columns={disciplineColumns}
                      dataSource={studentDisciplines}
                      rowKey="recordId"
                      size="small"
                      pagination={{ pageSize: 3 }}
                    />
                  </Card>
                )}

                <Card title="可选新床位（同性别）" size="small">
                  {cascaderOptions.length > 0 ? (
                    <div>
                      <p style={{ marginBottom: 8, color: '#666' }}>
                        宿舍楼数量：{cascaderOptions.length} 栋
                      </p>
                      <Cascader
                        options={cascaderOptions}
                        placeholder="选择新床位路径：宿舍楼 -> 房间 -> 床位"
                        expandTrigger="hover"
                        style={{ width: '100%' }}
                        disabled
                      />
                    </div>
                  ) : (
                    <div style={{ color: '#999', textAlign: 'center', padding: 20 }}>
                      暂无可用床位
                    </div>
                  )}
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
        title="申请换宿"
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
          {selectedStudent && (
            <div style={{ marginBottom: 16, padding: 16, background: '#f5f5f5', borderRadius: 4 }}>
              <Descriptions column={2} size="small">
                <Descriptions.Item label="学号">{selectedStudent.studentId}</Descriptions.Item>
                <Descriptions.Item label="姓名">{selectedStudent.name}</Descriptions.Item>
                <Descriptions.Item label="原床位">{selectedStudent.currentBedId}</Descriptions.Item>
                <Descriptions.Item label="违纪次数">{selectedStudent.disciplineCount} 次</Descriptions.Item>
              </Descriptions>
            </div>
          )}

          <Form.Item
            name="newBedSelection"
            label="选择新床位"
            rules={[{ required: true, message: '请选择新床位' }]}
          >
            <Cascader
              options={cascaderOptions}
              placeholder="请选择：宿舍楼 -> 房间 -> 床位"
              expandTrigger="hover"
              showSearch
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="reason"
            label="换宿原因"
            rules={[{ required: true, message: '请输入换宿原因' }]}
          >
            <Input.TextArea
              rows={3}
              placeholder="请输入换宿原因"
            />
          </Form.Item>

          <Alert
            message="换宿确认"
            description="换宿后将：1. 释放旧床位；2. 分配新床位；3. 迁移门禁权限。请确认后再提交。"
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Form.Item>
            <Button type="primary" htmlType="submit">
              确认换宿
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

export default RoomChangeManagement;
