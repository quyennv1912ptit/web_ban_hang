import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase';
import { syncUser } from './api/userApis'; 

import TestConnection from './TestConnection';

// --- Layouts ---
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout'; 

// --- Customer Pages ---
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import HomePage from './pages/HomePage';
import UserInfoPage from "./pages/UserInfoPage"
import ProductDetailPage from "./pages/ProductDetailPage"
import CategoryPage from './pages/CategoryPage';
import SalePage from './pages/SalePage';
import BestSellerPage from './pages/BestSeller';
import NewArrivalsPage from './pages/NewArrivalsPage';
import CartPage from './pages/CartPage';
import WishlistPage from './pages/WishlistPage';
import OrdersPage from './pages/OrdersPage';

// --- Admin Pages ---
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminUsers from './pages/admin/AdminUsers';
import AdminOrders from './pages/admin/AdminOrders';
import AdminReviews from './pages/admin/AdminReviews';
import AdminCategories from './pages/admin/AdminCategories';

const App = () => { 
  const [userRole, setUserRole] = useState(null); 
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Cấp quyền Admin nhanh dự phòng qua email để không bị nghẽn giao diện
        const adminEmails = ['minhhieu15thmay@gmail.com', 'admin_phu@gmail.com'];
        if (firebaseUser.email && adminEmails.includes(firebaseUser.email.toLowerCase())) {
          setUserRole('admin');
        } else {
          setUserRole('customer');
        }

        try {
          const data = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            display_name: firebaseUser.displayName,
            phone_number: firebaseUser.phoneNumber,
            avatar: firebaseUser.photoURL
          };
          
          // Đồng bộ với Database PostgreSQL và lấy role chuẩn từ DB
          const res = await syncUser(data);
          const dbRole = res?.data?.role || res?.role;
          if (dbRole) {
            setUserRole(dbRole);
          }
        } catch (error) {
          console.error("Lỗi đồng bộ user API:", error);
        }
      } else {
        setUserRole(null);
      }
      setIsLoading(false); 
    });

    return () => unsubscribe(); 
  }, []);

  if (isLoading) {
    return <div style={{ textAlign: 'center', marginTop: '20vh' }}>Đang tải hệ thống...</div>;
  }

  // --- CÁC COMPONENT BẢO VỆ ROUTE ---
  const AdminRoute = ({ children }) => {
    const firebaseUser = auth.currentUser;
    const isMasterAdmin = firebaseUser?.email && ['minhhieu15thmay@gmail.com', 'admin_phu@gmail.com'].includes(firebaseUser.email.toLowerCase());
    
    if (userRole !== 'admin' && !isMasterAdmin) {
      return <Navigate to="/" replace />;
    }
    return children;
  };

  const PrivateRoute = ({ children }) => {
    if (!auth.currentUser && !userRole) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  return (
    <>
        <TestConnection />

        <Routes>
            {/* LUỒNG 1: GIAO DIỆN KHÁCH HÀNG */}
            <Route element={<MainLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/product/:id" element={<ProductDetailPage />} />
                <Route path="/category/:id" element={<CategoryPage />} />
                <Route path="/sale" element={<SalePage/>} />
                <Route path="/best-sellers" element={<BestSellerPage/>} />
                <Route path="/new" element={<NewArrivalsPage/>} />
                
                <Route path="/account" element={<PrivateRoute><UserInfoPage /></PrivateRoute>} />
                <Route path="/cart" element={<PrivateRoute><CartPage/></PrivateRoute>} />
                <Route path="/wishlist" element={<PrivateRoute><WishlistPage/></PrivateRoute>} />
                <Route path="/orders" element={<PrivateRoute><OrdersPage/></PrivateRoute>} />
            </Route>

            {/* LUỒNG 2: GIAO DIỆN ADMIN */}
            <Route 
              path="/admin" 
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
                <Route index element={<AdminDashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="reviews" element={<AdminReviews />} />
                <Route path="categories" element={<AdminCategories />} />
            </Route>

            <Route path="*" element={<h1 style={{textAlign: 'center'}}>404 - Không tìm thấy trang</h1>} />
        </Routes>
    </>
  );
};

export default App;