"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateArticle_Schema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.CreateArticle_Schema = zod_1.default.object({
    title: zod_1.default.string({
        message: "Tiêu đề là bắt buộc",
    }).min(1, "Tiêu đề không được để trống"),
    thumbnail_url: zod_1.default.string().url("Đường dẫn ảnh không hợp lệ").optional(),
    short_description: zod_1.default.string().optional(),
    html_content: zod_1.default.string({
        message: "Nội dung bài viết là bắt buộc",
    }).min(1, "Nội dung bài viết không được để trống"),
    specialty_id: zod_1.default.number({
        message: "ID chuyên khoa phải là một số",
    }).int("ID chuyên khoa phải là số nguyên").positive("ID chuyên khoa không hợp lệ").optional(),
    author_id: zod_1.default.number({
        message: "ID tác giả phải là một số",
    }).int("ID tác giả phải là số nguyên").positive("ID tác giả không hợp lệ").optional()
});
