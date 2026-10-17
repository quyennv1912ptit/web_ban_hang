import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';

const MainLayout = ({ userRole }) => (
    <>
        <Header isAdmin={userRole === 'admin'} />
        <main style={{ maxWidth: 1200, margin: '0 auto', padding: 16 }}>
            <Suspense fallback={<div role="status" style={{ minHeight: '40vh', display: 'grid', placeItems: 'center' }}>Đang tải trang...</div>}>
                <Outlet />
            </Suspense>
        </main>
    </>
);

export default MainLayout;
