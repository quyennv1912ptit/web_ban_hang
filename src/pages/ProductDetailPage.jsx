import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FiMinus, FiPlus, FiShoppingCart, FiStar, FiSend } from 'react-icons/fi';
import axiosClient from '../api/axiosClient';
import { message } from 'antd'; 
import { useCart } from '../contexts/CartContext'; 
import { auth } from '../config/firebase'; 
import './ProductDetailPage.css';

const ProductDetailPage = () => {
    const { id: paramProductId } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mainImage, setMainImage] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [selectedColor, setSelectedColor] = useState('');
    
    // State xử lý Đánh giá sản phẩm
    const [reviews, setReviews] = useState([]);
    const [reviewContent, setReviewContent] = useState('');
    const [reviewRating, setReviewRating] = useState(5);
    const [submitting, setSubmitting] = useState(false);
    const [userOrderId, setUserOrderId] = useState(null);

    // 1. Tải danh sách đánh giá từ Backend
    const fetchReviews = useCallback(async (signal) => {
        try {
            const { data } = await axiosClient.get(`/products/${paramProductId}/reviews`, { signal });
            if (signal?.aborted) return;
            // Backend sử dụng fastapi-pagination nên mảng nằm trong data.items
            setReviews(data.items || data || []);
        } catch (error) {
            if (signal?.aborted) return;
            console.error("Lỗi tải danh sách đánh giá:", error);
        }
    }, [paramProductId]);

    // 2. Kiểm tra xem user hiện tại có đơn hàng đã nhận (delivered) chứa sản phẩm này không
    const checkEligibleOrder = useCallback(async (signal) => {
        setUserOrderId(null);
        const user = auth.currentUser;
        if (!user) return;
        try {
            const token = await user.getIdToken();
            const { data } = await axiosClient.get('/orders/', {
                params: { status: 'delivered', size: 100 },
                headers: { Authorization: `Bearer ${token}` },
                signal,
            });
            const ordersList = data.items || [];
            // Limit background requests and stop as soon as an eligible order is found.
            for (let offset = 0; offset < ordersList.length; offset += 5) {
                if (signal?.aborted || auth.currentUser?.uid !== user.uid) return;
                const orderDetails = await Promise.all(ordersList.slice(offset, offset + 5).map(async (order) => {
                    try {
                        const detail = await axiosClient.get(`/orders/${order.id}`, {
                            headers: { Authorization: `Bearer ${token}` },
                            signal,
                        });
                        return detail.data;
                    } catch (error) {
                        if (signal?.aborted) return null;
                        console.warn(`Không tải được đơn hàng ${order.id}:`, error);
                        return null;
                    }
                }));

                const eligibleOrder = orderDetails.find(order =>
                    order?.items?.some(item => String(item.product_id) === String(paramProductId))
                );
            
                if (signal?.aborted || auth.currentUser?.uid !== user.uid) return;
                if (eligibleOrder) {
                    setUserOrderId(eligibleOrder.id);
                    return;
                }
            }
        } catch (error) {
            if (signal?.aborted) return;
            console.error("Lỗi kiểm tra đơn hàng:", error);
        }
    }, [paramProductId]);

    useEffect(() => {
        if (!paramProductId) return;
        const controller = new AbortController();
        setReviews([]);
        setQuantity(1);
        fetchReviews(controller.signal);
        checkEligibleOrder(controller.signal);
        (async () => {
            try {
                setLoading(true);
                const { data } = await axiosClient.get(`/products/${paramProductId}`, { signal: controller.signal });
                if (controller.signal.aborted) return;
                setProduct(data);
                setMainImage(data.images?.[0]?.image_url || data.image_url || data.image || 'https://via.placeholder.com/600x600?text=No+Image');
                setSelectedColor(data.attributes?.color?.[0] || '');
            } catch {
                if (controller.signal.aborted) return;
                setProduct(null);
                message.error("Không thể tải thông tin sản phẩm!"); 
            } finally { 
                if (!controller.signal.aborted) setLoading(false);
            }
        })();
        return () => controller.abort();
    }, [paramProductId, fetchReviews, checkEligibleOrder]);

    const discountPercent = useMemo(() => (!product || product.original_price <= product.price) ? 0 : Math.round((1 - product.price / product.original_price) * 100), [product]);

    const handleQuantityChange = type => setQuantity(q => type === 'decrease'
        ? Math.max(1, q - 1)
        : Math.min(Number(product?.stock_quantity ?? 0), q + 1));

    const handleAction = async (isBuyNow) => {
        const idToBuy = product?.id || paramProductId;
        if (!idToBuy) return;
        if (Number(product?.stock_quantity ?? 0) < 1) {
            message.warning('Sản phẩm hiện đã hết hàng.');
            return;
        }
        try {
            setSubmitting(true);
            await addToCart(idToBuy, quantity);
            if (isBuyNow) {
                navigate('/cart', { state: { buyNowId: String(idToBuy), buyNow: true } });
            }
        } catch (error) {
            if (error?.response?.status === 401) { message.warning('Vui lòng đăng nhập!'); navigate('/login'); } 
            else { message.error(`Lỗi ${isBuyNow ? 'mua ngay' : 'thêm giỏ hàng'}`); }
        } finally { setSubmitting(false); }
    };

    // 3. Xử lý Gửi Đánh Giá Thật lên Backend (Có xử lý lỗi an toàn)
    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!reviewContent.trim()) return;
        if (!userOrderId) {
            message.warning('Bạn cần mua và nhận sản phẩm này để có thể đánh giá.');
            return;
        }

        const user = auth.currentUser;
        if (!user) {
            message.warning('Vui lòng đăng nhập để gửi đánh giá!');
            return;
        }

        try {
            setSubmitting(true);
            const token = await user.getIdToken();
            
            // Chuẩn bị payload động (chỉ chèn order_id nếu có)
            const payload = {
                rating: Number(reviewRating),
                comment: reviewContent.trim()
            };
            
            if (userOrderId) {
                payload.order_id = userOrderId;
            }

            await axiosClient.post(
                `/products/${paramProductId}/reviews`,
                payload,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            message.success('Đã gửi đánh giá thành công! ❤️');
            setReviewContent('');
            setReviewRating(5);
            
            await fetchReviews();
            
            const { data } = await axiosClient.get(`/products/${paramProductId}`);
            setProduct(data);
        } catch (error) {
            console.error("Lỗi gửi đánh giá:", error);
            
            // XỬ LÝ LỖI AN TOÀN CHỐNG SẬP REACT CHILD
            let errorMsg = 'Không thể gửi đánh giá!';
            const detail = error?.response?.data?.detail;
            
            if (typeof detail === 'string') {
                errorMsg = detail;
            } else if (Array.isArray(detail) && detail.length > 0) {
                // Lấy thông báo lỗi của Pydantic 422
                errorMsg = `Lỗi dữ liệu: ${detail[0]?.msg}`;
            }

            message.error(errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    const renderStars = rating => Array.from({ length: 5 }, (_, i) => <FiStar key={i} size={16} className={i + 1 <= rating ? 'review-star review-star--filled' : 'review-star'} fill={i + 1 <= rating ? 'currentColor' : 'none'} />);

    if (loading) return <div style={{ textAlign: 'center', padding: '100px 0' }}><h2>Đang tải sản phẩm...</h2></div>;
    if (!product) return <div style={{ textAlign: 'center', padding: '100px 0' }}><h2>Sản phẩm không tồn tại.</h2></div>;

    return (
        <main className="product-page">
            <nav className="product-breadcrumb">
                <Link to="/">Trang chủ</Link> › <Link to={product.category?.id ? `/category/${product.category.id}` : '/'}>{product.category?.name || 'Danh mục'}</Link> › <span>{product.name}</span>
            </nav>
            <section className="product-main">
                <div className="product-gallery">
                    <div className="gallery-main"><img src={mainImage} alt={product.name} /></div>
                    {product.images?.length > 0 && (
                        <div className="gallery-thumbnails">
                            {product.images.map((img, i) => (
                                <button key={img.id || i} type="button" className={`thumbnail ${mainImage === img.image_url ? 'active' : ''}`} onClick={() => setMainImage(img.image_url)}><img src={img.image_url} alt="thumb" /></button>
                            ))}
                        </div>
                    )}
                </div>
                <div className="product-info">
                    <h1 className="info-title">{product.name}</h1>
                    <div className="info-meta">
                        <div className="meta-rating"><span className="stars">★ {product.average_rating || 5}</span><span>{reviews.length || product.reviews_count || 0} Đánh giá</span></div>
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
                            <button type="button" onClick={() => handleQuantityChange('increase')} disabled={quantity >= Number(product.stock_quantity ?? 0)}><FiPlus size={15} /></button>
                        </div>
                        <span className="stock-text">{product.stock_quantity} có sẵn</span>
                    </div>
                    <div className="info-actions">
                        <button type="button" className="btn-add-cart" onClick={() => handleAction(false)} disabled={submitting || Number(product.stock_quantity ?? 0) < 1}><FiShoppingCart size={18} /><span>Thêm vào giỏ hàng</span></button>
                        <button type="button" className="btn-buy-now" onClick={() => handleAction(true)} disabled={submitting || Number(product.stock_quantity ?? 0) < 1}>Mua ngay</button>
                    </div>
                </div>
            </section>
            
            <section className="product-details-section">
                <h2 className="section-title">MÔ TẢ SẢN PHẨM</h2>
                {product.description ? <div className="description-content">{product.description}</div> : <p>Chưa có mô tả.</p>}
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
                        <textarea 
                            value={reviewContent} 
                            onChange={e => setReviewContent(e.target.value)} 
                            rows={4} 
                            maxLength={500} 
                            placeholder={!auth.currentUser
                                ? "Vui lòng đăng nhập để viết đánh giá..."
                                : !userOrderId
                                    ? "Bạn cần mua và nhận sản phẩm này để đánh giá..."
                                    : "Chia sẻ cảm nhận của bạn về sản phẩm..."
                            }
                            disabled={!auth.currentUser || !userOrderId}
                            required 
                        />
                        <button 
                            type="submit" 
                            className="btn-submit-review" 
                            disabled={submitting || !reviewContent.trim() || !userOrderId}
                        >
                            <FiSend size={17} /> Gửi đánh giá
                        </button>
                    </form>
                </div>

                <div className="reviews-list">
                    {reviews.map(review => (
                        <article key={review.id} className="review-item">
                            <div className="review-item__avatar">
                                {(review.user_name || review.userName || 'K').charAt(0).toUpperCase()}
                            </div>
                            <div className="review-item__content">
                                <div className="review-item__head">
                                    <div>
                                        <h3>{review.user_name || review.userName || 'Khách hàng'}</h3>
                                        <div className="review-item__rating">{renderStars(review.rating)}</div>
                                    </div>
                                    <time>
                                        {review.created_at ? new Date(review.created_at).toLocaleDateString('vi-VN') : (review.createdAt || 'Mới đây')}
                                    </time>
                                </div>
                                <p>{review.comment || review.content}</p>
                            </div>
                        </article>
                    ))}
                    {!reviews.length && <div className="review-empty">Chưa có đánh giá nào cho sản phẩm này.</div>}
                </div>
            </section>
        </main>
    );
};

export default ProductDetailPage;
