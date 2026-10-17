import React, { useState, useEffect } from 'react';
import { message, Spin } from 'antd'; // Thêm Spin để tạo hiệu ứng loading
import axiosClient from '../api/axiosClient';
import { auth } from '../config/firebase';
import { useCart } from '../contexts/CartContext';
import { useFavorites } from '../contexts/FavoritesContext';
import './WishlistPage.css';

function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { fetchFavorites } = useFavorites();

  const formatPrice = (price) => {
    return Number(price).toLocaleString('vi-VN') + 'đ';
  };

  // Hàm gọi API lấy danh sách yêu thích từ Backend
  const fetchWishlist = async () => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      const token = await user.getIdToken();
      const res = await axiosClient.get('/users/favorites', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const favoriteRows = Array.isArray(res.data) ? res.data : [];
      const products = await Promise.all(favoriteRows.map(async ({ product_id }) => {
        try {
          const productResponse = await axiosClient.get(`/products/${product_id}`);
          return productResponse.data;
        } catch (error) {
          console.warn(`Không tải được sản phẩm yêu thích ${product_id}:`, error);
          return null;
        }
      }));
      setWishlistItems(products.filter(Boolean));
    } catch (error) {
      console.error("Lỗi tải wishlist:", error);
      message.error("Không thể tải danh sách yêu thích");
    } finally {
      setLoading(false);
    }
  };

  // Lắng nghe đăng nhập và gọi API
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchWishlist();
      } else {
        setWishlistItems([]);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Xóa khỏi danh sách bằng API Toggle
  const handleRemoveFromWishlist = async (id) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      await axiosClient.delete(`/users/favorites/${id}`);
      setWishlistItems(prev => prev.filter(item => String(item.id) !== String(id)));
      await fetchFavorites();
      message.success("Đã xóa khỏi danh sách yêu thích");
    } catch (error) {
      console.error("Lỗi xóa wishlist:", error);
      message.error("Lỗi khi xóa sản phẩm");
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" tip="Đang tải danh sách yêu thích..." />
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <div className="wishlist-container">
        
        {/* Banner Wishlist */}
        <div className="wishlist-banner">
          <h1>❤️ SẢN PHẨM YÊU THÍCH ❤️</h1>
          <p>Lưu giữ những món đồ bạn quan tâm để dễ dàng quay lại mua sắm bất cứ lúc nào!</p>
        </div>

        {/* Thanh tiêu đề nhỏ */}
        <div className="wishlist-header-bar">
          <h2>Danh sách yêu thích ({wishlistItems.length} sản phẩm)</h2>
        </div>

        {/* Lưới sản phẩm */}
        {wishlistItems.length > 0 ? (
          <div className="product-grid">
            {wishlistItems.map((product) => {
              // Tự động tìm link ảnh thật từ dữ liệu backend trả về
              const imgUrl = product.images?.[0]?.image_url || product.image_url || 'https://via.placeholder.com/200';

              return (
                <div key={product.id} className="product-card wishlist-card">
                  {/* Nút bỏ thích */}
                  <button 
                    className="remove-wishlist-btn" 
                    onClick={() => handleRemoveFromWishlist(product.id)}
                    title="Bỏ thích"
                  >
                    ✕
                  </button>

                  <img src={imgUrl} alt={product.name} className="product-img" />
                  
                  <div className="product-info">
                    <h3 className="product-title">{product.name}</h3>
                    
                    <div>
                      <div className="product-prices">
                        <span className="wishlist-price">{formatPrice(product.price)}</span>
                        {/* Backend trả về original_price thay vì oldPrice */}
                        {product.original_price && (
                          <span className="product-old-price">{formatPrice(product.original_price)}</span>
                        )}
                      </div>

                      <div className="wishlist-meta">
                        <span className="star">★ {Number(product.average_rating || 0).toFixed(1)}</span>
                        <button className="move-to-cart-btn" onClick={async () => {
                          try { await addToCart(product.id); } catch { /* CartContext displays the error. */ }
                        }}>Thêm vào giỏ</button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="wishlist-empty">
            <h3>Danh sách yêu thích của bạn đang trống!</h3>
            <p>Hãy bấm vào biểu tượng trái tim ở các sản phẩm bạn quan tâm nhé.</p>
          </div>
        )}

      </div>
    </div>
  );
}

export default WishlistPage;
