import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CategoryGrid from '../components/home/CategoryGrid';
import ProductCard from '../components/home/ProductCard';
import './HomePage.css';

const PAGE_SIZE = 12;

const HomePage = () => {
    const [visible, setVisible] = useState(PAGE_SIZE);
    
    // 1. Thêm state để lưu dữ liệu thật
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // 2. Gọi API khi trang chủ vừa tải
    useEffect(() => {
        const fetchHomeData = async () => {
            try {
                setLoading(true);
                // Gọi API lấy danh mục
                const catRes = await axios.get('http://127.0.0.1:8000/api/categories/');
                setCategories(catRes.data);

                // Gọi API lấy toàn bộ sản phẩm (hoặc sản phẩm nổi bật tùy backend của bạn)
                const prodRes = await axios.get('http://127.0.0.1:8000/api/products/');
                setProducts(prodRes.data);
            } catch (error) {
                console.error("Lỗi lấy dữ liệu trang chủ:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHomeData();
    }, []);

    return (
        <div className="home">
            <section className="hero">
                <h1>Siêu sale cuối tháng</h1>
                <p>Giảm đến 50% cho hàng nghìn sản phẩm, miễn phí vận chuyển đơn từ 199K.</p>
            </section>

            {/* 3. Truyền dữ liệu danh mục thật vào CategoryGrid */}
            <CategoryGrid categories={categories} />

            <section className="section">
                <h2 className="section__title section__title--primary">GỢI Ý HÔM NAY</h2>
                
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>Đang tải sản phẩm...</div>
                ) : (
                    <>
                        <div className="products">
                            {/* 4. Truyền dữ liệu sản phẩm thật vào vòng lặp */}
                            {(Array.isArray(products) ? products : (products?.items || products?.data || [])).slice(0, visible).map((p, index) => (
                                <ProductCard key={p?.id || index} product={p} />
                            ))}
                        </div>

                        {visible < products.length && (
                            <div className="products__more">
                                <button type="button" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
                                    Xem thêm
                                </button>
                            </div>
                        )}
                    </>
                )}
            </section>
        </div>
    );
};

export default HomePage;