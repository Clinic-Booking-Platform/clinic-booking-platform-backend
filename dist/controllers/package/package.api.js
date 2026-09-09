"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.restorePackagesAPI = exports.deletePackagesAPI = exports.updatePackagesAPI = exports.postPackagesAPI = exports.getPackagesDetailAPI = exports.getPackagesAPI = void 0;
const package_service_js_1 = require("../../services/package/package.service.js");
const Package_Schema_js_1 = require("../../model/Schema/Package/Package_Schema.js");
const constant_js_1 = require("../../config/constant.js");
/**
 * GET /packages hoặc GET /admin/packages
 * Lấy danh sách gói khám
 * - Với Admin: xem được cả gói khám đã xóa hoặc lọc theo status ('active' | 'deleted' | 'all').
 * - Với User/Doctor: chỉ lấy gói khám đang hoạt động ('active').
 * Query params (tùy chọn):
 * - page: Phân trang (mặc định: 1)
 * - search: Tìm kiếm theo tên gói khám
 * - status: 'active' | 'deleted' | 'all' (áp dụng cho Admin)
 */
const getPackagesAPI = async (req, res) => {
    try {
        const { page, search, status, min_price, max_price, minPrice, maxPrice, price_range, price_ranges, } = req.query;
        const isAdmin = req.user?.role === constant_js_1.RoleType.ADMIN;
        const min = min_price ?? minPrice;
        const max = max_price ?? maxPrice;
        const parsedRanges = (0, constant_js_1.parsePriceRanges)(price_range || price_ranges);
        // Admin mặc định lấy tất cả ('all'), User/Doctor luôn chỉ lấy gói khám đang mở ('active')
        const filterStatus = isAdmin ? (status || 'all') : 'active';
        const data = await (0, package_service_js_1.getPackagesService)({
            page: page ? Number(page) : 1,
            search: search ? String(search) : undefined,
            status: filterStatus,
            minPrice: min !== undefined && min !== '' && !isNaN(Number(min)) ? Number(min) : undefined,
            maxPrice: max !== undefined && max !== '' && !isNaN(Number(max)) ? Number(max) : undefined,
            priceRanges: parsedRanges.length > 0 ? parsedRanges : undefined,
        });
        return res.status(200).json({
            status: 'success',
            message: 'Lấy danh sách gói khám thành công',
            data,
        });
    }
    catch (error) {
        return res.status(500).json({
            status: 'error',
            message: error.message || 'Lỗi hệ thống khi lấy danh sách gói khám',
        });
    }
};
exports.getPackagesAPI = getPackagesAPI;
/**
 * GET /packages/:id hoặc GET /admin/packages/:id
 * Lấy thông tin chi tiết của 1 gói khám (kèm package_detail nếu có)
 */
const getPackagesDetailAPI = async (req, res) => {
    try {
        const packageId = Number(req.params.id);
        if (!packageId || isNaN(packageId)) {
            return res.status(400).json({
                status: 'error',
                message: 'ID gói khám không hợp lệ',
            });
        }
        const isAdmin = req.user?.role === constant_js_1.RoleType.ADMIN;
        const data = await (0, package_service_js_1.getPackageByIdService)(packageId, isAdmin);
        return res.status(200).json({
            status: 'success',
            message: 'Lấy thông tin chi tiết gói khám thành công',
            data,
        });
    }
    catch (error) {
        return res.status(404).json({
            status: 'error',
            message: error.message || 'Không tìm thấy thông tin gói khám',
        });
    }
};
exports.getPackagesDetailAPI = getPackagesDetailAPI;
/**
 * POST /admin/packages
 * Thêm mới gói khám (Yêu cầu quyền Admin)
 */
const postPackagesAPI = async (req, res) => {
    try {
        const parsed = await Package_Schema_js_1.CreatePackageSchema.safeParseAsync(req.body);
        if (!parsed.success) {
            const errors = parsed.error.issues.map((i) => `${i.message} (${i.path[0]?.toString()})`);
            return res.status(400).json({
                status: 'error',
                message: errors,
            });
        }
        const data = await (0, package_service_js_1.createPackageService)(parsed.data);
        return res.status(201).json({
            status: 'success',
            message: 'Tạo gói khám mới thành công',
            data,
        });
    }
    catch (error) {
        return res.status(400).json({
            status: 'error',
            message: error.message || 'Lỗi khi tạo gói khám mới',
        });
    }
};
exports.postPackagesAPI = postPackagesAPI;
/**
 * PUT /admin/packages/:id
 * Cập nhật thông tin gói khám (Yêu cầu quyền Admin)
 * Sử dụng UpdatePackageSchema (.partial()) để validate
 */
const updatePackagesAPI = async (req, res) => {
    try {
        const packageId = Number(req.params.id);
        if (!packageId || isNaN(packageId)) {
            return res.status(400).json({
                status: 'error',
                message: 'ID gói khám không hợp lệ',
            });
        }
        const parsed = await Package_Schema_js_1.UpdatePackageSchema.safeParseAsync(req.body);
        if (!parsed.success) {
            const errors = parsed.error.issues.map((i) => `${i.message} (${i.path[0]?.toString()})`);
            return res.status(400).json({
                status: 'error',
                message: errors,
            });
        }
        const data = await (0, package_service_js_1.updatePackageService)(packageId, parsed.data);
        return res.status(200).json({
            status: 'success',
            message: 'Cập nhật thông tin gói khám thành công',
            data,
        });
    }
    catch (error) {
        return res.status(400).json({
            status: 'error',
            message: error.message || 'Lỗi khi cập nhật gói khám',
        });
    }
};
exports.updatePackagesAPI = updatePackagesAPI;
/**
 * DELETE /admin/packages/:id
 * Xóa mềm gói khám – Ngừng cung cấp (Yêu cầu quyền Admin)
 */
const deletePackagesAPI = async (req, res) => {
    try {
        const packageId = Number(req.params.id || req.body.id || req.query.id);
        if (!packageId || isNaN(packageId)) {
            return res.status(400).json({
                status: 'error',
                message: 'ID gói khám không hợp lệ',
            });
        }
        await (0, package_service_js_1.deletePackageService)(packageId);
        return res.status(200).json({
            status: 'success',
            message: 'Xóa mềm gói khám thành công',
        });
    }
    catch (error) {
        return res.status(400).json({
            status: 'error',
            message: error.message || 'Lỗi khi xóa gói khám',
        });
    }
};
exports.deletePackagesAPI = deletePackagesAPI;
/**
 * POST /admin/packages-restore/:id
 * Khôi phục gói khám đã bị xóa mềm (Yêu cầu quyền Admin)
 */
const restorePackagesAPI = async (req, res) => {
    try {
        const packageId = Number(req.params.id || req.body.id || req.query.id);
        if (!packageId || isNaN(packageId)) {
            return res.status(400).json({
                status: 'error',
                message: 'ID gói khám không hợp lệ',
            });
        }
        await (0, package_service_js_1.restorePackageService)(packageId);
        return res.status(200).json({
            status: 'success',
            message: 'Khôi phục gói khám thành công',
        });
    }
    catch (error) {
        return res.status(400).json({
            status: 'error',
            message: error.message || 'Lỗi khi khôi phục gói khám',
        });
    }
};
exports.restorePackagesAPI = restorePackagesAPI;
