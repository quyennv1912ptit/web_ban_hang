import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { toast } from 'react-toastify';
import axios from 'axios';
import {
    FiShoppingCart,
    FiHeart,
    FiUser,
    FiMenu,
    FiX,
    FiPackage,
    FiLogOut,
    FiChevronDown,
    FiPhone,
    FiGrid,
} from 'react-icons/fi';
import { auth } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import SearchBox from './search/SearchBox';
import './Header.css';

const QUICK_LINKS = [
    { label: 'Trang chủ', to: '/', end: true },
    { label: 'Khuyến mãi', to: '/sale' },
    { label: 'Bán chạy', to: '/best-sellers' },
    { label: 'Hàng mới về', to: '/new' },
];

const Header = () => {
    const { user, loading } = useAuth();
    const { totalQuantity } = useCart();
    const navigate = useNavigate();
    const location = useLocation();

    const [mobileOpen, setMobileOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [catOpen, setCatOpen] = useState(false);
    const [categories, setCategories] = useState([]); 

    const userMenuRef = useRef(null);
    const catMenuRef = useRef(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/categories/');
                setCategories(response.data);
            } catch (error) {
                console.error("Lỗi tải danh mục trên Header:", error);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        setMobileOpen(false);
        setUserMenuOpen(false);
        setCatOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
                setUserMenuOpen(false);
            }
            if (catMenuRef.current && !catMenuRef.current.contains(e.target)) {
                setCatOpen(false);
            }
        };
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                setUserMenuOpen(false);
                setCatOpen(false);
                setMobileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, []);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            toast.success('Đã đăng xuất');
            navigate('/');
        } catch {
            toast.error('Đăng xuất thất bại, vui lòng thử lại');
        }
    };

    const displayName = user?.displayName || user?.email || 'Tài khoản';
    const initial = displayName.charAt(0).toUpperCase();

    // Kiểm tra xem user hiện tại có phải admin không (check qua email hoặc role từ DB)
    const isAdmin = user?.email && ['minhhieu15thmay@gmail.com', 'admin_phu@gmail.com'].includes(user.email.toLowerCase());

    return (
        <header className="header">
            <div className="header__topbar">
                <div className="header__container header__topbar-inner">
                    <span><FiPhone /> Hotline: 0123 456 789</span>
                    <div className="header__topbar-links">
                        <Link to="/help">Trợ giúp</Link>
                        <Link to="/orders/track">Tra cứu đơn hàng</Link>
                    </div>
                </div>
            </div>

            <div className="header__main">
                <div className="header__container header__main-inner">
                    <button
                        type="button"
                        className="header__icon-btn header__burger"
                        aria-label={mobileOpen ? 'Đóng menu' : 'Mở menu'}
                        aria-expanded={mobileOpen}
                        onClick={() => setMobileOpen((v) => !v)}
                    >
                        {mobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                    </button>

                    <Link to="/" className="header__logo">
                        Pờ tít <span>Shop</span>
                    </Link>

                    <div className="header__search">
                        <SearchBox variant="compact" />
                    </div>

                    <div className="header__actions">
                        <Link to="/wishlist" className="header__action header__hide-mobile" aria-label="Yêu thích">
                            <FiHeart size={22} />
                            <span className="header__action-text">Yêu thích</span>
                        </Link>

                        <Link to="/cart" className="header__action" aria-label="Giỏ hàng">
                            <span className="header__cart-icon">
                                <FiShoppingCart size={22} />
                                {totalQuantity > 0 && (
                                    <span className="header__badge">
                                        {totalQuantity > 99 ? '99+' : totalQuantity}
                                    </span>
                                )}
                            </span>
                            <span className="header__action-text">Giỏ hàng</span>
                        </Link>

                        {loading ? (
                            <div className="header__skeleton" aria-hidden="true" />
                        ) : user ? (
                            <div className="header__user" ref={userMenuRef}>
                                <button
                                    type="button"
                                    className="header__user-btn"
                                    onClick={() => setUserMenuOpen((v) => !v)}
                                    aria-haspopup="menu"
                                    aria-expanded={userMenuOpen}
                                >
                                    {user.photoURL ? (
                                        <img
                                            src={user.photoURL}
                                            alt=""
                                            className="header__avatar"
                                            referrerPolicy="no-referrer"
                                        />
                                    ) : (
                                        <span className="header__avatar header__avatar--text">{initial}</span>
                                    )}
                                    <span className="header__user-name">{displayName}</span>
                                    <FiChevronDown size={16} />
                                </button>

                                {userMenuOpen && (
                                    <div className="header__dropdown" role="menu">
                                        <div className="header__dropdown-head">
                                            <strong>{user.displayName || 'Người dùng'}</strong>
                                            <small>{user.email}</small>
                                        </div>

                                        {/* HIỂN THỊ NÚT QUẢN TRỊ CHO ADMIN */}
                                        {isAdmin && (
                                            <Link 
                                                to="/admin" 
                                                role="menuitem" 
                                                style={{ color: '#d9534f', fontWeight: 'bold' }}
                                            >
                                                <FiGrid /> Trang Quản Trị
                                            </Link>
                                        )}

                                        <Link to="/account" role="menuitem"><FiUser /> Tài khoản của tôi</Link>
                                        <Link to="/orders" role="menuitem"><FiPackage /> Đơn mua</Link>
                                        <Link to="/wishlist" role="menuitem"><FiHeart /> Yêu thích</Link>
                                        <button type="button" onClick={handleLogout} role="menuitem">
                                            <FiLogOut /> Đăng xuất
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="header__auth header__hide-mobile">
                                <Link to="/login" className="header__btn header__btn--ghost">Đăng nhập</Link>
                                <Link to="/register" className="header__btn header__btn--primary">Đăng ký</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <nav className={`header__nav ${mobileOpen ? 'is-open' : ''}`} aria-label="Điều hướng chính">
                <div className="header__container header__nav-inner">
                    <div className="header__cats" ref={catMenuRef}>
                        <button
                            type="button"
                            className="header__cats-btn"
                            onClick={() => setCatOpen((v) => !v)}
                            aria-haspopup="true"
                            aria-expanded={catOpen}
                        >
                            <FiGrid size={16} /> Danh mục <FiChevronDown size={14} />
                        </button>

                        {catOpen && (
                            <div className="header__cats-panel">
                                {categories.map((c) => (
                                    <Link key={c.id} to={`/category/${c.id}`}>
                                        {c.name}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    <ul>
                        {QUICK_LINKS.map((l) => (
                            <li key={l.to}>
                                <NavLink to={l.to} end={l.end}>{l.label}</NavLink>
                            </li>
                        ))}
                        {!loading && !user && (
                            <>
                                <li className="header__nav-mobile-only"><NavLink to="/login">Đăng nhập</NavLink></li>
                                <li className="header__nav-mobile-only"><NavLink to="/register">Đăng ký</NavLink></li>
                            </>
                        )}
                    </ul>
                </div>
            </nav>
        </header>
    );
};

export default Header;