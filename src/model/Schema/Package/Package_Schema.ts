import z from 'zod';

export const CreatePackageSchema = z
    .object({
        name: z
            .string({ message: 'Tên gói khám phải là chuỗi ký tự' })
            .trim()
            .min(1, 'Tên gói khám không được để trống')
            .max(255, 'Tên gói khám tối đa 255 ký tự'),
        description: z
            .string({ message: 'Mô tả phải là chuỗi ký tự' })
            .trim()
            .optional()
            .nullable(),
        thumbnail_url: z
            .string({ message: 'Đường dẫn ảnh phải là chuỗi ký tự' })
            .trim()
            .max(255, 'Đường dẫn ảnh tối đa 255 ký tự')
            .optional()
            .nullable(),
        price: z
            .number({ message: 'Giá gói khám phải là số' })
            .positive('Giá gói khám phải lớn hơn 0'),
        discount_price: z
            .number({ message: 'Giá khuyến mãi phải là số' })
            .positive('Giá khuyến mãi phải lớn hơn 0')
            .optional()
            .nullable(),
        html_content: z
            .string({ message: 'Nội dung chi tiết phải là chuỗi ký tự' })
            .trim()
            .optional()
            .nullable(),
    })
    .refine(
        (data) => {
            if (data.discount_price != null) {
                return data.discount_price < data.price;
            }
            return true;
        },
        {
            message: 'Giá khuyến mãi phải nhỏ hơn giá gốc',
            path: ['discount_price'],
        }
    );

// Schema cập nhật sử dụng .partial() + refine lại discount < price khi cả hai được truyền
export const UpdatePackageSchema = z
    .object({
        name: z
            .string({ message: 'Tên gói khám phải là chuỗi ký tự' })
            .trim()
            .min(1, 'Tên gói khám không được để trống')
            .max(255, 'Tên gói khám tối đa 255 ký tự'),
        description: z
            .string({ message: 'Mô tả phải là chuỗi ký tự' })
            .trim()
            .optional()
            .nullable(),
        thumbnail_url: z
            .string({ message: 'Đường dẫn ảnh phải là chuỗi ký tự' })
            .trim()
            .max(255, 'Đường dẫn ảnh tối đa 255 ký tự')
            .optional()
            .nullable(),
        price: z
            .number({ message: 'Giá gói khám phải là số' })
            .positive('Giá gói khám phải lớn hơn 0'),
        discount_price: z
            .number({ message: 'Giá khuyến mãi phải là số' })
            .positive('Giá khuyến mãi phải lớn hơn 0')
            .optional()
            .nullable(),
        html_content: z
            .string({ message: 'Nội dung chi tiết phải là chuỗi ký tự' })
            .trim()
            .optional()
            .nullable(),
    })
    .partial()
    .refine(
        (data) => {
            if (data.discount_price != null && data.price != null) {
                return data.discount_price < data.price;
            }
            return true;
        },
        {
            message: 'Giá khuyến mãi phải nhỏ hơn giá gốc',
            path: ['discount_price'],
        }
    );

export type CreatePackageInput = z.infer<typeof CreatePackageSchema>;
export type UpdatePackageInput = z.infer<typeof UpdatePackageSchema>;
