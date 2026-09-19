"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.repayOrderPaymentAPI = exports.getBankListAPI = exports.verifyPaymentReturnAPI = exports.checkoutCartPaymentAPI = void 0;
const payment_service_js_1 = require("../../services/payment/payment.service.js");
const Payment_Schema_js_1 = require("../../model/Schema/Payment/Payment_Schema.js");
/**
 * POST /payment/checkout-cart
 * Bệnh nhân thanh toán toàn bộ giỏ hàng và nhận link VNPay
 */
const checkoutCartPaymentAPI = async (req, res) => {
    try {
        const parsed = await Payment_Schema_js_1.CheckoutCartPaymentSchema.safeParseAsync(req.body);
        if (!parsed.success) {
            const errors = parsed.error.issues.map((i) => `${i.message} (${i.path[0]?.toString()})`);
            return res.status(400).json({
                status: 'error',
                message: errors,
            });
        }
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Vui lòng đăng nhập để thanh toán giỏ hàng',
            });
        }
        const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
        const result = await (0, payment_service_js_1.checkoutCartPaymentService)({
            user_id: userId,
            client_ip: clientIp.includes('::') ? '127.0.0.1' : clientIp,
        });
        return res.status(201).json({
            status: 'success',
            message: 'Tạo đơn hàng và đường dẫn thanh toán VNPay thành công',
            data: result,
        });
    }
    catch (error) {
        return res.status(400).json({
            status: 'error',
            message: error.message || 'Lỗi khi khởi tạo thanh toán VNPay',
        });
    }
};
exports.checkoutCartPaymentAPI = checkoutCartPaymentAPI;
/**
 * GET /payment/vnpay-return
 * Endpoint nhận điều hướng từ VNPay sau khi khách hàng hoàn tất thanh toán
 */
const verifyPaymentReturnAPI = async (req, res) => {
    try {
        const result = await (0, payment_service_js_1.verifyPaymentReturnService)(req.query);
        if (result.isSuccess) {
            return res.status(200).json({
                status: 'success',
                message: result.message,
                data: result,
            });
        }
        else {
            return res.status(400).json({
                status: 'error',
                message: result.message,
                data: result,
            });
        }
    }
    catch (error) {
        return res.status(400).json({
            status: 'error',
            message: error.message || 'Lỗi khi xác thực kết quả thanh toán VNPay',
        });
    }
};
exports.verifyPaymentReturnAPI = verifyPaymentReturnAPI;
/**
 * GET /payment/banks
 * Lấy danh sách ngân hàng được VNPay hỗ trợ
 */
const getBankListAPI = async (req, res) => {
    try {
        const banks = await (0, payment_service_js_1.getBankListService)();
        return res.status(200).json({
            status: 'success',
            message: 'Lấy danh sách ngân hàng thành công',
            data: banks,
        });
    }
    catch (error) {
        return res.status(500).json({
            status: 'error',
            message: error.message || 'Lỗi khi lấy danh sách ngân hàng từ VNPay',
        });
    }
};
exports.getBankListAPI = getBankListAPI;
/**
 * POST /payment/repay/:id
 * Thanh toán lại đơn hàng chưa thanh toán (UNPAID hoặc FAILED)
 */
const repayOrderPaymentAPI = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Vui lòng đăng nhập để thanh toán lại đơn hàng',
            });
        }
        const rawId = req.params.id;
        const identifier = Array.isArray(rawId) ? rawId[0] : rawId;
        if (!identifier) {
            return res.status(400).json({
                status: 'error',
                message: 'Mã hoặc ID đơn hàng không hợp lệ',
            });
        }
        const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
        const result = await (0, payment_service_js_1.repayOrderPaymentService)(Number(userId), identifier, clientIp.includes('::') ? '127.0.0.1' : clientIp);
        return res.status(200).json({
            status: 'success',
            message: 'Khởi tạo đường dẫn thanh toán lại VNPay thành công',
            data: result,
        });
    }
    catch (error) {
        const statusCode = error.message?.includes('Không tìm thấy') ? 404 : 400;
        return res.status(statusCode).json({
            status: 'error',
            message: error.message || 'Lỗi khi khởi tạo thanh toán lại',
        });
    }
};
exports.repayOrderPaymentAPI = repayOrderPaymentAPI;
