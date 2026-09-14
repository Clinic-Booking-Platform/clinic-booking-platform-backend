import { ProductCode, VnpLocale } from 'vnpay';
import { prisma } from '../../config/client.js';
import { vnpay } from '../../config/vnpay.js';
import { PaymentMethod, PaymentStatus } from '../../config/constant.js';
import {
    CheckoutCartData,
    CreatePaymentUrlResult,
    VerifyReturnResult,
} from '../../types/payment/Payment.js';

/**
 * Thanh toán toàn bộ Giỏ hàng: Khởi tạo Order & URL thanh toán VNPay
 */
export const checkoutCartPaymentService = async (
    data: CheckoutCartData
): Promise<CreatePaymentUrlResult> => {
    return await prisma.$transaction(async (tx) => {
        // 1. Lấy thông tin Giỏ hàng
        const cart = await tx.cart.findUnique({
            where: { user_id: data.user_id },
            include: { cart_details: true },
        });

        if (!cart || cart.cart_details.length === 0) {
            throw new Error('Giỏ hàng trống. Không thể thanh toán.');
        }

        // 2. Tính tổng tiền
        let totalAmount = 0;
        for (const item of cart.cart_details) {
            totalAmount += Number(item.price) * item.quantity;
        }

        // 3. Tạo Order
        const orderCode = `ORD${Date.now()}${Math.floor(100 + Math.random() * 900)}`;

        const order = await tx.order.create({
            data: {
                user_id: data.user_id,
                order_code: orderCode,
                total_price: totalAmount,
                payment_method: PaymentMethod.VNPAY,
                payment_status: PaymentStatus.UNPAID,
                order_details: {
                    create: cart.cart_details.map((item) => ({
                        package_id: item.package_id,
                        quantity: item.quantity,
                        price: item.price,
                    })),
                },
            },
        });

        // 4. Sinh URL thanh toán VNPay
        const paymentUrl = vnpay.buildPaymentUrl({
            vnp_Amount: totalAmount,
            vnp_IpAddr: data.client_ip || '127.0.0.1',
            vnp_TxnRef: order.order_code,
            vnp_OrderInfo: `Thanh toan don hang ${order.order_code}`,
            vnp_OrderType: ProductCode.Pharmacy_MedicalServices,
            vnp_ReturnUrl: process.env.VNP_RETURN_URL || 'http://localhost:8080/payment/vnpay-return',
            vnp_Locale: VnpLocale.VN,
        });

        return {
            order_code: order.order_code,
            payment_url: paymentUrl,
            total_price: totalAmount,
        };
    });
};

/**
 * Xử lý xác thực kết quả thanh toán khi VNPay redirect về
 */
export const verifyPaymentReturnService = async (
    query: Record<string, any>
): Promise<VerifyReturnResult> => {
    // 1. Dùng SDK verify chữ ký số và mã phản hồi
    const verify = vnpay.verifyReturnUrl(query as any);
    const orderCode = query.vnp_TxnRef as string;

    if (!orderCode) {
        throw new Error('Mã giao dịch không hợp lệ');
    }

    // 2. Tìm đơn hàng
    const order = await prisma.order.findUnique({
        where: { order_code: orderCode },
    });

    if (!order) {
        throw new Error(`Không tìm thấy đơn hàng có mã: ${orderCode}`);
    }

    // Nếu đơn hàng đã được xử lý trước đó
    if (order.payment_status === PaymentStatus.PAID) {
        return {
            isSuccess: true,
            isVerified: true,
            message: 'Đơn hàng này đã được thanh toán thành công trước đó',
            order_code: orderCode,
        };
    }

    // 3. Xử lý kết quả
    return await prisma.$transaction(async (tx) => {
        if (verify.isVerified && verify.isSuccess) {
            // Thanh toán THÀNH CÔNG (vnp_ResponseCode = '00')
            // Cập nhật Order sang PAID
            await tx.order.update({
                where: { id: order.id },
                data: { payment_status: PaymentStatus.PAID },
            });

            // Xóa sạch giỏ hàng của user sau khi thanh toán thành công
            const cart = await tx.cart.findUnique({
                where: { user_id: order.user_id },
            });
            if (cart) {
                await tx.cartDetail.deleteMany({
                    where: { cart_id: cart.id },
                });
                await tx.cart.delete({
                    where: { id: cart.id },
                });
            }

            return {
                isSuccess: true,
                isVerified: true,
                message: 'Thanh toán thành công. Các gói khám đã được thêm vào tài khoản của bạn!',
                order_code: orderCode,
            };
        } else {
            // Thanh toán THẤT BẠI hoặc KHÁCH HỦY
            await tx.order.update({
                where: { id: order.id },
                data: { payment_status: PaymentStatus.FAILED },
            });

            return {
                isSuccess: false,
                isVerified: verify.isVerified,
                message: 'Giao dịch thanh toán không thành công hoặc đã bị hủy.',
                order_code: orderCode,
            };
        }
    });
};

/**
 * Lấy danh sách ngân hàng hỗ trợ bởi VNPay
 */
export const getBankListService = async () => {
    return await vnpay.getBankList();
};
