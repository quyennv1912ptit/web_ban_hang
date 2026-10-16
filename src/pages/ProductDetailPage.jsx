import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
    FiMinus,
    FiPlus,
    FiShoppingCart,
    FiStar,
    FiSend,
} from 'react-icons/fi';
import './ProductDetailPage.css';

import axiosClient from '../api/axiosClient';
import { useCart } from '../contexts/CartContext';

// Mock data mô phỏng cấu trúc dữ liệu từ Database.
const mockProduct = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Tai nghe Bluetooth chống ồn chủ động không dây',
    category: {
        name: 'Thiết bị điện tử',
        slug: 'thiet-bi-dien-tu',
    },
    price: 459000,
    original_price: 690000,
    stock_quantity: 150,
    sold_count: 860,
    average_rating: 4.7,
    reviews_count: 320,
    description: `
        <p>
            Tai nghe Bluetooth chống ồn cao cấp mang lại trải nghiệm âm thanh
            tuyệt vời.
        </p>
        <ul>
            <li>Chống ồn chủ động ANC</li>
            <li>Pin sử dụng 24h</li>
            <li>Bluetooth 5.3</li>
        </ul>
    `,
    attributes: {
        color: ['Đen', 'Trắng'],
        warranty: '12 tháng',
    },
    images: [
        {
            id: 'img1',
            original_url: 'https://via.placeholder.com/600x600?text=Image+1',
        },
        {
            id: 'img2',
            original_url: 'https://via.placeholder.com/600x600?text=Image+2',
        },
        {
            id: 'img3',
            original_url: 'https://via.placeholder.com/600x600?text=Image+3',
        },
    ],
};

const mockReviews = [
    {
        id: 1,
        userName: 'Nguyễn Văn A',
        rating: 5,
        createdAt: '2 ngày trước',
        content:
            'Âm thanh khá tốt, chống ồn ổn trong tầm giá. Pin dùng được lâu và kết nối Bluetooth nhanh.',
    },
    {
        id: 2,
        userName: 'Trần Minh',
        rating: 5,
        createdAt: '5 ngày trước',
        content:
            'Thiết kế đẹp, đeo khá êm. Mình dùng để nghe nhạc và họp online đều ổn.',
    },
    {
        id: 3,
        userName: 'Lê Hoàng',
        rating: 4,
        createdAt: '1 tuần trước',
        content:
            'Chất âm tốt, bass vừa phải. Sản phẩm phù hợp với nhu cầu nghe nhạc hằng ngày.',
    },
    {
        id: 4,
        userName: 'Phạm Ngọc',
        rating: 4,
        createdAt: '2 tuần trước',
        content:
            'Đóng gói cẩn thận, giao hàng nhanh. Micro dùng trong cuộc gọi cũng khá rõ.',
    },
];

const ratingStats = [
    { stars: 5, count: 245 },
    { stars: 4, count: 58 },
    { stars: 3, count: 10 },
    { stars: 2, count: 4 },
    { stars: 1, count: 3 },
];

const ProductDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [productData, setProductData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [mainImage, setMainImage] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [selectedColor, setSelectedColor] = useState('');
    const [reviews, setReviews] = useState([]);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewContent, setReviewContent] = useState('');
    const [hoverRating, setHoverRating] = useState(0);

    useEffect(() => {
        let active = true;

        const loadProduct = async () => {
            setLoading(true);
            setLoadError('');

            try {
                const productResponse = await axiosClient.get(`/products/${id}`);
                if (!active) return;

                const images = Array.isArray(productResponse.images)
                    ? [...productResponse.images].sort((a, b) => a.position - b.position)
                    : [];
                const loadedProduct = {
                    ...productResponse,
                    price: Number(productResponse.price ?? 0),
                    original_price: productResponse.original_price == null
                        ? null
                        : Number(productResponse.original_price),
                    average_rating: Number(productResponse.average_rating ?? 0),
                    stock_quantity: Number(productResponse.stock_quantity ?? 0),
                    sold_count: Number(productResponse.sold_count ?? 0),
                    attributes: productResponse.attributes ?? {},
                    category: productResponse.category ?? null,
                    images,
                };

                setProductData(loadedProduct);
                setMainImage(images[0]?.cropped_url || images[0]?.original_url || '');
                const colors = loadedProduct.attributes.color;
                setSelectedColor(Array.isArray(colors) ? colors[0] || '' : '');

                try {
                    const reviewResponse = await axiosClient.get(`/products/${id}/reviews`, {
                        params: { page: 1, size: 100 },
                    });
                    const reviewRows = Array.isArray(reviewResponse)
                        ? reviewResponse
                        : reviewResponse.items ?? [];
                    if (active) {
                        setReviews(reviewRows.map((review) => ({
                            id: review.id,
                            userName: `Người dùng ${String(review.user_id ?? '').slice(0, 8)}`,
                            rating: Number(review.rating ?? 0),
                            createdAt: review.created_at
                                ? new Date(review.created_at).toLocaleDateString('vi-VN')
                                : '',
                            content: review.comment ?? '',
                        })));
                        loadedProduct.reviews_count = reviewResponse.total ?? reviewRows.length;
                        setProductData({ ...loadedProduct });
                    }
                } catch {
                    if (active) setReviews([]);
                }
            } catch (error) {
                if (active) {
                    setLoadError(error.response?.data?.detail || 'Không tải được sản phẩm từ backend.');
                }
            } finally {
                if (active) setLoading(false);
            }
        };

        loadProduct();
        return () => { active = false; };
    }, [id]);

    const product = productData || {
        ...mockProduct,
        id,
        category: null,
        images: [],
        attributes: {},
        price: 0,
        original_price: null,
        stock_quantity: 0,
        sold_count: 0,
        average_rating: 0,
        reviews_count: 0,
        description: '',
    };
    const ratingStats = [5, 4, 3, 2, 1].map((stars) => ({
        stars,
        count: reviews.filter((review) => review.rating === stars).length,
    }));

    const discountPercent = useMemo(() => {
        if (product.original_price <= product.price) return 0;

        return Math.round(
            (1 - product.price / product.original_price) * 100
        );
    }, [product.original_price, product.price]);

    const reviewAverage = useMemo(() => {
        if (!reviews.length) return product.average_rating;

        const total = reviews.reduce((sum, review) => sum + review.rating, 0);
        return total / reviews.length;
    }, [reviews, product.average_rating]);

    const handleQuantityChange = (type) => {
        setQuantity((currentQuantity) => {
            if (type === 'decrease') {
                return Math.max(1, currentQuantity - 1);
            }

            if (type === 'increase') {
                return Math.min(
                    product.stock_quantity,
                    currentQuantity + 1
                );
            }

            return currentQuantity;
        });
    };

    const handleAddToCart = async () => {
        if (!productData) return;
        try {
            await addToCart(product, quantity);
            alert(`✅ Đã thêm ${quantity} sản phẩm vào giỏ hàng!`);
        } catch (error) {
            console.error('Lỗi thêm giỏ hàng:', error);
            
            // Lấy thông báo lỗi chính xác từ Backend (nếu có)
            const backendMsg = error.response?.data?.detail || error.message;
            alert(`❌ LỖI: ${backendMsg}`); // Hiện lỗi thật lên màn hình
        }
    };
    const handleBuyNow = async () => {
        if (!productData) return;
        try {
            await addToCart(product, quantity);
            
            // Thêm thành công thì chuyển hướng ngay sang trang giỏ hàng
            navigate('/cart');
        } catch (error) {
            console.error('Lỗi mua ngay:', error);
            alert("❌ Vui lòng đăng nhập để tiếp tục mua hàng!");
            navigate('/login');
        }
    };

    const handleReviewSubmit = (event) => {
        event.preventDefault();

        const content = reviewContent.trim();

        if (!content) return;

        const newReview = {
            id: Date.now(),
            userName: 'Bạn',
            rating: reviewRating,
            createdAt: 'Vừa xong',
            content,
        };

        setReviews((currentReviews) => [newReview, ...currentReviews]);
        setReviewContent('');
        setReviewRating(5);
        setHoverRating(0);
    };

    const renderStars = (rating, size = 16) => {
        return Array.from({ length: 5 }, (_, index) => {
            const starNumber = index + 1;

            return (
                <FiStar
                    key={starNumber}
                    size={size}
                    className={
                        starNumber <= rating
                            ? 'review-star review-star--filled'
                            : 'review-star'
                    }
                    fill={starNumber <= rating ? 'currentColor' : 'none'}
                />
            );
        });
    };

    if (loading) return <main className="product-page">Đang tải sản phẩm...</main>;
    if (loadError || !productData) {
        return <main className="product-page" role="alert">{loadError || 'Không tìm thấy sản phẩm.'}</main>;
    }

    return (
        <main className="product-page">
            {/* Breadcrumb */}
            <nav className="product-breadcrumb" aria-label="Breadcrumb">
                <Link to="/">Trang chủ</Link>
                <span aria-hidden="true">›</span>
                {product.category && <>
                    <Link to={`/category/${product.category.slug}`}>
                        {product.category.name}
                    </Link>
                    <span aria-hidden="true">›</span>
                </>}
                <span className="product-breadcrumb__current">
                    {product.name}
                </span>
            </nav>

            {/* Thông tin chính */}
            <section className="product-main">
                {/* Gallery */}
                <div className="product-gallery">
                    <div className="gallery-main">
                        {mainImage ? (
                            <img
                                src={mainImage}
                                alt={product.name}
                            />
                        ) : (
                            <div className="gallery-placeholder">
                                Không có hình ảnh
                            </div>
                        )}
                    </div>

                    <div className="gallery-thumbnails">
                        {product.images.map((image, index) => {
                            const imageUrl = image.cropped_url || image.original_url;
                            const isActive = mainImage === imageUrl;

                            return (
                                <button
                                    key={image.id}
                                    type="button"
                                    className={`thumbnail ${
                                        isActive ? 'active' : ''
                                    }`}
                                    onClick={() =>
                                        setMainImage(imageUrl)
                                    }
                                    aria-label={`Xem hình ảnh ${index + 1}`}
                                    aria-pressed={isActive}
                                >
                                    <img
                                        src={imageUrl}
                                        alt={`${product.name} - hình ${index + 1}`}
                                    />
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Thông tin & đặt hàng */}
                <div className="product-info">
                    <h1 className="info-title">{product.name}</h1>

                    <div className="info-meta">
                        <div className="meta-rating">
                            <span className="stars">
                                ★ {product.average_rating}
                            </span>
                            <span>
                                {product.reviews_count ?? reviews.length} Đánh giá
                            </span>
                        </div>

                        <span className="divider" aria-hidden="true">
                            |
                        </span>

                        <span className="meta-sold">
                            Đã bán {product.sold_count}
                        </span>
                    </div>

                    {/* Giá */}
                    <div className="info-price-box">
                        <span className="current-price">
                            {product.price.toLocaleString('vi-VN')} ₫
                        </span>

                        {product.original_price > product.price && (
                            <>
                                <span className="original-price">
                                    {product.original_price.toLocaleString(
                                        'vi-VN'
                                    )}{' '}
                                    ₫
                                </span>

                                <span className="discount-badge">
                                    -{discountPercent}%
                                </span>
                            </>
                        )}
                    </div>

                    {/* Thuộc tính */}
                    <div className="info-attributes">
                        {product.attributes.color?.length > 0 && (
                            <div className="attribute-group">
                                <span className="attr-label">
                                    Màu sắc:
                                </span>

                                <div className="attr-options">
                                    {product.attributes.color.map(
                                        (color) => (
                                            <button
                                                key={color}
                                                type="button"
                                                className={`attr-btn ${
                                                    selectedColor === color
                                                        ? 'active'
                                                        : ''
                                                }`}
                                                onClick={() =>
                                                    setSelectedColor(color)
                                                }
                                                aria-pressed={
                                                    selectedColor === color
                                                }
                                            >
                                                {color}
                                            </button>
                                        )
                                    )}
                                </div>
                            </div>
                        )}

                        {product.attributes.warranty && (
                            <div className="attribute-group">
                                <span className="attr-label">
                                    Bảo hành:
                                </span>
                                <span>
                                    {product.attributes.warranty}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Số lượng */}
                    <div className="info-quantity">
                        <span className="attr-label">Số lượng:</span>

                        <div className="qty-control">
                            <button
                                type="button"
                                onClick={() =>
                                    handleQuantityChange('decrease')
                                }
                                disabled={quantity <= 1}
                                aria-label="Giảm số lượng"
                            >
                                <FiMinus size={15} />
                            </button>

                            <input
                                type="number"
                                value={quantity}
                                min={1}
                                max={product.stock_quantity}
                                readOnly
                                aria-label="Số lượng sản phẩm"
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    handleQuantityChange('increase')
                                }
                                disabled={
                                    quantity >= product.stock_quantity
                                }
                                aria-label="Tăng số lượng"
                            >
                                <FiPlus size={15} />
                            </button>
                        </div>

                        <span className="stock-text">
                            {product.stock_quantity} sản phẩm có sẵn
                        </span>
                    </div>

                    {/* Hành động */}
                    <div className="info-actions">
                        <button
                            type="button"
                            className="btn-add-cart"
                            onClick={handleAddToCart}
                        >
                            <FiShoppingCart size={18} />
                            <span>Thêm vào giỏ hàng</span>
                        </button>

                        <button
                            type="button"
                            className="btn-buy-now"
                            onClick={handleBuyNow}
                        >
                            Mua ngay
                        </button>
                    </div>
                </div>
            </section>

            {/* Mô tả */}
            <section className="product-details-section">
                <h2 className="section-title">MÔ TẢ SẢN PHẨM</h2>

                {/* Chỉ render HTML đã được sanitize ở backend. */}
                <div
                    className="description-content"
                    dangerouslySetInnerHTML={{
                        __html: product.description,
                    }}
                />
            </section>

            {/* Đánh giá & bình luận */}
            <section className="product-reviews-section">
                <h2 className="section-title">ĐÁNH GIÁ SẢN PHẨM</h2>

                <div className="reviews-summary">
                    <div className="reviews-score">
                        <strong>{reviewAverage.toFixed(1)}</strong>
                        <div className="reviews-score__stars">
                            {renderStars(reviewAverage, 20)}
                        </div>
                        <span>
                            {reviews.length} bình luận đang hiển thị
                        </span>
                    </div>

                    <div className="reviews-breakdown">
                        {ratingStats.map((item) => {
                            const percentage =
                                product.reviews_count > 0
                                    ? Math.round(
                                          (item.count /
                                              product.reviews_count) *
                                              100
                                      )
                                    : 0;

                            return (
                                <div
                                    key={item.stars}
                                    className="rating-row"
                                >
                                    <span className="rating-row__label">
                                        {item.stars} <FiStar size={13} />
                                    </span>

                                    <div className="rating-row__bar">
                                        <span
                                            style={{
                                                width: `${percentage}%`,
                                            }}
                                        />
                                    </div>

                                    <span className="rating-row__count">
                                        {item.count}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="review-form-card">
                    <h3>Viết đánh giá của bạn</h3>

                    <form onSubmit={handleReviewSubmit}>
                        <div className="review-form__rating">
                            <span>Đánh giá:</span>

                            <div className="review-rating-input">
                                {Array.from(
                                    { length: 5 },
                                    (_, index) => {
                                        const starNumber = index + 1;
                                        const active =
                                            starNumber <=
                                            (hoverRating || reviewRating);

                                        return (
                                            <button
                                                key={starNumber}
                                                type="button"
                                                className={`review-rating-btn ${
                                                    active ? 'active' : ''
                                                }`}
                                                onMouseEnter={() =>
                                                    setHoverRating(
                                                        starNumber
                                                    )
                                                }
                                                onMouseLeave={() =>
                                                    setHoverRating(0)
                                                }
                                                onFocus={() =>
                                                    setHoverRating(
                                                        starNumber
                                                    )
                                                }
                                                onBlur={() =>
                                                    setHoverRating(0)
                                                }
                                                onClick={() =>
                                                    setReviewRating(
                                                        starNumber
                                                    )
                                                }
                                                aria-label={`${starNumber} sao`}
                                                aria-pressed={
                                                    reviewRating ===
                                                    starNumber
                                                }
                                            >
                                                <FiStar
                                                    size={22}
                                                    fill={
                                                        active
                                                            ? 'currentColor'
                                                            : 'none'
                                                    }
                                                />
                                            </button>
                                        );
                                    }
                                )}
                            </div>

                            <span className="review-form__rating-value">
                                {reviewRating}/5
                            </span>
                        </div>

                        <textarea
                            value={reviewContent}
                            onChange={(event) =>
                                setReviewContent(event.target.value)
                            }
                            rows={5}
                            maxLength={500}
                            placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
                            aria-label="Nội dung đánh giá"
                            required
                        />

                        <div className="review-form__bottom">
                            <span>
                                {reviewContent.length}/500 ký tự
                            </span>

                            <button
                                type="submit"
                                className="btn-submit-review"
                                disabled={!reviewContent.trim()}
                            >
                                <FiSend size={17} />
                                Gửi đánh giá
                            </button>
                        </div>
                    </form>
                </div>

                <div className="reviews-list">
                    {reviews.map((review) => (
                        <article
                            key={review.id}
                            className="review-item"
                        >
                            <div className="review-item__avatar">
                                {review.userName.charAt(0).toUpperCase()}
                            </div>

                            <div className="review-item__content">
                                <div className="review-item__head">
                                    <div>
                                        <h3>{review.userName}</h3>

                                        <div className="review-item__rating">
                                            {renderStars(
                                                review.rating,
                                                16
                                            )}
                                        </div>
                                    </div>

                                    <time>{review.createdAt}</time>
                                </div>

                                <p>{review.content}</p>
                            </div>
                        </article>
                    ))}

                    {!reviews.length && (
                        <div className="review-empty">
                            Chưa có bình luận nào. Hãy là người đầu tiên
                            đánh giá sản phẩm.
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
};

export default ProductDetailPage;
