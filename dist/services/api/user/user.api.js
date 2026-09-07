"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.restoreUserAPI = exports.deleteUserAPI = exports.getUsersAPI = void 0;
const user_service_js_1 = require("../../user/user.service.js");
/**
 * GET /admin/user
 * Lấy danh sách người dùng thông thường (chỉ role USER)
 */
const getUsersAPI = async (req, res) => {
    try {
        const { page, limit, search, status } = req.query;
        const data = await (0, user_service_js_1.getUsersService)({
            page: page ? Number(page) : undefined,
            limit: limit ? Number(limit) : undefined,
            search: search ? String(search) : undefined,
            status: status,
        });
        return res.status(200).json({
            status: 'success',
            message: 'Lấy danh sách người dùng thành công',
            data,
        });
    }
    catch (error) {
        return res.status(500).json({
            status: 'error',
            message: error.message || 'Lỗi khi lấy danh sách người dùng',
        });
    }
};
exports.getUsersAPI = getUsersAPI;
/**
 * DELETE /admin/user
 * Xóa mềm người dùng (chỉ áp dụng role USER)
 * Nhận id từ req.query.id, req.body.id hoặc req.params.id
 */
const deleteUserAPI = async (req, res) => {
    try {
        const rawId = req.params.id || req.query.id || req.body.id;
        const userId = Number(rawId);
        if (!rawId || isNaN(userId)) {
            return res.status(400).json({
                status: 'error',
                message: 'Vui lòng cung cấp ID người dùng hợp lệ (id)',
            });
        }
        const data = await (0, user_service_js_1.deleteUserService)(userId);
        return res.status(200).json({
            status: 'success',
            message: 'Xóa mềm người dùng thành công',
            data,
        });
    }
    catch (error) {
        return res.status(400).json({
            status: 'error',
            message: error.message || 'Lỗi khi xóa người dùng',
        });
    }
};
exports.deleteUserAPI = deleteUserAPI;
/**
 * POST /admin/user/restore
 * Khôi phục người dùng đã bị xóa mềm
 * Nhận id từ req.body.id hoặc req.query.id
 */
const restoreUserAPI = async (req, res) => {
    try {
        const rawId = req.body.id || req.query.id || req.params.id;
        const userId = Number(rawId);
        if (!rawId || isNaN(userId)) {
            return res.status(400).json({
                status: 'error',
                message: 'Vui lòng cung cấp ID người dùng hợp lệ (id)',
            });
        }
        const data = await (0, user_service_js_1.restoreUserService)(userId);
        return res.status(200).json({
            status: 'success',
            message: 'Khôi phục người dùng thành công',
            data,
        });
    }
    catch (error) {
        return res.status(400).json({
            status: 'error',
            message: error.message || 'Lỗi khi khôi phục người dùng',
        });
    }
};
exports.restoreUserAPI = restoreUserAPI;
