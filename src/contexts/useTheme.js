import { useContext } from 'react';
import ThemeContext from './themeStore';

export function useTheme() {
    return useContext(ThemeContext);
}
