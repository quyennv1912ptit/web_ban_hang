import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase';
import { syncUser } from './api/userApis'; // Hãy đảm bảo đường dẫn này đúng

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

const App = () => { 
  const [userRole, setUserRole] = useState(null); 
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const data = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            display_name: firebaseUser.displayName,
            phone_number: firebaseUser.phoneNumber,
            avatar: firebaseUser.photoURL
          };
          
          await syncUser(data);
          
          // TẠM THỜI HARDCODE ADMIN EMAIL ĐỂ TEST (Thay bằng email Firebase của bạn)
          const adminEmails = ['admin@gmail.com', 'testadmin@gmail.com']; 
          if (adminEmails.includes(firebaseUser.email)) {
            setUserRole('admin');
          } else {
            setUserRole('customer');
          }
          
        } catch (error) {
          console.error("Lỗi đồng bộ user:", error);
          setUserRole('customer'); 
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
  
  // Chỉ cho Admin vào
  const AdminRoute = ({ children }) => {
    if (userRole !== 'admin') {
      return <Navigate to="/" replace />;
    }
    return children;
  };

  // Chỉ cho User đã đăng nhập vào (tránh khách lạ vào xem giỏ hàng)
  const PrivateRoute = ({ children }) => {
    if (!userRole) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  return (
    <>
        {/* COMPONENT TEST KẾT NỐI SẼ LUÔN HIỆN Ở TRÊN CÙNG */}
        <TestConnection />

        <Routes>
            {/* LUỒNG 1: GIAO DIỆN KHÁCH HÀNG (Dùng MainLayout) */}
            <Route element={<MainLayout />}>
                {/* Route công khai */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/product/:id" element={<ProductDetailPage />} />
                <Route path="/category/:slug" element={<CategoryPage />} />
                <Route path="/sale" element={<SalePage/>} />
                <Route path="/best-sellers" element={<BestSellerPage/>} />
                <Route path="/new" element={<NewArrivalsPage/>} />
                
                {/* Route yêu cầu đăng nhập */}
                <Route path="/account" element={<PrivateRoute><UserInfoPage /></PrivateRoute>} />
                <Route path="/cart" element={<PrivateRoute><CartPage/></PrivateRoute>} />
                <Route path="/wishlist" element={<PrivateRoute><WishlistPage/></PrivateRoute>} />
                <Route path="/orders" element={<PrivateRoute><OrdersPage/></PrivateRoute>} />
            </Route>

            {/* LUỒNG 2: GIAO DIỆN ADMIN (Dùng AdminLayout và bọc trong AdminRoute) */}
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
            </Route>

            <Route path="*" element={<h1 style={{textAlign: 'center'}}>404 - Không tìm thấy trang</h1>} />
        </Routes>
    </>
  );
};

export default App;