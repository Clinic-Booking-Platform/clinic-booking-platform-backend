"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangeBannerStatusSchema = exports.UpdateBannerSchema = exports.CreateBannerSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.CreateBannerSchema = zod_1.default.object({
    title: zod_1.default
        .string({ message: 'Tiêu đề banner phải là chuỗi ký tự' })
        .trim()
        .min(1, 'Tiêu đề banner không được để trống')
        .max(255, 'Tiêu đề banner tối đa 255 ký tự'),
    image_url: zod_1.default
        .string({ message: 'Đường dẫn ảnh phải là chuỗi ký tự' })
        .trim()
        .min(1, 'Đường dẫn ảnh không được để trống')
        .max(255, 'Đường dẫn ảnh tối đa 255 ký tự'),
    link_url: zod_1.default
        .string({ message: 'Đường dẫn liên kết phải là chuỗi ký tự' })
        .trim()
        .max(255, 'Đường dẫn liên kết tối đa 255 ký tự')
        .optional()
        .nullable(),
    is_active: zod_1.default
        .boolean({ message: 'Trạng thái hoạt động phải là boolean (true hoặc false)' })
        .optional()
        .default(true),
});
exports.UpdateBannerSchema = zod_1.default.object({
    title: zod_1.default
        .string({ message: 'Tiêu đề banner phải là chuỗi ký tự' })
        .trim()
        .min(1, 'Tiêu đề banner không được để trống')
        .max(255, 'Tiêu đề banner tối đa 255 ký tự')
        .optional(),
    image_url: zod_1.default
        .string({ message: 'Đường dẫn ảnh phải là chuỗi ký tự' })
        .trim()
        .min(1, 'Đường dẫn ảnh không được để trống')
        .max(255, 'Đường dẫn ảnh tối đa 255 ký tự')
        .optional(),
    link_url: zod_1.default
        .string({ message: 'Đường dẫn liên kết phải là chuỗi ký tự' })
        .trim()
        .max(255, 'Đường dẫn liên kết tối đa 255 ký tự')
        .optional()
        .nullable(),
    sort_order: zod_1.default
        .number({ message: 'Thứ tự hiển thị phải là số' })
        .int('Thứ tự hiển thị phải là số nguyên')
        .min(1, 'Thứ tự hiển thị phải lớn hơn hoặc bằng 1')
        .optional(),
});
exports.ChangeBannerStatusSchema = zod_1.default.object({
    is_active: zod_1.default.boolean({
        message: 'Trạng thái is_active phải là kiểu boolean (true hoặc false)',
    }),
});
