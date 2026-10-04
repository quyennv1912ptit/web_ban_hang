import React, { useEffect, useRef, useState } from 'react';
import ReactCrop, { convertToPixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { toast } from 'react-toastify';
import { getCroppedBlob } from '../../utils/cropImage';

const ImageCropModal = ({ src, onConfirm, onCancel }) => {
    const imgRef = useRef(null);
    const [crop, setCrop] = useState();
    const [completedCrop, setCompletedCrop] = useState();
    const [busy, setBusy] = useState(false);

    // Đóng bằng phím Escape
    useEffect(() => {
        const onKey = (e) => e.key === 'Escape' && onCancel();
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [onCancel]);

    const handleImageLoad = (e) => {
        const { width, height } = e.currentTarget;
        // Mặc định chọn 90% ở giữa ảnh
        const initial = { unit: '%', x: 5, y: 5, width: 90, height: 90 };
        setCrop(initial);
        setCompletedCrop(convertToPixelCrop(initial, width, height));
    };

    const handleConfirm = async () => {
        if (!imgRef.current || !completedCrop?.width || !completedCrop?.height) {
            toast.info('Hãy chọn vùng ảnh cần tìm');
            return;
        }
        try {
            setBusy(true);
            const blob = await getCroppedBlob(imgRef.current, completedCrop);
            onConfirm(blob);
        } catch {
            toast.error('Không thể xử lý ảnh, vui lòng thử ảnh khác');
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="modal" role="dialog" aria-modal="true" aria-label="Cắt ảnh để tìm kiếm">
            <div className="modal__backdrop" onClick={onCancel} />
            <div className="modal__box">
                <h3>Chọn vùng ảnh cần tìm</h3>
                <p className="modal__hint">Kéo các góc khung để chọn đúng sản phẩm bạn muốn tìm.</p>

                <div className="modal__crop">
                    <ReactCrop
                        crop={crop}
                        onChange={(_, percentCrop) => setCrop(percentCrop)} onComplete={(pixelCrop) => setCompletedCrop(pixelCrop)}
                        minWidth={30}
                        minHeight={30}
                    >
                        <img
                            ref={imgRef}
                            src={src}
                            alt="Ảnh cần cắt"
                            onLoad={handleImageLoad}
                            style={{ maxHeight: '55vh', maxWidth: '100%' }}
                        />
                    </ReactCrop>
                </div>

                <div className="modal__actions">
                    <button type="button" className="btn btn--ghost" onClick={onCancel}>
                        Hủy
                    </button>
                    <button type="button" className="btn btn--primary" onClick={handleConfirm} disabled={busy}>
                        {busy ? 'Đang xử lý...' : 'Dùng vùng này'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImageCropModal;