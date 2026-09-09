"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.restoreSpecialtyAPI = exports.deleteSpecialtyAPI = exports.updateSpecialtyAPI = exports.postSpecialtyAPI = exports.getSpecialtiesDetailAPI = exports.getSpecialtiesAPI = void 0;
const specialty_service_js_1 = require("../../services/specialty/specialty.service.js");
const Specialty_Schema_js_1 = require("../../model/Schema/Specialty/Specialty_Schema.js");
const constant_js_1 = require("../../config/constant.js");
/**
 * GET /specialties hoặc GET /admin/specialties
 * Lấy danh sách chuyên khoa
 * - Với Admin: xem được cả chuyên khoa đã xóa hoặc lọc theo status ('active' | 'deleted' | 'all').
 * - Với Bệnh nhân/Clients: chỉ lấy chuyên khoa đang hoạt động ('active').
 * Query params (tùy chọn):
 * - page: Phân trang (mặc định: 1)
 * - search: Tìm kiếm theo tên chuyên khoa
 * - status: 'active' | 'deleted' | 'all' (áp dụng cho Admin)
 */
const getSpecialtiesAPI = async (req, res) => {
    try {
        const { page, search, status } = req.query;
        const isAdmin = req.user?.role === constant_js_1.RoleType.ADMIN;
        // Admin mặc định lấy tất cả ('all'), Bệnh nhân luôn chỉ lấy chuyên khoa đang mở ('active')
        const filterStatus = isAdmin ? (status || 'all') : 'active';
        const data = await (0, specialty_service_js_1.getSpecialtiesService)({
            page: page ? Number(page) : 1,
            search: search ? String(search) : undefined,
            status: filterStatus,
        });
        return res.status(200).json({
            status: 'success',
            message: 'Lấy danh sách chuyên khoa thành công',
            data,
        });
    }
    catch (error) {
        return res.status(500).json({
            status: 'error',
            message: error.message || 'Lỗi hệ thống khi lấy danh sách chuyên khoa',
        });
    }
};
exports.getSpecialtiesAPI = getSpecialtiesAPI;
/**
 * GET /specialties/:id hoặc GET /admin/specialties/:id
 * Lấy thông tin chi tiết của 1 chuyên khoa (kèm danh sách bác sĩ thuộc chuyên khoa đó)
 */
const getSpecialtiesDetailAPI = async (req, res) => {
    try {
        const specialtyId = Number(req.params.id);
        if (!specialtyId || isNaN(specialtyId)) {
            return res.status(400).json({
                status: 'error',
                message: 'ID chuyên khoa không hợp lệ',
            });
        }
        const isAdmin = req.user?.role === constant_js_1.RoleType.ADMIN;
        const data = await (0, specialty_service_js_1.getSpecialtyByIdService)(specialtyId, isAdmin);
        return res.status(200).json({
            status: 'success',
            message: 'Lấy thông tin chi tiết chuyên khoa thành công',
            data,
        });
    }
    catch (error) {
        return res.status(404).json({
            status: 'error',
            message: error.message || 'Không tìm thấy thông tin chuyên khoa',
        });
    }
};
exports.getSpecialtiesDetailAPI = getSpecialtiesDetailAPI;
/**
 * POST /admin/specialties
 * Thêm mới chuyên khoa (Yêu cầu quyền Admin)
 */
const postSpecialtyAPI = async (req, res) => {
    try {
        const parsed = await Specialty_Schema_js_1.CreateSpecialtySchema.safeParseAsync(req.body);
        if (!parsed.success) {
            const errors = parsed.error.issues.map((i) => `${i.message} (${i.path[0]?.toString()})`);
            return res.status(400).json({
                status: 'error',
                message: errors,
            });
        }
        const data = await (0, specialty_service_js_1.createSpecialtyService)(parsed.data);
        return res.status(201).json({
            status: 'success',
            message: 'Tạo chuyên khoa mới thành công',
            data,
        });
    }
    catch (error) {
        return res.status(400).json({
            status: 'error',
            message: error.message || 'Lỗi khi tạo chuyên khoa mới',
        });
    }
};
exports.postSpecialtyAPI = postSpecialtyAPI;
/**
 * PUT /admin/specialties/:id
 * Cập nhật thông tin chuyên khoa (Yêu cầu quyền Admin)
 * Sử dụng UpdateSpecialtySchema (.partial()) để validate
 */
const updateSpecialtyAPI = async (req, res) => {
    try {
        const specialtyId = Number(req.params.id);
        if (!specialtyId || isNaN(specialtyId)) {
            return res.status(400).json({
                status: 'error',
                message: 'ID chuyên khoa không hợp lệ',
            });
        }
        const parsed = await Specialty_Schema_js_1.UpdateSpecialtySchema.safeParseAsync(req.body);
        if (!parsed.success) {
            const errors = parsed.error.issues.map((i) => `${i.message} (${i.path[0]?.toString()})`);
            return res.status(400).json({
                status: 'error',
                message: errors,
            });
        }
        const data = await (0, specialty_service_js_1.updateSpecialtyService)(specialtyId, parsed.data);
        return res.status(200).json({
            status: 'success',
            message: 'Cập nhật thông tin chuyên khoa thành công',
            data,
        });
    }
    catch (error) {
        return res.status(400).json({
            status: 'error',
            message: error.message || 'Lỗi khi cập nhật chuyên khoa',
        });
    }
};
exports.updateSpecialtyAPI = updateSpecialtyAPI;
/**
 * DELETE /admin/specialties/:id
 * Xóa mềm chuyên khoa (Yêu cầu quyền Admin)
 */
const deleteSpecialtyAPI = async (req, res) => {
    try {
        const specialtyId = Number(req.params.id || req.body.id || req.query.id);
        if (!specialtyId || isNaN(specialtyId)) {
            return res.status(400).json({
                status: 'error',
                message: 'ID chuyên khoa không hợp lệ',
            });
        }
        await (0, specialty_service_js_1.deleteSpecialtyService)(specialtyId);
        return res.status(200).json({
            status: 'success',
            message: 'Xóa mềm chuyên khoa thành công',
        });
    }
    catch (error) {
        return res.status(400).json({
            status: 'error',
            message: error.message || 'Lỗi khi xóa chuyên khoa',
        });
    }
};
exports.deleteSpecialtyAPI = deleteSpecialtyAPI;
/**
 * POST /admin/specialties-restore/:id
 * Khôi phục chuyên khoa đã bị xóa mềm (Yêu cầu quyền Admin)
 */
const restoreSpecialtyAPI = async (req, res) => {
    try {
        const specialtyId = Number(req.params.id || req.body.id || req.query.id);
        if (!specialtyId || isNaN(specialtyId)) {
            return res.status(400).json({
                status: 'error',
                message: 'ID chuyên khoa không hợp lệ',
            });
        }
        await (0, specialty_service_js_1.restoreSpecialtyService)(specialtyId);
        return res.status(200).json({
            status: 'success',
            message: 'Khôi phục chuyên khoa thành công',
        });
    }
    catch (error) {
        return res.status(400).json({
            status: 'error',
            message: error.message || 'Lỗi khi khôi phục chuyên khoa',
        });
    }
};
exports.restoreSpecialtyAPI = restoreSpecialtyAPI;
