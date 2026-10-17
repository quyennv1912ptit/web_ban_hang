import React from 'react';
import { Suspense } from 'react';
import { Layout, Menu, Button } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  DashboardOutlined, 
  ShoppingOutlined, 
  ShoppingCartOutlined, 
  UserOutlined, 
  HomeOutlined,
  StarOutlined,
  AppstoreOutlined
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible>
        <div style={{ color: 'white', padding: '16px', textAlign: 'center', fontWeight: 'bold', fontSize: '16px' }}>
          ADMIN PANEL
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          onClick={({ key }) => navigate(key)}
          items={[
            { key: '/admin', icon: <DashboardOutlined />, label: 'Tổng quan' },
            { key: '/admin/products', icon: <ShoppingOutlined />, label: 'Sản phẩm' },
            { key: '/admin/orders', icon: <ShoppingCartOutlined />, label: 'Đơn hàng' },
            { key: '/admin/users', icon: <UserOutlined />, label: 'Người dùng' },
            { key: '/admin/reviews', icon: <StarOutlined />, label: 'Đánh giá' },
            { key: '/admin/categories', icon: <AppstoreOutlined />, label: 'Danh mục' },
          ]}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Button 
            type="primary" 
            ghost 
            icon={<HomeOutlined />} 
            onClick={() => navigate('/')}
          >
            Về trang khách hàng
          </Button>

          <span style={{ fontWeight: '500' }}>Xin chào, Admin</span>
        </Header>
        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff', minHeight: 280 }}>
          <Suspense fallback={<div role="status" style={{ minHeight: 280, display: 'grid', placeItems: 'center' }}>Đang tải trang...</div>}>
            <Outlet />
          </Suspense>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
