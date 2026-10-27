import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { auth } from '../config/firebase';
import { useFavorites } from '../contexts/FavoritesContext';

const FavoriteButton = ({ productId }) => {
  const { favoriteIds, toggleFavorite } = useFavorites();
  const [submitting, setSubmitting] = useState(false);

  // Tự động kiểm tra sản phẩm này có nằm trong danh sách yêu thích hay không
  const isFavorited = favoriteIds.includes(String(productId));

  const handleToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!auth.currentUser) {
      toast.warning('Vui lòng đăng nhập để lưu sản phẩm!');
      return;
    }

    setSubmitting(true);
    try {
      const status = await toggleFavorite(productId);
      if (status) {
        toast.success('Đã lưu vào danh sách yêu thích ❤️');
      } else {
        toast.info('Đã bỏ khỏi danh sách yêu thích');
      }
    } catch (error) {
      console.error(error);
      toast.error('Có lỗi xảy ra!');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={submitting}
      style={{
        background: 'var(--theme-surface-raised, white)',
        border: 'none',
        borderRadius: '50%',
        width: '32px',
        height: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: submitting ? 'not-allowed' : 'pointer',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        transition: 'all 0.3s',
        opacity: submitting ? 0.6 : 1
      }}
      title={isFavorited ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
      aria-label={isFavorited ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
      aria-pressed={isFavorited}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z"
          stroke={isFavorited ? '#ff4d4f' : '#999'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill={isFavorited ? '#ff4d4f' : 'none'}
        />
      </svg>
    </button>
  );
};

export default FavoriteButton;
