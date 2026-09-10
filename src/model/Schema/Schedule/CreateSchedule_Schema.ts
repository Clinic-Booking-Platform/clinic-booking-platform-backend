import z from 'zod';

/**
 * Schema tạo 1 ca làm việc
 */
export const CreateScheduleSchema = z.object({
    doctor_id: z.union([
        z.number().int().positive('ID bác sĩ không hợp lệ'),
        z.string().regex(/^\d+$/, 'ID bác sĩ phải là số nguyên').transform(Number),
    ]).optional(),
    date: z
        .string({ message: 'Ngày là bắt buộc' })
        .trim()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày phải có định dạng YYYY-MM-DD'),
    time_type: z
        .string({ message: 'Ca làm việc là bắt buộc' })
        .trim()
        .min(1, 'Ca làm việc không được để trống'),
    max_number: z.union([
        z.number().int().min(1, 'Số lượng tối thiểu là 1').max(100, 'Số lượng tối đa là 100'),
        z.string().regex(/^\d+$/, 'Số lượng phải là số nguyên').transform(Number),
    ]).optional(),
});

export type CreateSchedule = z.infer<typeof CreateScheduleSchema>;

/**
 * Schema tạo nhiều ca làm việc cùng lúc
 */
export const BulkCreateScheduleSchema = z.object({
    doctor_id: z.union([
        z.number().int().positive('ID bác sĩ không hợp lệ'),
        z.string().regex(/^\d+$/, 'ID bác sĩ phải là số nguyên').transform(Number),
    ]).optional(),
    date: z
        .string({ message: 'Ngày là bắt buộc' })
        .trim()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày phải có định dạng YYYY-MM-DD'),
    time_types: z
        .array(z.string().trim().min(1, 'Ca làm việc không được để trống'))
        .min(1, 'Phải chọn ít nhất 1 ca làm việc'),
    max_number: z.union([
        z.number().int().min(1, 'Số lượng tối thiểu là 1').max(100, 'Số lượng tối đa là 100'),
        z.string().regex(/^\d+$/, 'Số lượng phải là số nguyên').transform(Number),
    ]).optional(),
});

export type BulkCreateSchedule = z.infer<typeof BulkCreateScheduleSchema>;
