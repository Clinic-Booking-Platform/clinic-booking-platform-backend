import z from 'zod';

/**
 * Schema validate khi bệnh nhân thanh toán toàn bộ Giỏ hàng
 * Hiện tại không yêu cầu body data vì sẽ lấy toàn bộ từ Giỏ hàng của user
 */
export const CheckoutCartPaymentSchema = z.object({
    // Nếu tương lai muốn thanh toán 1 phần giỏ hàng thì thêm mảng cart_item_ids vào đây
    // cart_item_ids: z.array(z.number()).optional(),
});

export type CheckoutCartPayment = z.infer<typeof CheckoutCartPaymentSchema>;
