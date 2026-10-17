import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
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
      setLoading(true);
      const token = await user.getIdToken();
      const res = await axiosClient.get('/users/favorites', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const ids = (Array.isArray(res.data) ? res.data : []).map(item => String(item.product_id));
      setFavoriteIds(ids);
    } catch (error) {
      console.error("Lỗi tải danh sách yêu thích:", error);
      setFavoriteIds([]);
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

    const normalizedId = String(productId);
    const isFavorited = favoriteIds.includes(normalizedId);

    // 1. Đổi màu trái tim ngay lập tức không cần đợi API
    if (isFavorited) {
      setFavoriteIds(prev => prev.filter(id => id !== normalizedId));
    } else {
      setFavoriteIds(prev => [...prev, normalizedId]);
    }

    try {
      // 2. Bắn API xuống backend
      const token = await user.getIdToken();
      if (isFavorited) {
        await axiosClient.delete(`/users/favorites/${normalizedId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axiosClient.post(`/users/favorites/${normalizedId}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      return !isFavorited;
    } catch (error) {
      // Nếu API lỗi -> Hoàn tác lại trạng thái cũ
      if (isFavorited) {
        setFavoriteIds(prev => [...prev, normalizedId]);
      } else {
        setFavoriteIds(prev => prev.filter(id => id !== normalizedId));
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
