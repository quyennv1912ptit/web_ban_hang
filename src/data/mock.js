export const CATEGORIES = [
    { slug: 'thoi-trang-nam', name: 'Thời Trang Nam', icon: '👕' },
    { slug: 'dien-thoai', name: 'Điện Thoại & Phụ Kiện', icon: '📱' },
    { slug: 'thiet-bi-dien-tu', name: 'Thiết Bị Điện Tử', icon: '📺' },
    { slug: 'laptop', name: 'Máy Tính & Laptop', icon: '💻' },
    { slug: 'may-anh', name: 'Máy Ảnh & Máy Quay Phim', icon: '📷' },
    { slug: 'dong-ho', name: 'Đồng Hồ', icon: '⌚' },
    { slug: 'giay-dep-nam', name: 'Giày Dép Nam', icon: '👞' },
    { slug: 'gia-dung', name: 'Thiết Bị Điện Gia Dụng', icon: '🔌' },
    { slug: 'the-thao', name: 'Thể Thao & Du Lịch', icon: '⚽' },
    { slug: 'xe-co', name: 'Ô Tô & Xe Máy & Xe Đạp', icon: '🏍️' },
    { slug: 'thoi-trang-nu', name: 'Thời Trang Nữ', icon: '👗' },
    { slug: 'me-be', name: 'Mẹ & Bé', icon: '🍼' },
    { slug: 'nha-cua', name: 'Nhà Cửa & Đời Sống', icon: '🏠' },
    { slug: 'sac-dep', name: 'Sắc Đẹp', icon: '💄' },
    { slug: 'suc-khoe', name: 'Sức Khỏe', icon: '💊' },
    { slug: 'giay-dep-nu', name: 'Giày Dép Nữ', icon: '👠' },
    { slug: 'tui-vi-nu', name: 'Túi Ví Nữ', icon: '👜' },
    { slug: 'phu-kien-nu', name: 'Phụ Kiện & Trang Sức Nữ', icon: '💍' },
    { slug: 'bach-hoa', name: 'Bách Hóa Online', icon: '🛒' },
    { slug: 'nha-sach', name: 'Nhà Sách Online', icon: '📚' },
];

const BASE_PRODUCTS = [
    { name: 'Áo thun nam cotton basic', price: 129000, oldPrice: 199000, sold: 1520, rating: 4.8 },
    { name: 'Tai nghe Bluetooth chống ồn', price: 459000, oldPrice: 690000, sold: 860, rating: 4.7 },
    { name: 'Giày sneaker nữ đế êm', price: 289000, oldPrice: 350000, sold: 2310, rating: 4.9 },
    { name: 'Ấm siêu tốc inox 1.8L', price: 199000, oldPrice: 259000, sold: 640, rating: 4.6 },
    { name: 'Balo laptop chống nước', price: 249000, oldPrice: 399000, sold: 1180, rating: 4.8 },
    { name: 'Sạc nhanh 20W Type-C', price: 99000, oldPrice: 149000, sold: 5400, rating: 4.7 },
    { name: 'Son lì lâu trôi', price: 159000, oldPrice: 220000, sold: 3200, rating: 4.9 },
    { name: 'Đồng hồ thể thao chống nước', price: 349000, oldPrice: 520000, sold: 720, rating: 4.5 },
];

// Tạo 24 sản phẩm giả từ 8 mẫu
export const PRODUCTS = Array.from({ length: 24 }, (_, i) => {
    const base = BASE_PRODUCTS[i % BASE_PRODUCTS.length];
    return {
        ...base,
        id: `p${i + 1}`,
        image: `https://picsum.photos/seed/shop${i + 1}/400/400`,
    };
});