import { Request, Response } from 'express';
import {
    checkoutCartPaymentService,
    getBankListService,
    verifyPaymentReturnService,
} from '../../services/payment/payment.service.js';
import { CheckoutCartPaymentSchema } from '../../model/Schema/Payment/Payment_Schema.js';

/**
 * POST /payment/checkout-cart
 * Bệnh nhân thanh toán toàn bộ giỏ hàng và nhận link VNPay
 */
export const checkoutCartPaymentAPI = async (req: Request, res: Response) => {
    try {
        const parsed = await CheckoutCartPaymentSchema.safeParseAsync(req.body);
        if (!parsed.success) {
            const errors = parsed.error.issues.map(
                (i) => `${i.message} (${i.path[0]?.toString()})`
            );
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

        const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';

        const result = await checkoutCartPaymentService({
            user_id: userId,
            client_ip: clientIp.includes('::') ? '127.0.0.1' : clientIp,
        });

        return res.status(201).json({
            status: 'success',
            message: 'Tạo đơn hàng và đường dẫn thanh toán VNPay thành công',
            data: result,
        });
    } catch (error: any) {
        return res.status(400).json({
            status: 'error',
            message: error.message || 'Lỗi khi khởi tạo thanh toán VNPay',
        });
    }
};

/**
 * GET /payment/vnpay-return
 * Endpoint nhận điều hướng từ VNPay sau khi khách hàng hoàn tất thanh toán
 */
export const verifyPaymentReturnAPI = async (req: Request, res: Response) => {
    try {
        const result = await verifyPaymentReturnService(req.query);

        if (result.isSuccess) {
            return res.status(200).json({
                status: 'success',
                message: result.message,
                data: result,
            });
        } else {
            return res.status(400).json({
                status: 'error',
                message: result.message,
                data: result,
            });
        }
    } catch (error: any) {
        return res.status(400).json({
            status: 'error',
            message: error.message || 'Lỗi khi xác thực kết quả thanh toán VNPay',
        });
    }
};

/**
 * GET /payment/banks
 * Lấy danh sách ngân hàng được VNPay hỗ trợ
 */
export const getBankListAPI = async (req: Request, res: Response) => {
    try {
        const banks = await getBankListService();
        return res.status(200).json({
            status: 'success',
            message: 'Lấy danh sách ngân hàng thành công',
            data: banks,
        });
    } catch (error: any) {
        return res.status(500).json({
            status: 'error',
            message: error.message || 'Lỗi khi lấy danh sách ngân hàng từ VNPay',
        });
    }
};
