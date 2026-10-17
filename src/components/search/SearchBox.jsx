import React, { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiCamera, FiSearch, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import './SearchBox.css';

const MAX_FILE_MB = 10;
const ImageCropModal = lazy(() => import('./ImageCropModal'));

// variant: 'hero' (to, có đổ bóng) | 'compact' (gọn, dùng trong header)
const SearchBox = ({ variant = 'hero' }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [text, setText] = useState('');
    const [imageBlob, setImageBlob] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [cropSrc, setCropSrc] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (location.pathname !== '/search') return;

        const query = new URLSearchParams(location.search).get('q') || '';
        const searchedImage = location.state?.image;
        setText(query);
        setImageBlob(searchedImage instanceof Blob ? searchedImage : null);
        setPreviewUrl(searchedImage instanceof Blob ? URL.createObjectURL(searchedImage) : null);
    }, [location.pathname, location.search, location.state?.image]);

    useEffect(() => {
        return () => previewUrl && URL.revokeObjectURL(previewUrl);
    }, [previewUrl]);

    useEffect(() => {
        return () => cropSrc && URL.revokeObjectURL(cropSrc);
    }, [cropSrc]);

    const openCropper = (file) => {
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            toast.error('Vui lòng chọn file ảnh');
            return;
        }
        if (file.size > MAX_FILE_MB * 1024 * 1024) {
            toast.error(`Ảnh tối đa ${MAX_FILE_MB}MB`);
            return;
        }
        setCropSrc(URL.createObjectURL(file));
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        openCropper(file);
    };

    // Dán ảnh bằng Ctrl+V trong ô nhập
    const handlePaste = (e) => {
        const item = [...(e.clipboardData?.items || [])].find((i) => i.type.startsWith('image/'));
        if (item) {
            e.preventDefault();
            openCropper(item.getAsFile());
        }
    };

    const handleCropConfirm = (blob) => {
        setImageBlob(blob);
        setPreviewUrl(URL.createObjectURL(blob));
        setCropSrc(null);
    };

    const removeImage = () => {
        setImageBlob(null);
        setPreviewUrl(null);

        if (location.pathname === '/search' && location.state?.image) {
            navigate(`${location.pathname}${location.search}`, {
                replace: true,
                state: { ...location.state, image: null },
            });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const q = text.trim();
        if (!q && !imageBlob) {
            toast.info('Nhập từ khóa hoặc chọn một hình ảnh để tìm kiếm');
            return;
        }
        // Ảnh (Blob) được truyền qua state của router sang trang /search
        navigate(`/search${q ? `?q=${encodeURIComponent(q)}` : ''}`, {
            state: { image: imageBlob },
        });
    };

    const placeholder = previewUrl
        ? 'Thêm mô tả cho ảnh (không bắt buộc)...'
        : variant === 'compact'
            ? 'Tìm sản phẩm, thương hiệu hoặc dán ảnh...'
            : 'Tìm sản phẩm, thương hiệu, hoặc dán ảnh vào đây...';

    return (
        <>
            <form className={`searchbox searchbox--${variant}`} onSubmit={handleSubmit} role="search">
                <button
                    type="button"
                    className="searchbox__icon-btn"
                    onClick={() => fileInputRef.current?.click()}
                    aria-label="Tìm bằng hình ảnh"
                    title="Tìm bằng hình ảnh"
                >
                    <FiCamera size={variant === 'compact' ? 20 : 22} />
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleFileChange} />

                {previewUrl && (
                    <div className="searchbox__thumb">
                        <img src={previewUrl} alt="Ảnh đang dùng để tìm kiếm" />
                        <button type="button" onClick={removeImage} aria-label="Xóa ảnh">
                            <FiX size={12} />
                        </button>
                    </div>
                )}

                <input
                    type="text"
                    className="searchbox__input"
                    placeholder={placeholder}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onPaste={handlePaste}
                    aria-label="Nội dung tìm kiếm"
                />

                <button type="submit" className="searchbox__submit" aria-label="Tìm kiếm">
                    <FiSearch size={20} />
                    <span>Tìm kiếm</span>
                </button>
            </form>

            {cropSrc && (
                <Suspense fallback={null}>
                    <ImageCropModal
                        src={cropSrc}
                        onConfirm={handleCropConfirm}
                        onCancel={() => setCropSrc(null)}
                    />
                </Suspense>
            )}
        </>
    );
};

export default SearchBox;
