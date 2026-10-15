import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'cart_items';

const loadCart = () => {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
        return [];
    }
};

export const CartProvider = ({ children }) => {
    const [items, setItems] = useState(loadCart);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }, [items]);

    // product: { id, name, price, image }
    const addToCart = (product, quantity = 1) => {
        setItems((prev) => {
            const exist = prev.find((i) => i.id === product.id);
            if (exist) {
                return prev.map((i) =>
                    i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i
                );
            }
            return [...prev, { ...product, quantity }];
        });
    };

    const removeFromCart = (id) => setItems((prev) => prev.filter((i) => i.id !== id));

    const updateQuantity = (id, quantity) =>
        setItems((prev) =>
            prev.map((i) => (i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i))
        );

    const clearCart = () => setItems([]);

    const totalQuantity = useMemo(
        () => items.reduce((sum, i) => sum + i.quantity, 0),
        [items]
    );
    const totalPrice = useMemo(
        () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
        [items]
    );

    return (
        <CartContext.Provider
            value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, totalQuantity, totalPrice }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);