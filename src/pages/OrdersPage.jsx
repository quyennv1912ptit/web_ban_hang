import React, { useState } from 'react';
import { Table, Tag, Button } from 'antd';
import { FiPackage } from 'react-icons/fi';
import './OrdersPage.css'; // Import file CSS vào đây

const OrdersPage = () => {
  const [orders, setOrders] = useState([
    { id: 'DH001', date: '10/10/2026', total: 450000, status: 'Đang giao' },
    { id: 'DH002', date: '05/10/2026', total: 150000, status: 'Hoàn thành' },
    { id: 'DH003', date: '01/10/2026', total: 890000, status: 'Đã hủy' },
    { id: 'DH004', date: '28/09/2026', total: 320000, status: 'Chờ xác nhận' },
  ]);

  const columns = [
    { title: 'Mã đơn', dataIndex: 'id', key: 'id', render: (text) => <strong>{text}</strong> },
    { title: 'Ngày đặt', dataIndex: 'date', key: 'date' },
    { 
      title: 'Tổng tiền (VNĐ)', 
      dataIndex: 'total', 
      key: 'total',
      render: (val) => val.toLocaleString('vi-VN') + ' đ'
    },
    { 
      title: 'Trạng thái', 
      dataIndex: 'status', 
      key: 'status',
      render: (status) => {
        let color = 'blue';
        if (status === 'Hoàn thành') color = 'green';
        if (status === 'Đã hủy') color = 'red';
        if (status === 'Chờ xác nhận') color = 'orange';
        return <Tag color={color}>{status}</Tag>;
      }
    },
    {
      title: 'Hành động',
      key: 'action',
      render: () => <Button type="link" size="small">Xem chi tiết</Button>,
    },
  ];

  return (
    <div className="orders-page">
      <h2 className="orders-page__title">
        <FiPackage /> Đơn mua của tôi
      </h2>
      
      <div className="orders-page__table-container">
        <Table 
          columns={columns} 
          dataSource={orders} 
          rowKey="id" 
          pagination={false} 
        />
      </div>
    </div>
  );
};

export default OrdersPage;