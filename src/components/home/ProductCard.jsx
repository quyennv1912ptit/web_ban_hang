import React from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiStar } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useCart } from '../../contexts/CartContext';
import { formatPrice } from '../../utils/format';

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();
    const discount = product.oldPrice
        ? Math.round((1 - product.price / product.oldPrice) * 100)
        : 0;

    const handleAdd = async () => {
        try {
            await addToCart({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
            });
            toast.success('Đã thêm vào giỏ hàng');
        } catch (error) {
            toast.error(error.response?.data?.detail || error.message || 'Không thể thêm vào giỏ hàng');
        }
    };

    return (
        <article className="product">
            <Link to={`/product/${product.id}`} className="product__link">
                <div className="product__img-wrap">
                    <img src={product.image} alt={product.name} loading="lazy" />
                    {discount > 0 && <span className="product__discount">-{discount}%</span>}
                </div>
                <h3 className="product__name">{product.name}</h3>
            </Link>

            <div className="product__price">
                <strong>{formatPrice(product.price)}</strong>
                {product.oldPrice && <del>{formatPrice(product.oldPrice)}</del>}
            </div>

            <div className="product__meta">
                <span><FiStar /> {product.rating}</span>
                <span>Đã bán {product.sold.toLocaleString('vi-VN')}</span>
            </div>

            <button type="button" className="product__add" onClick={handleAdd}>
                <FiShoppingCart /> Thêm vào giỏ
            </button>
        </article>
    );
};

export default ProductCard;
