import { Request, Response } from 'express';
import { prisma } from '../../config/client.js';
import { RoleType } from '../../config/constant.js';
import {
    getPrescriptionByMedicalRecordService,
    createPrescriptionService,
    updatePrescriptionService,
    deletePrescriptionItemService,
} from '../../services/prescription/prescription.service.js';
import { CreatePrescriptionSchema } from '../../model/Schema/Prescription/CreatePrescription_Schema.js';
import { UpdatePrescriptionSchema } from '../../model/Schema/Prescription/UpdatePrescription_Schema.js';

// ============================================================
// USER: Xem đơn thuốc theo hồ sơ bệnh án
// ============================================================
/**
 * GET /prescriptions/medical-record/:medicalRecordId
 * Bệnh nhân xem đơn thuốc theo hồ sơ bệnh án của mình
 */
export const getUserPrescriptionAPI = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Vui lòng đăng nhập để xem đơn thuốc',
            });
        }

        const medicalRecordId = Number(req.params.medicalRecordId);
        if (!medicalRecordId || isNaN(medicalRecordId)) {
            return res.status(400).json({
                status: 'error',
                message: 'ID hồ sơ bệnh án không hợp lệ',
            });
        }

        const data = await getPrescriptionByMedicalRecordService(medicalRecordId, {
            userId: Number(userId),
            role: RoleType.USER,
        });

        return res.status(200).json({
            status: 'success',
            message: 'Lấy đơn thuốc thành công',
            data,
        });
    } catch (error: any) {
        const statusCode = error.message?.includes('Không tìm thấy') ? 404 : 400;
        return res.status(statusCode).json({
            status: 'error',
            message: error.message || 'Lỗi hệ thống khi lấy đơn thuốc',
        });
    }
};

// ============================================================
// DOCTOR: Xem đơn thuốc theo hồ sơ bệnh án
// ============================================================
/**
 * GET /doctor/prescriptions/medical-record/:medicalRecordId
 * Bác sĩ xem đơn thuốc theo hồ sơ bệnh án ca trực của mình
 */
export const getDoctorPrescriptionAPI = async (req: Request, res: Response) => {
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

        const medicalRecordId = Number(req.params.medicalRecordId);
        if (!medicalRecordId || isNaN(medicalRecordId)) {
            return res.status(400).json({
                status: 'error',
                message: 'ID hồ sơ bệnh án không hợp lệ',
            });
        }

        const data = await getPrescriptionByMedicalRecordService(medicalRecordId, {
            doctorId: doctor.id,
            role: RoleType.DOCTOR,
        });

        return res.status(200).json({
            status: 'success',
            message: 'Lấy đơn thuốc thành công',
            data,
        });
    } catch (error: any) {
        const statusCode = error.message?.includes('Không tìm thấy') ? 404 : 400;
        return res.status(statusCode).json({
            status: 'error',
            message: error.message || 'Lỗi hệ thống khi lấy đơn thuốc',
        });
    }
};

// ============================================================
// ADMIN: Xem đơn thuốc theo hồ sơ bệnh án
// ============================================================
/**
 * GET /admin/prescriptions/medical-record/:medicalRecordId
 * Admin xem đơn thuốc theo bất kỳ hồ sơ bệnh án nào
 */
export const getAdminPrescriptionAPI = async (req: Request, res: Response) => {
    try {
        const medicalRecordId = Number(req.params.medicalRecordId);
        if (!medicalRecordId || isNaN(medicalRecordId)) {
            return res.status(400).json({
                status: 'error',
                message: 'ID hồ sơ bệnh án không hợp lệ',
            });
        }

        const data = await getPrescriptionByMedicalRecordService(medicalRecordId, {
            role: RoleType.ADMIN,
        });

        return res.status(200).json({
            status: 'success',
            message: 'Lấy đơn thuốc thành công',
            data,
        });
    } catch (error: any) {
        const statusCode = error.message?.includes('Không tìm thấy') ? 404 : 400;
        return res.status(statusCode).json({
            status: 'error',
            message: error.message || 'Lỗi hệ thống khi lấy đơn thuốc',
        });
    }
};

// ============================================================
// DOCTOR: Kê đơn thuốc
// ============================================================
/**
 * POST /doctor/prescriptions/medical-record/:medicalRecordId
 * Bác sĩ kê đơn thuốc (thêm các loại thuốc vào bệnh án)
 * Body: { items: [ { medicine_name, dosage, quantity, unit, instructions? } ] }
 */
export const createPrescriptionAPI = async (req: Request, res: Response) => {
    try {
        const parsed = await CreatePrescriptionSchema.safeParseAsync(req.body);
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

        const medicalRecordId = Number(req.params.medicalRecordId);
        if (!medicalRecordId || isNaN(medicalRecordId)) {
            return res.status(400).json({
                status: 'error',
                message: 'ID hồ sơ bệnh án không hợp lệ',
            });
        }

        const data = await createPrescriptionService(doctor.id, medicalRecordId, parsed.data);

        return res.status(201).json({
            status: 'success',
            message: 'Kê đơn thuốc thành công',
            data,
        });
    } catch (error: any) {
        const statusCode = error.message?.includes('Không tìm thấy') ? 404 : 400;
        return res.status(statusCode).json({
            status: 'error',
            message: error.message || 'Lỗi khi kê đơn thuốc',
        });
    }
};

// ============================================================
// DOCTOR: Điều chỉnh đơn thuốc
// ============================================================
/**
 * PUT /doctor/prescriptions/medical-record/:medicalRecordId
 * Bác sĩ điều chỉnh đơn thuốc (cập nhật lại toàn bộ danh sách thuốc)
 * Body: { items: [ { medicine_name, dosage, quantity, unit, instructions? } ] }
 */
export const updatePrescriptionAPI = async (req: Request, res: Response) => {
    try {
        const parsed = await UpdatePrescriptionSchema.safeParseAsync(req.body);
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

        const medicalRecordId = Number(req.params.medicalRecordId);
        if (!medicalRecordId || isNaN(medicalRecordId)) {
            return res.status(400).json({
                status: 'error',
                message: 'ID hồ sơ bệnh án không hợp lệ',
            });
        }

        const data = await updatePrescriptionService(doctor.id, medicalRecordId, parsed.data);

        return res.status(200).json({
            status: 'success',
            message: 'Cập nhật đơn thuốc thành công',
            data,
        });
    } catch (error: any) {
        const statusCode = error.message?.includes('Không tìm thấy') ? 404 : 400;
        return res.status(statusCode).json({
            status: 'error',
            message: error.message || 'Lỗi khi điều chỉnh đơn thuốc',
        });
    }
};

// ============================================================
// DOCTOR: Xóa một loại thuốc khỏi đơn thuốc
// ============================================================
/**
 * DELETE /doctor/prescriptions/:itemId
 * Bác sĩ xóa một loại thuốc trong đơn
 */
export const deletePrescriptionItemAPI = async (req: Request, res: Response) => {
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

        const itemId = Number(req.params.itemId);
        if (!itemId || isNaN(itemId)) {
            return res.status(400).json({
                status: 'error',
                message: 'ID thuốc không hợp lệ',
            });
        }

        const data = await deletePrescriptionItemService(doctor.id, itemId);

        return res.status(200).json({
            status: 'success',
            message: 'Xóa thuốc khỏi đơn thành công',
            data,
        });
    } catch (error: any) {
        const statusCode = error.message?.includes('Không tìm thấy') ? 404 : 400;
        return res.status(statusCode).json({
            status: 'error',
            message: error.message || 'Lỗi khi xóa thuốc khỏi đơn',
        });
    }
};
