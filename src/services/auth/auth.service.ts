import { AuthService } from '../../middleware/auth.services.js';
import { prisma } from '../../config/client.js';

// ============================================================
// Kiểm tra email đã tồn tại chưa
// ============================================================
export const isEmail = async (email: string) => {
    return prisma.user.findUnique({ where: { email } });
};

// ============================================================
// Tạo tài khoản mới
// ============================================================
export const Register_User = async (email: string, password: string, fullname: string) => {
    const hashPassword = await AuthService.hashPassword(password);

    return prisma.user.create({
        data: {
            email,
            password: hashPassword,
            full_name: fullname,
            role: 'USER',
        },
    });
};
