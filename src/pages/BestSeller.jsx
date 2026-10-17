import React, { useState, useEffect, useMemo } from 'react';
import axiosClient from '../api/axiosClient';
import ProductCard from '../components/home/ProductCard'; 
import '../pages/CategoryPage.css'; 

const BestSellerPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State lưu kiểu sắp xếp (mặc định, tăng dần, giảm dần)
    const [sortOrder, setSortOrder] = useState('default');

    useEffect(() => {
        const fetchBestSellers = async () => {
            try {
                setLoading(true);
                const res = await axiosClient.get('/products/?sort=best_selling');
                setProducts(res.data.items || res.data || []);
            } catch (err) {
                console.error("Lỗi khi tải sản phẩm bán chạy:", err);
                setError("Không thể tải danh sách sản phẩm.");
            } finally {
                setLoading(false);
            }
        };

        fetchBestSellers();
    }, []);

    // Logic sắp xếp giá ngay trên Frontend
    const displayedProducts = useMemo(() => {
        // Tạo một bản sao của mảng để không làm hỏng dữ liệu gốc
        let result = [...products];

        if (sortOrder === 'price_asc') {
            result.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
        } else if (sortOrder === 'price_desc') {
            result.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
        }

        return result;
    }, [products, sortOrder]);

    if (loading) {
        return <div className="category-page flex justify-center items-center h-64"><h3>Đang tải danh sách bán chạy...</h3></div>;
    }

    if (error) {
        return <div className="category-page flex justify-center items-center h-64 text-red-500"><h3>{error}</h3></div>;
    }

    return (
        <div className="category-page">
            <div className="category-container">
                
                <div className="category-header">
                    <h2>🏆 Top Sản Phẩm Bán Chạy Nhất 🏆</h2>
                    
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                        <select 
                            className="category-select"
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                        >
                            <option value="default">Sắp xếp mặc định</option>
                            <option value="price_asc">Giá: Thấp đến Cao (Tăng dần)</option>
                            <option value="price_desc">Giá: Cao đến Thấp (Giảm dần)</option>
                        </select>
                    </div>
                </div>

                {displayedProducts.length > 0 ? (
                    <div className="product-grid">
                        {displayedProducts.map((product, index) => (
                            <ProductCard key={product.id} product={product} priority={index === 0} />
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <h3>Hiện tại chưa có sản phẩm nào.</h3>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BestSellerPage;