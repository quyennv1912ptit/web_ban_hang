import React, { useCallback, useEffect, useState } from 'react';
import ThemeContext from './themeStore';

const STORAGE_KEY = 'web_ban_hang_theme';
function getInitialTheme() {
    try {
        const savedTheme = window.localStorage.getItem(STORAGE_KEY);
        if (savedTheme === 'dark' || savedTheme === 'light') return savedTheme;
    } catch {
        // The app still works if the browser blocks local storage.
    }
    return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(getInitialTheme);

    useEffect(() => {
        document.documentElement.dataset.theme = theme;
        try {
            window.localStorage.setItem(STORAGE_KEY, theme);
        } catch {
            // Keep the current theme for this session when storage is unavailable.
        }
    }, [theme]);

    const toggleTheme = useCallback(() => {
        setTheme(current => current === 'dark' ? 'light' : 'dark');
    }, []);

    return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

