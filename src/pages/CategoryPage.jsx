import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import ProductCard from '../components/home/ProductCard';
import './CategoryPage.css';

function CategoryPage() {
  const { id } = useParams(); 
  
  const [products, setProducts] = useState([]);
  const [categoryName, setCategoryName] = useState('Đang tải...');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 1. Thêm State để lưu tiêu chí lọc
  const [sortOption, setSortOption] = useState('best_selling');

  useEffect(() => {
    const controller = new AbortController();
    const fetchCategoryData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [categoryRes, productsRes] = await Promise.all([
          axiosClient.get(`/categories/${id}`, { signal: controller.signal }),
          axiosClient.get('/products/', { params: { category_id: id, sort: sortOption, size: 50 }, signal: controller.signal }),
        ]);
        if (controller.signal.aborted) return;
        setCategoryName(categoryRes.data.name || 'Danh mục');
        setProducts(productsRes.data?.items || []);

      } catch (err) {
        if (controller.signal.aborted) return;
        console.error("Lỗi khi kết nối backend:", err);
        setError("Không thể tải dữ liệu. Vui lòng kiểm tra lại kết nối.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    if (id) {
      fetchCategoryData();
    }
    return () => controller.abort();
  }, [id, sortOption]);

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
            <option value="best_selling">Bán chạy</option>
            <option value="newest">Mới nhất</option>
            <option value="top_rated">Đánh giá cao</option>
            <option value="price_asc">Giá từ thấp đến cao</option>
            <option value="price_desc">Giá từ cao xuống thấp</option>
          </select>
        </div>

        {/* Sắp xếp được áp dụng trực tiếp bởi endpoint danh sách sản phẩm. */}
        {products.length > 0 ? (
          <div className="product-grid">
            {products.map((product, index) => <ProductCard key={product.id} product={product} priority={index === 0} />)}
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
