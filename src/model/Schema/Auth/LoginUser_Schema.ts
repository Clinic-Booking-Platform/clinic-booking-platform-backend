import z from 'zod';

export const LoginUserSchema = z
    .object({
        email: z.string().email('Email không đúng định dạng').optional(),
        password: z
            .string({ message: 'Mật khẩu không hợp lệ hoặc bị trống' })
            .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
            .max(50, 'Mật khẩu không được vượt quá 50 ký tự'),
    })
    .refine((data) => !!(data.email), {
        message: 'Vui lòng cung cấp email hoặc username đăng nhập',
        path: ['email'],
    });

export type LoginUser = z.infer<typeof LoginUserSchema>;