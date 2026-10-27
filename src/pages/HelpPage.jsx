import React from 'react';
import { Link } from 'react-router-dom';

const HelpPage = () => (
    <section className="help-page" style={{ maxWidth: 860, margin: '32px auto', padding: 24 }}>
        <h1>Trợ giúp</h1>
        <p>Chọn một mục bên dưới để tiếp tục mua sắm hoặc quản lý tài khoản:</p>
        <ul style={{ lineHeight: 2 }}>
            <li><Link to="/orders">Tra cứu đơn hàng</Link></li>
            <li><Link to="/account">Thông tin tài khoản</Link></li>
            <li><Link to="/terms">Điều khoản dịch vụ</Link></li>
            <li><Link to="/privacy">Chính sách bảo mật</Link></li>
        </ul>
    </section>
);

export default HelpPage;
