import z from 'zod';

export const UpdateDoctorSchema = z
    .object({
        full_name: z
            .string({ message: 'Họ và tên phải là chuỗi ký tự' })
            .trim()
            .min(1, 'Họ và tên không được để trống')
            .max(100, 'Họ và tên không được quá 100 ký tự'),
        phone_number: z
            .string({ message: 'Số điện thoại phải là chuỗi ký tự' })
            .trim()
            .regex(/^(0|\+84)[0-9]{9}$/, 'Số điện thoại không đúng định dạng (gồm 10 số)')
            .nullable(),
        avatar: z
            .string()
            .trim()
            .max(255, 'Đường dẫn ảnh đại diện không quá 255 ký tự')
            .nullable(),
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

export type UpdateDoctor = z.infer<typeof UpdateDoctorSchema>;
