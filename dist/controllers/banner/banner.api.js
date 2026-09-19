"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBannersAPI = exports.statusBannersAPI = exports.updateBannersAPI = exports.postBannersAPI = exports.getBannersAPI = void 0;
const banner_service_js_1 = require("../../services/banner/banner.service.js");
const Banner_Schema_js_1 = require("../../model/Schema/Banner/Banner_Schema.js");
const constant_js_1 = require("../../config/constant.js");
/**
 * GET /banners (User) hoặc GET /admin/banners (Admin)
 * Lấy danh sách banner
 * - Với User: Chỉ lấy toàn bộ banner đang hoạt động (is_active: true) hiển thị marketing trên giao diện (không cần search, không phân trang)
 * - Với Admin: Hỗ trợ phân trang và filter (search, status)
 */
const getBannersAPI = async (req, res) => {
    try {
        const isAdmin = req.user?.role === constant_js_1.RoleType.ADMIN;
        // User: Chỉ dùng hiển thị ra giao diện marketing (không search, không phân trang)
        if (!isAdmin) {
            const banners = await (0, banner_service_js_1.getActiveBannersClientService)();
            return res.status(200).json({
                status: 'success',
                message: 'Lấy danh sách banner thành công',
                data: banners,
            });
        }
        // Admin: Có phân trang và filter (search, status)
        const { page, search, status } = req.query;
        const filterStatus = status || 'all';
        const data = await (0, banner_service_js_1.getBannersService)({
            page: page ? Number(page) : 1,
            search: search ? String(search) : undefined,
            status: filterStatus,
        });
        return res.status(200).json({
            status: 'success',
            message: 'Lấy danh sách banner thành công',
            data,
        });
    }
    catch (error) {
        return res.status(500).json({
            status: 'error',
            message: error.message || 'Lỗi hệ thống khi lấy danh sách banner',
        });
    }
};
exports.getBannersAPI = getBannersAPI;
/**
 * POST /admin/banners
 * Thêm mới banner (Yêu cầu quyền Admin)
 */
const postBannersAPI = async (req, res) => {
    try {
        const parsed = await Banner_Schema_js_1.CreateBannerSchema.safeParseAsync(req.body);
        if (!parsed.success) {
            const errors = parsed.error.issues.map((i) => `${i.message} (${i.path.join('.')})`);
            return res.status(400).json({
                status: 'error',
                message: errors,
            });
        }
        const data = await (0, banner_service_js_1.createBannerService)(parsed.data);
        return res.status(201).json({
            status: 'success',
            message: 'Tạo banner mới thành công',
            data,
        });
    }
    catch (error) {
        return res.status(400).json({
            status: 'error',
            message: error.message || 'Lỗi khi tạo banner mới',
        });
    }
};
exports.postBannersAPI = postBannersAPI;
/**
 * PUT /admin/banners/:id
 * Cập nhật thông tin banner (Yêu cầu quyền Admin)
 * ID được truyền qua URL params
 */
const updateBannersAPI = async (req, res) => {
    try {
        const bannerId = Number(req.params.id);
        if (!req.params.id || isNaN(bannerId)) {
            return res.status(400).json({
                status: 'error',
                message: 'ID banner không hợp lệ hoặc không được cung cấp',
            });
        }
        const parsed = await Banner_Schema_js_1.UpdateBannerSchema.safeParseAsync(req.body);
        if (!parsed.success) {
            const errors = parsed.error.issues.map((i) => `${i.message} (${i.path.join('.')})`);
            return res.status(400).json({
                status: 'error',
                message: errors,
            });
        }
        const data = await (0, banner_service_js_1.updateBannerService)(bannerId, parsed.data);
        return res.status(200).json({
            status: 'success',
            message: 'Cập nhật thông tin banner thành công',
            data,
        });
    }
    catch (error) {
        return res.status(400).json({
            status: 'error',
            message: error.message || 'Lỗi khi cập nhật banner',
        });
    }
};
exports.updateBannersAPI = updateBannersAPI;
/**
 * PUT /admin/banners-status/:id
 * Cập nhật trạng thái hiển thị của banner (trường is_active kiểu boolean) (Yêu cầu quyền Admin)
 * ID được truyền qua URL params
 */
const statusBannersAPI = async (req, res) => {
    try {
        const bannerId = Number(req.params.id);
        if (!req.params.id || isNaN(bannerId)) {
            return res.status(400).json({
                status: 'error',
                message: 'ID banner không hợp lệ hoặc không được cung cấp',
            });
        }
        const parsed = await Banner_Schema_js_1.ChangeBannerStatusSchema.safeParseAsync(req.body);
        if (!parsed.success) {
            const errors = parsed.error.issues.map((i) => `${i.message} (${i.path.join('.')})`);
            return res.status(400).json({
                status: 'error',
                message: errors,
            });
        }
        const data = await (0, banner_service_js_1.changeBannerStatusService)(bannerId, parsed.data.is_active);
        return res.status(200).json({
            status: 'success',
            message: 'Cập nhật trạng thái banner thành công',
            data,
        });
    }
    catch (error) {
        return res.status(400).json({
            status: 'error',
            message: error.message || 'Lỗi khi cập nhật trạng thái banner',
        });
    }
};
exports.statusBannersAPI = statusBannersAPI;
/**
 * DELETE /admin/banners/:id
 * Xóa cứng banner khỏi hệ thống (Hard delete) (Yêu cầu quyền Admin)
 * ID được truyền qua URL params
 */
const deleteBannersAPI = async (req, res) => {
    try {
        const bannerId = Number(req.params.id);
        if (!req.params.id || isNaN(bannerId)) {
            return res.status(400).json({
                status: 'error',
                message: 'ID banner không hợp lệ hoặc không được cung cấp',
            });
        }
        await (0, banner_service_js_1.deleteBannerService)(bannerId);
        return res.status(200).json({
            status: 'success',
            message: 'Xóa banner thành công (xóa vĩnh viễn)',
        });
    }
    catch (error) {
        return res.status(400).json({
            status: 'error',
            message: error.message || 'Lỗi khi xóa banner',
        });
    }
};
exports.deleteBannersAPI = deleteBannersAPI;
