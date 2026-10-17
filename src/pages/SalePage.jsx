import React, { useState, useEffect, useMemo } from 'react';
import axiosClient from '../api/axiosClient';
import ProductCard from '../components/home/ProductCard'; 
import '../pages/CategoryPage.css'; 

const SalePage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // 1. Thêm State để lưu tiêu chí lọc
    const [sortOption, setSortOption] = useState('newest');

    useEffect(() => {
        const fetchSaleProducts = async () => {
            try {
                setLoading(true);
                setError(null);
                const params = { on_sale: true, size: 50 };
                if (sortOption !== 'biggest_discount') params.sort = sortOption;
                const res = await axiosClient.get('/products/', { params });
                setProducts(res.data.items || res.data || []);
            } catch (err) {
                console.error("Lỗi khi tải sản phẩm khuyến mãi:", err);
                setError("Không thể tải danh sách khuyến mãi.");
            } finally {
                setLoading(false);
            }
        };

        fetchSaleProducts();
    }, [sortOption]);

    // 2. Logic tự động sắp xếp sản phẩm khi chọn bộ lọc
    const sortedProducts = useMemo(() => {
        if (sortOption !== 'biggest_discount') return products;
        return [...products].sort((a, b) => {
            const discountA = Number(a.original_price ?? 0) - Number(a.price ?? 0);
            const discountB = Number(b.original_price ?? 0) - Number(b.price ?? 0);
            return discountB - discountA;
        });
    }, [products, sortOption]);

    if (loading) {
        return <div className="category-page flex justify-center items-center h-64"><h3>Đang tải siêu sale...</h3></div>;
    }

    if (error) {
        return <div className="category-page flex justify-center items-center h-64 text-red-500"><h3>{error}</h3></div>;
    }

    return (
        <div className="category-page">
            <div className="category-container">
                
                {/* Header trang Khuyến mãi */}
                <div className="category-header">
                    <h2>🔥 Ưu Đãi Khủng - Siêu Sale Cuối Tháng 🔥</h2>
                    {/* 3. Gắn biến State và hàm onChange vào thẻ select */}
                    <select 
                        className="category-select"
                        value={sortOption}
                        onChange={(e) => setSortOption(e.target.value)}
                    >
                        <option value="newest">Mới cập nhật</option>
                        <option value="biggest_discount">Giảm nhiều nhất</option>
                        <option value="price_asc">Giá từ thấp đến cao</option>
                    </select>
                </div>

                {/* 4. Render danh sách đã được sắp xếp (sortedProducts) */}
                {sortedProducts.length > 0 ? (
                    <div className="product-grid">
                        {sortedProducts.map((product, index) => (
                            <ProductCard key={product.id} product={product} priority={index === 0} />
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <h3>Hiện tại chưa có chương trình khuyến mãi nào.</h3>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SalePage;
