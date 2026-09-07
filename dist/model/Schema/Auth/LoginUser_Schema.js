"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginUserSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.LoginUserSchema = zod_1.default
    .object({
    email: zod_1.default.string().email('Email không đúng định dạng').optional(),
    password: zod_1.default
        .string({ message: 'Mật khẩu không hợp lệ hoặc bị trống' })
        .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
        .max(50, 'Mật khẩu không được vượt quá 50 ký tự'),
})
    .refine((data) => !!(data.email), {
    message: 'Vui lòng cung cấp email hoặc username đăng nhập',
    path: ['email'],
});
