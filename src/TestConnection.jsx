import React, { useEffect, useState } from 'react';
import axiosClient from './api/axiosClient'; // Đảm bảo đường dẫn import này đúng

const TestConnection = () => {
    const [status, setStatus] = useState("⏳ Đang kiểm tra kết nối với Backend...");
    const [data, setData] = useState([]);
    const [errorDetail, setErrorDetail] = useState("");

    useEffect(() => {
        axiosClient.get('/categories/')
            .then(response => {
                // CHỐT CHẶN: Kiểm tra xem response có thực sự là một mảng JSON (chứa danh mục) hay không
                if (Array.isArray(response)) {
                    setStatus("✅ KẾT NỐI BACKEND THÀNH CÔNG VÀ CÓ DỮ LIỆU!");
                    setData(response); 
                    setErrorDetail(""); // Xóa thông báo lỗi cũ nếu có
                } else {
                    // Nếu trả về 200 OK nhưng dữ liệu không phải mảng (thường là file index.html của Vite)
                    setStatus("❌ KẾT NỐI THẤT BẠI (LỖI ẢO)!");
                    setErrorDetail("API trả về file HTML thay vì dữ liệu JSON. Nguyên nhân: Chưa bật Backend, cấu hình sai VITE_API_URL trong file .env, hoặc bạn quên tắt/bật lại terminal 'npm run dev'.");
                    setData([]);
                }
            })
            .catch(error => {
                setStatus("❌ KẾT NỐI THẤT BẠI!");
                
                if (!error.response) {
                    setErrorDetail("Lỗi mạng (Network Error): Chưa bật terminal Backend, hoặc sai URL trong file .env, hoặc chưa cấu hình đúng CORS.");
                } else if (error.response.status === 404) {
                    setErrorDetail("Lỗi 404: Đã kết nối được tới server nhưng sai đường dẫn API (Hãy check lại tiền tố /api trong URL).");
                } else {
                    setErrorDetail(`Lỗi Server (Mã lỗi ${error.response.status}): Server đã kết nối nhưng logic backend đang bị lỗi.`);
                }
                
                console.error("Log chi tiết lỗi:", error);
            });
    }, []);

    return (
        <div style={{ padding: '20px', border: '2px dashed #007bff', margin: '20px', borderRadius: '8px', backgroundColor: '#f8f9fa' }}>
            <h3 style={{ marginTop: 0, color: '#007bff' }}>📡 Bảng Kiểm Tra Kết Nối React - FastAPI</h3>
            
            <p style={{ fontWeight: 'bold', fontSize: '18px', color: status.includes('THÀNH CÔNG') ? '#28a745' : '#dc3545' }}>
                {status}
            </p>
            
            {errorDetail && (
                <div style={{ padding: '10px', backgroundColor: '#ffe6e6', borderLeft: '4px solid red', color: '#cc0000' }}>
                    <strong>👉 Gợi ý sửa lỗi:</strong> {errorDetail}
                </div>
            )}

            {data.length > 0 && (
                <div style={{ marginTop: '15px' }}>
                    <p style={{ fontWeight: 'bold', color: '#28a745' }}>Dữ liệu Category từ Database:</p>
                    <ul style={{ listStyleType: 'square' }}>
                        {data.map(cat => (
                            <li key={cat.id}>{cat.name}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default TestConnection;