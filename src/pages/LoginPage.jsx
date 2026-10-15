import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    signInWithEmailAndPassword,
    signInWithPopup,
} from 'firebase/auth';
import { auth, googleProvider, facebookProvider } from '../config/firebase';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';
import './AuthPage.css';

const schema = yup.object({
    email: yup
        .string()
        .required('Vui lòng nhập email')
        .email('Email không hợp lệ'),
    password: yup
        .string()
        .required('Vui lòng nhập mật khẩu')
        .min(6, 'Mật khẩu tối thiểu 6 ký tự'),
});

const getFirebaseErrorMessage = (code) => {
    switch (code) {
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
        case 'auth/user-not-found':
            return 'Email hoặc mật khẩu không đúng';
        case 'auth/too-many-requests':
            return 'Bạn thử quá nhiều lần, vui lòng thử lại sau';
        case 'auth/popup-closed-by-user':
            return 'Bạn đã đóng cửa sổ đăng nhập';
        case 'auth/account-exists-with-different-credential':
            return 'Email này đã được dùng với phương thức đăng nhập khác';
        case 'auth/network-request-failed':
            return 'Lỗi kết nối mạng';
        default:
            return 'Đăng nhập thất bại, vui lòng thử lại';
    }
};

const LoginPage = () => {
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: { email: '', password: '' },
    });

    const onSubmit = async ({ email, password }) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            toast.success('Đăng nhập thành công');
            navigate('/');
        } catch (error) {
            toast.error(getFirebaseErrorMessage(error.code));
        }
    };

    const handleSocialLogin = async (provider) => {
        try {
            await signInWithPopup(auth, provider);
            toast.success('Đăng nhập thành công');
            navigate('/');
        } catch (error) {
            toast.error(getFirebaseErrorMessage(error.code));
        }
    };

    return (
        <div className="auth">
            <h1 className="auth__title">Đăng nhập</h1>

            <form className="auth__form" onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="auth__field">
                    <label className="auth__label" htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        className={`auth__input ${errors.email ? 'auth__input--error' : ''}`}
                        placeholder="example@gmail.com"
                        autoComplete="email"
                        aria-invalid={!!errors.email}
                        {...register('email')}
                    />
                    {errors.email && <p className="auth__error">{errors.email.message}</p>}
                </div>

                <div className="auth__field">
                    <label className="auth__label" htmlFor="password">Mật khẩu</label>
                    <input
                        id="password"
                        type="password"
                        className={`auth__input ${errors.password ? 'auth__input--error' : ''}`}
                        placeholder="••••••"
                        autoComplete="current-password"
                        aria-invalid={!!errors.password}
                        {...register('password')}
                    />
                    {errors.password && <p className="auth__error">{errors.password.message}</p>}
                </div>

                <button type="submit" className="auth__submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
                </button>
            </form>

            <div className="auth__divider"><span>HOẶC</span></div>

            <div className="auth__social">
                <button type="button" className="auth__social-btn" onClick={() => handleSocialLogin(googleProvider)}>
                    <FcGoogle size={20} /> Google
                </button>
                <button type="button" className="auth__social-btn" onClick={() => handleSocialLogin(facebookProvider)}>
                    <FaFacebook size={20} color="#1877F2" /> Facebook
                </button>
            </div>

            <p className="auth__switch">
                Bạn là người mới? <Link to="/register">Đăng ký</Link>
            </p>
        </div>
    );
};

export default LoginPage;