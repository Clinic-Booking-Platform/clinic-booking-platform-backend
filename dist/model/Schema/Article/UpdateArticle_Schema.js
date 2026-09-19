"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateArticle_Schema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.UpdateArticle_Schema = zod_1.default.object({
    title: zod_1.default.string().min(1, "Tiêu đề không được để trống").optional(),
    thumbnail_url: zod_1.default.string().url("Đường dẫn ảnh không hợp lệ").optional(),
    short_description: zod_1.default.string().optional(),
    html_content: zod_1.default.string().min(1, "Nội dung bài viết không được để trống").optional(),
}).refine(data => Object.keys(data).length > 0, {
    message: "Vui lòng cung cấp ít nhất một trường để cập nhật",
});
