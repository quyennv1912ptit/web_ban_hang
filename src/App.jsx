import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase';
import { syncUser } from './api/userApis';

import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import HomePage from './pages/HomePage';
import UserInfoPage from "./pages/UserInfoPage"
import ProductDetailPage from "./pages/ProductDetailPage"

const App = () => { 
  
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
          
          const user = await syncUser(data);
          console.log("Đồng bộ user thành công:", user);
          
        } catch (error) {
          console.error("Lỗi đồng bộ user:", error);
        }
      } else {
        console.log("User đã đăng xuất");
      }
    });

    return () => unsubscribe(); 
    
  }, []);

  return (
    
    <Routes>
        <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            {/* Thêm các route: /cart, /search, /category/:slug, /account, /orders, /wishlist ... */}
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/account" element={<UserInfoPage />} />
        </Route>
    </Routes>
        
    
  );

};

export default App;