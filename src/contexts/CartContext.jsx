import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import axiosClient from '../api/axiosClient';
import cartApi from '../api/cartApi';

const CartContext = createContext(null);
const STORAGE_KEY = 'cart_items';

const loadCart = () => {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
        return [];
    }
};

const asCartProduct = (product, quantity) => ({
    id: product.id,
    name: product.name,
    price: Number(product.price ?? 0),
    image: product.image || product.image_url || product.images?.[0]?.cropped_url || product.images?.[0]?.original_url || '',
    quantity: Number(quantity ?? 1),
});

export const CartProvider = ({ children }) => {
    const { user, loading: authLoading } = useAuth();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (authLoading) return undefined;
        let active = true;

        const loadRemoteCart = async () => {
            setLoading(true);
            setError('');

            if (!user) {
                setItems(loadCart());
                setLoading(false);
                return;
            }

            try {
                const response = await cartApi.getItems();
                const rows = Array.isArray(response) ? response : response?.items ?? [];
                const hydratedItems = await Promise.all(rows.map(async (row) => {
                    const product = await axiosClient.get(`/products/${row.product_id}`);
                    return asCartProduct(product, row.quantity);
                }));
                if (active) setItems(hydratedItems);
            } catch (loadError) {
                if (active) {
                    setItems([]);
                    setError(loadError.response?.data?.detail || 'Không tải được giỏ hàng từ backend.');
                }
            } finally {
                if (active) setLoading(false);
            }
        };

        loadRemoteCart();
        return () => { active = false; };
    }, [user, authLoading]);

    useEffect(() => {
        if (!authLoading && !user) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        }
    }, [items, user, authLoading]);

    const addToCart = async (product, quantity = 1) => {
        const cartProduct = asCartProduct(product, quantity);
        if (!cartProduct.id) throw new Error('Không xác định được sản phẩm cần thêm.');

        if (user) {
            await cartApi.addItem({ product_id: cartProduct.id, quantity: cartProduct.quantity });
        }

        setItems((current) => {
            const existing = current.find((item) => item.id === cartProduct.id);
            if (existing) {
                return current.map((item) => item.id === cartProduct.id
                    ? { ...item, quantity: item.quantity + cartProduct.quantity }
                    : item);
            }
            return [...current, cartProduct];
        });
        return cartProduct;
    };

    const removeFromCart = async (id) => {
        if (user) await cartApi.removeItem(id);
        setItems((current) => current.filter((item) => item.id !== id));
    };

    const updateQuantity = async (id, quantity) => {
        const nextQuantity = Math.max(1, Number(quantity));
        if (user) await cartApi.updateItem(id, nextQuantity);
        setItems((current) => current.map((item) => item.id === id
            ? { ...item, quantity: nextQuantity }
            : item));
    };

    const clearCart = async () => {
        if (user) await cartApi.clear();
        setItems([]);
    };

    const totalQuantity = useMemo(
        () => items.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
        [items]
    );
    const totalPrice = useMemo(
        () => items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0),
        [items]
    );

    return (
        <CartContext.Provider value={{
            items, loading, error, addToCart, removeFromCart, updateQuantity,
            clearCart, totalQuantity, totalPrice,
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
