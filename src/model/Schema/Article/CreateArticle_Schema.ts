import z from 'zod';

export const CreateArticle_Schema = z.object({
  title: z.string({
    message: "Tiêu đề là bắt buộc",
  }).min(1, "Tiêu đề không được để trống"),
  
  thumbnail_url: z.string().url("Đường dẫn ảnh không hợp lệ").optional(),
  
  short_description: z.string().optional(),
  
  html_content: z.string({
    message: "Nội dung bài viết là bắt buộc",
  }).min(1, "Nội dung bài viết không được để trống"),
  
  specialty_id: z.number({
    message: "ID chuyên khoa phải là một số",
  }).int("ID chuyên khoa phải là số nguyên").positive("ID chuyên khoa không hợp lệ").optional(),
  
  author_id: z.number({
    message: "ID tác giả phải là một số",
  }).int("ID tác giả phải là số nguyên").positive("ID tác giả không hợp lệ").optional()
});
