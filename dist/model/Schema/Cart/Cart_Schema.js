"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCartQuantitySchema = exports.AddToCartSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.AddToCartSchema = zod_1.default.object({
    package_id: zod_1.default
        .number({ message: 'ID gói khám phải là số' })
        .int('ID gói khám phải là số nguyên')
        .positive('ID gói khám phải lớn hơn 0'),
    quantity: zod_1.default
        .number({ message: 'Số lượng phải là số' })
        .int('Số lượng phải là số nguyên')
        .min(1, 'Số lượng tối thiểu là 1')
        .optional()
        .default(1),
});
exports.UpdateCartQuantitySchema = zod_1.default.object({
    quantity: zod_1.default
        .number({ message: 'Số lượng phải là số' })
        .int('Số lượng phải là số nguyên')
        .min(1, 'Số lượng tối thiểu là 1'),
});
