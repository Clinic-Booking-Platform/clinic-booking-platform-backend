import rateLimit from 'express-rate-limit';

/**
 * Auth Limiter: Dành riêng cho các endpoint nhạy cảm (Đăng nhập, Đăng ký)
 * Giúp ngăn chặn tấn công dò mật khẩu (Brute-force) và spam tạo tài khoản.
 */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 phút
    max: 20, // Tối đa 20 lần thử trong 15 phút cho mỗi địa chỉ IP
    message: {
        status: 429,
        message: 'Bạn đã thử đăng nhập/đăng ký quá nhiều lần, vui lòng thử lại sau 15 phút!',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * General Limiter: Dành cho toàn bộ các endpoint thông thường (Admin, Doctor, User)
 * Đảm bảo hệ thống không bị spam/crawl nhưng vẫn hoạt động mượt mà cho trải nghiệm người dùng và admin.
 */
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 phút
    max: process.env.NODE_ENV === 'production' ? 1000 : 3000, // 1000 ở production, 3000 ở môi trường dev
    message: {
        status: 429,
        message: 'Bạn đã gửi quá nhiều yêu cầu đến hệ thống, vui lòng thử lại sau ít phút!',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
