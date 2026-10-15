import React, { useState } from 'react';
import { PRODUCTS } from '../data/mock';
import './CartPage.css';

function CartPage() {
  // Lấy tạm 3 sản phẩm đầu tiên từ mock.js để làm mẫu dữ liệu trong giỏ hàng
  const [cartItems, setCartItems] = useState([
    { ...PRODUCTS[0], quantity: 2 },
    { ...PRODUCTS[1], quantity: 1 },
    { ...PRODUCTS[4], quantity: 3 }
  ]);

  // --- PHẦN LOGIC (Xử lý dữ liệu giỏ hàng) ---

  // Tăng số lượng sản phẩm
  const handleIncrease = (id) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  // Giảm số lượng sản phẩm (tối thiểu là 1)
  const handleDecrease = (id) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === id && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item
      )
    );
  };

  // Xóa sản phẩm khỏi giỏ hàng
  const handleRemove = (id) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  // Định dạng tiền tệ
  const formatPrice = (price) => {
    return price.toLocaleString('vi-VN') + 'đ';
  };

  // Tính tổng tiền hàng tạm tính
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingFee = cartItems.length > 0 ? 30000 : 0; // Phí ship cố định 30k nếu giỏ có hàng
  const totalAmount = subtotal + (subtotal > 0 ? shippingFee : 0);

  // --- PHẦN GIAO DIỆN (Hiển thị UI) ---

  return (
    <div className="cart-page">
      <div className="cart-container">
        <h1 className="cart-main-title">🛒 Giỏ Hàng Của Bạn</h1>

        {cartItems.length > 0 ? (
          <div className="cart-content">
            
            {/* Cột bên trái: Danh sách sản phẩm */}
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
                    <button onClick={() => handleDecrease(item.id)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => handleIncrease(item.id)}>+</button>
                  </div>

                  <div className="cart-item-total">
                    {formatPrice(item.price * item.quantity)}
                  </div>

                  <div className="cart-item-action">
                    <button onClick={() => handleRemove(item.id)} className="remove-btn">Xóa</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Cột bên phải: Tổng tiền thanh toán */}
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
        ) : (
          /* Giao diện khi giỏ hàng trống */
          <div className="cart-empty">
            <h3>Giỏ hàng của bạn đang trống!</h3>
            <p>Hãy dạo quanh cửa hàng để chọn cho mình những sản phẩm ưng ý nhé.</p>
          </div>
        )}

      </div>
    </div>
  );
}

export default CartPage;