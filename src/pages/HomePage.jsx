import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { getCategories } from '../api/categoriesApi';
import CategoryGrid from '../components/home/CategoryGrid';
import ProductCard from '../components/home/ProductCard';
import './HomePage.css';

const PAGE_SIZE = 24;

const HomePage = () => {
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);

    // 2. Gọi API khi trang chủ vừa tải
    useEffect(() => {
        const controller = new AbortController();
        getCategories().then((response) => {
            if (!controller.signal.aborted) setCategories(response.data);
        }).catch((error) => {
            if (!controller.signal.aborted) console.error('Lỗi tải danh mục:', error);
        });
        const fetchHomeData = async () => {
            try {
                setLoading(true);
                const prodRes = await axiosClient.get('/products/', {
                    signal: controller.signal, params: { page: 1, size: PAGE_SIZE },
                });
                if (controller.signal.aborted) return;
                setProducts(prodRes.data?.items || []);
                setPage(Number(prodRes.data?.page || 1));
                setHasMore(Number(prodRes.data?.page || 1) < Number(prodRes.data?.pages || 1));
            } catch (error) {
                if (controller.signal.aborted) return;
                console.error("Lỗi lấy dữ liệu trang chủ:", error);
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        };

        fetchHomeData();
        return () => controller.abort();
    }, []);

    const loadMore = async () => {
        if (loadingMore || !hasMore) return;
        try {
            setLoadingMore(true);
            const nextPage = page + 1;
            const response = await axiosClient.get('/products/', {
                params: { page: nextPage, size: PAGE_SIZE },
            });
            const nextProducts = response.data?.items || [];
            setProducts((current) => [...current, ...nextProducts]);
            setPage(Number(response.data?.page || nextPage));
            setHasMore(Number(response.data?.page || nextPage) < Number(response.data?.pages || nextPage));
        } catch (error) {
            console.error('Lỗi tải thêm sản phẩm:', error);
        } finally {
            setLoadingMore(false);
        }
    };

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
                            {products.map((product, index) => (
                                <ProductCard key={product.id} product={product} priority={index === 0} />
                            ))}
                        </div>

                        {hasMore && (
                            <div className="products__more">
                                <button type="button" onClick={loadMore} disabled={loadingMore}>
                                    {loadingMore ? 'Đang tải...' : 'Xem thêm'}
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
