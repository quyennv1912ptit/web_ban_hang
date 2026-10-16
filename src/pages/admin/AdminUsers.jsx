import React, { useState, useEffect } from 'react';
import { Table, Tag, Select, message, Card } from 'antd';
import axios from 'axios';
import { auth } from '../../config/firebase';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Lấy danh sách user từ backend
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) return;
      const token = await user.getIdToken();

      const res = await axios.get('http://127.0.0.1:8000/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Hứng dữ liệu phân trang từ FastAPI
      setUsers(res.data.items || res.data || []);
    } catch (error) {
      console.error("Lỗi lấy danh sách user:", error);
      message.error("Không thể tải danh sách người dùng!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) fetchUsers();
    });
    return () => unsubscribe();
  }, []);

  // Hàm thay đổi role trực tiếp trên bảng
  const handleRoleChange = async (userId, newRole) => {
    try {
      const user = auth.currentUser;
      const token = await user.getIdToken();

      await axios.patch(`http://127.0.0.1:8000/api/admin/users/${userId}`, {
        role: newRole
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      message.success("Cập nhật quyền thành công!");
      fetchUsers(); // Tải lại danh sách
    } catch (error) {
      console.error(error);
      message.error(error.response?.data?.detail || "Cập nhật quyền thất bại!");
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      render: (id) => <span style={{ fontSize: '12px', color: '#888' }}>{String(id).substring(0, 8)}...</span>
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Họ tên',
      dataIndex: 'full_name',
      key: 'full_name',
      render: (name) => name || 'Chưa cập nhật'
    },
    {
      title: 'Vai trò hiện tại',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={role === 'admin' ? 'geekblue' : 'green'}>
          {role ? role.toUpperCase() : 'CUSTOMER'}
        </Tag>
      )
    },
    {
      title: 'Hành động (Đổi quyền)',
      key: 'action',
      render: (_, record) => (
        <Select
          defaultValue={record.role || 'customer'}
          style={{ width: 130 }}
          onChange={(value) => handleRoleChange(record.id, value)}
          options={[
            { value: 'customer', label: 'Customer' },
            { value: 'admin', label: 'Admin' }
          ]}
        />
      ),
    },
  ];

  return (
    <Card title="Quản lý người dùng hệ thống">
      <Table 
        columns={columns} 
        dataSource={users} 
        rowKey="id" 
        loading={loading}
        pagination={{ pageSize: 8 }}
      />
    </Card>
  );
};

export default AdminUsers;