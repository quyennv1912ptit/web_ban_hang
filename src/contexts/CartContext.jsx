import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { auth } from '../config/firebase';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);

    // Hàm tiện ích lấy Firebase Token để gửi header Authorization cho FastAPI
    const getAuthHeader = async () => {
        const user = auth.currentUser;
        if (!user) return null;
        const token = await user.getIdToken();
        return { Authorization: `Bearer ${token}` };
    };

    // 1. Tải danh sách giỏ hàng từ Backend
    const fetchCart = async () => {
        try {
            const headers = await getAuthHeader();
            if (!headers) {
                setCartItems([]); // Chưa đăng nhập thì giỏ rỗng
                return;
            }
            setLoading(true);
            const res = await axios.get('http://localhost:8000/api/cart/', { headers });
            setCartItems(res.data || []);
        } catch (error) {
            console.error("Lỗi lấy giỏ hàng:", error);
        } finally {
            setLoading(false);
        }
    };

    // Tự động tải lại giỏ hàng mỗi khi trạng thái đăng nhập thay đổi
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                fetchCart();
            } else {
                setCartItems([]);
            }
        });
        return () => unsubscribe();
    }, []);

    // 2. Thêm sản phẩm vào giỏ (ĐÃ SỬA: Hỗ trợ nhận trực tiếp productId là chuỗi)
    const addToCart = async (productOrId, quantity = 1) => {
        try {
            const headers = await getAuthHeader();
            if (!headers) {
                toast.warning('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!');
                return;
            }

            // Xử lý thông minh: Nếu truyền Object thì lấy .id, nếu truyền String UUID thì lấy luôn
            const finalProductId = typeof productOrId === 'object' ? productOrId.id : productOrId;

            if (!finalProductId) {
                console.error("Lỗi: Không tìm thấy ID sản phẩm để thêm vào giỏ!");
                return;
            }

            await axios.post(
                'http://localhost:8000/api/cart/',
                { product_id: finalProductId, quantity },
                { headers }
            );

            toast.success('Đã thêm vào giỏ hàng');
            await fetchCart(); // Cập nhật lại giỏ hàng
        } catch (error) {
            console.error("Lỗi thêm giỏ hàng:", error);
            
            // Xử lý báo lỗi chi tiết nếu backend báo 422
            const msg = error.response?.data?.detail || 'Thêm vào giỏ thất bại';
            
            // Nếu backend trả về mảng báo lỗi pydantic (thường là 422)
            if (Array.isArray(msg)) {
                toast.error(`Lỗi dữ liệu: ${msg[0]?.msg}`);
            } else {
                toast.error(msg);
            }
            
            // Ném lỗi ra ngoài để ProductDetailPage biết mà dừng chuyển trang
            throw error; 
        }
    };

    // 3. Cập nhật số lượng sản phẩm
    const updateQuantity = async (productId, newQuantity) => {
        if (newQuantity < 1) return;
        try {
            const headers = await getAuthHeader();
            if (!headers) return;

            await axios.put(
                `http://localhost:8000/api/cart/${productId}`,
                { quantity: newQuantity },
                { headers }
            );

            await fetchCart();
        } catch (error) {
            console.error("Lỗi cập nhật số lượng:", error);
            const msg = error.response?.data?.detail || 'Không thể cập nhật số lượng';
            toast.error(msg);
        }
    };

    // 4. Xóa một sản phẩm
    const removeFromCart = async (productId) => {
        try {
            const headers = await getAuthHeader();
            if (!headers) return;

            await axios.delete(`http://localhost:8000/api/cart/${productId}`, { headers });
            toast.info('Đã xóa sản phẩm khỏi giỏ');
            await fetchCart();
        } catch (error) {
            console.error("Lỗi xóa sản phẩm:", error);
            toast.error('Xóa sản phẩm thất bại');
        }
    };

    // 5. Xóa toàn bộ giỏ hàng
    const clearCart = async () => {
        try {
            const headers = await getAuthHeader();
            if (!headers) return;

            await axios.delete('http://localhost:8000/api/cart/', { headers });
            setCartItems([]);
            toast.info('Đã làm trống giỏ hàng');
        } catch (error) {
            console.error("Lỗi làm trống giỏ:", error);
        }
    };

    // Tính tổng số lượng & tổng tiền (bọc an toàn)
    const totalQuantity = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const totalPrice = cartItems.reduce((sum, item) => {
        const itemPrice = item.product?.price || item.price || 0;
        return sum + itemPrice * item.quantity;
    }, 0);

    return (
        <CartContext.Provider
            value={{
                cartItems,
                loading,
                addToCart,
                updateQuantity,
                removeFromCart,
                clearCart,
                totalQuantity,
                totalPrice,
                fetchCart
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);