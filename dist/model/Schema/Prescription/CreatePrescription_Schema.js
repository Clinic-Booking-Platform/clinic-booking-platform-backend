"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatePrescriptionSchema = exports.PrescriptionItemSchema = void 0;
const zod_1 = __importDefault(require("zod"));
/**
 * Schema validate cho từng loại thuốc trong đơn
 */
exports.PrescriptionItemSchema = zod_1.default.object({
    medicine_name: zod_1.default
        .string({ message: 'Tên thuốc là bắt buộc' })
        .trim()
        .min(1, 'Tên thuốc không được để trống')
        .max(255, 'Tên thuốc tối đa 255 ký tự'),
    dosage: zod_1.default
        .string({ message: 'Liều dùng là bắt buộc' })
        .trim()
        .min(1, 'Liều dùng không được để trống')
        .max(100, 'Liều dùng tối đa 100 ký tự'),
    quantity: zod_1.default.union([
        zod_1.default.number().int().positive('Số lượng phải lớn hơn 0'),
        zod_1.default.string().regex(/^\d+$/, 'Số lượng phải là số nguyên dương').transform(Number),
    ]),
    unit: zod_1.default
        .string({ message: 'Đơn vị là bắt buộc' })
        .trim()
        .min(1, 'Đơn vị không được để trống')
        .max(50, 'Đơn vị tối đa 50 ký tự'),
    instructions: zod_1.default
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
exports.CreatePrescriptionSchema = zod_1.default.object({
    items: zod_1.default
        .array(exports.PrescriptionItemSchema)
        .min(1, 'Đơn thuốc phải có ít nhất 1 loại thuốc'),
});
