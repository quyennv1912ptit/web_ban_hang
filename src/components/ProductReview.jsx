import React, { useState, useEffect } from 'react';
import { Rate, Input, Button, Avatar, message, Popconfirm, Spin, Select } from 'antd';
import { UserOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';
import { auth } from '../config/firebase';

const { TextArea } = Input;

const ProductReviews = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Delivered Orders
  const [deliveredOrders, setDeliveredOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  // Form State
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const currentUser = auth.currentUser;

  // 1. Tải danh sách đánh giá từ API backend (Lưu ý: backend dùng fastapi-pagination)
  const fetchReviews = async () => {
    try {
      const res = await axios.get(`http://127.0.0.1:8000/api/products/${productId}/reviews`);
      // fastapi-pagination trả về dữ liệu nằm trong res.data.items
      setReviews(res.data.items || res.data || []);
    } catch (error) {
      console.error("Lỗi tải đánh giá:", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Kiểm tra xem user có đơn hàng nào đã giao chứa sản phẩm này không (để lấy order_id)
  const checkDeliveredOrders = async () => {
    if (!currentUser) return;
    try {
      const token = await currentUser.getIdToken();
      const res = await axios.get(`http://127.0.0.1:8000/api/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const ordersList = res.data.items || res.data || [];
      // Lọc các đơn hàng trạng thái 'delivered' chứa sản phẩm này
      const eligible = ordersList.filter(order => 
        order.status === 'delivered' && 
        order.items?.some(item => item.product_id === productId)
      );

      setDeliveredOrders(eligible);
      if (eligible.length > 0) {
        setSelectedOrderId(eligible[0].id); // Tự động chọn đơn hàng đầu tiên tìm thấy
      }
    } catch (error) {
      console.error("Lỗi kiểm tra đơn hàng:", error);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchReviews();
      checkDeliveredOrders();
    }
  }, [productId]);

  // 3. Gửi đánh giá mới
  const handleSubmit = async () => {
    if (!currentUser) {
      message.warning('Vui lòng đăng nhập để gửi đánh giá!');
      return;
    }

    if (!selectedOrderId) {
      message.warning('Bạn chỉ có thể đánh giá sản phẩm sau khi đã mua và nhận hàng thành công!');
      return;
    }

    if (!comment.trim()) {
      message.warning('Vui lòng nhập nội dung nhận xét!');
      return;
    }

    setSubmitting(true);
    try {
      const token = await currentUser.getIdToken();
      await axios.post(
        `http://127.0.0.1:8000/api/products/${productId}/reviews`,
        {
          order_id: selectedOrderId,
          rating: rating,
          comment: comment
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      message.success('Cảm ơn bạn đã gửi đánh giá! ❤️');
      setComment('');
      fetchReviews(); // Tải lại danh sách
    } catch (error) {
      console.error("Lỗi gửi đánh giá:", error);
      const errorMsg = error.response?.data?.detail || 'Không thể gửi đánh giá!';
      message.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // 4. Xóa đánh giá
  const handleDelete = async (reviewId) => {
    try {
      const token = await currentUser.getIdToken();
      await axios.delete(
        `http://127.0.0.1:8000/api/products/${productId}/reviews/${reviewId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      message.success('Đã xóa đánh giá');
      setReviews(prev => prev.filter(r => r.id !== reviewId));
    } catch (error) {
      console.error("Lỗi xóa đánh giá:", error);
      message.error('Không thể xóa đánh giá này!');
    }
  };

  // Tính điểm trung bình hiển thị
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
    : 5.0;

  return (
    <div style={{ marginTop: '40px', background: '#fff', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>
        Đánh giá & Nhận xét sản phẩm
      </h2>

      {/* TỔNG QUAN RATING */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px', padding: '16px', background: '#fafafa', borderRadius: '8px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#ff4d4f' }}>{avgRating}</div>
          <Rate disabled allowHalf value={Number(avgRating)} style={{ fontSize: '16px' }} />
          <div style={{ color: '#8c8c8c', marginTop: '4px' }}>({reviews.length} đánh giá)</div>
        </div>
      </div>

      {/* FORM VIẾT ĐÁNH GIÁ */}
      <div style={{ marginBottom: '32px', borderBottom: '1px solid #f0f0f0', paddingBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Viết đánh giá của bạn</h3>
        
        {/* Chọn đơn hàng đã mua */}
        {currentUser && deliveredOrders.length > 1 && (
          <div style={{ marginBottom: '12px' }}>
            <span style={{ marginRight: '8px' }}>Chọn đơn hàng:</span>
            <Select 
              value={selectedOrderId} 
              onChange={setSelectedOrderId}
              style={{ width: 250 }}
            >
              {deliveredOrders.map(order => (
                <Select.Option key={order.id} value={order.id}>
                  Mã đơn: {order.id.slice(0, 8)}...
                </Select.Option>
              ))}
            </Select>
          </div>
        )}

        <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>Chọn số sao:</span>
          <Rate value={rating} onChange={setRating} />
        </div>
        
        <TextArea 
          rows={3} 
          placeholder={
            !currentUser 
              ? "Vui lòng đăng nhập để đánh giá..." 
              : deliveredOrders.length === 0 
                ? "Bạn cần mua và nhận sản phẩm này để có thể đánh giá." 
                : "Chia sẻ cảm nhận của bạn về sản phẩm..."
          } 
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          disabled={!currentUser || deliveredOrders.length === 0}
          style={{ marginBottom: '12px' }}
        />
        
        <Button 
          type="primary" 
          onClick={handleSubmit} 
          loading={submitting} 
          disabled={!currentUser || deliveredOrders.length === 0}
          style={{ background: '#ff4d4f', borderColor: '#ff4d4f' }}
        >
          Gửi đánh giá
        </Button>
      </div>

      {/* DANH SÁCH BÌNH LUẬN */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}><Spin /></div>
      ) : reviews.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {reviews.map((item) => (
            <div key={item.id} style={{ display: 'flex', gap: '12px', paddingBottom: '16px', borderBottom: '1px solid #f5f5f5' }}>
              <Avatar icon={<UserOutlined />} size={40} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: '600' }}>Khách hàng</span>
                  <span style={{ color: '#bfbfbf', fontSize: '12px' }}>
                    {item.created_at ? new Date(item.created_at).toLocaleDateString('vi-VN') : ''}
                  </span>
                </div>
                <Rate disabled value={item.rating} style={{ fontSize: '12px', margin: '4px 0' }} />
                <p style={{ margin: '4px 0 0 0', color: '#434343' }}>{item.comment}</p>
              </div>

              {/* Nút xóa nếu đúng tác giả */}
              {currentUser && item.user_id === currentUser.uid && (
                <Popconfirm title="Xóa đánh giá này?" onConfirm={() => handleDelete(item.id)} okText="Xóa" cancelText="Hủy">
                  <Button type="text" danger icon={<DeleteOutlined />} size="small" />
                </Popconfirm>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', color: '#8c8c8c', padding: '20px 0' }}>
          Chưa có đánh giá nào cho sản phẩm này.
        </div>
      )}
    </div>
  );
};

export default ProductReviews;