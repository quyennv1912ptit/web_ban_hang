import React from 'react';
import { Card, Col, Row, Statistic } from 'antd';

const AdminDashboard = () => {
  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>Tổng quan hệ thống</h2>
      <Row gutter={16}>
        <Col span={8}>
          <Card bordered={false} style={{ background: '#f6ffed' }}>
            <Statistic title="Doanh thu hôm nay" value={3500000} suffix="VNĐ" valueStyle={{ color: '#3f8600' }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false} style={{ background: '#e6f7ff' }}>
            <Statistic title="Đơn hàng chờ xử lý" value={12} valueStyle={{ color: '#1890ff' }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false} style={{ background: '#fff2e8' }}>
            <Statistic title="Tổng sản phẩm" value={145} valueStyle={{ color: '#fa541c' }} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;