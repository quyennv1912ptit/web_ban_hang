import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import './CartPage.css';

function CartPage() {
  const {
    items: cartItems,
    loading,
    error,
    updateQuantity,
    removeFromCart,
  } = useCart();
  const [busyId, setBusyId] = useState('');
  const [actionError, setActionError] = useState('');

  const changeQuantity = async (item, amount) => {
    const nextQuantity = item.quantity + amount;
    if (nextQuantity < 1) return;

    setBusyId(item.id);
    setActionError('');
    try {
      await updateQuantity(item.id, nextQuantity);
    } catch (requestError) {
      setActionError(requestError.response?.data?.detail || 'Không cập nhật được số lượng.');
    } finally {
      setBusyId('');
    }
  };

  const handleRemove = async (id) => {
    setBusyId(id);
    setActionError('');
    try {
      await removeFromCart(id);
    } catch (requestError) {
      setActionError(requestError.response?.data?.detail || 'Không xóa được sản phẩm khỏi giỏ.');
    } finally {
      setBusyId('');
    }
  };

  const formatPrice = (price) => Number(price || 0).toLocaleString('vi-VN') + 'đ';
  const subtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
    0
  );
  const shippingFee = cartItems.length > 0 ? 30000 : 0;
  const totalAmount = subtotal + shippingFee;

  return (
    <div className="cart-page">
      <div className="cart-container">
        <h1 className="cart-main-title">🛒 Giỏ Hàng Của Bạn</h1>

        {loading ? (
          <p>Đang tải giỏ hàng...</p>
        ) : error ? (
          <p role="alert">{error}</p>
        ) : actionError ? (
          <p role="alert">{actionError}</p>
        ) : null}

        {!loading && cartItems.length > 0 ? (
          <div className="cart-content">
            <div className="cart-list">
              <div className="cart-header-row">
                <span>Sản phẩm</span>
                <span>Đơn giá</span>
                <span>Số lượng</span>
                <span>Thành tiền</span>
                <span>Thao tác</span>
              </div>

              {cartItems.map((item) => (
                <div key={item.id} className="cart-item-row">
                  <div className="cart-item-info">
                    <img src={item.image} alt={item.name} className="cart-item-img" />
                    <span className="cart-item-name">{item.name}</span>
                  </div>

                  <div className="cart-item-price">{formatPrice(item.price)}</div>

                  <div className="cart-item-qty">
                    <button
                      type="button"
                      onClick={() => changeQuantity(item, -1)}
                      disabled={busyId === item.id || item.quantity <= 1}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => changeQuantity(item, 1)}
                      disabled={busyId === item.id}
                    >
                      +
                    </button>
                  </div>

                  <div className="cart-item-total">
                    {formatPrice(Number(item.price || 0) * Number(item.quantity || 0))}
                  </div>

                  <div className="cart-item-action">
                    <button
                      type="button"
                      onClick={() => handleRemove(item.id)}
                      className="remove-btn"
                      disabled={busyId === item.id}
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <h3>Cộng giỏ hàng</h3>
              <div className="summary-row">
                <span>Tạm tính</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="summary-row">
                <span>Phí vận chuyển</span>
                <span>{formatPrice(shippingFee)}</span>
              </div>
              <div className="summary-row total-row">
                <span>Tổng cộng</span>
                <span className="total-price">{formatPrice(totalAmount)}</span>
              </div>

              <button className="checkout-btn">Tiến Hành Thanh Toán</button>
            </div>
          </div>
        ) : !loading && !error ? (
          <div className="cart-empty">
            <h3>Giỏ hàng của bạn đang trống!</h3>
            <p>Hãy dạo quanh cửa hàng để chọn cho mình những sản phẩm ưng ý nhé.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default CartPage;
