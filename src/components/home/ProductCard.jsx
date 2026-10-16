import React from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiStar } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useCart } from '../../contexts/CartContext';
import { formatPrice } from '../../utils/format';

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();

    // 1. Đồng bộ an toàn các trường dữ liệu từ backend
    const id = product.id;
    const name = product.name || product.ten_san_pham || 'Đang cập nhật...';
    const price = product.price || product.gia_ban || 0;
    const oldPrice = product.oldPrice || product.old_price || product.gia_goc || null;
    const image = product.image || product.image_url || 'https://via.placeholder.com/300x300?text=No+Image';
    
    // Fallback mặc định nếu backend của bạn chưa tạo các cột này trong Database
    const rating = product.rating || 5.0; 
    const sold = product.sold || product.da_ban || 0; 

    // 2. Tính toán phần trăm giảm giá an toàn
    const discount = oldPrice && oldPrice > price
        ? Math.round((1 - price / oldPrice) * 100)
        : 0;

    const handleAdd = () => {
        addToCart({ id, name, price, image });
        toast.success('Đã thêm vào giỏ hàng');
    };

    return (
        <article className="product">
            <Link to={`/product/${id}`} className="product__link">
                <div className="product__img-wrap">
                    <img src={image} alt={name} loading="lazy" />
                    {discount > 0 && <span className="product__discount">-{discount}%</span>}
                </div>
                <h3 className="product__name">{name}</h3>
            </Link>

            <div className="product__price">
                <strong>{formatPrice(price)}</strong>
                {oldPrice && <del>{formatPrice(oldPrice)}</del>}
            </div>

            <div className="product__meta">
                <span><FiStar /> {rating}</span>
                {/* Đảm bảo 'sold' luôn là số để toLocaleString() không báo lỗi */}
                <span>Đã bán {Number(sold).toLocaleString('vi-VN')}</span>
            </div>

            <button type="button" className="product__add" onClick={handleAdd}>
                <FiShoppingCart /> Thêm vào giỏ
            </button>
        </article>
    );
};

export default ProductCard;