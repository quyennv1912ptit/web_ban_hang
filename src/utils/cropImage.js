// Cắt vùng crop từ thẻ <img> đang hiển thị, trả về Blob (JPEG)
export function getCroppedBlob(image, crop, maxSize = 1024) {
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const sw = crop.width * scaleX;
    const sh = crop.height * scaleY;

    // Thu nhỏ nếu ảnh quá lớn để upload nhẹ hơn
    const ratio = Math.min(1, maxSize / Math.max(sw, sh));

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(sw * ratio);
    canvas.height = Math.round(sh * ratio);

    const ctx = canvas.getContext('2d');
    ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        sw,
        sh,
        0,
        0,
        canvas.width,
        canvas.height
    );

    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => (blob ? resolve(blob) : reject(new Error('Không thể cắt ảnh'))),
            'image/jpeg',
            0.9
        );
    });
}