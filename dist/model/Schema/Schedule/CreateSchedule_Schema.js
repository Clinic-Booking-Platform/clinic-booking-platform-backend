"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BulkCreateScheduleSchema = exports.CreateScheduleSchema = void 0;
const zod_1 = __importDefault(require("zod"));
/**
 * Schema tạo 1 ca làm việc
 */
exports.CreateScheduleSchema = zod_1.default.object({
    doctor_id: zod_1.default.union([
        zod_1.default.number().int().positive('ID bác sĩ không hợp lệ'),
        zod_1.default.string().regex(/^\d+$/, 'ID bác sĩ phải là số nguyên').transform(Number),
    ]).optional(),
    date: zod_1.default
        .string({ message: 'Ngày là bắt buộc' })
        .trim()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày phải có định dạng YYYY-MM-DD'),
    time_type: zod_1.default
        .string({ message: 'Ca làm việc là bắt buộc' })
        .trim()
        .min(1, 'Ca làm việc không được để trống'),
    max_number: zod_1.default.union([
        zod_1.default.number().int().min(1, 'Số lượng tối thiểu là 1').max(100, 'Số lượng tối đa là 100'),
        zod_1.default.string().regex(/^\d+$/, 'Số lượng phải là số nguyên').transform(Number),
    ]).optional(),
});
/**
 * Schema tạo nhiều ca làm việc cùng lúc
 */
exports.BulkCreateScheduleSchema = zod_1.default.object({
    doctor_id: zod_1.default.union([
        zod_1.default.number().int().positive('ID bác sĩ không hợp lệ'),
        zod_1.default.string().regex(/^\d+$/, 'ID bác sĩ phải là số nguyên').transform(Number),
    ]).optional(),
    date: zod_1.default
        .string({ message: 'Ngày là bắt buộc' })
        .trim()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày phải có định dạng YYYY-MM-DD'),
    time_types: zod_1.default
        .array(zod_1.default.string().trim().min(1, 'Ca làm việc không được để trống'))
        .min(1, 'Phải chọn ít nhất 1 ca làm việc'),
    max_number: zod_1.default.union([
        zod_1.default.number().int().min(1, 'Số lượng tối thiểu là 1').max(100, 'Số lượng tối đa là 100'),
        zod_1.default.string().regex(/^\d+$/, 'Số lượng phải là số nguyên').transform(Number),
    ]).optional(),
});
