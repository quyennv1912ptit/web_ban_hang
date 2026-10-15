import React from 'react';
import LegalLayout from '../components/LegalLayout';

const SHOP_NAME = 'Tên Shop';
const SUPPORT_EMAIL = 'support@example.com';

const sections = [
    {
        heading: 'Giới thiệu',
        paragraphs: [
            `${SHOP_NAME} tôn trọng quyền riêng tư của bạn. Chính sách này giải thích chúng tôi thu thập, sử dụng và bảo vệ thông tin cá nhân của bạn như thế nào.`,
        ],
    },
    {
        heading: 'Thông tin chúng tôi thu thập',
        items: [
            'Thông tin tài khoản: họ tên, email, ảnh đại diện (nếu đăng nhập bằng Google hoặc Facebook).',
            'Thông tin giao hàng: địa chỉ nhận hàng, số điện thoại.',
            'Thông tin đơn hàng: sản phẩm đã mua, lịch sử giao dịch, phương thức thanh toán (chúng tôi không lưu số thẻ đầy đủ).',
            'Thông tin kỹ thuật: loại thiết bị, trình duyệt, địa chỉ IP, cookie và dữ liệu sử dụng website.',
        ],
    },
    {
        heading: 'Mục đích sử dụng thông tin',
        items: [
            'Tạo và quản lý tài khoản, xác thực đăng nhập.',
            'Xử lý đơn hàng, giao hàng và hỗ trợ sau bán hàng.',
            'Gửi thông báo về đơn hàng, cập nhật dịch vụ và (khi bạn đồng ý) thông tin khuyến mãi.',
            'Phát hiện, ngăn chặn gian lận và bảo vệ an toàn hệ thống.',
            'Cải thiện trải nghiệm và chất lượng dịch vụ.',
        ],
    },
    {
        heading: 'Đăng nhập bằng bên thứ ba',
        paragraphs: [
            'Khi bạn đăng nhập bằng Google hoặc Facebook, chúng tôi nhận thông tin cơ bản từ các nền tảng này (tên, email, ảnh đại diện). Chúng tôi không nhận được mật khẩu của bạn. Việc xử lý dữ liệu bên phía các nền tảng này tuân theo chính sách riêng của họ.',
        ],
    },
    {
        heading: 'Chia sẻ thông tin',
        paragraphs: ['Chúng tôi không bán thông tin cá nhân của bạn. Thông tin chỉ được chia sẻ trong các trường hợp sau:'],
        items: [
            'Đơn vị vận chuyển: để giao hàng đến đúng địa chỉ.',
            'Đối tác thanh toán: để xử lý giao dịch.',
            'Nhà cung cấp hạ tầng: ví dụ dịch vụ xác thực và lưu trữ dữ liệu (như Firebase), chỉ để vận hành hệ thống.',
            'Cơ quan nhà nước có thẩm quyền: khi có yêu cầu hợp pháp.',
        ],
    },
    {
        heading: 'Cookie',
        paragraphs: [
            'Chúng tôi dùng cookie và công nghệ tương tự để duy trì đăng nhập, ghi nhớ giỏ hàng và phân tích lượt truy cập. Bạn có thể tắt cookie trong cài đặt trình duyệt, nhưng một số tính năng có thể hoạt động không đầy đủ.',
        ],
    },
    {
        heading: 'Bảo mật thông tin',
        paragraphs: [
            'Chúng tôi áp dụng các biện pháp kỹ thuật và quản lý hợp lý như mã hóa kết nối (HTTPS), kiểm soát truy cập và không lưu mật khẩu dạng văn bản gốc. Tuy nhiên, không có hệ thống nào an toàn tuyệt đối, và bạn cũng nên tự bảo vệ mật khẩu của mình.',
        ],
    },
    {
        heading: 'Thời gian lưu trữ',
        paragraphs: [
            'Chúng tôi lưu thông tin trong thời gian tài khoản còn hoạt động và trong khoảng thời gian cần thiết để đáp ứng nghĩa vụ pháp lý, kế toán hoặc giải quyết tranh chấp.',
        ],
    },
    {
        heading: 'Quyền của bạn',
        items: [
            'Truy cập và xem thông tin cá nhân chúng tôi đang lưu.',
            'Chỉnh sửa thông tin chưa chính xác.',
            'Yêu cầu xóa tài khoản và dữ liệu liên quan.',
            'Rút lại sự đồng ý hoặc từ chối nhận email quảng cáo bất cứ lúc nào.',
        ],
    },
    {
        heading: 'Trẻ em',
        paragraphs: [
            'Dịch vụ không dành cho người dưới 16 tuổi nếu không có sự giám sát của cha mẹ hoặc người giám hộ. Nếu phát hiện đã thu thập thông tin của trẻ em ngoài ý muốn, chúng tôi sẽ xóa thông tin đó.',
        ],
    },
    {
        heading: 'Thay đổi chính sách',
        paragraphs: [
            'Chính sách này có thể được cập nhật. Khi có thay đổi quan trọng, chúng tôi sẽ thông báo trên website hoặc qua email.',
        ],
    },
    {
        heading: 'Liên hệ',
        paragraphs: [`Mọi câu hỏi về quyền riêng tư, vui lòng gửi email đến: ${SUPPORT_EMAIL}`],
    },
];

const PrivacyPage = () => (
    <LegalLayout
        title="Chính sách bảo mật"
        updatedAt="30/09/2026"
        sections={sections}
    />
);

export default PrivacyPage;