import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/client.js';

const SALT_ROUNDS = 10;

// ============================================================
// Password helpers
// ============================================================
export class AuthService {
    static async hashPassword(password: string): Promise<string> {
        const salt = await bcrypt.genSalt(SALT_ROUNDS);
        return bcrypt.hash(password, salt);
    }

    static async comparePassword(plainText: string, hash: string): Promise<boolean> {
        return bcrypt.compare(plainText, hash);
    }
}

// ============================================================
// Login – trả về access_token + thông tin user
// ============================================================
export const loginService = async (email: string, password: string) => {
    const user = await prisma.user.findFirst({
        where: { email, deleted_at: null },
    });

    if (!user) throw new Error('Email hoặc mật khẩu không đúng.');

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new Error('Email hoặc mật khẩu không đúng.');

    const payload = {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        phone_number: user.phone_number ?? null,
        avatar: user.avatar ?? null,
        role: user.role,
    };

    const secret = process.env.JWT_SECRET || 'your_fallback_secret';
    const access_token = jwt.sign(payload, secret, {
        expiresIn: (process.env.JWT_EXPIRES_IN || '1d') as any,
    });

    return { access_token, user: payload };
};

// ============================================================
// JWT Middleware – yêu cầu đăng nhập (bất kỳ role nào)
// ============================================================
export const authMiddlewareClients = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        res.status(401).json({ message: 'Không tồn tại token' });
        return;
    }
    try {
        const secret = process.env.JWT_SECRET || 'your_fallback_secret';
        req.user = jwt.verify(token, secret) as any;
        next();
    } catch {
        res.status(403).json({ data: null, message: 'Token hết hạn hoặc không hợp lệ' });
    }
};

// ============================================================
// JWT Middleware – chỉ dành cho ADMIN
// ============================================================
export const authMiddlewareADMIN = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        res.status(401).json({ message: 'Không tồn tại token' });
        return;
    }
    try {
        const secret = process.env.JWT_SECRET || 'your_fallback_secret';
        const decoded = jwt.verify(token, secret) as any;
        req.user = decoded;
        if (decoded?.role !== 'ADMIN') {
            res.status(403).json({ data: null, message: 'Không có quyền truy cập (yêu cầu ADMIN)' });
            return;
        }
        next();
    } catch {
        res.status(403).json({ data: null, message: 'Token hết hạn hoặc không hợp lệ' });
    }
};
