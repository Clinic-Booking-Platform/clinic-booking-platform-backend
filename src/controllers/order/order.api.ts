import { Request, Response } from 'express';
import {
    cancelOrderService,
    getAllOrdersAdminService,
    getOrderDetailAdminService,
    getOrderDetailByUserService,
    getOrdersByUserService,
} from '../../services/order/order.service.js';

/**
 * GET /orders
 * Lấy danh sách lịch sử đơn hàng của người dùng hiện tại
 * Query params: ?page=1&pageSize=5&status=PAID
 */
export const getOrdersAPI = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Vui lòng đăng nhập để xem lịch sử đơn hàng',
            });
        }

        const { page, pageSize, status } = req.query;

        const data = await getOrdersByUserService(Number(userId), {
            page: page ? Number(page) : undefined,
            pageSize: pageSize ? Number(pageSize) : undefined,
            status: status ? String(status) : undefined,
        });

        return res.status(200).json({
            status: 'success',
            message: 'Lấy danh sách đơn hàng thành công',
            data,
        });
    } catch (error: any) {
        return res.status(500).json({
            status: 'error',
            message: error.message || 'Lỗi hệ thống khi lấy danh sách đơn hàng',
        });
    }
};

/**
 * GET /orders/:id
 * Lấy thông tin chi tiết một đơn hàng của người dùng (theo id hoặc mã order_code)
 */
export const getOrderDetailAPI = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Vui lòng đăng nhập để xem chi tiết đơn hàng',
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

        const data = await getOrderDetailByUserService(Number(userId), identifier);

        return res.status(200).json({
            status: 'success',
            message: 'Lấy chi tiết đơn hàng thành công',
            data,
        });
    } catch (error: any) {
        const statusCode = error.message?.includes('Không tìm thấy') ? 404 : 500;
        return res.status(statusCode).json({
            status: 'error',
            message: error.message || 'Lỗi hệ thống khi lấy chi tiết đơn hàng',
        });
    }
};
/**
 * POST /orders/:id/cancel
 * Hủy đơn hàng chưa thanh toán (UNPAID)
 */
export const cancelOrderAPI = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Vui lòng đăng nhập để hủy đơn hàng',
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

        const data = await cancelOrderService(Number(userId), identifier);

        return res.status(200).json({
            status: 'success',
            message: 'Hủy đơn hàng thành công',
            data,
        });
    } catch (error: any) {
        const statusCode = error.message?.includes('Không tìm thấy') ? 404 : 400;
        return res.status(statusCode).json({
            status: 'error',
            message: error.message || 'Lỗi khi hủy đơn hàng',
        });
    }
};

/**
 * GET /admin/orders
 * Lấy danh sách toàn bộ đơn hàng trên hệ thống (dành cho Admin)
 * Query params: ?page=1&pageSize=10&search=keyword&status=PAID&from_date=2026-09-01&to_date=2026-09-15
 */
export const getOrderAdminsAPI = async (req: Request, res: Response) => {
    try {
        const { page, pageSize, search, status, from_date, to_date } = req.query;

        const data = await getAllOrdersAdminService({
            page: page ? Number(page) : undefined,
            pageSize: pageSize ? Number(pageSize) : undefined,
            search: search ? String(search) : undefined,
            status: status ? String(status) : undefined,
            from_date: from_date ? String(from_date) : undefined,
            to_date: to_date ? String(to_date) : undefined,
        });

        return res.status(200).json({
            status: 'success',
            message: 'Lấy danh sách đơn hàng thành công',
            data,
        });
    } catch (error: any) {
        return res.status(500).json({
            status: 'error',
            message: error.message || 'Lỗi hệ thống khi lấy danh sách đơn hàng',
        });
    }
};

/**
 * GET /admin/orders/:id
 * Lấy chi tiết đơn hàng trên hệ thống (dành cho Admin)
 * Hỗ trợ tra cứu theo id hoặc order_code
 */
export const getOrderDetailAdminAPI = async (req: Request, res: Response) => {
    try {
        const rawId = req.params.id;
        const identifier = Array.isArray(rawId) ? rawId[0] : rawId;
        if (!identifier) {
            return res.status(400).json({
                status: 'error',
                message: 'Mã hoặc ID đơn hàng không hợp lệ',
            });
        }

        const data = await getOrderDetailAdminService(identifier);

        return res.status(200).json({
            status: 'success',
            message: 'Lấy chi tiết đơn hàng thành công',
            data,
        });
    } catch (error: any) {
        const statusCode = error.message?.includes('Không tìm thấy') ? 404 : 500;
        return res.status(statusCode).json({
            status: 'error',
            message: error.message || 'Lỗi hệ thống khi lấy chi tiết đơn hàng',
        });
    }
};
