import { Request, Response } from 'express';
import {
    createMedicalRecordService,
    updateMedicalRecordService,
    signMedicalRecordService,
    getMedicalRecordDetailService,
    getMedicalRecordsByUserService,
    getMedicalRecordsByDoctorService,
    getAllMedicalRecordsAdminService,
} from '../../services/medical-record/medical-record.service.js';
import { CreateMedicalRecordSchema } from '../../model/Schema/MedicalRecord/CreateMedicalRecord_Schema.js';
import { UpdateMedicalRecordSchema } from '../../model/Schema/MedicalRecord/UpdateMedicalRecord_Schema.js';
import { prisma } from '../../config/client.js';
import { RoleType } from '../../config/constant.js';

// ============================================================
// DOCTOR: Tạo hồ sơ bệnh án
// ============================================================

/**
 * POST /api/v1/doctor/medical-records
 * Bác sĩ tạo hồ sơ bệnh án cho lịch hẹn đã xác nhận (CONFIRMED)
 * Body: { appointment_id, diagnosis, symptoms?, clinical_examination?, ... , attachments?[] }
 */
export const createMedicalRecordAPI = async (req: Request, res: Response) => {
    try {
        // Validate body
        const parsed = await CreateMedicalRecordSchema.safeParseAsync(req.body);
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
                message: 'Vui lòng đăng nhập',
            });
        }

        // Lấy doctor_id từ user_id
        const doctor = await prisma.doctor.findUnique({
            where: { user_id: Number(userId) },
        });

        if (!doctor) {
            return res.status(403).json({
                status: 'error',
                message: 'Tài khoản của bạn không phải là bác sĩ.',
            });
        }

        const data = await createMedicalRecordService(doctor.id, parsed.data);

        return res.status(201).json({
            status: 'success',
            message: 'Tạo hồ sơ bệnh án thành công',
            data,
        });
    } catch (error: any) {
        const statusCode = error.message?.includes('Không tìm thấy') ? 404 : 400;
        return res.status(statusCode).json({
            status: 'error',
            message: error.message || 'Lỗi khi tạo hồ sơ bệnh án',
        });
    }
};

// ============================================================
// DOCTOR: Cập nhật hồ sơ bệnh án
// ============================================================

/**
 * PUT /api/v1/doctor/medical-records/:id
 * Bác sĩ cập nhật hồ sơ bệnh án (chỉ khi chưa ký - status = DRAFT)
 * Body: { diagnosis?, symptoms?, clinical_examination?, ... , attachments?[] }
 */
export const updateMedicalRecordAPI = async (req: Request, res: Response) => {
    try {
        // Validate body
        const parsed = await UpdateMedicalRecordSchema.safeParseAsync(req.body);
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
                message: 'Vui lòng đăng nhập',
            });
        }

        const doctor = await prisma.doctor.findUnique({
            where: { user_id: Number(userId) },
        });

        if (!doctor) {
            return res.status(403).json({
                status: 'error',
                message: 'Tài khoản của bạn không phải là bác sĩ.',
            });
        }

        const recordId = Number(req.params.id);
        if (!recordId || isNaN(recordId)) {
            return res.status(400).json({
                status: 'error',
                message: 'ID hồ sơ bệnh án không hợp lệ',
            });
        }

        const data = await updateMedicalRecordService(doctor.id, recordId, parsed.data);

        return res.status(200).json({
            status: 'success',
            message: 'Cập nhật hồ sơ bệnh án thành công',
            data,
        });
    } catch (error: any) {
        const statusCode = error.message?.includes('Không tìm thấy') ? 404 : 400;
        return res.status(statusCode).json({
            status: 'error',
            message: error.message || 'Lỗi khi cập nhật hồ sơ bệnh án',
        });
    }
};

// ============================================================
// DOCTOR: Ký xác nhận & Đóng hồ sơ bệnh án
// ============================================================

/**
 * PUT /api/v1/doctor/medical-records/:id/sign
 * Bác sĩ ký xác nhận đóng hồ sơ bệnh án (DRAFT → SIGNED)
 * Sau khi ký, hồ sơ bệnh án KHÔNG THỂ chỉnh sửa
 */
export const signMedicalRecordAPI = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Vui lòng đăng nhập',
            });
        }

        const doctor = await prisma.doctor.findUnique({
            where: { user_id: Number(userId) },
        });

        if (!doctor) {
            return res.status(403).json({
                status: 'error',
                message: 'Tài khoản của bạn không phải là bác sĩ.',
            });
        }

        const recordId = Number(req.params.id);
        if (!recordId || isNaN(recordId)) {
            return res.status(400).json({
                status: 'error',
                message: 'ID hồ sơ bệnh án không hợp lệ',
            });
        }

        const data = await signMedicalRecordService(doctor.id, recordId);

        return res.status(200).json({
            status: 'success',
            message: 'Ký xác nhận hồ sơ bệnh án thành công. Hồ sơ đã được đóng và không thể chỉnh sửa.',
            data,
        });
    } catch (error: any) {
        const statusCode = error.message?.includes('Không tìm thấy') ? 404 : 400;
        return res.status(statusCode).json({
            status: 'error',
            message: error.message || 'Lỗi khi ký xác nhận hồ sơ bệnh án',
        });
    }
};

// ============================================================
// DOCTOR: Danh sách hồ sơ bệnh án
// ============================================================

/**
 * GET /api/v1/doctor/medical-records
 * Bác sĩ xem danh sách hồ sơ bệnh án của mình
 * Query params: ?page=1&search=keyword&from_date=2026-09-01&to_date=2026-09-30
 */
export const getDoctorMedicalRecordsAPI = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Vui lòng đăng nhập',
            });
        }

        const doctor = await prisma.doctor.findUnique({
            where: { user_id: Number(userId) },
        });

        if (!doctor) {
            return res.status(403).json({
                status: 'error',
                message: 'Tài khoản của bạn không phải là bác sĩ.',
            });
        }

        const { page, search, from_date, to_date } = req.query;

        const data = await getMedicalRecordsByDoctorService(doctor.id, {
            page: page ? Number(page) : undefined,
            search: search ? String(search) : undefined,
            from_date: from_date ? String(from_date) : undefined,
            to_date: to_date ? String(to_date) : undefined,
        });

        return res.status(200).json({
            status: 'success',
            message: 'Lấy danh sách hồ sơ bệnh án thành công',
            data,
        });
    } catch (error: any) {
        return res.status(500).json({
            status: 'error',
            message: error.message || 'Lỗi hệ thống khi lấy danh sách hồ sơ bệnh án',
        });
    }
};

// ============================================================
// DOCTOR: Chi tiết hồ sơ bệnh án
// ============================================================

/**
 * GET /api/v1/doctor/medical-records/:id
 * Bác sĩ xem chi tiết hồ sơ bệnh án thuộc ca trực của mình
 */
export const getDoctorMedicalRecordDetailAPI = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Vui lòng đăng nhập',
            });
        }

        const doctor = await prisma.doctor.findUnique({
            where: { user_id: Number(userId) },
        });

        if (!doctor) {
            return res.status(403).json({
                status: 'error',
                message: 'Tài khoản của bạn không phải là bác sĩ.',
            });
        }

        const recordId = Number(req.params.id);
        if (!recordId || isNaN(recordId)) {
            return res.status(400).json({
                status: 'error',
                message: 'ID hồ sơ bệnh án không hợp lệ',
            });
        }

        const data = await getMedicalRecordDetailService(recordId, {
            doctorId: doctor.id,
            role: RoleType.DOCTOR,
        });

        return res.status(200).json({
            status: 'success',
            message: 'Lấy chi tiết hồ sơ bệnh án thành công',
            data,
        });
    } catch (error: any) {
        const statusCode = error.message?.includes('Không tìm thấy') ? 404 : 400;
        return res.status(statusCode).json({
            status: 'error',
            message: error.message || 'Lỗi hệ thống khi lấy chi tiết hồ sơ bệnh án',
        });
    }
};

// ============================================================
// USER: Danh sách hồ sơ bệnh án
// ============================================================

/**
 * GET /api/v1/medical-records
 * Bệnh nhân xem danh sách hồ sơ bệnh án của mình
 * Query params: ?page=1
 */
export const getUserMedicalRecordsAPI = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Vui lòng đăng nhập để xem hồ sơ bệnh án',
            });
        }

        const { page } = req.query;

        const data = await getMedicalRecordsByUserService(Number(userId), {
            page: page ? Number(page) : undefined,
        });

        return res.status(200).json({
            status: 'success',
            message: 'Lấy danh sách hồ sơ bệnh án thành công',
            data,
        });
    } catch (error: any) {
        return res.status(500).json({
            status: 'error',
            message: error.message || 'Lỗi hệ thống khi lấy danh sách hồ sơ bệnh án',
        });
    }
};

// ============================================================
// USER: Chi tiết hồ sơ bệnh án
// ============================================================

/**
 * GET /api/v1/medical-records/:id
 * Bệnh nhân xem chi tiết hồ sơ bệnh án của mình
 */
export const getUserMedicalRecordDetailAPI = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Vui lòng đăng nhập để xem hồ sơ bệnh án',
            });
        }

        const recordId = Number(req.params.id);
        if (!recordId || isNaN(recordId)) {
            return res.status(400).json({
                status: 'error',
                message: 'ID hồ sơ bệnh án không hợp lệ',
            });
        }

        const data = await getMedicalRecordDetailService(recordId, {
            userId: Number(userId),
            role: RoleType.USER,
        });

        return res.status(200).json({
            status: 'success',
            message: 'Lấy chi tiết hồ sơ bệnh án thành công',
            data,
        });
    } catch (error: any) {
        const statusCode = error.message?.includes('Không tìm thấy') ? 404 : 400;
        return res.status(statusCode).json({
            status: 'error',
            message: error.message || 'Lỗi hệ thống khi lấy chi tiết hồ sơ bệnh án',
        });
    }
};

// ============================================================
// ADMIN: Danh sách tất cả hồ sơ bệnh án
// ============================================================

/**
 * GET /api/v1/admin/medical-records
 * Admin xem danh sách tất cả hồ sơ bệnh án trên hệ thống
 * Query params: ?page=1&search=keyword&from_date=2026-09-01&to_date=2026-09-30&doctor_id=1
 */
export const getAdminMedicalRecordsAPI = async (req: Request, res: Response) => {
    try {
        const { page, search, from_date, to_date, doctor_id } = req.query;

        const data = await getAllMedicalRecordsAdminService({
            page: page ? Number(page) : undefined,
            search: search ? String(search) : undefined,
            from_date: from_date ? String(from_date) : undefined,
            to_date: to_date ? String(to_date) : undefined,
            doctor_id: doctor_id ? Number(doctor_id) : undefined,
        });

        return res.status(200).json({
            status: 'success',
            message: 'Lấy danh sách hồ sơ bệnh án thành công',
            data,
        });
    } catch (error: any) {
        return res.status(500).json({
            status: 'error',
            message: error.message || 'Lỗi hệ thống khi lấy danh sách hồ sơ bệnh án',
        });
    }
};

// ============================================================
// ADMIN: Chi tiết hồ sơ bệnh án
// ============================================================

/**
 * GET /api/v1/admin/medical-records/:id
 * Admin xem chi tiết bất kỳ hồ sơ bệnh án nào trên hệ thống
 */
export const getAdminMedicalRecordDetailAPI = async (req: Request, res: Response) => {
    try {
        const recordId = Number(req.params.id);
        if (!recordId || isNaN(recordId)) {
            return res.status(400).json({
                status: 'error',
                message: 'ID hồ sơ bệnh án không hợp lệ',
            });
        }

        const data = await getMedicalRecordDetailService(recordId, {
            role: RoleType.ADMIN,
        });

        return res.status(200).json({
            status: 'success',
            message: 'Lấy chi tiết hồ sơ bệnh án thành công',
            data,
        });
    } catch (error: any) {
        const statusCode = error.message?.includes('Không tìm thấy') ? 404 : 400;
        return res.status(statusCode).json({
            status: 'error',
            message: error.message || 'Lỗi hệ thống khi lấy chi tiết hồ sơ bệnh án',
        });
    }
};
