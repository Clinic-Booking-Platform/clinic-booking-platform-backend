import { isEmail } from '../../../services/auth/auth.service.js';
import z from 'zod';

const emailSchema = z.string().email('Email không đúng định dạng').refine(
    async (email) => !(await isEmail(email)),
    { message: 'Email đã tồn tại' }
);

export const RegisterDoctorSchema = z
    .object({
        fullname: z
            .string({ message: 'Họ và tên không hợp lệ hoặc bị trống' })
            .trim()
            .min(1, 'Họ và tên không được để trống')
            .max(100, 'Họ và tên không được vượt quá 100 ký tự'),
        email: emailSchema,
        specialty_id: z.number({ message: 'Chuyên khoa không hợp lệ hoặc bị trống' }).min(1, 'Chuyên khoa không được để trống'),
        price: z.number({ message: 'Giá khám không hợp lệ hoặc bị trống' }).min(0, 'Giá khám không được để trống'),
        password: z
            .string({ message: 'Mật khẩu không hợp lệ hoặc bị trống' })
            .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
            .max(50, 'Mật khẩu không được vượt quá 50 ký tự'),

        confirmPassword: z.string().optional(),
    })
    .refine((data) => {
        const confirm = data.confirmPassword;
        return data.password === confirm;
    }, {
        message: 'Mật khẩu xác nhận không trùng khớp',
        path: ['confirmpassword'],
    });

export type RegisterDoctor = z.infer<typeof RegisterDoctorSchema>;