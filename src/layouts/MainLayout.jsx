import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';

const MainLayout = () => (
    <>
        <Header />
        <main style={{ maxWidth: 1200, margin: '0 auto', padding: 16 }}>
            <Outlet />
        </main>
    </>
);

export default MainLayout;