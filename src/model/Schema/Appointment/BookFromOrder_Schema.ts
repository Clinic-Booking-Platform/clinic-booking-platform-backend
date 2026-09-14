import z from 'zod';

/**
 * Schema validate khi bệnh nhân đặt lịch khám từ gói khám đã mua (Order Detail)
 */
export const BookFromOrderSchema = z.object({
    doctor_id: z.union([
        z.number().int().positive('ID bác sĩ không hợp lệ'),
        z.string().regex(/^\d+$/, 'ID bác sĩ phải là số nguyên').transform(Number),
    ]),
    date: z
        .string({ message: 'Ngày khám là bắt buộc' })
        .trim()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày phải có định dạng YYYY-MM-DD'),
    time_type: z
        .string({ message: 'Ca khám là bắt buộc' })
        .trim()
        .min(1, 'Ca khám không được để trống'),
    patient_name: z
        .string({ message: 'Họ tên bệnh nhân là bắt buộc' })
        .trim()
        .min(2, 'Họ tên bệnh nhân phải có ít nhất 2 ký tự')
        .max(255, 'Họ tên bệnh nhân tối đa 255 ký tự'),
    patient_phone: z
        .string({ message: 'Số điện thoại bệnh nhân là bắt buộc' })
        .trim()
        .regex(/^(0[0-9]{9})$/, 'Số điện thoại không hợp lệ (VD: 0901234567)'),
    symptoms: z
        .string()
        .trim()
        .max(2000, 'Mô tả triệu chứng tối đa 2000 ký tự')
        .optional(),
});

export type BookFromOrder = z.infer<typeof BookFromOrderSchema>;
