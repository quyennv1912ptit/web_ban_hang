import React, { useState } from 'react';
import { message } from 'antd';
import { HeartOutlined, HeartFilled } from '@ant-design/icons';
import { auth } from '../config/firebase';
import { useFavorites } from '../contexts/FavoritesContext';

const FavoriteButton = ({ productId }) => {
  const { favoriteIds, toggleFavorite } = useFavorites();
  const [submitting, setSubmitting] = useState(false);

  // Tự động kiểm tra sản phẩm này có nằm trong danh sách yêu thích hay không
  const isFavorited = favoriteIds.includes(productId);

  const handleToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!auth.currentUser) {
      message.warning('Vui lòng đăng nhập để lưu sản phẩm!');
      return;
    }

    setSubmitting(true);
    try {
      const status = await toggleFavorite(productId);
      if (status) {
        message.success('Đã lưu vào danh sách yêu thích ❤️');
      } else {
        message.info('Đã bỏ khỏi danh sách yêu thích');
      }
    } catch (error) {
      console.error(error);
      message.error('Có lỗi xảy ra!');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={submitting}
      style={{
        background: 'white',
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
    >
      {isFavorited ? (
        <HeartFilled style={{ color: '#ff4d4f', fontSize: '18px' }} />
      ) : (
        <HeartOutlined style={{ color: '#999', fontSize: '18px' }} />
      )}
    </button>
  );
};

export default FavoriteButton;