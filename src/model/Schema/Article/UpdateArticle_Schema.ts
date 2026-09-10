import z from 'zod';

export const UpdateArticle_Schema = z.object({
  title: z.string().min(1, "Tiêu đề không được để trống").optional(),

  thumbnail_url: z.string().url("Đường dẫn ảnh không hợp lệ").optional(),

  short_description: z.string().optional(),

  html_content: z.string().min(1, "Nội dung bài viết không được để trống").optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: "Vui lòng cung cấp ít nhất một trường để cập nhật",
});
