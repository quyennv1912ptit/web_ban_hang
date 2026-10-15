import React, { useState } from 'react';
import { Table, Button, Space, Tag, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const AdminProducts = () => {
  // Dữ liệu mẫu (sau này lấy từ API/Firebase)
  const [products, setProducts] = useState([
    { id: 'SP001', name: 'Áo thun Pờ tít', price: 150000, stock: 120, status: 'Còn hàng' },
    { id: 'SP002', name: 'Áo khoác mùa đông', price: 350000, stock: 0, status: 'Hết hàng' },
    { id: 'SP003', name: 'Balo sinh viên', price: 250000, stock: 45, status: 'Còn hàng' },
  ]);

  // Hàm mô phỏng việc xóa sản phẩm
  const handleDelete = (id) => {
    const newData = products.filter(item => item.id !== id);
    setProducts(newData);
    message.success('Đã xóa sản phẩm thành công!');
  };

  // Cấu hình các cột cho Bảng
  const columns = [
    { 
      title: 'Mã SP', 
      dataIndex: 'id', 
      key: 'id',
      fontWeight: 'bold',
    },
    { 
      title: 'Tên sản phẩm', 
      dataIndex: 'name', 
      key: 'name' 
    },
    { 
      title: 'Giá bán (VNĐ)', 
      dataIndex: 'price', 
      key: 'price',
      render: (price) => price.toLocaleString('vi-VN') + ' đ'
    },
    { 
      title: 'Tồn kho', 
      dataIndex: 'stock', 
      key: 'stock' 
    },
    { 
      title: 'Trạng thái', 
      dataIndex: 'status', 
      key: 'status',
      render: (status) => (
        <Tag color={status === 'Còn hàng' ? 'green' : 'red'}>
          {status}
        </Tag>
      )
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="primary" ghost icon={<EditOutlined />}>Sửa</Button>
          
          <Popconfirm
            title="Xóa sản phẩm"
            description="Bạn có chắc chắn muốn xóa sản phẩm này không?"
            onConfirm={() => handleDelete(record.id)}
            okText="Có, xóa"
            cancelText="Hủy"
          >
            <Button danger icon={<DeleteOutlined />}>Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0 }}>Quản lý Sản phẩm</h2>
        <Button type="primary" icon={<PlusOutlined />} size="large">
          Thêm sản phẩm mới
        </Button>
      </div>
      
      <Table 
        columns={columns} 
        dataSource={products} 
        rowKey="id" 
        pagination={{ pageSize: 5 }} 
      />
    </div>
  );
};

export default AdminProducts;