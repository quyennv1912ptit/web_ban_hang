import React, { useState, useEffect } from 'react';
import { PRODUCTS } from '../data/mock';
import './BestSeller.css'; // Import file CSS riêng

function BestSeller() {
  const [bestSellers, setBestSellers] = useState([]);

  useEffect(() => {
    const sortedProducts = [...PRODUCTS].sort((a, b) => b.sold - a.sold);
    setBestSellers(sortedProducts);
  }, []);

  const formatPrice = (price) => {
    return price.toLocaleString('vi-VN') + 'đ';
  };

  return (
    <div className="bestseller-page">
      <div className="bestseller-container">
        
        {/* Banner trang Bán chạy */}
        <div className="bestseller-banner">
          <h1>👑 TOP SẢN PHẨM BÁN CHẠY 👑</h1>
          <p>Những mặt hàng được khách hàng tin tưởng và lựa chọn nhiều nhất!</p>
        </div>

        {/* Thanh tiêu đề nhỏ */}
        <div className="bestseller-header-bar">
          <h2>Danh sách xếp hạng sản phẩm Hot</h2>
          <span className="update-text">Cập nhật liên tục theo giờ</span>
        </div>

        {/* Lưới sản phẩm Best Seller */}
        <div className="product-grid">
          {bestSellers.map((product, index) => {
            const isTop3 = index < 3;
            
            return (
              <div key={product.id} className="product-card bestseller-card">
                {isTop3 && (
                  <div className={`top-badge top-${index + 1}`}>
                    Top {index + 1} 🔥
                  </div>
                )}

                <img src={product.image} alt={product.name} className="product-img" />
                
                <div className="product-info">
                  <h3 className="product-title">{product.name}</h3>
                  
                  <div>
                    <div className="product-prices">
                      <span className="bestseller-price">{formatPrice(product.price)}</span>
                      {product.oldPrice && (
                        <span className="product-old-price">{formatPrice(product.oldPrice)}</span>
                      )}
                    </div>

                    <div className="bestseller-meta">
                      <span className="star">★ {product.rating}</span>
                      <span className="sold-count">Đã bán: {product.sold}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}

export default BestSeller;