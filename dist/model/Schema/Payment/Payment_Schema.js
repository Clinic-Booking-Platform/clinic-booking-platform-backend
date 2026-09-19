"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckoutCartPaymentSchema = void 0;
const zod_1 = __importDefault(require("zod"));
/**
 * Schema validate khi bệnh nhân thanh toán toàn bộ Giỏ hàng
 * Hiện tại không yêu cầu body data vì sẽ lấy toàn bộ từ Giỏ hàng của user
 */
exports.CheckoutCartPaymentSchema = zod_1.default.object({
// Nếu tương lai muốn thanh toán 1 phần giỏ hàng thì thêm mảng cart_item_ids vào đây
// cart_item_ids: z.array(z.number()).optional(),
});
