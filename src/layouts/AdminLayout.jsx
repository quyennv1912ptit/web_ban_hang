import React from 'react';
import { Layout, Menu } from 'antd';
import { DashboardOutlined, ShoppingOutlined, HomeOutlined } from '@ant-design/icons';
import { Outlet, useNavigate } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

const AdminLayout = () => {
  const navigate = useNavigate();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider theme="dark">
        <div style={{ height: 64, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 'bold' }}>
          ADMIN PANEL
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['/admin']}
          onClick={({ key }) => navigate(key)}
          items={[
            { key: '/admin', icon: <DashboardOutlined />, label: 'Tổng quan' },
            { key: '/admin/products', icon: <ShoppingOutlined />, label: 'Quản lý Sản phẩm' },
            { key: '/', icon: <HomeOutlined />, label: 'Về trang Khách' }, // Nút để thoát ra web ngoài
          ]}
        />
      </Sider>
      
      <Layout>
        <Header style={{ background: '#fff', padding: 0 }} />
        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff', borderRadius: 8 }}>
          {/* Outlet chính là nơi render ra các trang con (Dashboard, Products...) */}
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;