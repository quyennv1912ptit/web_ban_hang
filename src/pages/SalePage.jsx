import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
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
                const res = await axios.get('http://127.0.0.1:8000/api/products/?on_sale=true');
                setProducts(res.data.items || res.data || []);
            } catch (err) {
                console.error("Lỗi khi tải sản phẩm khuyến mãi:", err);
                setError("Không thể tải danh sách khuyến mãi.");
            } finally {
                setLoading(false);
            }
        };

        fetchSaleProducts();
    }, []);

    // 2. Logic tự động sắp xếp sản phẩm khi chọn bộ lọc
    const sortedProducts = useMemo(() => {
        let result = [...products];
        switch (sortOption) {
            case 'price_asc':
                // Giá từ thấp đến cao
                return result.sort((a, b) => (a.price || a.gia_ban || 0) - (b.price || b.gia_ban || 0));
            case 'biggest_discount':
                // Giảm nhiều nhất (Tính mức chênh lệch giữa giá gốc và giá bán)
                return result.sort((a, b) => {
                    const discountA = (a.original_price || a.gia_goc || a.price || 0) - (a.price || a.gia_ban || 0);
                    const discountB = (b.original_price || b.gia_goc || b.price || 0) - (b.price || b.gia_ban || 0);
                    return discountB - discountA; // Thằng nào giảm nhiều tiền hơn xếp lên đầu
                });
            case 'newest':
            default:
                // Mới cập nhật (Dựa vào ID lớn xếp trước)
                return result.sort((a, b) => b.id - a.id);
        }
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
                        {sortedProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
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