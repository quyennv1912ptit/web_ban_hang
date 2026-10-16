import React, { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FiMinus, FiPlus, FiShoppingCart, FiStar, FiSend } from 'react-icons/fi';
import axios from 'axios';
import { message } from 'antd'; 
import { useCart } from '../contexts/CartContext'; 
import './ProductDetailPage.css';

const ProductDetailPage = () => {
    const { id: paramProductId } = useParams();
    const navigate = useNavigate();
    const { addToCart, fetchCart } = useCart(); 

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mainImage, setMainImage] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [selectedColor, setSelectedColor] = useState('');
    const [reviews, setReviews] = useState([]);
    const [reviewContent, setReviewContent] = useState('');
    const [reviewRating, setReviewRating] = useState(5);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!paramProductId) return;
        (async () => {
            try {
                setLoading(true);
                const { data } = await axios.get(`http://localhost:8000/api/products/${paramProductId}`);
                setProduct(data);
                setMainImage(data.images?.[0]?.original_url || data.image_url || data.image || 'https://via.placeholder.com/600x600?text=No+Image');
                if (data.attributes?.color?.length) setSelectedColor(data.attributes.color[0]);
            } catch (error) { message.error("Không thể tải thông tin sản phẩm!"); } 
            finally { setLoading(false); }
        })();
    }, [paramProductId]);

    const discountPercent = useMemo(() => (!product || product.original_price <= product.price) ? 0 : Math.round((1 - product.price / product.original_price) * 100), [product]);
    const reviewAverage = useMemo(() => (!product || !reviews.length) ? (product?.average_rating || 5) : reviews.reduce((s, r) => s + r.rating, 0) / reviews.length, [reviews, product]);

    const handleQuantityChange = type => setQuantity(q => type === 'decrease' ? Math.max(1, q - 1) : Math.min(product?.stock_quantity || 100, q + 1));

    const handleAction = async (isBuyNow) => {
        const idToBuy = product?.id || paramProductId;
        if (!idToBuy) return;
        try {
            setSubmitting(true);
            await addToCart(idToBuy, quantity);
            if (isBuyNow) {
                if (typeof fetchCart === 'function') await fetchCart();
                navigate('/cart', { state: { buyNowId: String(idToBuy), buyNow: true } });
            } else {
                message.success(`Đã thêm ${quantity} sản phẩm vào giỏ!`);
            }
        } catch (error) {
            if (error?.response?.status === 401) { message.warning('Vui lòng đăng nhập!'); navigate('/login'); } 
            else { message.error(`Lỗi ${isBuyNow ? 'mua ngay' : 'thêm giỏ hàng'}`); }
        } finally { setSubmitting(false); }
    };

    const handleReviewSubmit = e => {
        e.preventDefault();
        if (!reviewContent.trim()) return;
        setReviews([{ id: Date.now(), userName: 'Bạn', rating: reviewRating, createdAt: 'Vừa xong', content: reviewContent.trim() }, ...reviews]);
        setReviewContent(''); setReviewRating(5);
    };

    const renderStars = rating => Array.from({ length: 5 }, (_, i) => <FiStar key={i} size={16} className={i + 1 <= rating ? 'review-star review-star--filled' : 'review-star'} fill={i + 1 <= rating ? 'currentColor' : 'none'} />);

    if (loading) return <div style={{ textAlign: 'center', padding: '100px 0' }}><h2>Đang tải sản phẩm...</h2></div>;
    if (!product) return <div style={{ textAlign: 'center', padding: '100px 0' }}><h2>Sản phẩm không tồn tại.</h2></div>;

    return (
        <main className="product-page">
            <nav className="product-breadcrumb">
                <Link to="/">Trang chủ</Link> › <Link to={`/category/${product.category?.slug}`}>{product.category?.name || 'Danh mục'}</Link> › <span>{product.name}</span>
            </nav>
            <section className="product-main">
                <div className="product-gallery">
                    <div className="gallery-main"><img src={mainImage} alt={product.name} /></div>
                    {product.images?.length > 0 && (
                        <div className="gallery-thumbnails">
                            {product.images.map((img, i) => (
                                <button key={img.id || i} type="button" className={`thumbnail ${mainImage === img.original_url ? 'active' : ''}`} onClick={() => setMainImage(img.original_url)}><img src={img.original_url} alt="thumb" /></button>
                            ))}
                        </div>
                    )}
                </div>
                <div className="product-info">
                    <h1 className="info-title">{product.name}</h1>
                    <div className="info-meta">
                        <div className="meta-rating"><span className="stars">★ {product.average_rating || 5}</span><span>{product.reviews_count || 0} Đánh giá</span></div>
                        <span className="divider">|</span><span className="meta-sold">Đã bán {product.sold_count || 0}</span>
                    </div>
                    <div className="info-price-box">
                        <span className="current-price">{Number(product.price).toLocaleString('vi-VN')} ₫</span>
                        {product.original_price > product.price && <><span className="original-price">{Number(product.original_price).toLocaleString('vi-VN')} ₫</span><span className="discount-badge">-{discountPercent}%</span></>}
                    </div>
                    <div className="info-attributes">
                        {product.attributes?.color?.length > 0 && (
                            <div className="attribute-group">
                                <span className="attr-label">Màu sắc:</span>
                                <div className="attr-options">
                                    {product.attributes.color.map(color => <button key={color} type="button" className={`attr-btn ${selectedColor === color ? 'active' : ''}`} onClick={() => setSelectedColor(color)}>{color}</button>)}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="info-quantity">
                        <span className="attr-label">Số lượng:</span>
                        <div className="qty-control">
                            <button type="button" onClick={() => handleQuantityChange('decrease')} disabled={quantity <= 1}><FiMinus size={15} /></button>
                            <input type="number" value={quantity} readOnly />
                            <button type="button" onClick={() => handleQuantityChange('increase')} disabled={quantity >= (product.stock_quantity || 100)}><FiPlus size={15} /></button>
                        </div>
                        <span className="stock-text">{product.stock_quantity || 'Sẵn sàng giao'} có sẵn</span>
                    </div>
                    <div className="info-actions">
                        <button type="button" className="btn-add-cart" onClick={() => handleAction(false)} disabled={submitting}><FiShoppingCart size={18} /><span>Thêm vào giỏ hàng</span></button>
                        <button type="button" className="btn-buy-now" onClick={() => handleAction(true)} disabled={submitting}>Mua ngay</button>
                    </div>
                </div>
            </section>
            <section className="product-details-section">
                <h2 className="section-title">MÔ TẢ SẢN PHẨM</h2>
                {product.description ? <div className="description-content" dangerouslySetInnerHTML={{ __html: product.description }} /> : <p>Chưa có mô tả.</p>}
            </section>
            <section className="product-reviews-section">
                <h2 className="section-title">ĐÁNH GIÁ SẢN PHẨM</h2>
                <div className="review-form-card">
                    <h3>Viết đánh giá</h3>
                    <form onSubmit={handleReviewSubmit}>
                        <div className="review-form__rating">
                            <span>Đánh giá:</span>
                            <div className="review-rating-input">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <button key={star} type="button" className={`review-rating-btn ${star <= reviewRating ? 'active' : ''}`} onClick={() => setReviewRating(star)}>
                                        <FiStar size={22} fill={star <= reviewRating ? 'currentColor' : 'none'} />
                                    </button>
                                ))}
                            </div>
                        </div>
                        <textarea value={reviewContent} onChange={e => setReviewContent(e.target.value)} rows={4} maxLength={500} placeholder="Chia sẻ cảm nhận..." required />
                        <button type="submit" className="btn-submit-review" disabled={!reviewContent.trim()}><FiSend size={17} /> Gửi đánh giá</button>
                    </form>
                </div>
                <div className="reviews-list">
                    {reviews.map(review => (
                        <article key={review.id} className="review-item">
                            <div className="review-item__avatar">{review.userName.charAt(0)}</div>
                            <div className="review-item__content">
                                <div className="review-item__head">
                                    <div><h3>{review.userName}</h3><div className="review-item__rating">{renderStars(review.rating)}</div></div>
                                    <time>{review.createdAt}</time>
                                </div>
                                <p>{review.content}</p>
                            </div>
                        </article>
                    ))}
                    {!reviews.length && <div className="review-empty">Chưa có bình luận nào.</div>}
                </div>
            </section>
        </main>
    );
};
export default ProductDetailPage;