"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateUserSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.UpdateUserSchema = zod_1.default
    .object({
    full_name: zod_1.default
        .string({ message: 'Họ và tên phải là chuỗi ký tự' })
        .trim()
        .min(1, 'Họ và tên không được để trống')
        .max(100, 'Họ và tên không được quá 100 ký tự'),
    phone_number: zod_1.default
        .string({ message: 'Số điện thoại phải là chuỗi ký tự' })
        .trim()
        .regex(/^(0|\+84)[0-9]{9}$/, 'Số điện thoại không đúng định dạng (gồm 10 số, ví dụ 0912345678 hoặc +84912345678)')
        .nullable(),
    date_of_birth: zod_1.default
        .string()
        .refine((val) => !isNaN(Date.parse(val)), {
        message: 'Ngày sinh không đúng định dạng ngày hợp lệ (VD: 1995-10-25)',
    })
        .nullable(),
    gender: zod_1.default
        .string()
        .trim()
        .max(10, 'Giới tính không vượt quá 10 ký tự')
        .nullable(),
    avatar: zod_1.default
        .string()
        .trim()
        .max(255, 'Đường dẫn ảnh đại diện không quá 255 ký tự')
        .nullable(),
    // Các trường dành riêng cho Bác sĩ (Doctor)
    specialty_id: zod_1.default.union([
        zod_1.default.number().int().positive('ID chuyên khoa không hợp lệ'),
        zod_1.default.string().regex(/^\d+$/, 'ID chuyên khoa phải là số nguyên').transform(Number),
    ]),
    description: zod_1.default
        .string()
        .trim()
        .nullable(),
    price: zod_1.default.union([
        zod_1.default.number().min(0, 'Giá khám không được nhỏ hơn 0'),
        zod_1.default.string().regex(/^\d+(\.\d+)?$/, 'Giá khám phải là số hợp lệ').transform(Number),
    ]),
})
    .partial();
