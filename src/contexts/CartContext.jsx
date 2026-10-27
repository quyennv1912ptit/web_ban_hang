import React, { createContext, useContext, useState, useEffect, useLayoutEffect, useCallback, useRef } from 'react';
import axiosClient from '../api/axiosClient';
import { toast } from 'react-toastify';
import { auth } from '../config/firebase';
import { useLocation } from 'react-router-dom';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const requestVersion = useRef(0);
    const pendingRequests = useRef(new Map());
    const { pathname } = useLocation();
    const pathnameRef = useRef(pathname);
    useLayoutEffect(() => { pathnameRef.current = pathname; }, [pathname]);

    // Hàm tiện ích lấy Firebase Token để gửi header Authorization cho FastAPI
    const getAuthHeader = async () => {
        const user = auth.currentUser;
        if (!user) return null;
        const token = await user.getIdToken();
        return { Authorization: `Bearer ${token}` };
    };

    // 1. Tải danh sách giỏ hàng từ Backend
    const fetchCart = useCallback((hydrate = true) => {
        const user = auth.currentUser;
        if (!user) {
            setCartItems([]);
            setLoading(false);
            return Promise.resolve();
        }
        const key = `${user.uid}:${hydrate}`;
        if (pendingRequests.current.has(key)) return pendingRequests.current.get(key);
        const version = ++requestVersion.current;
        const isCurrent = () => version === requestVersion.current && auth.currentUser?.uid === user.uid;
        setLoading(true);
        setError('');
        const request = (async () => {
            try {
                const res = await axiosClient.get('/cart/');
                if (!isCurrent()) return;
                const items = Array.isArray(res.data) ? res.data : [];
                // The header only needs quantities. Product details load on the cart page.
                if (!hydrate) {
                    setCartItems(current => items.map(item => ({
                        ...item,
                        product: current.find(existing => String(existing.product_id) === String(item.product_id))?.product,
                    })));
                    return;
                }
                const hydratedItems = await Promise.all(items.map(async (item) => {
                    try {
                        const productRes = await axiosClient.get(`/products/${item.product_id}`);
                        return { ...item, product: productRes.data };
                    } catch (error) {
                        console.warn(`Không tải được sản phẩm trong giỏ ${item.product_id}:`, error);
                        return {
                            ...item,
                            product: { id: item.product_id, name: 'Sản phẩm không còn khả dụng', price: 0 },
                        };
                    }
                }));
                if (isCurrent()) setCartItems(hydratedItems);
            } catch (error) {
                if (isCurrent()) setError('Không thể tải giỏ hàng. Vui lòng thử lại.');
                console.error("Lỗi lấy giỏ hàng:", error);
            } finally {
                if (isCurrent()) setLoading(false);
            }
        })().finally(() => {
            if (pendingRequests.current.get(key) === request) pendingRequests.current.delete(key);
        });
        pendingRequests.current.set(key, request);
        return request;
    }, []);

    // Tự động tải lại giỏ hàng mỗi khi trạng thái đăng nhập thay đổi
    useEffect(() => {
        const requests = pendingRequests.current;
        const unsubscribe = auth.onAuthStateChanged((user) => {
            requestVersion.current += 1;
            pendingRequests.current.clear();
            setCartItems([]);
            setError('');
            if (user) {
                fetchCart(pathnameRef.current === '/cart');
            } else {
                setLoading(false);
            }
        });
        return () => {
            requestVersion.current += 1;
            requests.clear();
            unsubscribe();
        };
    }, [fetchCart]);

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

            const userId = auth.currentUser?.uid;
            await axiosClient.post(
                '/cart/',
                { product_id: finalProductId, quantity },
                { headers }
            );

            if (auth.currentUser?.uid !== userId) return;
            requestVersion.current += 1;
            pendingRequests.current.clear();
            toast.success('Đã thêm vào giỏ hàng');
            await fetchCart(pathnameRef.current === '/cart');
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

            const userId = auth.currentUser?.uid;
            const response = await axiosClient.put(
                `/cart/${productId}`,
                { quantity: newQuantity },
                { headers }
            );

            if (auth.currentUser?.uid !== userId) return;
            requestVersion.current += 1;
            pendingRequests.current.clear();
            setLoading(false);
            setCartItems(items => items.map(item => String(item.product_id) === String(productId)
                ? { ...item, ...response.data } : item));
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

            const userId = auth.currentUser?.uid;
            await axiosClient.delete(`/cart/${productId}`, { headers });
            if (auth.currentUser?.uid !== userId) return;
            requestVersion.current += 1;
            pendingRequests.current.clear();
            setLoading(false);
            toast.info('Đã xóa sản phẩm khỏi giỏ');
            setCartItems(items => items.filter(item => String(item.product_id) !== String(productId)));
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

            const userId = auth.currentUser?.uid;
            await axiosClient.delete('/cart/', { headers });
            if (auth.currentUser?.uid !== userId) return;
            requestVersion.current += 1;
            pendingRequests.current.clear();
            setLoading(false);
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
                error,
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
