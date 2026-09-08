import z from 'zod';

export const CreateSpecialtySchema = z.object({
    name: z
        .string({ message: 'Tên chuyên khoa phải là chuỗi ký tự' })
        .trim()
        .min(1, 'Tên chuyên khoa không được để trống')
        .max(255, 'Tên chuyên khoa tối đa 255 ký tự'),
    description: z
        .string({ message: 'Mô tả phải là chuỗi ký tự' })
        .trim()
        .optional()
        .nullable(),
    image_url: z
        .string({ message: 'Đường dẫn ảnh phải là chuỗi ký tự' })
        .trim()
        .max(255, 'Đường dẫn ảnh tối đa 255 ký tự')
        .optional()
        .nullable(),
});

// Schema cập nhật sử dụng .partial() để biến các trường thành tùy chọn
export const UpdateSpecialtySchema = CreateSpecialtySchema.partial();

export type CreateSpecialtyInput = z.infer<typeof CreateSpecialtySchema>;
export type UpdateSpecialtyInput = z.infer<typeof UpdateSpecialtySchema>;
