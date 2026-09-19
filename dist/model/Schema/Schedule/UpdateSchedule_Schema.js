"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateScheduleSchema = void 0;
const zod_1 = __importDefault(require("zod"));
/**
 * Schema cập nhật ca làm việc
 * Phải cập nhật ít nhất 1 trường (max_number hoặc status)
 */
exports.UpdateScheduleSchema = zod_1.default
    .object({
    max_number: zod_1.default.union([
        zod_1.default.number().int().min(1, 'Số lượng tối thiểu là 1').max(100, 'Số lượng tối đa là 100'),
        zod_1.default.string().regex(/^\d+$/, 'Số lượng phải là số nguyên').transform(Number),
    ]).optional(),
    status: zod_1.default
        .enum(['AVAILABLE', 'FULL', 'CANCELLED'], {
        message: 'Trạng thái phải là AVAILABLE, FULL hoặc CANCELLED',
    })
        .optional(),
})
    .refine((data) => data.max_number !== undefined || data.status !== undefined, {
    message: 'Phải cập nhật ít nhất một trường (max_number hoặc status)',
});
