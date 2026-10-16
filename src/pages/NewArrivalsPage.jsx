import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import ProductCard from '../components/home/ProductCard'; 
import '../pages/CategoryPage.css'; 

const NewArrivalsPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 1. Thêm State để lưu danh mục đang chọn
    const [filterCategory, setFilterCategory] = useState('all');

    useEffect(() => {
        const fetchNewArrivals = async () => {
            try {
                setLoading(true);
                const res = await axios.get('http://127.0.0.1:8000/api/products/');
                setProducts(res.data.items || res.data || []);
            } catch (err) {
                console.error("Lỗi khi tải sản phẩm mới về:", err);
                setError("Không thể tải danh sách sản phẩm mới.");
            } finally {
                setLoading(false);
            }
        };

        fetchNewArrivals();
    }, []);

    // 2. Logic lọc sản phẩm theo danh mục ngay trên Frontend
    const filteredProducts = useMemo(() => {
        if (filterCategory === 'all') return products;

        return products.filter(product => {
            // Lấy tên danh mục của sản phẩm
            const catName = (product.category?.name || product.category_name || product.ten_danh_muc || '').toLowerCase();

            if (filterCategory === 'fashion') {
                return catName.includes('thời trang') || catName.includes('áo') || catName.includes('quần') || catName.includes('giày') || catName.includes('túi');
            }
            if (filterCategory === 'tech') {
                return catName.includes('công nghệ') || catName.includes('điện thoại') || catName.includes('máy tính') || catName.includes('laptop') || catName.includes('điện tử');
            }
            return true;
        });
    }, [products, filterCategory]);

    if (loading) {
        return <div className="category-page flex justify-center items-center h-64"><h3>Đang tải hàng mới về...</h3></div>;
    }

    if (error) {
        return <div className="category-page flex justify-center items-center h-64 text-red-500"><h3>{error}</h3></div>;
    }

    return (
        <div className="category-page">
            <div className="category-container">
                
                {/* Header trang */}
                <div className="category-header">
                    <h2>✨ Hàng Mới Về - Cập Nhật Mới Nhất ✨</h2>
                    {/* 3. Gắn State và sự kiện onChange vào thẻ select */}
                    <select 
                        className="category-select"
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                    >
                        <option value="all">Tất cả danh mục</option>
                        <option value="fashion">Thời trang</option>
                        <option value="tech">Công nghệ</option>
                    </select>
                </div>

                {/* 4. Map dữ liệu từ mảng đã lọc (filteredProducts) */}
                {filteredProducts.length > 0 ? (
                    <div className="product-grid">
                        {filteredProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <h3>Hiện chưa có sản phẩm mới nào trong danh mục này.</h3>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NewArrivalsPage;