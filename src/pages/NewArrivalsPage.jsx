import React, { useState, useEffect } from 'react';
import { PRODUCTS } from '../data/mock';
import './NewArrivalsPage.css';

function NewArrivalsPage() {
  const [newProducts, setNewProducts] = useState([]);

  useEffect(() => {
    // Sắp xếp sản phẩm theo thứ tự mới nhất (đảo ngược mảng PRODUCTS để sản phẩm có ID lớn lên đầu)
    const sortedByNewest = [...PRODUCTS].reverse();
    setNewProducts(sortedByNewest);
  }, []);

  const formatPrice = (price) => {
    return price.toLocaleString('vi-VN') + 'đ';
  };

  return (
    <div className="new-page">
      <div className="new-container">
        
        {/* Banner Hàng Mới Về */}
        <div className="new-banner">
          <h1>✨ HÀNG MỚI VỀ - NEW ARRIVALS ✨</h1>
          <p>Cập nhật những xu hướng thời trang và công nghệ mới nhất tuần này!</p>
        </div>

        {/* Thanh tiêu đề nhỏ */}
        <div className="new-header-bar">
          <h2>Danh sách sản phẩm vừa lên kệ</h2>
          <span className="new-badge-text">Mới 100%</span>
        </div>

        {/* Lưới sản phẩm */}
        <div className="product-grid">
          {newProducts.map((product) => (
            <div key={product.id} className="product-card new-card">
              {/* Nhãn New */}
              <div className="new-item-badge">NEW</div>

              <img src={product.image} alt={product.name} className="product-img" />
              
              <div className="product-info">
                <h3 className="product-title">{product.name}</h3>
                
                <div>
                  <div className="product-prices">
                    <span className="new-price">{formatPrice(product.price)}</span>
                    {product.oldPrice && (
                      <span className="product-old-price">{formatPrice(product.oldPrice)}</span>
                    )}
                  </div>

                  <div className="new-meta">
                    <span className="star">★ {product.rating}</span>
                    <span className="sold-count">Đã bán {product.sold}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default NewArrivalsPage;