import z from 'zod';

/**
 * Schema cập nhật ca làm việc
 * Phải cập nhật ít nhất 1 trường (max_number hoặc status)
 */
export const UpdateScheduleSchema = z
    .object({
        max_number: z.union([
            z.number().int().min(1, 'Số lượng tối thiểu là 1').max(100, 'Số lượng tối đa là 100'),
            z.string().regex(/^\d+$/, 'Số lượng phải là số nguyên').transform(Number),
        ]).optional(),
        status: z
            .enum(['AVAILABLE', 'FULL', 'CANCELLED'], {
                message: 'Trạng thái phải là AVAILABLE, FULL hoặc CANCELLED',
            })
            .optional(),
    })
    .refine((data) => data.max_number !== undefined || data.status !== undefined, {
        message: 'Phải cập nhật ít nhất một trường (max_number hoặc status)',
    });

export type UpdateSchedule = z.infer<typeof UpdateScheduleSchema>;
