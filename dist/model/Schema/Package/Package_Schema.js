"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePackageSchema = exports.CreatePackageSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.CreatePackageSchema = zod_1.default
    .object({
    name: zod_1.default
        .string({ message: 'Tên gói khám phải là chuỗi ký tự' })
        .trim()
        .min(1, 'Tên gói khám không được để trống')
        .max(255, 'Tên gói khám tối đa 255 ký tự'),
    description: zod_1.default
        .string({ message: 'Mô tả phải là chuỗi ký tự' })
        .trim()
        .optional()
        .nullable(),
    thumbnail_url: zod_1.default
        .string({ message: 'Đường dẫn ảnh phải là chuỗi ký tự' })
        .trim()
        .max(255, 'Đường dẫn ảnh tối đa 255 ký tự')
        .optional()
        .nullable(),
    price: zod_1.default
        .number({ message: 'Giá gói khám phải là số' })
        .positive('Giá gói khám phải lớn hơn 0'),
    discount_price: zod_1.default
        .number({ message: 'Giá khuyến mãi phải là số' })
        .positive('Giá khuyến mãi phải lớn hơn 0')
        .optional()
        .nullable(),
    html_content: zod_1.default
        .string({ message: 'Nội dung chi tiết phải là chuỗi ký tự' })
        .trim()
        .optional()
        .nullable(),
})
    .refine((data) => {
    if (data.discount_price != null) {
        return data.discount_price < data.price;
    }
    return true;
}, {
    message: 'Giá khuyến mãi phải nhỏ hơn giá gốc',
    path: ['discount_price'],
});
// Schema cập nhật sử dụng .partial() + refine lại discount < price khi cả hai được truyền
exports.UpdatePackageSchema = zod_1.default
    .object({
    name: zod_1.default
        .string({ message: 'Tên gói khám phải là chuỗi ký tự' })
        .trim()
        .min(1, 'Tên gói khám không được để trống')
        .max(255, 'Tên gói khám tối đa 255 ký tự'),
    description: zod_1.default
        .string({ message: 'Mô tả phải là chuỗi ký tự' })
        .trim()
        .optional()
        .nullable(),
    thumbnail_url: zod_1.default
        .string({ message: 'Đường dẫn ảnh phải là chuỗi ký tự' })
        .trim()
        .max(255, 'Đường dẫn ảnh tối đa 255 ký tự')
        .optional()
        .nullable(),
    price: zod_1.default
        .number({ message: 'Giá gói khám phải là số' })
        .positive('Giá gói khám phải lớn hơn 0'),
    discount_price: zod_1.default
        .number({ message: 'Giá khuyến mãi phải là số' })
        .positive('Giá khuyến mãi phải lớn hơn 0')
        .optional()
        .nullable(),
    html_content: zod_1.default
        .string({ message: 'Nội dung chi tiết phải là chuỗi ký tự' })
        .trim()
        .optional()
        .nullable(),
})
    .partial()
    .refine((data) => {
    if (data.discount_price != null && data.price != null) {
        return data.discount_price < data.price;
    }
    return true;
}, {
    message: 'Giá khuyến mãi phải nhỏ hơn giá gốc',
    path: ['discount_price'],
});
