const priceFormatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });

export const formatPrice = (value) => priceFormatter.format(value);
