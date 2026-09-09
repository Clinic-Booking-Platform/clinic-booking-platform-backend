import z from 'zod';

export const CreateBannerSchema = z.object({
    title: z
        .string({ message: 'Tiêu đề banner phải là chuỗi ký tự' })
        .trim()
        .min(1, 'Tiêu đề banner không được để trống')
        .max(255, 'Tiêu đề banner tối đa 255 ký tự'),
    image_url: z
        .string({ message: 'Đường dẫn ảnh phải là chuỗi ký tự' })
        .trim()
        .min(1, 'Đường dẫn ảnh không được để trống')
        .max(255, 'Đường dẫn ảnh tối đa 255 ký tự'),
    link_url: z
        .string({ message: 'Đường dẫn liên kết phải là chuỗi ký tự' })
        .trim()
        .max(255, 'Đường dẫn liên kết tối đa 255 ký tự')
        .optional()
        .nullable(),
    is_active: z
        .boolean({ message: 'Trạng thái hoạt động phải là boolean (true hoặc false)' })
        .optional()
        .default(true),
});

export const UpdateBannerSchema = z.object({
    title: z
        .string({ message: 'Tiêu đề banner phải là chuỗi ký tự' })
        .trim()
        .min(1, 'Tiêu đề banner không được để trống')
        .max(255, 'Tiêu đề banner tối đa 255 ký tự')
        .optional(),
    image_url: z
        .string({ message: 'Đường dẫn ảnh phải là chuỗi ký tự' })
        .trim()
        .min(1, 'Đường dẫn ảnh không được để trống')
        .max(255, 'Đường dẫn ảnh tối đa 255 ký tự')
        .optional(),
    link_url: z
        .string({ message: 'Đường dẫn liên kết phải là chuỗi ký tự' })
        .trim()
        .max(255, 'Đường dẫn liên kết tối đa 255 ký tự')
        .optional()
        .nullable(),
    sort_order: z
        .number({ message: 'Thứ tự hiển thị phải là số' })
        .int('Thứ tự hiển thị phải là số nguyên')
        .min(1, 'Thứ tự hiển thị phải lớn hơn hoặc bằng 1')
        .optional(),
});

export const ChangeBannerStatusSchema = z.object({
    is_active: z.boolean({
        message: 'Trạng thái is_active phải là kiểu boolean (true hoặc false)',
    }),
});

export type CreateBannerInput = z.infer<typeof CreateBannerSchema>;
export type UpdateBannerInput = z.infer<typeof UpdateBannerSchema>;
export type ChangeBannerStatusInput = z.infer<typeof ChangeBannerStatusSchema>;
