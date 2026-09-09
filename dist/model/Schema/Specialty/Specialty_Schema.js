"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateSpecialtySchema = exports.CreateSpecialtySchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.CreateSpecialtySchema = zod_1.default.object({
    name: zod_1.default
        .string({ message: 'Tên chuyên khoa phải là chuỗi ký tự' })
        .trim()
        .min(1, 'Tên chuyên khoa không được để trống')
        .max(255, 'Tên chuyên khoa tối đa 255 ký tự'),
    description: zod_1.default
        .string({ message: 'Mô tả phải là chuỗi ký tự' })
        .trim()
        .optional()
        .nullable(),
    image_url: zod_1.default
        .string({ message: 'Đường dẫn ảnh phải là chuỗi ký tự' })
        .trim()
        .max(255, 'Đường dẫn ảnh tối đa 255 ký tự')
        .optional()
        .nullable(),
});
// Schema cập nhật sử dụng .partial() để biến các trường thành tùy chọn
exports.UpdateSpecialtySchema = exports.CreateSpecialtySchema.partial();
