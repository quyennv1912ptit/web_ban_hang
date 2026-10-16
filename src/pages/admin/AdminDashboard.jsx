import React, { useState, useEffect } from 'react';
import { Card, Col, Row, Statistic, message } from 'antd';
import { UserOutlined, ShoppingCartOutlined, AppstoreOutlined, DollarCircleOutlined } from '@ant-design/icons';
import axios from 'axios';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    total_revenue: 0,
    total_orders: 0,
    total_products: 0,
    total_users: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // Gọi thẳng tới endpoint analytics không cần kèm header token rườm rà
        const res = await axios.get('http://127.0.0.1:8000/api/admin/analytics');
        setStats(res.data);
      } catch (error) {
        console.error("Lỗi lấy dữ liệu thống kê:", error);
        message.error("Không thể tải dữ liệu tổng quan từ Admin");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>Tổng quan hệ thống</h2>
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card bordered={false} style={{ background: '#f6ffed' }} loading={loading}>
            <Statistic 
              title="Tổng doanh thu" 
              value={stats.total_revenue} 
              suffix="VNĐ" 
              valueStyle={{ color: '#3f8600' }} 
              prefix={<DollarCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false} style={{ background: '#e6f7ff' }} loading={loading}>
            <Statistic 
              title="Tổng đơn hàng" 
              value={stats.total_orders} 
              valueStyle={{ color: '#1890ff' }} 
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false} style={{ background: '#fff2e8' }} loading={loading}>
            <Statistic 
              title="Tổng sản phẩm" 
              value={stats.total_products} 
              valueStyle={{ color: '#fa541c' }} 
              prefix={<AppstoreOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false} style={{ background: '#f9f0ff' }} loading={loading}>
            <Statistic 
              title="Tổng người dùng" 
              value={stats.total_users} 
              valueStyle={{ color: '#722ed1' }} 
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;