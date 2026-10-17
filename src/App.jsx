import React, { lazy, Suspense, useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase';
import { syncUser } from './api/userApis'; 

// --- Contexts ---
import { FavoritesProvider } from './contexts/FavoritesContext'; // 1. Import FavoritesProvider

// --- Layouts ---
import MainLayout from './layouts/MainLayout';
const AdminLayout = lazy(() => import('./layouts/AdminLayout'));

// Keep the home route in the entry chunk; load other routes when first visited.
import HomePage from './pages/HomePage';
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const UserInfoPage = lazy(() => import('./pages/UserInfoPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const CategoryPage = lazy(() => import('./pages/CategoryPage'));
const SalePage = lazy(() => import('./pages/SalePage'));
const BestSellerPage = lazy(() => import('./pages/BestSeller'));
const NewArrivalsPage = lazy(() => import('./pages/NewArrivalsPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const WishlistPage = lazy(() => import('./pages/WishlistPage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const HelpPage = lazy(() => import('./pages/HelpPage'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminReviews = lazy(() => import('./pages/admin/AdminReviews'));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories'));

const AdminRoute = ({ userRole, roleLoading, children }) => {
  if (roleLoading) {
    return <div role="status" style={{ minHeight: '40vh', display: 'grid', placeItems: 'center' }}>Đang xác thực quyền quản trị...</div>;
  }
  return userRole === 'admin' ? children : <Navigate to="/" replace />;
};

const PrivateRoute = ({ userRole, children }) => (
  auth.currentUser || userRole ? children : <Navigate to="/login" replace />
);

const App = () => { 
  const [userRole, setUserRole] = useState(null); 
  const [isLoading, setIsLoading] = useState(true);
  const [roleLoading, setRoleLoading] = useState(false);

  useEffect(() => {
    let authEvent = 0;
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      const currentEvent = ++authEvent;
      if (!firebaseUser) {
        setUserRole(null);
        setRoleLoading(false);
        setIsLoading(false);
        return;
      }

      // Render the storefront immediately; resolve the admin role in the background.
      setUserRole('customer');
      setIsLoading(false);
      setRoleLoading(true);

      const syncUserInBackground = async () => {
        try {
          const res = await syncUser({
            display_name: firebaseUser.displayName,
            phone_number: firebaseUser.phoneNumber,
          });
          if (currentEvent === authEvent) {
            setUserRole(res?.data?.role || 'customer');
          }
        } catch (error) {
          console.error("Lỗi đồng bộ user API:", error);
        } finally {
          if (currentEvent === authEvent) setRoleLoading(false);
        }
      };

      syncUserInBackground();
    });

    return () => {
      authEvent += 1;
      unsubscribe();
    };
  }, []);

  if (isLoading) {
    return <div style={{ textAlign: 'center', marginTop: '20vh' }}>Đang tải hệ thống...</div>;
  }

  return (
    /* 2. Bọc toàn bộ các Router bên trong FavoritesProvider */
    <FavoritesProvider>
      <Routes>
          {/* LUỒNG 1: GIAO DIỆN KHÁCH HÀNG */}
          <Route element={<MainLayout userRole={userRole} />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/help" element={<HelpPage />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/category/:id" element={<CategoryPage />} />
              <Route path="/sale" element={<SalePage/>} />
              <Route path="/best-sellers" element={<BestSellerPage/>} />
              <Route path="/new" element={<NewArrivalsPage/>} />
              <Route path="/search" element={<SearchPage />} />
              
              <Route path="/account" element={<PrivateRoute userRole={userRole}><UserInfoPage /></PrivateRoute>} />
              <Route path="/cart" element={<PrivateRoute userRole={userRole}><CartPage/></PrivateRoute>} />
              <Route path="/wishlist" element={<PrivateRoute userRole={userRole}><WishlistPage/></PrivateRoute>} />
              <Route path="/orders" element={<PrivateRoute userRole={userRole}><OrdersPage/></PrivateRoute>} />
          </Route>

          {/* LUỒNG 2: GIAO DIỆN ADMIN */}
          <Route 
            path="/admin" 
            element={
              <Suspense fallback={<div role="status" style={{ minHeight: '40vh', display: 'grid', placeItems: 'center' }}>Đang tải trang quản trị...</div>}>
              <AdminRoute userRole={userRole} roleLoading={roleLoading}>
                <AdminLayout />
              </AdminRoute>
              </Suspense>
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
    </FavoritesProvider>
  );
};

export default App;
