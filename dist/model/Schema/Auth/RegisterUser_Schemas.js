"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterUserSchema = void 0;
const auth_service_js_1 = require("../../../services/auth/auth.service.js");
const zod_1 = __importDefault(require("zod"));
const emailSchema = zod_1.default.string().email('Email không đúng định dạng').refine(async (email) => !(await (0, auth_service_js_1.isEmail)(email)), { message: 'Email đã tồn tại' });
exports.RegisterUserSchema = zod_1.default
    .object({
    fullname: zod_1.default
        .string({ message: 'Họ và tên không hợp lệ hoặc bị trống' })
        .trim()
        .min(1, 'Họ và tên không được để trống')
        .max(100, 'Họ và tên không được vượt quá 100 ký tự'),
    email: emailSchema,
    password: zod_1.default
        .string({ message: 'Mật khẩu không hợp lệ hoặc bị trống' })
        .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
        .max(50, 'Mật khẩu không được vượt quá 50 ký tự'),
    confirmPassword: zod_1.default.string().optional(),
})
    .refine((data) => {
    const confirm = data.confirmPassword;
    return data.password === confirm;
}, {
    message: 'Mật khẩu xác nhận không trùng khớp',
    path: ['confirmpassword'],
});
