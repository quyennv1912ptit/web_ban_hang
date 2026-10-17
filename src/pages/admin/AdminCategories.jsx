import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, Popconfirm, message, Card } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axiosClient from '../../api/axiosClient';
import { auth } from '../../config/firebase';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form] = Form.useForm();

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) return;
      const token = await user.getIdToken();

      const res = await axiosClient.get('/admin/categories', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(res.data || []);
    } catch (error) {
      console.error("Lỗi lấy danh mục:", error);
      message.error("Không thể tải danh mục sản phẩm!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) fetchCategories();
    });
    return () => unsubscribe();
  }, []);

  const handleOpenModal = (category = null) => {
    setEditingCategory(category);
    if (category) {
      form.setFieldsValue(category);
    } else {
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const handleSaveCategory = async (values) => {
    try {
      const user = auth.currentUser;
      const token = await user.getIdToken();
      const headers = { Authorization: `Bearer ${token}` };

      if (editingCategory) {
        // Cập nhật danh mục
        await axiosClient.put(`/admin/categories/${editingCategory.id}`, values, { headers });
        message.success("Cập nhật danh mục thành công!");
      } else {
        // Tạo mới danh mục
        await axiosClient.post('/admin/categories', values, { headers });
        message.success("Thêm danh mục mới thành công!");
      }

      setIsModalOpen(false);
      fetchCategories();
    } catch (error) {
      console.error(error);
      message.error("Lưu danh mục thất bại!");
    }
  };

  const handleDelete = async (id) => {
    try {
      const user = auth.currentUser;
      const token = await user.getIdToken();

      await axiosClient.delete(`/admin/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      message.success("Xóa danh mục thành công!");
      fetchCategories();
    } catch (error) {
      console.error(error);
      message.error("Xóa danh mục thất bại!");
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Tên danh mục', dataIndex: 'name', key: 'name' },
    { title: 'Slug', dataIndex: 'slug', key: 'slug' },
    { title: 'Icon', dataIndex: 'icon', key: 'icon', render: (icon) => icon || 'Không có' },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="primary" ghost icon={<EditOutlined />} onClick={() => handleOpenModal(record)}>Sửa</Button>
          <Popconfirm
            title="Xóa danh mục"
            description="Bạn có chắc chắn muốn xóa danh mục này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
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
        <h2 style={{ margin: 0 }}>Quản lý Danh mục sản phẩm</h2>
        <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => handleOpenModal(null)}>
          Thêm danh mục
        </Button>
      </div>

      <Card>
        <Table columns={columns} dataSource={categories} rowKey="id" loading={loading} />
      </Card>

      <Modal
        title={editingCategory ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={handleSaveCategory}>
          <Form.Item name="name" label="Tên danh mục" rules={[{ required: true, message: 'Vui lòng nhập tên danh mục!' }]}>
            <Input placeholder="Ví dụ: Thời trang nam" />
          </Form.Item>
          <Form.Item name="slug" label="Slug URL" rules={[{ required: true, message: 'Vui lòng nhập slug!' }]}>
            <Input placeholder="Ví dụ: thoi-trang-nam" />
          </Form.Item>
          <Form.Item name="icon" label="Icon (Tùy chọn)">
            <Input placeholder="Tên icon hoặc URL..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminCategories;