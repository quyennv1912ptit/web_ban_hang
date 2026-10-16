import React, { useState, useEffect } from 'react';
import { Table, Button, Popconfirm, message, Card, Rate } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';
import { auth } from '../../config/firebase';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) return;
      const token = await user.getIdToken();

      const res = await axios.get('http://127.0.0.1:8000/api/admin/reviews', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setReviews(res.data.items || res.data || []);
    } catch (error) {
      console.error("Lỗi lấy danh sách đánh giá:", error);
      message.error("Không thể tải danh sách đánh giá!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) fetchReviews();
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async (reviewId) => {
    try {
      const user = auth.currentUser;
      const token = await user.getIdToken();

      await axios.delete(`http://127.0.0.1:8000/api/admin/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      message.success("Đã xóa đánh giá và cập nhật lại điểm sản phẩm!");
      fetchReviews();
    } catch (error) {
      console.error(error);
      message.error("Xóa đánh giá thất bại!");
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
      title: 'Đánh giá (Sao)',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating) => <Rate disabled defaultValue={rating} />
    },
    {
      title: 'Nội dung bình luận',
      dataIndex: 'comment',
      key: 'comment',
      render: (comment) => comment || 'Không có bình luận'
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Popconfirm
          title="Xóa đánh giá"
          description="Bạn có chắc muốn xóa đánh giá vi phạm này không?"
          onConfirm={() => handleDelete(record.id)}
          okText="Xóa"
          cancelText="Hủy"
        >
          <Button danger icon={<DeleteOutlined />}>Xóa</Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <Card title="Kiểm duyệt Đánh giá sản phẩm">
      <Table 
        columns={columns} 
        dataSource={reviews} 
        rowKey="id" 
        loading={loading}
        pagination={{ pageSize: 8 }}
      />
    </Card>
  );
};

export default AdminReviews;