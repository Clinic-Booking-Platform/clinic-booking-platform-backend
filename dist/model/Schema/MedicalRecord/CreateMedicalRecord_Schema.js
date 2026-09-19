"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateMedicalRecordSchema = void 0;
const zod_1 = __importDefault(require("zod"));
/**
 * Schema validate khi Bác sĩ tạo hồ sơ bệnh án
 * Áp dụng cho: POST /doctor/medical-records
 */
exports.CreateMedicalRecordSchema = zod_1.default.object({
    appointment_id: zod_1.default.union([
        zod_1.default.number().int().positive('ID lịch hẹn không hợp lệ'),
        zod_1.default.string().regex(/^\d+$/, 'ID lịch hẹn phải là số nguyên').transform(Number),
    ]),
    // --- Triệu chứng & Khám lâm sàng ---
    symptoms: zod_1.default
        .string()
        .trim()
        .max(5000, 'Triệu chứng tối đa 5000 ký tự')
        .optional(),
    clinical_examination: zod_1.default
        .string()
        .trim()
        .max(5000, 'Kết quả khám lâm sàng tối đa 5000 ký tự')
        .optional(),
    // --- Chẩn đoán (bắt buộc) ---
    diagnosis: zod_1.default
        .string({ message: 'Chẩn đoán là bắt buộc' })
        .trim()
        .min(2, 'Chẩn đoán phải có ít nhất 2 ký tự')
        .max(255, 'Chẩn đoán tối đa 255 ký tự'),
    icd10_code: zod_1.default
        .string()
        .trim()
        .max(20, 'Mã ICD-10 tối đa 20 ký tự')
        .optional(),
    icd10_name: zod_1.default
        .string()
        .trim()
        .max(255, 'Tên bệnh ICD-10 tối đa 255 ký tự')
        .optional(),
    // --- Sinh hiệu (Vital Signs) ---
    blood_pressure: zod_1.default
        .string()
        .trim()
        .max(20, 'Huyết áp tối đa 20 ký tự')
        .optional(),
    pulse: zod_1.default
        .union([
        zod_1.default.number().int().min(0).max(300, 'Mạch không hợp lệ'),
        zod_1.default.string().regex(/^\d+$/).transform(Number),
    ])
        .optional(),
    temperature: zod_1.default
        .union([
        zod_1.default.number().min(30).max(45, 'Nhiệt độ không hợp lệ'),
        zod_1.default.string().regex(/^\d+(\.\d+)?$/).transform(Number),
    ])
        .optional(),
    weight: zod_1.default
        .union([
        zod_1.default.number().min(0).max(500, 'Cân nặng không hợp lệ'),
        zod_1.default.string().regex(/^\d+(\.\d+)?$/).transform(Number),
    ])
        .optional(),
    height: zod_1.default
        .union([
        zod_1.default.number().min(0).max(300, 'Chiều cao không hợp lệ'),
        zod_1.default.string().regex(/^\d+(\.\d+)?$/).transform(Number),
    ])
        .optional(),
    // --- Lời dặn & Tái khám ---
    doctor_advice: zod_1.default
        .string()
        .trim()
        .max(2000, 'Lời dặn tối đa 2000 ký tự')
        .optional(),
    re_examination_date: zod_1.default
        .string()
        .trim()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày tái khám phải có định dạng YYYY-MM-DD')
        .optional(),
    // --- Hình thức khám ---
    consultation_type: zod_1.default
        .enum(['OFFLINE', 'ONLINE'], { message: 'Hình thức khám phải là OFFLINE hoặc ONLINE' })
        .optional(),
    recommendation: zod_1.default
        .string()
        .trim()
        .max(2000, 'Khuyến nghị tối đa 2000 ký tự')
        .optional(),
    // --- Đính kèm file xét nghiệm (<<extend>>) ---
    attachments: zod_1.default
        .array(zod_1.default.object({
        file_url: zod_1.default
            .string({ message: 'Đường dẫn file là bắt buộc' })
            .trim()
            .min(1, 'Đường dẫn file không được để trống')
            .max(500, 'Đường dẫn file tối đa 500 ký tự'),
        file_name: zod_1.default
            .string({ message: 'Tên file là bắt buộc' })
            .trim()
            .min(1, 'Tên file không được để trống')
            .max(255, 'Tên file tối đa 255 ký tự'),
        description: zod_1.default
            .string()
            .trim()
            .max(255, 'Mô tả file tối đa 255 ký tự')
            .optional(),
    }))
        .optional(),
});
