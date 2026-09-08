"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSpecialtiesDetailAPI = exports.getSpecialtiesAPI = void 0;
const specialty_service_js_1 = require("../../services/specialty/specialty.service.js");
const constant_js_1 = require("../../config/constant.js");
/**
 * GET /specialties hoặc GET /admin/specialties
 * Lấy danh sách chuyên khoa
 * - Với Admin: xem được cả chuyên khoa đã xóa hoặc lọc theo status ('active' | 'deleted' | 'all').
 * - Với Bệnh nhân/Clients: chỉ lấy chuyên khoa đang hoạt động ('active').
 * Query params (tùy chọn):
 * - page: Phân trang (nếu không truyền sẽ lấy toàn bộ chuyên khoa để làm dropdown/menu)
 * - search: Tìm kiếm theo tên chuyên khoa
 * - status: 'active' | 'deleted' | 'all' (dành cho Admin)
 */
const getSpecialtiesAPI = async (req, res) => {
    try {
        const { page, search, status } = req.query;
        const isAdmin = req.user?.role === constant_js_1.RoleType.ADMIN;
        // Admin mặc định lấy tất cả ('all'), Bệnh nhân luôn chỉ lấy chuyên khoa đang mở ('active')
        const filterStatus = isAdmin ? (status || 'all') : 'active';
        const data = await (0, specialty_service_js_1.getSpecialtiesService)({
            page: page ? Number(page) : undefined,
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
