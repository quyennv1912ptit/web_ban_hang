import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { auth } from '../config/firebase'; // Chỉnh đường dẫn tới firebase của ông

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [loading, setLoading] = useState(true);

  // Lấy danh sách ID sản phẩm đã yêu thích từ backend
  const fetchFavorites = async () => {
    const user = auth.currentUser;
    if (!user) {
      setFavoriteIds([]);
      setLoading(false);
      return;
    }
    try {
      const token = await user.getIdToken();
      const res = await axios.get('http://127.0.0.1:8000/api/favorites/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Trích xuất mảng chứa các ID đã thích
      const ids = res.data.map(item => item.id);
      setFavoriteIds(ids);
    } catch (error) {
      console.error("Lỗi tải danh sách yêu thích:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchFavorites();
      } else {
        setFavoriteIds([]);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Hàm Toggle cập nhật tức thì trên UI (Optimistic update)
  const toggleFavorite = async (productId) => {
    const user = auth.currentUser;
    if (!user) return false;

    const isFavorited = favoriteIds.includes(productId);

    // 1. Đổi màu trái tim ngay lập tức không cần đợi API
    if (isFavorited) {
      setFavoriteIds(prev => prev.filter(id => id !== productId));
    } else {
      setFavoriteIds(prev => [...prev, productId]);
    }

    try {
      // 2. Bắn API xuống backend
      const token = await user.getIdToken();
      const res = await axios.post(
        `http://127.0.0.1:8000/api/favorites/${productId}/toggle`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return res.data.is_favorited;
    } catch (error) {
      // Nếu API lỗi -> Hoàn tác lại trạng thái cũ
      if (isFavorited) {
        setFavoriteIds(prev => [...prev, productId]);
      } else {
        setFavoriteIds(prev => prev.filter(id => id !== productId));
      }
      throw error;
    }
  };

  return (
    <FavoritesContext.Provider value={{ favoriteIds, toggleFavorite, fetchFavorites, loading }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => useContext(FavoritesContext);