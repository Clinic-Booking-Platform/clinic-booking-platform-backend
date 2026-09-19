"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateAppointmentSchema = void 0;
const zod_1 = __importDefault(require("zod"));
/**
 * Schema validate khi bệnh nhân đặt lịch khám Offline
 */
exports.CreateAppointmentSchema = zod_1.default.object({
    doctor_id: zod_1.default.union([
        zod_1.default.number().int().positive('ID bác sĩ không hợp lệ'),
        zod_1.default.string().regex(/^\d+$/, 'ID bác sĩ phải là số nguyên').transform(Number),
    ]),
    date: zod_1.default
        .string({ message: 'Ngày khám là bắt buộc' })
        .trim()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày phải có định dạng YYYY-MM-DD'),
    time_type: zod_1.default
        .string({ message: 'Ca khám là bắt buộc' })
        .trim()
        .min(1, 'Ca khám không được để trống'),
    patient_name: zod_1.default
        .string({ message: 'Họ tên bệnh nhân là bắt buộc' })
        .trim()
        .min(2, 'Họ tên bệnh nhân phải có ít nhất 2 ký tự')
        .max(255, 'Họ tên bệnh nhân tối đa 255 ký tự'),
    patient_phone: zod_1.default
        .string({ message: 'Số điện thoại bệnh nhân là bắt buộc' })
        .trim()
        .regex(/^(0[0-9]{9})$/, 'Số điện thoại không hợp lệ (VD: 0901234567)'),
    symptoms: zod_1.default
        .string()
        .trim()
        .max(2000, 'Mô tả triệu chứng tối đa 2000 ký tự')
        .optional(),
});
