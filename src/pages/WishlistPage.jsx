import React, { useState, useEffect } from 'react';
import { message, Spin } from 'antd'; // Thêm Spin để tạo hiệu ứng loading
import axios from 'axios';
import { auth } from '../config/firebase';
import './WishlistPage.css';

function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

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
      const res = await axios.get('http://127.0.0.1:8000/api/favorites/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWishlistItems(res.data);
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
      const token = await user.getIdToken();
      await axios.post(
        `http://127.0.0.1:8000/api/favorites/${id}/toggle`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Xóa khỏi UI ngay lập tức để người dùng không phải đợi load lại trang
      setWishlistItems(prev => prev.filter(item => item.id !== id));
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
              const imgUrl = product.images?.[0]?.original_url || product.image_url || 'https://via.placeholder.com/200';

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
                        <span className="star">★ {product.rating || "5.0"}</span>
                        <button className="move-to-cart-btn">Thêm vào giỏ</button>
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