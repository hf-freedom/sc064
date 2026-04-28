import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Row, Col, Select, Modal, Form, message, Cascader, Tabs } from 'antd';
import { ReloadOutlined, HomeOutlined, TeamOutlined } from '@ant-design/icons';
import { dormitoryApi, studentApi } from '../api';

const { Option } = Select;
const { TabPane } = Tabs;

const DormitoryAssignment = () => {
  const [buildings, setBuildings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [beds, setBeds] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedBed, setSelectedBed] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [form] = Form.useForm();
  const [cascaderOptions, setCascaderOptions] = useState([]);

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

  const loadRooms = async (buildingId) => {
    try {
      const response = await dormitoryApi.getRooms(buildingId);
      if (response.data.code === 200) {
        setRooms(response.data.data || []);
      }
    } catch (error) {
      message.error('获取房间列表失败');
    }
  };

  const loadBeds = async (roomId) => {
    try {
      const response = await dormitoryApi.getBeds(roomId);
      if (response.data.code === 200) {
        setBeds(response.data.data || []);
      }
    } catch (error) {
      message.error('获取床位列表失败');
    }
  };

  const buildCascaderOptions = async (gender = null) => {
    try {
      let buildingList;
      
      if (gender) {
        const buildingRes = await dormitoryApi.getBuildings();
        if (buildingRes.data.code === 200) {
          buildingList = buildingRes.data.data.filter(b => b.genderRestriction === gender) || [];
        }
      } else {
        const buildingRes = await dormitoryApi.getBuildings();
        if (buildingRes.data.code === 200) {
          buildingList = buildingRes.data.data || [];
        }
      }

      if (!buildingList || buildingList.length === 0) {
        setCascaderOptions([]);
        return;
      }

      const options = [];
      
      for (const building of buildingList) {
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
    } catch (error) {
      console.error('构建级联选项失败', error);
    }
  };

  const handleStudentChange = (studentId) => {
    const student = students.find(s => s.studentId === studentId);
    if (student) {
      form.setFieldsValue({ bedSelection: undefined });
      buildCascaderOptions(student.gender);
    } else {
      buildCascaderOptions(null);
    }
  };

  useEffect(() => {
    fetchBuildings();
    fetchStudents();
  }, []);

  const handleAssign = () => {
    setSelectedBed(null);
    setSelectedStudent(null);
    form.resetFields();
    setCascaderOptions([]);
    setModalVisible(true);
  };

  const handleSubmit = async (values) => {
    const bedId = values.bedSelection[2];
    const studentId = values.studentId;

    try {
      const response = await dormitoryApi.assign({
        studentId,
        bedId,
      });

      if (response.data.code === 200) {
        message.success('宿舍分配成功');
        setModalVisible(false);
        fetchStudents();
        buildCascaderOptions();
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      message.error('分配失败');
    }
  };

  const buildingColumns = [
    {
      title: '宿舍楼ID',
      dataIndex: 'buildingId',
      key: 'buildingId',
    },
    {
      title: '宿舍楼名称',
      dataIndex: 'buildingName',
      key: 'buildingName',
    },
    {
      title: '性别限制',
      dataIndex: 'genderRestriction',
      key: 'genderRestriction',
      render: (gender) => gender === 'MALE' ? '男生' : '女生',
    },
    {
      title: '楼层数',
      dataIndex: 'floorCount',
      key: 'floorCount',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
  ];

  const bedColumns = [
    {
      title: '床位ID',
      dataIndex: 'bedId',
      key: 'bedId',
    },
    {
      title: '床位号',
      dataIndex: 'bedNumber',
      key: 'bedNumber',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusMap = {
          AVAILABLE: '可用',
          OCCUPIED: '已占用',
          MAINTENANCE: '维护中',
        };
        return statusMap[status] || status;
      },
    },
    {
      title: '学生ID',
      dataIndex: 'studentId',
      key: 'studentId',
    },
  ];

  const studentColumns = [
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
  ];

  return (
    <div>
      <Row gutter={16}>
        <Col span={24}>
          <Card 
            title="宿舍分配" 
            extra={
              <Row gutter={16}>
                <Col>
                  <Button 
                    icon={<ReloadOutlined />} 
                    onClick={() => { fetchBuildings(); fetchStudents(); buildCascaderOptions(); }}
                  >
                    刷新
                  </Button>
                </Col>
                <Col>
                  <Button type="primary" onClick={handleAssign}>
                    分配宿舍
                  </Button>
                </Col>
              </Row>
            }
          >
            <Tabs defaultActiveKey="1">
              <TabPane tab={<span><HomeOutlined />宿舍楼信息</span>} key="1">
                <Table
                  columns={buildingColumns}
                  dataSource={buildings}
                  rowKey="buildingId"
                  pagination={false}
                />
              </TabPane>
              <TabPane tab={<span><TeamOutlined />学生住宿状态</span>} key="2">
                <Table
                  columns={studentColumns}
                  dataSource={students}
                  rowKey="studentId"
                  loading={loading}
                />
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>

      <Modal
        title="分配宿舍"
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
              placeholder="请选择学生（仅显示未入住且无欠费的学生）"
              showSearch
              optionFilterProp="children"
              onChange={handleStudentChange}
            >
              {students
                .filter(s => {
                  const isNotAccommodated = s.accommodationStatus === 'NOT_ACCOMMODATED';
                  const hasNoArrears = s.arrearsStatus === 'NO_ARREARS' || 
                                      s.arrearsStatus === null || 
                                      s.arrearsStatus === undefined;
                  return isNotAccommodated && hasNoArrears;
                })
                .map(student => (
                  <Option key={student.studentId} value={student.studentId}>
                    {student.studentId} - {student.name} 
                    <span style={{ marginLeft: 8, color: student.gender === 'MALE' ? '#1890ff' : '#eb2f96' }}>
                      [{student.gender === 'MALE' ? '男' : '女'}生]
                    </span>
                  </Option>
                ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="bedSelection"
            label="选择床位"
            rules={[{ required: true, message: '请选择床位' }]}
          >
            <Cascader
              options={cascaderOptions}
              placeholder="请先选择学生，然后选择匹配性别的床位"
              expandTrigger="hover"
              showSearch
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              确认分配
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DormitoryAssignment;
