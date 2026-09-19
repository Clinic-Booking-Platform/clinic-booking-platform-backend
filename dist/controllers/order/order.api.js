"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrderDetailAdminAPI = exports.getOrderAdminsAPI = exports.cancelOrderAPI = exports.getOrderDetailAPI = exports.getOrdersAPI = void 0;
const order_service_js_1 = require("../../services/order/order.service.js");
/**
 * GET /orders
 * Lấy danh sách lịch sử đơn hàng của người dùng hiện tại
 * Query params: ?page=1&pageSize=5&status=PAID
 */
const getOrdersAPI = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Vui lòng đăng nhập để xem lịch sử đơn hàng',
            });
        }
        const { page, pageSize, status } = req.query;
        const data = await (0, order_service_js_1.getOrdersByUserService)(Number(userId), {
            page: page ? Number(page) : undefined,
            pageSize: pageSize ? Number(pageSize) : undefined,
            status: status ? String(status) : undefined,
        });
        return res.status(200).json({
            status: 'success',
            message: 'Lấy danh sách đơn hàng thành công',
            data,
        });
    }
    catch (error) {
        return res.status(500).json({
            status: 'error',
            message: error.message || 'Lỗi hệ thống khi lấy danh sách đơn hàng',
        });
    }
};
exports.getOrdersAPI = getOrdersAPI;
/**
 * GET /orders/:id
 * Lấy thông tin chi tiết một đơn hàng của người dùng (theo id hoặc mã order_code)
 */
const getOrderDetailAPI = async (req, res) => {
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
        const data = await (0, order_service_js_1.getOrderDetailByUserService)(Number(userId), identifier);
        return res.status(200).json({
            status: 'success',
            message: 'Lấy chi tiết đơn hàng thành công',
            data,
        });
    }
    catch (error) {
        const statusCode = error.message?.includes('Không tìm thấy') ? 404 : 500;
        return res.status(statusCode).json({
            status: 'error',
            message: error.message || 'Lỗi hệ thống khi lấy chi tiết đơn hàng',
        });
    }
};
exports.getOrderDetailAPI = getOrderDetailAPI;
/**
 * POST /orders/:id/cancel
 * Hủy đơn hàng chưa thanh toán (UNPAID)
 */
const cancelOrderAPI = async (req, res) => {
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
        const data = await (0, order_service_js_1.cancelOrderService)(Number(userId), identifier);
        return res.status(200).json({
            status: 'success',
            message: 'Hủy đơn hàng thành công',
            data,
        });
    }
    catch (error) {
        const statusCode = error.message?.includes('Không tìm thấy') ? 404 : 400;
        return res.status(statusCode).json({
            status: 'error',
            message: error.message || 'Lỗi khi hủy đơn hàng',
        });
    }
};
exports.cancelOrderAPI = cancelOrderAPI;
/**
 * GET /admin/orders
 * Lấy danh sách toàn bộ đơn hàng trên hệ thống (dành cho Admin)
 * Query params: ?page=1&pageSize=10&search=keyword&status=PAID&from_date=2026-09-01&to_date=2026-09-15
 */
const getOrderAdminsAPI = async (req, res) => {
    try {
        const { page, pageSize, search, status, from_date, to_date } = req.query;
        const data = await (0, order_service_js_1.getAllOrdersAdminService)({
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
    }
    catch (error) {
        return res.status(500).json({
            status: 'error',
            message: error.message || 'Lỗi hệ thống khi lấy danh sách đơn hàng',
        });
    }
};
exports.getOrderAdminsAPI = getOrderAdminsAPI;
/**
 * GET /admin/orders/:id
 * Lấy chi tiết đơn hàng trên hệ thống (dành cho Admin)
 * Hỗ trợ tra cứu theo id hoặc order_code
 */
const getOrderDetailAdminAPI = async (req, res) => {
    try {
        const rawId = req.params.id;
        const identifier = Array.isArray(rawId) ? rawId[0] : rawId;
        if (!identifier) {
            return res.status(400).json({
                status: 'error',
                message: 'Mã hoặc ID đơn hàng không hợp lệ',
            });
        }
        const data = await (0, order_service_js_1.getOrderDetailAdminService)(identifier);
        return res.status(200).json({
            status: 'success',
            message: 'Lấy chi tiết đơn hàng thành công',
            data,
        });
    }
    catch (error) {
        const statusCode = error.message?.includes('Không tìm thấy') ? 404 : 500;
        return res.status(statusCode).json({
            status: 'error',
            message: error.message || 'Lỗi hệ thống khi lấy chi tiết đơn hàng',
        });
    }
};
exports.getOrderDetailAdminAPI = getOrderDetailAdminAPI;
