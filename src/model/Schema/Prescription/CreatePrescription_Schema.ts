import z from 'zod';

/**
 * Schema validate cho từng loại thuốc trong đơn
 */
export const PrescriptionItemSchema = z.object({
    medicine_name: z
        .string({ message: 'Tên thuốc là bắt buộc' })
        .trim()
        .min(1, 'Tên thuốc không được để trống')
        .max(255, 'Tên thuốc tối đa 255 ký tự'),
    dosage: z
        .string({ message: 'Liều dùng là bắt buộc' })
        .trim()
        .min(1, 'Liều dùng không được để trống')
        .max(100, 'Liều dùng tối đa 100 ký tự'),
    quantity: z.union([
        z.number().int().positive('Số lượng phải lớn hơn 0'),
        z.string().regex(/^\d+$/, 'Số lượng phải là số nguyên dương').transform(Number),
    ]),
    unit: z
        .string({ message: 'Đơn vị là bắt buộc' })
        .trim()
        .min(1, 'Đơn vị không được để trống')
        .max(50, 'Đơn vị tối đa 50 ký tự'),
    instructions: z
        .string()
        .trim()
        .max(255, 'Hướng dẫn sử dụng tối đa 255 ký tự')
        .optional()
        .nullable(),
});

/**
 * Schema validate khi Bác sĩ kê đơn thuốc
 * Áp dụng cho: POST /doctor/prescriptions/medical-record/:medicalRecordId
 */
export const CreatePrescriptionSchema = z.object({
    items: z
        .array(PrescriptionItemSchema)
        .min(1, 'Đơn thuốc phải có ít nhất 1 loại thuốc'),
});

export type CreatePrescription = z.infer<typeof CreatePrescriptionSchema>;
export type PrescriptionItem = z.infer<typeof PrescriptionItemSchema>;
