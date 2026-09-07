import z from 'zod';

export const UpdateUserSchema = z
    .object({
        full_name: z
            .string({ message: 'Họ và tên phải là chuỗi ký tự' })
            .trim()
            .min(1, 'Họ và tên không được để trống')
            .max(100, 'Họ và tên không được quá 100 ký tự'),
        phone_number: z
            .string({ message: 'Số điện thoại phải là chuỗi ký tự' })
            .trim()
            .regex(/^(0|\+84)[0-9]{9}$/, 'Số điện thoại không đúng định dạng (gồm 10 số, ví dụ 0912345678 hoặc +84912345678)')
            .nullable(),
        date_of_birth: z
            .string()
            .refine((val) => !isNaN(Date.parse(val)), {
                message: 'Ngày sinh không đúng định dạng ngày hợp lệ (VD: 1995-10-25)',
            })
            .nullable(),
        gender: z
            .string()
            .trim()
            .max(10, 'Giới tính không vượt quá 10 ký tự')
            .nullable(),
        avatar: z
            .string()
            .trim()
            .max(255, 'Đường dẫn ảnh đại diện không quá 255 ký tự')
            .nullable(),

        // Các trường dành riêng cho Bác sĩ (Doctor)
        specialty_id: z.union([
            z.number().int().positive('ID chuyên khoa không hợp lệ'),
            z.string().regex(/^\d+$/, 'ID chuyên khoa phải là số nguyên').transform(Number),
        ]),
        description: z
            .string()
            .trim()
            .nullable(),
        price: z.union([
            z.number().min(0, 'Giá khám không được nhỏ hơn 0'),
            z.string().regex(/^\d+(\.\d+)?$/, 'Giá khám phải là số hợp lệ').transform(Number),
        ]),
    })
    .partial();

export type UpdateUser = z.infer<typeof UpdateUserSchema>;
