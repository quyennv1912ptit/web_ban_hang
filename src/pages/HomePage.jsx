import React, { useState } from 'react';
import CategoryGrid from '../components/home/CategoryGrid';
import ProductCard from '../components/home/ProductCard';
import { CATEGORIES, PRODUCTS } from '../data/mock';
import './HomePage.css';

const PAGE_SIZE = 12;

const HomePage = () => {
    const [visible, setVisible] = useState(PAGE_SIZE);

    return (
        <div className="home">
            <section className="hero">
                <h1>Siêu sale cuối tháng</h1>
                <p>Giảm đến 50% cho hàng nghìn sản phẩm, miễn phí vận chuyển đơn từ 199K.</p>
            </section>

            <CategoryGrid categories={CATEGORIES} />

            <section className="section">
                <h2 className="section__title section__title--primary">GỢI Ý HÔM NAY</h2>
                <div className="products">
                    {PRODUCTS.slice(0, visible).map((p) => (
                        <ProductCard key={p.id} product={p} />
                    ))}
                </div>

                {visible < PRODUCTS.length && (
                    <div className="products__more">
                        <button type="button" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
                            Xem thêm
                        </button>
                    </div>
                )}
            </section>
        </div>
    );
};

export default HomePage;