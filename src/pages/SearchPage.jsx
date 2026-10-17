import React, { useEffect, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import ProductCard from '../components/home/ProductCard';
import './SearchPage.css';

const PAGE_SIZE = 12;

const getErrorMessage = (error) => {
    const detail = error.response?.data?.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) return detail[0]?.msg || 'Thông tin tìm kiếm không hợp lệ.';
    if (error.response?.status === 503) return 'Dịch vụ tìm kiếm đang khởi động. Vui lòng thử lại sau.';
    return 'Không thể tìm kiếm sản phẩm. Vui lòng kiểm tra kết nối rồi thử lại.';
};

const SearchPage = () => {
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const query = (searchParams.get('q') || '').trim();
    const image = location.state?.image || null;

    const [page, setPage] = useState(1);
    const [reloadKey, setReloadKey] = useState(0);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [filterDraft, setFilterDraft] = useState({ categoryId: '', minPrice: '', maxPrice: '' });
    const [filters, setFilters] = useState({ categoryId: '', minPrice: '', maxPrice: '' });
    const [filterError, setFilterError] = useState('');
    const [pagination, setPagination] = useState({ pages: 0, total: 0 });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;

        axiosClient.get('/categories/')
            .then((response) => {
                if (!cancelled) setCategories(Array.isArray(response.data) ? response.data : []);
            })
            .catch((requestError) => {
                if (!cancelled) console.error('Lỗi tải danh mục tìm kiếm:', requestError);
            });

        return () => { cancelled = true; };
    }, []);

    useEffect(() => {
        setPage(1);
    }, [query]);

    const handleApplyFilters = (event) => {
        event.preventDefault();
        const minPrice = filterDraft.minPrice === '' ? null : Number(filterDraft.minPrice);
        const maxPrice = filterDraft.maxPrice === '' ? null : Number(filterDraft.maxPrice);

        if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) {
            setFilterError('Giá tối thiểu không được lớn hơn giá tối đa.');
            return;
        }

        setFilterError('');
        setPage(1);
        if (
            filters.categoryId === filterDraft.categoryId
            && filters.minPrice === filterDraft.minPrice
            && filters.maxPrice === filterDraft.maxPrice
        ) {
            setReloadKey((current) => current + 1);
        } else {
            setFilters({ ...filterDraft });
        }
    };

    const handleClearFilters = () => {
        const cleared = { categoryId: '', minPrice: '', maxPrice: '' };
        setFilterDraft(cleared);
        setFilterError('');
        setPage(1);
        if (!filters.categoryId && !filters.minPrice && !filters.maxPrice) {
            setReloadKey((current) => current + 1);
        } else {
            setFilters(cleared);
        }
    };

    useEffect(() => {
        let cancelled = false;

        const fetchResults = async () => {
            if (!query && !image) {
                setProducts([]);
                setPagination({ pages: 0, total: 0 });
                setError('');
                setLoading(false);
                return;
            }

            setLoading(true);
            setError('');

            try {
                const params = { page, size: PAGE_SIZE };
                if (filters.categoryId) params.category_id = Number(filters.categoryId);
                if (filters.minPrice !== '') params.min_price = Number(filters.minPrice);
                if (filters.maxPrice !== '') params.max_price = Number(filters.maxPrice);
                let response;

                if (image) {
                    const formData = new FormData();
                    formData.append('file', image, 'query-image.jpg');
                    if (query) formData.append('q', query);
                    response = await axiosClient.post('/products/search/image', formData, { params });
                } else {
                    response = await axiosClient.get('/products/search', {
                        params: { ...params, q: query },
                    });
                }

                if (cancelled) return;
                const result = response.data;
                setProducts(Array.isArray(result?.items) ? result.items : []);
                setPagination({
                    pages: Number(result?.pages || 0),
                    total: Number(result?.total || 0),
                });
            } catch (requestError) {
                if (cancelled) return;
                setError(getErrorMessage(requestError));
                setProducts([]);
                setPagination({ pages: 0, total: 0 });
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchResults();
        return () => { cancelled = true; };
    }, [query, image, page, reloadKey, filters, location.key]);

    return (
        <section className="search-page">
            <h1>Kết quả tìm kiếm</h1>

            <form className="search-page__filters" onSubmit={handleApplyFilters}>
                <label>
                    <span>Danh mục</span>
                    <select
                        value={filterDraft.categoryId}
                        onChange={(event) => setFilterDraft((current) => ({ ...current, categoryId: event.target.value }))}
                    >
                        <option value="">Tất cả danh mục</option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>{category.name}</option>
                        ))}
                    </select>
                </label>
                <label>
                    <span>Giá tối thiểu</span>
                    <input
                        type="number"
                        min="0"
                        step="1"
                        value={filterDraft.minPrice}
                        onChange={(event) => setFilterDraft((current) => ({ ...current, minPrice: event.target.value }))}
                        placeholder="Từ giá"
                    />
                </label>
                <label>
                    <span>Giá tối đa</span>
                    <input
                        type="number"
                        min="0"
                        step="1"
                        value={filterDraft.maxPrice}
                        onChange={(event) => setFilterDraft((current) => ({ ...current, maxPrice: event.target.value }))}
                        placeholder="Đến giá"
                    />
                </label>
                <div className="search-page__filter-actions">
                    <button type="submit">Áp dụng</button>
                    <button type="button" className="search-page__clear-filters" onClick={handleClearFilters}>Xóa lọc</button>
                </div>
            </form>
            {filterError && <p className="search-page__filter-error" role="alert">{filterError}</p>}

            <p className="search-page__summary">
                {image ? 'Tìm theo ảnh' : query ? `Từ khóa: “${query}”` : 'Nhập từ khóa hoặc chọn ảnh để bắt đầu.'}
                {!loading && !error && pagination.total > 0 ? ` · ${pagination.total} sản phẩm` : ''}
            </p>

            {loading && <p className="search-page__status">Đang tìm sản phẩm...</p>}
            {error && (
                <div className="search-page__error" role="alert">
                    <p>{error}</p>
                    <button type="button" onClick={() => setReloadKey((current) => current + 1)}>Thử lại</button>
                </div>
            )}

            {!loading && !error && products.length > 0 && (
                <>
                    <div className="products">
                        {products.map((product, index) => <ProductCard key={product.id} product={product} priority={index === 0} />)}
                    </div>
                    {pagination.pages > 1 && (
                        <nav className="search-page__pagination" aria-label="Phân trang kết quả tìm kiếm">
                            <button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page <= 1}>
                                Trang trước
                            </button>
                            <span>Trang {page} / {pagination.pages}</span>
                            <button type="button" onClick={() => setPage((current) => Math.min(pagination.pages, current + 1))} disabled={page >= pagination.pages}>
                                Trang sau
                            </button>
                        </nav>
                    )}
                </>
            )}

            {!loading && !error && (query || image) && products.length === 0 && (
                <p className="search-page__status">Không tìm thấy sản phẩm phù hợp.</p>
            )}
        </section>
    );
};

export default SearchPage;
