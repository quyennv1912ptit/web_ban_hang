import React, { useEffect, useState } from 'react';
import CategoryGrid from '../components/home/CategoryGrid';
import ProductCard from '../components/home/ProductCard';
import axiosClient from '../api/axiosClient';
import './HomePage.css';

const PAGE_SIZE = 12;

const getItems = (response) => {
    if (Array.isArray(response)) return response;
    return response?.items ?? response?.results ?? [];
};

const HomePage = () => {
    const [visible, setVisible] = useState(PAGE_SIZE);
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let active = true;

        const loadHomeData = async () => {
            const [categoriesResult, productsResult] = await Promise.allSettled([
                axiosClient.get('/categories/'),
                axiosClient.get('/products/', { params: { page: 1, size: 100 } }),
            ]);

            if (!active) return;

            const errors = [];

            if (categoriesResult.status === 'fulfilled') {
                setCategories(getItems(categoriesResult.value));
            } else {
                errors.push('danh mục');
            }

            if (productsResult.status === 'fulfilled') {
                const rows = getItems(productsResult.value);
                setProducts(rows.map((product) => ({
                    ...product,
                    image:
                        product.image ||
                        product.image_url ||
                        product.images?.[0]?.cropped_url ||
                        product.images?.[0]?.original_url ||
                        '',
                    oldPrice: product.oldPrice ?? product.original_price ?? null,
                    rating: product.rating ?? product.average_rating ?? 0,
                    sold: product.sold ?? product.sold_count ?? 0,
                })));
            } else {
                errors.push('sản phẩm');
            }

            if (errors.length) {
                setError(`Không tải được ${errors.join(' và ')} từ backend.`);
            }
            setLoading(false);
        };

        loadHomeData();

        return () => {
            active = false;
        };
    }, []);

    return (
        <div className="home">
            <section className="hero">
                <h1>Siêu sale cuối tháng</h1>
                <p>Giảm đến 50% cho hàng nghìn sản phẩm, miễn phí vận chuyển đơn từ 199K.</p>
            </section>

            <CategoryGrid categories={categories} />

            <section className="section">
                <h2 className="section__title section__title--primary">GỢI Ý HÔM NAY</h2>

                {error && <p role="alert">{error}</p>}
                {loading && <p>Đang tải sản phẩm...</p>}

                <div className="products">
                    {products.slice(0, visible).map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>

                {!loading && !error && products.length === 0 && (
                    <p>Database chưa có sản phẩm để hiển thị.</p>
                )}

                {visible < products.length && (
                    <div className="products__more">
                        <button type="button" onClick={() => setVisible((value) => value + PAGE_SIZE)}>
                            Xem thêm
                        </button>
                    </div>
                )}
            </section>
        </div>
    );
};

export default HomePage;
