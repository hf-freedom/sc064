import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, theme } from 'antd';
import {
  TeamOutlined,
  HomeOutlined,
  FileTextOutlined,
  ToolOutlined,
  LockOutlined,
  LogoutOutlined,
  SwapOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import StudentManagement from './pages/StudentManagement';
import DormitoryAssignment from './pages/DormitoryAssignment';
import UtilityBills from './pages/UtilityBills';
import MaintenanceRequests from './pages/MaintenanceRequests';
import AccessCardManagement from './pages/AccessCardManagement';
import CheckOutManagement from './pages/CheckOutManagement';
import RoomChangeManagement from './pages/RoomChangeManagement';
import DisciplineManagement from './pages/DisciplineManagement';

const { Header, Sider, Content } = Layout;

function App() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const menuItems = [
    {
      key: '/students',
      icon: <TeamOutlined />,
      label: '学生管理',
    },
    {
      key: '/dormitory',
      icon: <HomeOutlined />,
      label: '宿舍分配',
    },
    {
      key: '/bills',
      icon: <FileTextOutlined />,
      label: '水电账单',
    },
    {
      key: '/maintenance',
      icon: <ToolOutlined />,
      label: '维修报修',
    },
    {
      key: '/access-cards',
      icon: <LockOutlined />,
      label: '门禁管理',
    },
    {
      key: '/checkout',
      icon: <LogoutOutlined />,
      label: '退宿管理',
    },
    {
      key: '/room-change',
      icon: <SwapOutlined />,
      label: '换宿管理',
    },
    {
      key: '/discipline',
      icon: <WarningOutlined />,
      label: '违纪管理',
    },
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
        <div style={{
          height: 64,
          margin: 16,
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
          fontSize: collapsed ? 12 : 16,
        }}>
          {collapsed ? '宿舍系统' : '校园宿舍管理系统'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }}>
          <h2 style={{ marginLeft: 24, lineHeight: '64px' }}>校园宿舍管理系统</h2>
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <Routes>
            <Route path="/" element={<StudentManagement />} />
            <Route path="/students" element={<StudentManagement />} />
            <Route path="/dormitory" element={<DormitoryAssignment />} />
            <Route path="/bills" element={<UtilityBills />} />
            <Route path="/maintenance" element={<MaintenanceRequests />} />
            <Route path="/access-cards" element={<AccessCardManagement />} />
            <Route path="/checkout" element={<CheckOutManagement />} />
            <Route path="/room-change" element={<RoomChangeManagement />} />
            <Route path="/discipline" element={<DisciplineManagement />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
}

export default App;
