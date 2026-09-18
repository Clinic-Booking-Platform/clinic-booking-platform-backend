import z from 'zod';

/**
 * Schema validate khi Bác sĩ tạo hồ sơ bệnh án
 * Áp dụng cho: POST /doctor/medical-records
 */
export const CreateMedicalRecordSchema = z.object({
    appointment_id: z.union([
        z.number().int().positive('ID lịch hẹn không hợp lệ'),
        z.string().regex(/^\d+$/, 'ID lịch hẹn phải là số nguyên').transform(Number),
    ]),

    // --- Triệu chứng & Khám lâm sàng ---
    symptoms: z
        .string()
        .trim()
        .max(5000, 'Triệu chứng tối đa 5000 ký tự')
        .optional(),
    clinical_examination: z
        .string()
        .trim()
        .max(5000, 'Kết quả khám lâm sàng tối đa 5000 ký tự')
        .optional(),

    // --- Chẩn đoán (bắt buộc) ---
    diagnosis: z
        .string({ message: 'Chẩn đoán là bắt buộc' })
        .trim()
        .min(2, 'Chẩn đoán phải có ít nhất 2 ký tự')
        .max(255, 'Chẩn đoán tối đa 255 ký tự'),
    icd10_code: z
        .string()
        .trim()
        .max(20, 'Mã ICD-10 tối đa 20 ký tự')
        .optional(),
    icd10_name: z
        .string()
        .trim()
        .max(255, 'Tên bệnh ICD-10 tối đa 255 ký tự')
        .optional(),

    // --- Sinh hiệu (Vital Signs) ---
    blood_pressure: z
        .string()
        .trim()
        .max(20, 'Huyết áp tối đa 20 ký tự')
        .optional(),
    pulse: z
        .union([
            z.number().int().min(0).max(300, 'Mạch không hợp lệ'),
            z.string().regex(/^\d+$/).transform(Number),
        ])
        .optional(),
    temperature: z
        .union([
            z.number().min(30).max(45, 'Nhiệt độ không hợp lệ'),
            z.string().regex(/^\d+(\.\d+)?$/).transform(Number),
        ])
        .optional(),
    weight: z
        .union([
            z.number().min(0).max(500, 'Cân nặng không hợp lệ'),
            z.string().regex(/^\d+(\.\d+)?$/).transform(Number),
        ])
        .optional(),
    height: z
        .union([
            z.number().min(0).max(300, 'Chiều cao không hợp lệ'),
            z.string().regex(/^\d+(\.\d+)?$/).transform(Number),
        ])
        .optional(),

    // --- Lời dặn & Tái khám ---
    doctor_advice: z
        .string()
        .trim()
        .max(2000, 'Lời dặn tối đa 2000 ký tự')
        .optional(),
    re_examination_date: z
        .string()
        .trim()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày tái khám phải có định dạng YYYY-MM-DD')
        .optional(),

    // --- Hình thức khám ---
    consultation_type: z
        .enum(['OFFLINE', 'ONLINE'], { message: 'Hình thức khám phải là OFFLINE hoặc ONLINE' })
        .optional(),
    recommendation: z
        .string()
        .trim()
        .max(2000, 'Khuyến nghị tối đa 2000 ký tự')
        .optional(),

    // --- Đính kèm file xét nghiệm (<<extend>>) ---
    attachments: z
        .array(
            z.object({
                file_url: z
                    .string({ message: 'Đường dẫn file là bắt buộc' })
                    .trim()
                    .min(1, 'Đường dẫn file không được để trống')
                    .max(500, 'Đường dẫn file tối đa 500 ký tự'),
                file_name: z
                    .string({ message: 'Tên file là bắt buộc' })
                    .trim()
                    .min(1, 'Tên file không được để trống')
                    .max(255, 'Tên file tối đa 255 ký tự'),
                description: z
                    .string()
                    .trim()
                    .max(255, 'Mô tả file tối đa 255 ký tự')
                    .optional(),
            })
        )
        .optional(),
});

export type CreateMedicalRecord = z.infer<typeof CreateMedicalRecordSchema>;
