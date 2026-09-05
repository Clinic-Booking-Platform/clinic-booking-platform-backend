import z from 'zod';

export const LoginUserSchema = z.object({
    username: z.string().email('Email không đúng định dạng'),
    password: z
        .string({ message: 'Mật khẩu không hợp lệ hoặc bị trống' })
        .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
        .max(50, 'Mật khẩu không được vượt quá 50 ký tự'),
});

export type LoginUser = z.infer<typeof LoginUserSchema>;