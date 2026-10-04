import React from 'react';
import LegalLayout from '../components/LegalLayout';

const SHOP_NAME = 'Tên Shop';
const SUPPORT_EMAIL = 'support@example.com';
const SUPPORT_PHONE = '0123 456 789';

const sections = [
    {
        heading: 'Chấp nhận điều khoản',
        paragraphs: [
            `Khi truy cập, đăng ký tài khoản hoặc mua hàng tại ${SHOP_NAME}, bạn xác nhận đã đọc, hiểu và đồng ý với các điều khoản dưới đây. Nếu không đồng ý, vui lòng ngừng sử dụng dịch vụ.`,
        ],
    },
    {
        heading: 'Tài khoản người dùng',
        items: [
            'Bạn cung cấp thông tin chính xác, đầy đủ và cập nhật khi đăng ký.',
            'Bạn chịu trách nhiệm bảo mật mật khẩu và mọi hoạt động diễn ra dưới tài khoản của mình.',
            'Bạn cần thông báo ngay cho chúng tôi nếu phát hiện tài khoản bị truy cập trái phép.',
            'Mỗi người nên sử dụng một tài khoản. Chúng tôi có quyền khóa tài khoản có dấu hiệu gian lận hoặc vi phạm điều khoản.',
        ],
    },
    {
        heading: 'Sản phẩm và giá cả',
        paragraphs: [
            'Chúng tôi cố gắng hiển thị chính xác hình ảnh, mô tả và giá sản phẩm. Tuy nhiên, màu sắc thực tế có thể chênh lệch nhẹ do màn hình hiển thị.',
            'Giá và tình trạng hàng có thể thay đổi mà không cần báo trước. Trường hợp sai sót rõ ràng về giá, chúng tôi có quyền liên hệ để xác nhận lại hoặc hủy đơn.',
        ],
    },
    {
        heading: 'Đặt hàng và thanh toán',
        items: [
            'Đơn hàng chỉ được xác nhận khi bạn nhận được thông báo xác nhận từ hệ thống.',
            'Các phương thức thanh toán được hỗ trợ: thanh toán khi nhận hàng (COD), chuyển khoản và các cổng thanh toán được hiển thị khi đặt hàng.',
            'Chúng tôi có quyền từ chối hoặc hủy đơn trong trường hợp hết hàng, thông tin không chính xác hoặc nghi ngờ gian lận.',
        ],
    },
    {
        heading: 'Vận chuyển',
        paragraphs: [
            'Thời gian giao hàng phụ thuộc vào địa chỉ nhận và đơn vị vận chuyển, thời gian dự kiến được hiển thị khi thanh toán. Bạn cần cung cấp đúng địa chỉ và số điện thoại để việc giao hàng thuận lợi.',
        ],
    },
    {
        heading: 'Đổi trả và hoàn tiền',
        items: [
            'Bạn có thể yêu cầu đổi trả khi sản phẩm bị lỗi, sai mẫu hoặc không đúng mô tả.',
            'Sản phẩm cần còn nguyên tình trạng, tem nhãn và có bằng chứng mua hàng.',
            'Thời hạn và điều kiện cụ thể theo chính sách đổi trả được công bố trên website.',
            'Tiền hoàn lại được chuyển về phương thức thanh toán ban đầu sau khi chúng tôi kiểm tra hàng trả về.',
        ],
    },
    {
        heading: 'Hành vi bị cấm',
        items: [
            'Sử dụng website cho mục đích gian lận, vi phạm pháp luật.',
            'Tấn công, dò quét lỗ hổng, can thiệp trái phép vào hệ thống.',
            'Sao chép, thu thập dữ liệu hàng loạt (scraping) khi chưa được cho phép.',
            'Đăng tải nội dung xúc phạm, sai sự thật hoặc xâm phạm quyền của người khác.',
        ],
    },
    {
        heading: 'Sở hữu trí tuệ',
        paragraphs: [
            `Toàn bộ nội dung trên website như logo, hình ảnh, văn bản, giao diện thuộc quyền sở hữu của ${SHOP_NAME} hoặc bên cấp phép. Bạn không được sao chép hoặc sử dụng cho mục đích thương mại khi chưa có sự đồng ý bằng văn bản.`,
        ],
    },
    {
        heading: 'Giới hạn trách nhiệm',
        paragraphs: [
            'Chúng tôi nỗ lực duy trì website hoạt động ổn định nhưng không đảm bảo dịch vụ không bao giờ gián đoạn hoặc không có lỗi. Chúng tôi không chịu trách nhiệm cho thiệt hại gián tiếp phát sinh từ việc sử dụng website, trong phạm vi pháp luật cho phép.',
        ],
    },
    {
        heading: 'Thay đổi điều khoản',
        paragraphs: [
            'Chúng tôi có thể cập nhật điều khoản theo thời gian. Phiên bản mới có hiệu lực kể từ khi đăng tải. Việc tiếp tục sử dụng dịch vụ đồng nghĩa với việc bạn chấp nhận thay đổi.',
        ],
    },
    {
        heading: 'Luật áp dụng và giải quyết tranh chấp',
        paragraphs: [
            'Điều khoản này được điều chỉnh bởi pháp luật Việt Nam. Mọi tranh chấp ưu tiên giải quyết thông qua thương lượng; nếu không đạt được thỏa thuận, tranh chấp sẽ được giải quyết tại tòa án có thẩm quyền.',
        ],
    },
    {
        heading: 'Liên hệ',
        paragraphs: [`Email: ${SUPPORT_EMAIL} | Điện thoại: ${SUPPORT_PHONE}`],
    },
];

const TermsPage = () => (
    <LegalLayout
        title="Điều khoản dịch vụ"
        updatedAt="30/09/2026"
        sections={sections}
    />
);

export default TermsPage;