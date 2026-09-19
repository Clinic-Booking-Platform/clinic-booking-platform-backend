"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.repayOrderPaymentService = exports.getBankListService = exports.verifyPaymentReturnService = exports.checkoutCartPaymentService = void 0;
const vnpay_1 = require("vnpay");
const client_js_1 = require("../../config/client.js");
const vnpay_js_1 = require("../../config/vnpay.js");
const constant_js_1 = require("../../config/constant.js");
/**
 * Thanh toán toàn bộ Giỏ hàng: Khởi tạo Order & URL thanh toán VNPay
 */
const checkoutCartPaymentService = async (data) => {
    return await client_js_1.prisma.$transaction(async (tx) => {
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
                payment_method: constant_js_1.PaymentMethod.VNPAY,
                payment_status: constant_js_1.PaymentStatus.UNPAID,
                order_details: {
                    create: cart.cart_details.map((item) => ({
                        package_id: item.package_id,
                        quantity: item.quantity,
                        price: item.price,
                    })),
                },
            },
        });
        // 4. Sinh URL thanh toán VNPay (kèm thời hạn 15 phút đếm ngược trên VNPay)
        const now = new Date();
        const expireDate = new Date(now.getTime() + constant_js_1.ORDER_PAYMENT_TIMEOUT_MINUTES * 60 * 1000);
        const paymentUrl = vnpay_js_1.vnpay.buildPaymentUrl({
            vnp_Amount: totalAmount,
            vnp_IpAddr: data.client_ip || '127.0.0.1',
            vnp_TxnRef: order.order_code,
            vnp_OrderInfo: `Thanh toan don hang ${order.order_code}`,
            vnp_OrderType: vnpay_1.ProductCode.Pharmacy_MedicalServices,
            vnp_ReturnUrl: process.env.VNP_RETURN_URL || 'http://localhost:8080/payment/vnpay-return',
            vnp_Locale: vnpay_1.VnpLocale.VN,
            vnp_CreateDate: (0, vnpay_1.dateFormat)(now),
            vnp_ExpireDate: (0, vnpay_1.dateFormat)(expireDate),
        });
        return {
            order_code: order.order_code,
            payment_url: paymentUrl,
            total_price: totalAmount,
        };
    });
};
exports.checkoutCartPaymentService = checkoutCartPaymentService;
/**
 * Xử lý xác thực kết quả thanh toán khi VNPay redirect về
 */
const verifyPaymentReturnService = async (query) => {
    // 1. Dùng SDK verify chữ ký số và mã phản hồi
    const verify = vnpay_js_1.vnpay.verifyReturnUrl(query);
    const rawTxnRef = query.vnp_TxnRef;
    if (!rawTxnRef) {
        throw new Error('Mã giao dịch không hợp lệ');
    }
    // Tách lấy order_code gốc nếu vnp_TxnRef có hậu tố _timestamp khi thanh toán lại
    const orderCode = rawTxnRef.split('_')[0];
    // 2. Tìm đơn hàng
    const order = await client_js_1.prisma.order.findUnique({
        where: { order_code: orderCode },
    });
    if (!order) {
        throw new Error(`Không tìm thấy đơn hàng có mã: ${orderCode}`);
    }
    // Nếu đơn hàng đã được xử lý trước đó
    if (order.payment_status === constant_js_1.PaymentStatus.PAID) {
        return {
            isSuccess: true,
            isVerified: true,
            message: 'Đơn hàng này đã được thanh toán thành công trước đó',
            order_code: orderCode,
        };
    }
    // 3. Xử lý kết quả
    return await client_js_1.prisma.$transaction(async (tx) => {
        if (verify.isVerified && verify.isSuccess) {
            // Thanh toán THÀNH CÔNG (vnp_ResponseCode = '00')
            // Cập nhật Order sang PAID
            await tx.order.update({
                where: { id: order.id },
                data: { payment_status: constant_js_1.PaymentStatus.PAID },
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
        }
        else {
            // Thanh toán THẤT BẠI, KHÁCH HỦY hoặc HẾT HẠN
            const responseCode = query.vnp_ResponseCode;
            const isTimeout = responseCode === '11';
            await tx.order.update({
                where: { id: order.id },
                data: {
                    payment_status: constant_js_1.PaymentStatus.FAILED,
                    ...(isTimeout ? { deleted_at: new Date() } : {}),
                },
            });
            return {
                isSuccess: false,
                isVerified: verify.isVerified,
                message: isTimeout
                    ? 'Giao dịch đã hết thời gian thanh toán (15 phút).'
                    : 'Giao dịch thanh toán không thành công hoặc đã bị hủy.',
                order_code: orderCode,
            };
        }
    });
};
exports.verifyPaymentReturnService = verifyPaymentReturnService;
/**
 * Lấy danh sách ngân hàng hỗ trợ bởi VNPay
 */
const getBankListService = async () => {
    return await vnpay_js_1.vnpay.getBankList();
};
exports.getBankListService = getBankListService;
/**
 * Thanh toán lại đơn hàng chưa thanh toán (UNPAID hoặc FAILED)
 * - Tái sử dụng order_code và total_price có sẵn để sinh URL VNPay mới
 */
const repayOrderPaymentService = async (userId, identifier, clientIp) => {
    const isNumeric = typeof identifier === 'number' || /^\d+$/.test(String(identifier));
    const where = {
        user_id: userId,
        ...(isNumeric ? { id: Number(identifier) } : { order_code: String(identifier) }),
    };
    const order = await client_js_1.prisma.order.findFirst({ where });
    if (!order) {
        throw new Error('Không tìm thấy đơn hàng hoặc đơn hàng không thuộc về bạn');
    }
    if (order.deleted_at !== null) {
        throw new Error('Đơn hàng này đã bị hủy, không thể thanh toán lại. Vui lòng chọn gói khám và tạo đơn mới.');
    }
    if (order.payment_status === constant_js_1.PaymentStatus.PAID) {
        throw new Error('Đơn hàng này đã được thanh toán thành công, không cần thanh toán lại.');
    }
    // Khi thanh toán lại, cấp một phiên thanh toán VNPay mới trọn vẹn 15 phút
    const now = new Date();
    const expireTime = new Date(now.getTime() + constant_js_1.ORDER_PAYMENT_TIMEOUT_MINUTES * 60 * 1000);
    // Cập nhật lại thời gian đơn hàng và trạng thái UNPAID để đồng bộ với phiên VNPay mới
    await client_js_1.prisma.order.update({
        where: { id: order.id },
        data: {
            created_at: now,
            payment_status: constant_js_1.PaymentStatus.UNPAID,
        },
    });
    const totalAmount = Number(order.total_price);
    // Gắn hậu tố timestamp vào vnp_TxnRef để đảm bảo tính duy nhất trên cổng VNPay
    const vnpTxnRef = `${order.order_code}_${Date.now()}`;
    const paymentUrl = vnpay_js_1.vnpay.buildPaymentUrl({
        vnp_Amount: totalAmount,
        vnp_IpAddr: clientIp || '127.0.0.1',
        vnp_TxnRef: vnpTxnRef,
        vnp_OrderInfo: `Thanh toan don hang ${order.order_code}`,
        vnp_OrderType: vnpay_1.ProductCode.Pharmacy_MedicalServices,
        vnp_ReturnUrl: process.env.VNP_RETURN_URL || 'http://localhost:8080/payment/vnpay-return',
        vnp_Locale: vnpay_1.VnpLocale.VN,
        vnp_CreateDate: (0, vnpay_1.dateFormat)(now),
        vnp_ExpireDate: (0, vnpay_1.dateFormat)(expireTime),
    });
    return {
        order_code: order.order_code,
        payment_url: paymentUrl,
        total_price: totalAmount,
    };
};
exports.repayOrderPaymentService = repayOrderPaymentService;
