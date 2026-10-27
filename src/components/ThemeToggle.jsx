import React from 'react';
import { FiMoon, FiSun } from 'react-icons/fi';
import { useTheme } from '../contexts/useTheme';

const ThemeToggle = ({ className = '' }) => {
    const { theme, toggleTheme } = useTheme();
    const nextTheme = theme === 'dark' ? 'light' : 'dark';

    return (
        <button
            type="button"
            className={`theme-toggle ${className}`.trim()}
            onClick={toggleTheme}
            aria-label="Giao diện tối"
            aria-pressed={theme === 'dark'}
            title={`Chuyển sang giao diện ${nextTheme === 'dark' ? 'tối' : 'sáng'}`}
        >
            {theme === 'dark'
                ? <FiSun size={20} strokeWidth={1.8} aria-hidden="true" />
                : <FiMoon size={20} strokeWidth={1.8} aria-hidden="true" />}
        </button>
    );
};

export default ThemeToggle;
