import React, { useEffect, useMemo } from 'react';
import { ConfigProvider, theme as antTheme } from 'antd';
import { Outlet } from 'react-router-dom';
import { useTheme } from '../contexts/useTheme';

// Loaded with the routes that use Ant Design, keeping the storefront entry light.
const AntThemeLayout = ({ children }) => {
    const { theme } = useTheme();
    const config = useMemo(() => ({
        algorithm: theme === 'dark' ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
        token: {
            colorPrimary: '#2563eb',
            ...(theme === 'dark' ? {
                colorBgBase: '#111318',
                colorBgLayout: '#111318',
                colorBgContainer: '#1b1e25',
                colorBgElevated: '#232731',
                colorText: '#e8eaf0',
                colorTextSecondary: '#b0b8c7',
                colorLink: '#82aaff',
                colorLinkHover: '#a8c4ff',
                colorPrimaryText: '#82aaff',
                colorPrimaryTextHover: '#a8c4ff',
                colorBorder: '#363b47',
                colorBorderSecondary: '#303541',
            } : {}),
        },
        ...(theme === 'dark' ? {
            components: {
                Button: {
                    colorPrimary: '#82aaff',
                    colorPrimaryHover: '#a8c4ff',
                    colorPrimaryActive: '#6b94e8',
                    primaryColor: '#111318',
                },
            },
        } : {}),
    }), [theme]);

    useEffect(() => {
        // Static message/Modal helpers mount outside the normal React tree.
        ConfigProvider.config({
            holderRender: node => <ConfigProvider theme={config}>{node}</ConfigProvider>,
        });
        return () => ConfigProvider.config({ holderRender: undefined });
    }, [config]);

    return <ConfigProvider theme={config}>{children || <Outlet />}</ConfigProvider>;
};

export default AntThemeLayout;
