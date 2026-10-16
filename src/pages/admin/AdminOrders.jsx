import React, { useState, useEffect } from 'react';
import { Table, Tag, Select, message, Card } from 'antd';
import axios from 'axios';
import { auth } from '../../config/firebase';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) return;
      const token = await user.getIdToken();

      const res = await axios.get('http://127.0.0.1:8000/api/admin/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setOrders(res.data.items || res.data || []);
    } catch (error) {
      console.error("Lỗi lấy danh sách đơn hàng:", error);
      message.error("Không thể tải danh sách đơn hàng!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) fetchOrders();
    });
    return () => unsubscribe();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const user = auth.currentUser;
      const token = await user.getIdToken();

      // Gửi giá trị in hoa khớp với chuẩn Enum của Pydantic backend
      await axios.patch(`http://127.0.0.1:8000/api/admin/orders/${orderId}/status`, {
        status: newStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      message.success("Cập nhật trạng thái đơn hàng thành công!");
      fetchOrders();
    } catch (error) {
      console.error("Chi tiết lỗi 422 từ Backend:", error.response?.data);
      message.error("Cập nhật trạng thái thất bại!");
    }
  };

  const columns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'id',
      key: 'id',
      render: (id) => <span style={{ fontSize: '12px', color: '#888' }}>{String(id).substring(0, 8)}...</span>
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (amount) => Number(amount || 0).toLocaleString('vi-VN') + ' đ'
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'gold';
        const stt = status ? status.toLowerCase() : '';
        if (stt === 'delivered') color = 'green';
        if (stt === 'cancelled') color = 'red';
        if (stt === 'shipping') color = 'blue';
        return <Tag color={color}>{status ? status.toUpperCase() : 'PENDING'}</Tag>;
      }
    },
    {
      title: 'Đổi trạng thái',
      key: 'action',
      render: (_, record) => (
        <Select
          defaultValue={record.status || 'pending'}
          style={{ width: 140 }}
          onChange={(value) => handleStatusChange(record.id, value)}
          options={[
            { value: 'pending', label: 'Chờ xử lý' },
            { value: 'processing', label: 'Đang xử lý' },
            { value: 'shipped', label: 'Đang giao' },
            { value: 'delivered', label: 'Đã giao' },
            { value: 'cancelled', label: 'Đã hủy' }
          ]}
        />
      ),
    },
  ];

  return (
    <Card title="Quản lý Đơn hàng hệ thống">
      <Table 
        columns={columns} 
        dataSource={orders} 
        rowKey="id" 
        loading={loading}
        pagination={{ pageSize: 8 }}
      />
    </Card>
  );
};

export default AdminOrders;