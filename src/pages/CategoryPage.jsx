import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import './CategoryPage.css';

function CategoryPage() {
  const { id } = useParams(); 
  
  const [products, setProducts] = useState([]);
  const [categoryName, setCategoryName] = useState('Đang tải...');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 1. Thêm State để lưu tiêu chí lọc
  const [sortOption, setSortOption] = useState('popular');

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        setLoading(true);
        setError(null);

        const categoryRes = await axios.get(`http://127.0.0.1:8000/api/categories/${id}`);
        setCategoryName(categoryRes.data.name || categoryRes.data.ten_danh_muc || 'Danh mục');

        const productsRes = await axios.get(`http://127.0.0.1:8000/api/products?category_id=${id}`);
        setProducts(productsRes.data.items || productsRes.data); 

      } catch (err) {
        console.error("Lỗi khi kết nối backend:", err);
        setError("Không thể tải dữ liệu. Vui lòng kiểm tra lại kết nối.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCategoryData();
    }
  }, [id]); 

  // 2. Tự động sắp xếp lại mảng products mỗi khi sortOption thay đổi
  const sortedProducts = useMemo(() => {
    let result = [...products];
    switch (sortOption) {
      case 'price_asc':
        return result.sort((a, b) => (a.price || a.gia_ban || 0) - (b.price || b.gia_ban || 0));
      case 'price_desc':
        return result.sort((a, b) => (b.price || b.gia_ban || 0) - (a.price || a.gia_ban || 0));
      case 'best_selling':
        return result.sort((a, b) => (b.sold || b.sold_count || 0) - (a.sold || a.sold_count || 0));
      case 'newest':
        return result.sort((a, b) => b.id - a.id); // Giả định ID lớn hơn là mới hơn
      default: // 'popular'
        return result; // Giữ nguyên thứ tự gốc từ API
    }
  }, [products, sortOption]);

  const formatPrice = (price) => {
    if (!price) return '0đ';
    return price.toLocaleString('vi-VN') + 'đ';
  };

  if (loading) {
    return <div className="category-page flex justify-center items-center h-64"><h3>Đang tải dữ liệu...</h3></div>;
  }

  if (error) {
    return <div className="category-page flex justify-center items-center h-64 text-red-500"><h3>{error}</h3></div>;
  }

  return (
    <div className="category-page">
      <div className="category-container">
        
        <div className="category-header">
          <h2>{categoryName}</h2>
          {/* 3. Gắn sự kiện onChange và value vào thẻ select */}
          <select 
            className="category-select" 
            value={sortOption} 
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="popular">Phổ biến</option>
            <option value="newest">Mới nhất</option>
            <option value="best_selling">Bán chạy</option>
            <option value="price_asc">Giá từ thấp đến cao</option>
            <option value="price_desc">Giá từ cao xuống thấp</option>
          </select>
        </div>

        {/* 4. Render danh sách đã sắp xếp (sortedProducts) thay vì mảng gốc (products) */}
        {sortedProducts.length > 0 ? (
          <div className="product-grid">
            {sortedProducts.map((product) => (
              <Link 
                to={`/product/${product.id}`} 
                key={product.id} 
                className="product-card"
                style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
              >
                <img 
                  src={product.image || product.image_url} 
                  alt={product.name || product.ten_san_pham} 
                  className="product-img" 
                />
                
                <div className="product-info">
                  <h3 className="product-title">{product.name || product.ten_san_pham}</h3>
                  
                  <div>
                    <div className="product-prices">
                      <span className="product-price">{formatPrice(product.price || product.gia_ban)}</span>
                      {(product.oldPrice || product.gia_goc) && (
                        <span className="product-old-price">{formatPrice(product.oldPrice || product.gia_goc)}</span>
                      )}
                    </div>

                    <div className="product-meta">
                      <span className="star">★</span>
                      <span>{product.rating || '5.0'}</span>
                      <span className="dot">|</span>
                      <span>Đã bán {product.sold || product.sold_count || '0'}</span>
                    </div>
                  </div>
                </div>
              </Link>
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