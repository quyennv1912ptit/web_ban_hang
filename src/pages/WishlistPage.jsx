import React, { useState, useEffect } from 'react';
import { PRODUCTS } from '../data/mock';
import './WishlistPage.css';

function WishlistPage() {
  // Lấy tạm một vài sản phẩm làm mẫu danh sách yêu thích
  const [wishlistItems, setWishlistItems] = useState([
    PRODUCTS[2],
    PRODUCTS[5],
    PRODUCTS[8]
  ]);

  const formatPrice = (price) => {
    return price.toLocaleString('vi-VN') + 'đ';
  };

  // Hàm xóa sản phẩm khỏi danh sách yêu thích
  const handleRemoveFromWishlist = (id) => {
    setWishlistItems(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="wishlist-page">
      <div className="wishlist-container">
        
        {/* Banner Wishlist */}
        <div className="wishlist-banner">
          <h1>❤️ SẢN PHẨM YÊU THÍCH ❤️</h1>
          <p>Lưu giữ những món đồ bạn quan tâm để dễ dàng quay lại mua sắm bất cứ lúc nào!</p>
        </div>

        {/* Thanh tiêu đề nhỏ */}
        <div className="wishlist-header-bar">
          <h2>Danh sách yêu thích ({wishlistItems.length} sản phẩm)</h2>
        </div>

        {/* Lưới sản phẩm */}
        {wishlistItems.length > 0 ? (
          <div className="product-grid">
            {wishlistItems.map((product) => (
              <div key={product.id} className="product-card wishlist-card">
                {/* Nút bỏ thích (dấu X hoặc trái tim) */}
                <button 
                  className="remove-wishlist-btn" 
                  onClick={() => handleRemoveFromWishlist(product.id)}
                  title="Bỏ thích"
                >
                  ✕
                </button>

                <img src={product.image} alt={product.name} className="product-img" />
                
                <div className="product-info">
                  <h3 className="product-title">{product.name}</h3>
                  
                  <div>
                    <div className="product-prices">
                      <span className="wishlist-price">{formatPrice(product.price)}</span>
                      {product.oldPrice && (
                        <span className="product-old-price">{formatPrice(product.oldPrice)}</span>
                      )}
                    </div>

                    <div className="wishlist-meta">
                      <span className="star">★ {product.rating}</span>
                      <button className="move-to-cart-btn">Thêm vào giỏ</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="wishlist-empty">
            <h3>Danh sách yêu thích của bạn đang trống!</h3>
            <p>Hãy bấm vào biểu tượng trái tim ở các sản phẩm bạn quan tâm nhé.</p>
          </div>
        )}

      </div>
    </div>
  );
}

export default WishlistPage;