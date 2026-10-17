import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiTrash2, FiPlus, FiMinus, FiArrowLeft } from 'react-icons/fi';
import { Modal, Button, Input, Radio, Form, message, Checkbox } from 'antd';
import axiosClient from '../api/axiosClient';
import { auth } from '../config/firebase';
import { useCart } from '../contexts/CartContext';
import './CartPage.css';

const CartPage = () => {
    const { cartItems, updateQuantity, removeFromCart, loading, fetchCart } = useCart();
    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState("cod");
    const [submittingOrder, setSubmittingOrder] = useState(false);
    const [selectedItemIds, setSelectedItemIds] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();
    const [submittingAddr, setSubmittingAddr] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => { if (typeof fetchCart === 'function') fetchCart(); }, []); // eslint-disable-line

    useEffect(() => {
        const targetId = location.state?.buyNowId || location.state?.autoCheckId;
        if (targetId && cartItems?.length > 0) {
            if (cartItems.some(item => String(item.product_id || item.product?.id) === String(targetId))) {
                setSelectedItemIds([String(targetId)]);
                if (location.state?.buyNow) setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 300);
                window.history.replaceState({}, document.title);
            }
        }
    }, [location.state, cartItems]);

    const getAuthHeader = async () => auth.currentUser ? { Authorization: `Bearer ${await auth.currentUser.getIdToken()}` } : null;

    const fetchAddresses = async () => {
        try {
            const headers = await getAuthHeader();
            if (!headers) return;
            const { data } = await axiosClient.get('/users/addresses', { headers });
            setAddresses(data || []);
            if (data?.length > 0) setSelectedAddressId((data.find(a => a.is_default) || data[0]).id);
        } catch (error) { console.error("Lỗi tải địa chỉ:", error); }
    };

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            if (user) fetchAddresses();
            else setAddresses([]);
        });
        return () => unsubscribe();
    }, []);

    const handleAddAddress = async (values) => {
        try {
            setSubmittingAddr(true);
            const headers = await getAuthHeader();
            const { data } = await axiosClient.post('/users/addresses', values, { headers });
            message.success('Thêm địa chỉ thành công!');
            setIsModalOpen(false);
            form.resetFields();
            await fetchAddresses();
            if (data?.id) setSelectedAddressId(data.id);
        } catch (error) { message.error(error.response?.data?.detail || 'Không thể thêm địa chỉ'); } 
        finally { setSubmittingAddr(false); }
    };

    const handleSelectItem = id => {
        const strId = String(id);
        setSelectedItemIds(prev => prev.includes(strId) ? prev.filter(i => i !== strId) : [...prev, strId]);
    };

    const handleSelectAll = e => setSelectedItemIds(e.target.checked ? cartItems.map(item => String(item.product_id || item.product?.id)) : []);

    const selectedTotalPrice = cartItems.filter(item => selectedItemIds.includes(String(item.product_id || item.product?.id)))
        .reduce((sum, item) => sum + (Number((item.product || item).price ?? (item.product || item).unit_price ?? item.price ?? 0) * item.quantity), 0);
    const shippingFee = selectedItemIds.length === 0 || selectedTotalPrice >= 199000 ? 0 : 30000;
    const totalPayment = selectedTotalPrice + shippingFee;

    const handleCheckout = async () => {
        if (!selectedItemIds.length) return message.warning('Vui lòng tick chọn ít nhất 1 sản phẩm!');
        if (!selectedAddressId) return message.warning('Vui lòng chọn hoặc thêm địa chỉ giao hàng!');
        try {
            setSubmittingOrder(true);
            const headers = await getAuthHeader();
            if (!headers) return message.warning('Vui lòng đăng nhập để thanh toán!');
            const itemsToOrder = cartItems.filter(item => selectedItemIds.includes(String(item.product_id || item.product?.id)));
            const orderResponse = await axiosClient.post('/orders/', {
                address_id: selectedAddressId, payment_method: paymentMethod,
                items: itemsToOrder.map(item => ({ product_id: item.product_id || item.product?.id, quantity: item.quantity }))
            }, { headers });
            if (paymentMethod !== 'cod' && orderResponse.data?.id) {
                await axiosClient.post(`/orders/${orderResponse.data.id}/pay`, {}, { headers });
            }
            message.success('Đặt hàng thành công!');
            for (const id of selectedItemIds) await removeFromCart(id);
            setSelectedItemIds([]);
            navigate('/orders');
        } catch (error) { message.error(error.response?.data?.detail || 'Thanh toán thất bại'); } 
        finally { setSubmittingOrder(false); }
    };

    if (loading && !cartItems?.length) return <div className="cart-page flex justify-center items-center h-64"><h3>Đang tải giỏ hàng...</h3></div>;
    if (!cartItems?.length) return (
        <div className="cart-page empty-cart" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <h2>Giỏ hàng của bạn đang trống!</h2>
            <Link to="/" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: '#ee4d2d', color: '#fff', borderRadius: '4px', textDecoration: 'none', marginTop: 15 }}><FiArrowLeft /> Quay lại trang chủ</Link>
        </div>
    );

    return (
        <div className="cart-page" style={{ maxWidth: '1200px', margin: '20px auto', padding: '0 15px' }}>
            <h2>Giỏ hàng ({cartItems.length} sản phẩm)</h2>
            <div className="cart-container" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '20px', marginTop: '20px' }}>
                <div className="cart-items" style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <div style={{ paddingBottom: '15px', borderBottom: '1px solid #eee', marginBottom: '10px' }}>
                        <Checkbox checked={cartItems.length > 0 && selectedItemIds.length === cartItems.length} onChange={handleSelectAll}><strong>Chọn tất cả ({cartItems.length})</strong></Checkbox>
                    </div>
                    {cartItems.map(item => {
                        const product = item.product || item;
                        const pId = String(item.product_id || product.id);
                        const price = Number(product.price ?? item.price ?? product.unit_price ?? 0);
                        return (
                            <div key={pId} className="cart-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid #eee' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: 2 }}>
                                    <Checkbox checked={selectedItemIds.includes(pId)} onChange={() => handleSelectItem(pId)} />
                                    <img src={product.images?.[0]?.image_url || product.image_url || product.image || 'https://via.placeholder.com/80'} alt={product.name || 'Sản phẩm'} style={{ width: '80px', height: '80px', objectFit: 'contain', borderRadius: '4px', cursor: 'pointer' }} onClick={() => handleSelectItem(pId)} />
                                    <div>
                                        <h4 style={{ margin: '0 0 5px 0', fontSize: '16px', cursor: 'pointer' }} onClick={() => handleSelectItem(pId)}>{product.name || item.product_name}</h4>
                                        <span style={{ color: '#ee4d2d', fontWeight: 'bold' }}>{price.toLocaleString('vi-VN')}đ</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, justifyContent: 'center' }}>
                                    <button onClick={() => updateQuantity(pId, item.quantity - 1)} disabled={item.quantity <= 1} style={{ padding: '5px 10px', cursor: 'pointer' }}><FiMinus /></button>
                                    <span style={{ fontWeight: 'bold', width: '30px', textAlign: 'center' }}>{item.quantity}</span>
                                    <button onClick={() => updateQuantity(pId, item.quantity + 1)} style={{ padding: '5px 10px', cursor: 'pointer' }}><FiPlus /></button>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1, justifyContent: 'flex-end' }}>
                                    <strong style={{ color: '#ee4d2d' }}>{(price * item.quantity).toLocaleString('vi-VN')}đ</strong>
                                    <button onClick={() => removeFromCart(pId)} style={{ border: 'none', background: 'none', color: '#999', cursor: 'pointer', fontSize: '18px' }}><FiTrash2 /></button>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="cart-summary" style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', height: 'fit-content' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <h3 style={{ margin: 0 }}>Địa chỉ giao hàng</h3>
                        <Button type="dashed" size="small" icon={<FiPlus />} onClick={() => setIsModalOpen(true)}>Thêm mới</Button>
                    </div>
                    {addresses.length === 0 ? <p style={{ color: '#ee4d2d', fontSize: '13px' }}>Chưa có địa chỉ. Vui lòng thêm!</p> : (
                        <Radio.Group onChange={e => setSelectedAddressId(e.target.value)} value={selectedAddressId} style={{ width: '100%', maxHeight: '150px', overflowY: 'auto', marginBottom: '15px' }}>
                            {addresses.map(a => (
                                <Radio key={a.id} value={a.id} style={{ display: 'block', margin: '6px 0', fontSize: '13px' }}>
                                    <strong>{a.receiver_name}</strong> ({a.phone}) <br/><span style={{ color: '#666' }}>{a.street || a.address_line}, {a.city}</span>
                                </Radio>
                            ))}
                        </Radio.Group>
                    )}
                    <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Thanh toán</h3>
                    <Radio.Group onChange={e => setPaymentMethod(e.target.value)} value={paymentMethod} style={{ marginBottom: '15px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <Radio value="cod">Thanh toán khi nhận hàng (COD)</Radio><Radio value="vnpay">VNPay (mô phỏng)</Radio><Radio value="momo">MoMo (mô phỏng)</Radio><Radio value="credit_card">Thẻ tín dụng (mô phỏng)</Radio>
                    </Radio.Group>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                        <span>Tạm tính:</span><span>{selectedTotalPrice.toLocaleString('vi-VN')}đ</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                        <span>Phí giao hàng:</span><span>{shippingFee.toLocaleString('vi-VN')}đ</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', marginTop: 8 }}>
                        <strong>Tổng ({selectedItemIds.length}):</strong><strong style={{ color: '#ee4d2d' }}>{totalPayment.toLocaleString('vi-VN')}đ</strong>
                    </div>
                    <button onClick={handleCheckout} disabled={submittingOrder || selectedItemIds.length === 0} style={{ width: "100%", padding: "12px", backgroundColor: selectedItemIds.length === 0 ? "#ccc" : "#ee4d2d", color: "#fff", border: "none", borderRadius: "4px", fontSize: "16px", fontWeight: "bold", cursor: selectedItemIds.length === 0 ? "not-allowed" : "pointer", marginTop: "15px", opacity: submittingOrder ? 0.7 : 1 }}>
                        {submittingOrder ? 'Đang xử lý...' : `Mua hàng (${selectedItemIds.length})`}
                    </button>
                </div>
            </div>
            <Modal title="Thêm địa chỉ giao hàng" open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null}>
                <Form form={form} layout="vertical" onFinish={handleAddAddress}>
                    <Form.Item name="receiver_name" label="Tên người nhận" rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item name="address_line" label="Địa chỉ cụ thể" rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item name="city" label="Tỉnh / Thành phố"><Input /></Form.Item>
                    <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}><Button onClick={() => setIsModalOpen(false)} style={{ marginRight: 8 }}>Hủy</Button><Button type="primary" htmlType="submit" loading={submittingAddr}>Lưu</Button></Form.Item>
                </Form>
            </Modal>
        </div>
    );
};
export default CartPage;
