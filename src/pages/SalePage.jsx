import React, { useState, useEffect } from 'react';
import { PRODUCTS } from '../data/mock';
import './SalePage.css'; // Import file CSS riêng

function SalePage() {
  const [saleProducts, setSaleProducts] = useState([]);

  useEffect(() => {
    const discountedProducts = PRODUCTS.filter(item => item.oldPrice && item.oldPrice > item.price);
    setSaleProducts(discountedProducts);
  }, []);

  const formatPrice = (price) => {
    return price.toLocaleString('vi-VN') + 'đ';
  };

  const calculateDiscount = (price, oldPrice) => {
    if (!oldPrice || oldPrice <= price) return 0;
    return Math.round(((oldPrice - price) / oldPrice) * 100);
  };

  return (
    <div className="sale-page">
      <div className="sale-container">
        
        {/* Banner Khuyến Mãi */}
        <div className="sale-banner">
          <h1>🔥 SIÊU SALE CUỐI THÁNG 🔥</h1>
          <p>Giảm đến 50% cho hàng nghìn sản phẩm. Nhanh tay kẻo lỡ!</p>
        </div>

        {/* Khung bộ lọc */}
        <div className="sale-filter-bar">
          <h2>Có {saleProducts.length} sản phẩm đang giảm giá</h2>
          <select className="sale-select">
            <option>Giảm nhiều nhất</option>
            <option>Bán chạy nhất</option>
          </select>
        </div>

        {/* Lưới sản phẩm */}
        <div className="product-grid">
          {saleProducts.map((product) => {
            const discountPercent = calculateDiscount(product.price, product.oldPrice);
            
            return (
              <div key={product.id} className="product-card sale-card">
                {discountPercent > 0 && (
                  <div className="discount-badge">
                    -{discountPercent}%
                  </div>
                )}

                <img src={product.image} alt={product.name} className="product-img" />
                
                <div className="product-info">
                  <h3 className="product-title">{product.name}</h3>
                  
                  <div>
                    <div className="product-prices">
                      <span className="sale-price">{formatPrice(product.price)}</span>
                      <span className="product-old-price">{formatPrice(product.oldPrice)}</span>
                    </div>

                    {/* Thanh tiến trình */}
                    <div className="progress-bar-container">
                      <div 
                        className="progress-bar-fill" 
                        style={{ width: `${Math.min(product.sold / 50, 100)}%` }}
                      ></div>
                      <span className="progress-text">ĐÃ BÁN {product.sold}</span>
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

export default SalePage;