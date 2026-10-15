import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    createUserWithEmailAndPassword,
    updateProfile,
    sendEmailVerification,
    signInWithPopup,
} from 'firebase/auth';
import { auth, googleProvider, facebookProvider } from '../config/firebase';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';
import './AuthPage.css';

const schema = yup.object({
    fullName: yup
        .string()
        .trim()
        .required('Vui lòng nhập họ tên')
        .min(2, 'Họ tên tối thiểu 2 ký tự'),
    email: yup
        .string()
        .required('Vui lòng nhập email')
        .email('Email không hợp lệ'),
    password: yup
        .string()
        .required('Vui lòng nhập mật khẩu')
        .min(6, 'Mật khẩu tối thiểu 6 ký tự')
        .matches(/[A-Za-z]/, 'Mật khẩu phải có ít nhất 1 chữ cái')
        .matches(/[0-9]/, 'Mật khẩu phải có ít nhất 1 chữ số'),
    confirmPassword: yup
        .string()
        .required('Vui lòng nhập lại mật khẩu')
        .oneOf([yup.ref('password')], 'Mật khẩu nhập lại không khớp'),
    agree: yup
        .boolean()
        .oneOf([true], 'Bạn cần đồng ý với điều khoản để tiếp tục'),
});

const getFirebaseErrorMessage = (code) => {
    switch (code) {
        case 'auth/email-already-in-use':
            return 'Email này đã được đăng ký';
        case 'auth/weak-password':
            return 'Mật khẩu quá yếu';
        case 'auth/invalid-email':
            return 'Email không hợp lệ';
        case 'auth/popup-closed-by-user':
            return 'Bạn đã đóng cửa sổ đăng ký';
        case 'auth/account-exists-with-different-credential':
            return 'Email này đã được dùng với phương thức đăng nhập khác';
        case 'auth/network-request-failed':
            return 'Lỗi kết nối mạng';
        default:
            return 'Đăng ký thất bại, vui lòng thử lại';
    }
};

const RegisterPage = () => {
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            fullName: '',
            email: '',
            password: '',
            confirmPassword: '',
            agree: false,
        },
    });

    const onSubmit = async ({ fullName, email, password }) => {
        try {
            const { user } = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(user, { displayName: fullName });
            await sendEmailVerification(user);
            toast.success('Đăng ký thành công! Vui lòng kiểm tra email để xác minh tài khoản');
            navigate('/');
        } catch (error) {
            toast.error(getFirebaseErrorMessage(error.code));
        }
    };

    const handleSocialRegister = async (provider) => {
        try {
            await signInWithPopup(auth, provider);
            toast.success('Đăng ký thành công');
            navigate('/');
        } catch (error) {
            toast.error(getFirebaseErrorMessage(error.code));
        }
    };

    const inputClass = (name) => `auth__input ${errors[name] ? 'auth__input--error' : ''}`;

    return (
        <div className="auth">
            <h1 className="auth__title">Đăng ký</h1>

            <form className="auth__form" onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="auth__field">
                    <label className="auth__label" htmlFor="fullName">Họ và tên</label>
                    <input
                        id="fullName"
                        type="text"
                        className={inputClass('fullName')}
                        placeholder="Nguyễn Văn A"
                        autoComplete="name"
                        aria-invalid={!!errors.fullName}
                        {...register('fullName')}
                    />
                    {errors.fullName && <p className="auth__error">{errors.fullName.message}</p>}
                </div>

                <div className="auth__field">
                    <label className="auth__label" htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        className={inputClass('email')}
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
                        className={inputClass('password')}
                        placeholder="••••••"
                        autoComplete="new-password"
                        aria-invalid={!!errors.password}
                        {...register('password')}
                    />
                    {errors.password && <p className="auth__error">{errors.password.message}</p>}
                </div>

                <div className="auth__field">
                    <label className="auth__label" htmlFor="confirmPassword">Nhập lại mật khẩu</label>
                    <input
                        id="confirmPassword"
                        type="password"
                        className={inputClass('confirmPassword')}
                        placeholder="••••••"
                        autoComplete="new-password"
                        aria-invalid={!!errors.confirmPassword}
                        {...register('confirmPassword')}
                    />
                    {errors.confirmPassword && (
                        <p className="auth__error">{errors.confirmPassword.message}</p>
                    )}
                </div>

                <div className="auth__field">
                    <label className="auth__check">
                        <input type="checkbox" {...register('agree')} />
                        <span>
                            Tôi đồng ý với{' '}
                            <Link to="/terms" target="_blank" rel="noopener noreferrer">Điều khoản dịch vụ</Link>{' '}
                            và{' '}
                            <Link to="/privacy" target="_blank" rel="noopener noreferrer">Chính sách bảo mật</Link>
                        </span>
                    </label>
                    {errors.agree && <p className="auth__error">{errors.agree.message}</p>}
                </div>

                <button type="submit" className="auth__submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Đang đăng ký...' : 'Đăng ký'}
                </button>
            </form>

            <div className="auth__divider"><span>HOẶC</span></div>

            <div className="auth__social">
                <button type="button" className="auth__social-btn" onClick={() => handleSocialRegister(googleProvider)}>
                    <FcGoogle size={20} /> Google
                </button>
                <button type="button" className="auth__social-btn" onClick={() => handleSocialRegister(facebookProvider)}>
                    <FaFacebook size={20} color="#1877F2" /> Facebook
                </button>
            </div>

            <p className="auth__switch">
                Bạn đã có tài khoản? <Link to="/login">Đăng nhập</Link>
            </p>
        </div>
    );
};

export default RegisterPage;