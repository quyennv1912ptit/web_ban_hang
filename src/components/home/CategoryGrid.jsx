import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const ROWS = 2;

const CategoryGrid = ({ categories }) => {
    const scrollerRef = useRef(null);
    const [canScroll, setCanScroll] = useState({ left: false, right: false });

    // Lưới xếp theo cột, nên sắp lại để hàng 1 = các mục đầu, hàng 2 = các mục sau
    const cols = Math.ceil(categories.length / ROWS);
    const ordered = [];
    for (let c = 0; c < cols; c++) {
        for (let r = 0; r < ROWS; r++) {
            const item = categories[r * cols + c];
            if (item) ordered.push(item);
        }
    }

    const updateArrows = useCallback(() => {
        const el = scrollerRef.current;
        if (!el) return;
        setCanScroll({
            left: el.scrollLeft > 0,
            right: el.scrollLeft + el.clientWidth < el.scrollWidth - 1,
        });
    }, []);

    useEffect(() => {
        updateArrows();
        const el = scrollerRef.current;
        el.addEventListener('scroll', updateArrows, { passive: true });
        window.addEventListener('resize', updateArrows);
        return () => {
            el.removeEventListener('scroll', updateArrows);
            window.removeEventListener('resize', updateArrows);
        };
    }, [updateArrows, categories.length]);

    const scrollBy = (dir) => {
        const el = scrollerRef.current;
        el.scrollBy({ left: dir * el.clientWidth, behavior: 'smooth' });
    };

    return (
        <section className="section cat">
            <h2 className="section__title">DANH MỤC</h2>

            <div className="cat__wrap">
                <div className="cat__scroller" ref={scrollerRef}>
                    {ordered.map((c) => (
                        // ĐỔI c.slug THÀNH c.id Ở ĐÂY
                        <Link key={c.id} to={`/category/${c.id}`} className="cat__item">
                            {/* Nếu backend trả về link ảnh, có thể bạn sẽ cần đổi thành thẻ <img src={c.icon} /> */}
                            <span className="cat__icon" aria-hidden="true">{c.icon}</span>
                            <span className="cat__name">{c.name}</span>
                        </Link>
                    ))}
                </div>

                {canScroll.left && (
                    <button type="button" className="cat__arrow cat__arrow--left" onClick={() => scrollBy(-1)} aria-label="Cuộn sang trái">
                        <FiChevronLeft size={18} />
                    </button>
                )}
                {canScroll.right && (
                    <button type="button" className="cat__arrow cat__arrow--right" onClick={() => scrollBy(1)} aria-label="Cuộn sang phải">
                        <FiChevronRight size={18} />
                    </button>
                )}
            </div>
        </section>
    );
};

export default CategoryGrid;