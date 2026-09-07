import { Request, Response } from 'express';
import {
    deleteDoctorService,
    getDoctorByIdService,
    getDoctorsService,
    restoreDoctorService,
    updateDoctorService,
} from '../../services/doctor/doctor.service.js';
import { UpdateDoctorSchema } from '../../model/Schema/Doctor/UpdateDoctor_Schema.js';
import { RoleType } from '../../config/constant.js';

/**
 * GET /doctors hoặc GET /admin/doctors
 * Lấy danh sách bác sĩ (kèm chuyên khoa, thông tin cá nhân)
 * - Đối với Admin: mặc định lấy TẤT CẢ ('all' - gồm cả bác sĩ đã xóa mềm), hoặc lọc theo query status ('active' | 'deleted' | 'all').
 * - Đối với Bệnh nhân/Clients: LUÔN chỉ lấy bác sĩ đang hoạt động ('active').
 * Query params:
 * - page: Trang hiện tại
 * - specialty_id: Lọc theo ID chuyên khoa
 * - search: Tìm theo tên bác sĩ
 * - status: 'active' | 'deleted' | 'all' (áp dụng cho Admin)
 */
export const getDoctorsAPI = async (req: Request, res: Response) => {
    try {
        const { page, specialty_id, search, status } = req.query;
        const isAdmin = req.user?.role === RoleType.ADMIN;

        // Admin mặc định thấy toàn bộ danh sách (cả bác sĩ đã bị xóa mềm) để quản lý
        // Bệnh nhân thì luôn chỉ thấy bác sĩ đang hoạt động
        const filterStatus = isAdmin ? ((status as any) || 'all') : 'active';

        const data = await getDoctorsService({
            page: page ? Number(page) : 1,
            specialty_id: specialty_id ? Number(specialty_id) : undefined,
            search: search ? String(search) : undefined,
            status: filterStatus,
        });

        return res.status(200).json({
            status: 'success',
            message: 'Lấy danh sách bác sĩ thành công',
            data,
        });
    } catch (error: any) {
        return res.status(500).json({
            status: 'error',
            message: error.message || 'Lỗi hệ thống khi lấy danh sách bác sĩ',
        });
    }
};

/**
 * GET /doctors/:id
 * Xem chi tiết thông tin 1 bác sĩ (Admin xem được cả bác sĩ đã xóa)
 */
export const getDoctorDetailAPI = async (req: Request, res: Response) => {
    try {
        const doctorId = Number(req.params.id);
        if (!doctorId || isNaN(doctorId)) {
            return res.status(400).json({
                status: 'error',
                message: 'ID bác sĩ không hợp lệ',
            });
        }

        const isAdmin = req.user?.role === RoleType.ADMIN;
        const data = await getDoctorByIdService(doctorId, isAdmin);
        return res.status(200).json({
            status: 'success',
            message: 'Lấy thông tin bác sĩ thành công',
            data,
        });
    } catch (error: any) {
        return res.status(404).json({
            status: 'error',
            message: error.message || 'Không tìm thấy thông tin bác sĩ',
        });
    }
};

/**
 * PUT /admin/doctors/:id
 * Admin cập nhật thông tin và chuyên môn của bác sĩ
 */
export const updateDoctorAPI = async (req: Request, res: Response) => {
    try {
        const doctorId = Number(req.params.id);
        if (!doctorId || isNaN(doctorId)) {
            return res.status(400).json({
                status: 'error',
                message: 'ID bác sĩ không hợp lệ',
            });
        }

        const parsed = await UpdateDoctorSchema.safeParseAsync(req.body);
        if (!parsed.success) {
            const errors = parsed.error.issues.map(
                (i) => `${i.message} (${i.path[0]?.toString()})`
            );
            return res.status(400).json({
                status: 'error',
                message: errors,
            });
        }

        const updated = await updateDoctorService(doctorId, parsed.data);
        return res.status(200).json({
            status: 'success',
            message: 'Cập nhật hồ sơ bác sĩ thành công',
            data: updated,
        });
    } catch (error: any) {
        return res.status(400).json({
            status: 'error',
            message: error.message || 'Lỗi khi cập nhật hồ sơ bác sĩ',
        });
    }
};

/**
 * DELETE /admin/doctors/:id
 * Admin xóa mềm bác sĩ theo doctorId
 */
export const deleteDoctorAPI = async (req: Request, res: Response) => {
    try {
        const doctorId = Number(req.params.id || req.body.id || req.query.id);
        if (!doctorId || isNaN(doctorId)) {
            return res.status(400).json({
                status: 'error',
                message: 'ID bác sĩ không hợp lệ',
            });
        }

        await deleteDoctorService(doctorId);
        return res.status(200).json({
            status: 'success',
            message: 'Xóa mềm bác sĩ thành công',
        });
    } catch (error: any) {
        return res.status(400).json({
            status: 'error',
            message: error.message || 'Lỗi khi xóa bác sĩ',
        });
    }
};

/**
 * POST /admin/doctors-restore/:id
 * Admin khôi phục bác sĩ theo doctorId
 */
export const restoreDoctorAPI = async (req: Request, res: Response) => {
    try {
        const doctorId = Number(req.params.id || req.body.id || req.query.id);
        if (!doctorId || isNaN(doctorId)) {
            return res.status(400).json({
                status: 'error',
                message: 'ID bác sĩ không hợp lệ',
            });
        }

        await restoreDoctorService(doctorId);
        return res.status(200).json({
            status: 'success',
            message: 'Khôi phục hồ sơ bác sĩ thành công',
        });
    } catch (error: any) {
        return res.status(400).json({
            status: 'error',
            message: error.message || 'Lỗi khi khôi phục hồ sơ bác sĩ',
        });
    }
};