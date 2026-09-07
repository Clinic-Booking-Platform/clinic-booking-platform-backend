"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddlewareDOCTOR = exports.authMiddlewareADMIN = exports.authMiddlewareClients = exports.loginService = exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
require("dotenv/config");
const client_js_1 = require("../config/client.js");
const SALT_ROUNDS = 10;
// ============================================================
// Password helpers
// ============================================================
class AuthService {
    static async hashPassword(password) {
        const salt = await bcrypt_1.default.genSalt(SALT_ROUNDS);
        return bcrypt_1.default.hash(password, salt);
    }
    static async comparePassword(plainText, hash) {
        return bcrypt_1.default.compare(plainText, hash);
    }
}
exports.AuthService = AuthService;
// ============================================================
// Login – trả về access_token + thông tin user
// ============================================================
const loginService = async (email, password) => {
    const user = await client_js_1.prisma.user.findFirst({
        where: { email, deleted_at: null },
        include: { role: true },
    });
    if (!user)
        throw new Error('Email hoặc mật khẩu không đúng.');
    const isValid = await bcrypt_1.default.compare(password, user.password);
    if (!isValid)
        throw new Error('Email hoặc mật khẩu không đúng.');
    const payload = {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        phone_number: user.phone_number,
        avatar: user.avatar,
        roleId: user.roleId,
        role: user.role?.name || null,
    };
    const secret = process.env.JWT_SECRET || 'your_fallback_secret';
    const access_token = jsonwebtoken_1.default.sign(payload, secret, {
        expiresIn: (process.env.JWT_EXPIRES_IN || '1d'),
    });
    return { access_token, user: payload };
};
exports.loginService = loginService;
// ============================================================
// JWT Middleware – yêu cầu đăng nhập (bất kỳ role nào)
// ============================================================
const authMiddlewareClients = async (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        res.status(401).json({ message: 'Không tồn tại token' });
        return;
    }
    try {
        const secret = process.env.JWT_SECRET || 'your_fallback_secret';
        req.user = jsonwebtoken_1.default.verify(token, secret);
        next();
    }
    catch {
        res.status(403).json({ data: null, message: 'Token hết hạn hoặc không hợp lệ' });
    }
};
exports.authMiddlewareClients = authMiddlewareClients;
// ============================================================
// JWT Middleware – chỉ dành cho ADMIN
// ============================================================
const authMiddlewareADMIN = async (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        res.status(401).json({ message: 'Không tồn tại token' });
        return;
    }
    try {
        const secret = process.env.JWT_SECRET || 'your_fallback_secret';
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        req.user = decoded;
        if (decoded?.role !== 'ADMIN') {
            res.status(403).json({ data: null, message: 'Không có quyền truy cập (yêu cầu ADMIN)' });
            return;
        }
        next();
    }
    catch {
        res.status(403).json({ data: null, message: 'Token hết hạn hoặc không hợp lệ' });
    }
};
exports.authMiddlewareADMIN = authMiddlewareADMIN;
// ============================================================
// JWT Middleware – chỉ dành cho DOCTOR hoặc ADMIN
// ============================================================
const authMiddlewareDOCTOR = async (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        res.status(401).json({ message: 'Không tồn tại token' });
        return;
    }
    try {
        const secret = process.env.JWT_SECRET || 'your_fallback_secret';
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        req.user = decoded;
        if (decoded?.role !== 'DOCTOR' && decoded?.role !== 'ADMIN') {
            res.status(403).json({ data: null, message: 'Không có quyền truy cập (yêu cầu DOCTOR hoặc ADMIN)' });
            return;
        }
        next();
    }
    catch {
        res.status(403).json({ data: null, message: 'Token hết hạn hoặc không hợp lệ' });
    }
};
exports.authMiddlewareDOCTOR = authMiddlewareDOCTOR;
