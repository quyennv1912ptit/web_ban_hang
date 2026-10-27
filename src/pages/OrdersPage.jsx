import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Modal, message } from 'antd';
import { FiPackage } from 'react-icons/fi';
import axiosClient from '../api/axiosClient';
import { auth } from '../config/firebase';
import './OrdersPage.css';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Lấy Firebase Token gắn vào Header
  const getAuthHeader = async () => {
    const user = auth.currentUser;
    if (!user) return null;
    const token = await user.getIdToken();
    return { Authorization: `Bearer ${token}` };
  };

  // 1. Gọi API lấy danh sách đơn hàng
  const fetchOrders = async () => {
    try {
      const headers = await getAuthHeader();
      if (!headers) return;
      
      setLoading(true);
      const res = await axiosClient.get('/orders/', { headers });
      // FastAPI-pagination trả về dữ liệu qua trường .items hoặc trực tiếp mảng
      setOrders(res.data.items || res.data || []);
    } catch (error) {
      console.error("Lỗi lấy danh sách đơn hàng:", error);
      message.error('Không thể tải lịch sử đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchOrders();
      } else {
        setOrders([]);
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Xem chi tiết đơn hàng
  const handleViewDetail = async (orderId) => {
    try {
      const headers = await getAuthHeader();
      const res = await axiosClient.get(`/orders/${orderId}`, { headers });
      setSelectedOrder(res.data);
      setIsModalVisible(true);
    } catch (error) {
      console.error("Lỗi xem chi tiết đơn:", error);
      message.error('Không thể tải chi tiết đơn hàng');
    }
  };

  // 3. Hủy đơn hàng đang chờ
  const handleCancelOrder = async (orderId) => {
    try {
      const headers = await getAuthHeader();
      await axiosClient.post(`/orders/${orderId}/cancel`, {}, { headers });
      message.success('Đã hủy đơn hàng thành công');
      fetchOrders(); // Tải lại danh sách
    } catch (error) {
      console.error("Lỗi hủy đơn:", error);
      const msg = error.response?.data?.detail || 'Không thể hủy đơn hàng này';
      message.error(msg);
    }
  };

  const columns = [
    { 
      title: 'Mã đơn', 
      dataIndex: 'id', 
      key: 'id', 
      render: (text) => <strong title={text}>{text.slice(0, 8)}...</strong> 
    },
    { 
      title: 'Ngày đặt', 
      dataIndex: 'created_at', 
      key: 'created_at',
      render: (dateStr) => dateStr ? new Date(dateStr).toLocaleDateString('vi-VN') : ''
    },
    { 
      title: 'Tổng tiền (VNĐ)', 
      dataIndex: 'total_amount', 
      key: 'total_amount',
      render: (val) => Number(val).toLocaleString('vi-VN') + ' đ'
    },
    { 
      title: 'Trạng thái', 
      dataIndex: 'status', 
      key: 'status',
      render: (status) => {
        let color = 'blue';
        let textStatus = status;
        const stt = status ? status.toLowerCase() : 'pending';

        if (stt === 'pending') { color = 'orange'; textStatus = 'Chờ xử lý'; }
        else if (stt === 'processing') { color = 'cyan'; textStatus = 'Đang xử lý'; }
        else if (stt === 'shipped') { color = 'purple'; textStatus = 'Đang giao'; }
        else if (stt === 'delivered') { color = 'green'; textStatus = 'Đã giao'; }
        else if (stt === 'cancelled') { color = 'red'; textStatus = 'Đã hủy'; }
        else if (stt === 'returned') { color = 'purple'; textStatus = 'Đã hoàn hàng'; }

        return <Tag color={color}>{textStatus}</Tag>;
      }
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button type="link" size="small" onClick={() => handleViewDetail(record.id)}>
            Chi tiết
          </Button>
          {record.status === 'pending' && (
            <Button type="link" danger size="small" onClick={() => handleCancelOrder(record.id)}>
              Hủy đơn
            </Button>
          )}
        </div>
      ),
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
          loading={loading}
          pagination={{ pageSize: 5 }} 
        />
      </div>

      {/* Modal hiển thị chi tiết đơn hàng */}
      <Modal
        title="Chi tiết đơn hàng"
        open={isModalVisible}
        onOk={() => setIsModalVisible(false)}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="submit" type="primary" onClick={() => setIsModalVisible(false)}>
            Đóng
          </Button>
        ]}
      >
        {selectedOrder ? (
          <div>
            <p><strong>Mã đơn hàng:</strong> {selectedOrder.id}</p>
            <p><strong>Trạng thái:</strong> {selectedOrder.status}</p>
            <p><strong>Phí vận chuyển:</strong> {Number(selectedOrder.shipping_fee).toLocaleString('vi-VN')} đ</p>
            <p><strong>Tổng thanh toán:</strong> <span style={{ color: 'var(--theme-danger, red)', fontWeight: 'bold' }}>{Number(selectedOrder.total_amount).toLocaleString('vi-VN')} đ</span></p>
            <h4 style={{ marginTop: '16px', marginBottom: '8px' }}>Danh sách sản phẩm:</h4>
            <ul>
              {selectedOrder.items?.map((item, idx) => (
                <li key={idx} style={{ marginBottom: '6px' }}>
                  {item.product_name} x {item.quantity} — <strong>{(item.price * item.quantity).toLocaleString('vi-VN')} đ</strong>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p>Đang tải chi tiết...</p>
        )}
      </Modal>
    </div>
  );
};

export default OrdersPage;
