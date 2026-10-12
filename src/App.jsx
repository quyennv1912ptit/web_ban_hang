import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase';
import { syncUser } from './api/userApis';

// --- Layouts ---
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout'; // Sẽ tạo Layout này cho Admin

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

// --- Admin Pages (Tạo thêm các file này trong src/pages/admin) ---
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';

const App = () => { 
  // State quản lý thông tin user và trạng thái loading
  const [userRole, setUserRole] = useState(null); 
  const [isLoading, setIsLoading] = useState(true); // Tránh chớp nháy giao diện khi đang check Firebase

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
          
          // GIẢ SỬ: API syncUser trả về thông tin user có chứa role ('admin' hoặc 'customer')
          // Nếu API chưa có, bạn có thể tự quy định email nào là admin (vd: firebaseUser.email === 'admin@gmail.com')
          setUserRole(user?.role || 'customer'); 
          
        } catch (error) {
          console.error("Lỗi đồng bộ user:", error);
          setUserRole('customer'); // Lỗi thì mặc định là khách
        }
      } else {
        console.log("User đã đăng xuất");
        setUserRole(null);
      }
      setIsLoading(false); // Check xong thì tắt loading
    });

    return () => unsubscribe(); 
  }, []);

  // Nếu đang kiểm tra đăng nhập thì hiển thị màn hình chờ (để không bị nhảy trang)
  if (isLoading) {
    return <div style={{ textAlign: 'center', marginTop: '20vh' }}>Đang tải hệ thống...</div>;
  }

  // Component bảo vệ Route của Admin
  const AdminRoute = ({ children }) => {
    if (userRole !== 'admin') {
      // Nếu không phải admin, đá về trang chủ
      return <Navigate to="/" replace />;
    }
    return children;
  };

  return (
    <Routes>
        {/* LUỒNG 1: GIAO DIỆN KHÁCH HÀNG (Dùng MainLayout) */}
        <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/account" element={<UserInfoPage />} />
            <Route path="/category/:slug" element={<CategoryPage />} />
            <Route path="/sale" element={<SalePage/>} />
            <Route path="/best-sellers" element={<BestSellerPage/>} />
            <Route path="/new" element={<NewArrivalsPage/>} />
            <Route path="/cart" element={<CartPage/>} />
            <Route path="/wishlist" element={<WishlistPage/>} />
            <Route path="/orders" element={<OrdersPage/>} />
        </Route>

        {/* LUỒNG 2: GIAO DIỆN ADMIN (Dùng AdminLayout và được bảo vệ) */}
        <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
        </Route>
        {/* Route bắt lỗi 404 (nếu gõ linh tinh) */}
        <Route path="*" element={<h1 style={{textAlign: 'center'}}>404 - Không tìm thấy trang</h1>} />
    </Routes>
  );
};

export default App;