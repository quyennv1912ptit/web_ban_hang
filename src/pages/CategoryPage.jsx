import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CATEGORIES, PRODUCTS } from '../data/mock';
import './CategoryPage.css'; // Import file CSS riêng

function CategoryPage() {
  const { slug } = useParams(); 
  const [products, setProducts] = useState([]);
  const [categoryName, setCategoryName] = useState('Danh mục');

  useEffect(() => {
    const currentCategory = CATEGORIES.find(cat => cat.slug === slug);
    if (currentCategory) {
      setCategoryName(currentCategory.name);
    }

    const filteredProducts = PRODUCTS.filter(item => item.categorySlug === slug);
    setProducts(filteredProducts);
  }, [slug]);

  const formatPrice = (price) => {
    return price.toLocaleString('vi-VN') + 'đ';
  };

  return (
    <div className="category-page">
      <div className="category-container">
        
        {/* Header Danh mục */}
        <div className="category-header">
          <h2>{categoryName}</h2>
          <select className="category-select">
            <option>Phổ biến</option>
            <option>Mới nhất</option>
            <option>Bán chạy</option>
            <option>Giá từ thấp đến cao</option>
          </select>
        </div>

        {/* Lưới sản phẩm */}
        {products.length > 0 ? (
          <div className="product-grid">
            {products.map((product) => (
              <div key={product.id} className="product-card">
                <img src={product.image} alt={product.name} className="product-img" />
                
                <div className="product-info">
                  <h3 className="product-title">{product.name}</h3>
                  
                  <div>
                    <div className="product-prices">
                      <span className="product-price">{formatPrice(product.price)}</span>
                      <span className="product-old-price">{formatPrice(product.oldPrice)}</span>
                    </div>

                    <div className="product-meta">
                      <span className="star">★</span>
                      <span>{product.rating}</span>
                      <span className="dot">|</span>
                      <span>Đã bán {product.sold}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>Không tìm thấy sản phẩm nào trong danh mục này.</h3>
          </div>
        )}

      </div>
    </div>
  );
}

export default CategoryPage;