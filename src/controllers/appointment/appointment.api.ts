import { Request, Response } from 'express';
import {
    createAppointmentService,
    bookAppointmentFromOrderService,
    getAppointmentsByUserService,
    cancelAppointmentByUserService,
    getAppointmentsByDoctorService,
    cancelAppointmentByDoctorOrAdminService,
    updateAppointmentStatusService,
    getAllAppointmentsAdminService,
    getAppointmentDetailService,
} from '../../services/appointment/appointment.service.js';
import { CreateAppointmentSchema } from '../../model/Schema/Appointment/CreateAppointment_Schema.js';
import { BookFromOrderSchema } from '../../model/Schema/Appointment/BookFromOrder_Schema.js';
import { prisma } from '../../config/client.js';
import { RoleType } from '../../config/constant.js';

/**
 * POST /api/v1/appointments
 * Bệnh nhân đặt lịch khám Offline
 * Body: { doctor_id, date, time_type, patient_name, patient_phone, symptoms? }
 */
export const createAppointmentAPI = async (req: Request, res: Response) => {
    try {
        // Validate body
        const parsed = await CreateAppointmentSchema.safeParseAsync(req.body);
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

        const appointment = await createAppointmentService({
            user_id: userId,
            doctor_id: parsed.data.doctor_id,
            date: parsed.data.date,
            time_type: parsed.data.time_type,
            patient_name: parsed.data.patient_name,
            patient_phone: parsed.data.patient_phone,
            symptoms: parsed.data.symptoms,
        });

        return res.status(201).json({
            status: 'success',
            message: 'Đặt lịch khám thành công',
            data: appointment,
        });
    } catch (error: any) {
        return res.status(400).json({
            status: 'error',
            message: error.message || 'Lỗi khi đặt lịch khám',
        });
    }
};

/**
 * POST /api/v1/appointments/book-from-order/:id
 * Bệnh nhân đặt lịch khám từ gói khám đã thanh toán (id là order_detail_id)
 * Body: { doctor_id, date, time_type, patient_name, patient_phone, symptoms? }
 */
export const bookFromOrderAPI = async (req: Request, res: Response) => {
    try {
        const orderDetailId = Number(req.params.id);
        if (!orderDetailId || isNaN(orderDetailId)) {
            return res.status(400).json({
                status: 'error',
                message: 'ID gói khám không hợp lệ',
            });
        }

        const parsed = await BookFromOrderSchema.safeParseAsync(req.body);
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

        const appointment = await bookAppointmentFromOrderService({
            user_id: userId,
            order_detail_id: orderDetailId,
            doctor_id: parsed.data.doctor_id,
            date: parsed.data.date,
            time_type: parsed.data.time_type,
            patient_name: parsed.data.patient_name,
            patient_phone: parsed.data.patient_phone,
            symptoms: parsed.data.symptoms,
        });

        return res.status(201).json({
            status: 'success',
            message: 'Đặt lịch khám từ gói khám thành công',
            data: appointment,
        });
    } catch (error: any) {
        return res.status(400).json({
            status: 'error',
            message: error.message || 'Lỗi khi đặt lịch khám từ gói khám',
        });
    }
};

// ============================================================
// USER: Lịch sử lịch hẹn
// ============================================================

/**
 * GET /api/v1/appointments
 * Lấy danh sách lịch sử lịch hẹn của người dùng hiện tại
 * Query params: ?page=1&pageSize=5&status=PENDING
 */
export const getAppointmentsAPI = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Vui lòng đăng nhập để xem lịch sử lịch hẹn',
            });
        }

        const { page, status } = req.query;

        const data = await getAppointmentsByUserService(Number(userId), {
            page: page ? Number(page) : undefined,
            status: status ? String(status) : undefined,
        });

        return res.status(200).json({
            status: 'success',
            message: 'Lấy danh sách lịch hẹn thành công',
            data,
        });
    } catch (error: any) {
        return res.status(500).json({
            status: 'error',
            message: error.message || 'Lỗi hệ thống khi lấy danh sách lịch hẹn',
        });
    }
};

/**
 * GET /api/v1/appointments/:id
 * Lấy thông tin chi tiết một lịch hẹn của người dùng hiện tại
 */
export const getAppointmentDetailAPI = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Vui lòng đăng nhập để xem chi tiết lịch hẹn',
            });
        }

        const appointmentId = Number(req.params.id);
        if (!appointmentId || isNaN(appointmentId)) {
            return res.status(400).json({
                status: 'error',
                message: 'ID lịch hẹn không hợp lệ',
            });
        }

        const data = await getAppointmentDetailService(appointmentId, {
            userId: Number(userId),
            role: RoleType.USER,
        });

        return res.status(200).json({
            status: 'success',
            message: 'Lấy chi tiết lịch hẹn thành công',
            data,
        });
    } catch (error: any) {
        const statusCode = error.message?.includes('Không tìm thấy') ? 404 : 400;
        return res.status(statusCode).json({
            status: 'error',
            message: error.message || 'Lỗi hệ thống khi lấy chi tiết lịch hẹn',
        });
    }
};

// ============================================================
// USER: Hủy lịch hẹn
// ============================================================

/**
 * DELETE /api/v1/appointments/:id
 * Bệnh nhân tự hủy lịch hẹn của mình (chỉ khi đang ở trạng thái PENDING)
 */
export const cancelAppointmentAPI = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Vui lòng đăng nhập để hủy lịch hẹn',
            });
        }

        const appointmentId = Number(req.params.id);
        if (!appointmentId || isNaN(appointmentId)) {
            return res.status(400).json({
                status: 'error',
                message: 'ID lịch hẹn không hợp lệ',
            });
        }

        const data = await cancelAppointmentByUserService(Number(userId), appointmentId);

        return res.status(200).json({
            status: 'success',
            message: 'Hủy lịch hẹn thành công',
            data,
        });
    } catch (error: any) {
        const statusCode = error.message?.includes('Không tìm thấy') ? 404 : 400;
        return res.status(statusCode).json({
            status: 'error',
            message: error.message || 'Lỗi khi hủy lịch hẹn',
        });
    }
};

// ============================================================
// DOCTOR: Xem danh sách lịch hẹn
// ============================================================

/**
 * GET /api/v1/doctor/appointments
 * Bác sĩ xem danh sách lịch hẹn của bản thân
 * Query params: ?page=1&pageSize=10&status=CONFIRMED&from_date=2026-09-01&to_date=2026-09-30&search=keyword
 */
export const getDoctorAppointmentsAPI = async (req: Request, res: Response) => {
    try {
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

        const { page, status, from_date, to_date, search } = req.query;

        const data = await getAppointmentsByDoctorService(doctor.id, {
            page: page ? Number(page) : undefined,
            status: status ? String(status) : undefined,
            from_date: from_date ? String(from_date) : undefined,
            to_date: to_date ? String(to_date) : undefined,
            search: search ? String(search) : undefined,
        });

        return res.status(200).json({
            status: 'success',
            message: 'Lấy danh sách lịch hẹn thành công',
            data,
        });
    } catch (error: any) {
        return res.status(500).json({
            status: 'error',
            message: error.message || 'Lỗi hệ thống khi lấy danh sách lịch hẹn',
        });
    }
};

/**
 * GET /api/v1/doctor/appointments/:id
 * Bác sĩ xem chi tiết một lịch hẹn thuộc ca trực của mình
 */
export const getDoctorAppointmentDetailAPI = async (req: Request, res: Response) => {
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

        const appointmentId = Number(req.params.id);
        if (!appointmentId || isNaN(appointmentId)) {
            return res.status(400).json({
                status: 'error',
                message: 'ID lịch hẹn không hợp lệ',
            });
        }

        const data = await getAppointmentDetailService(appointmentId, {
            doctorId: doctor.id,
            role: RoleType.DOCTOR,
        });

        return res.status(200).json({
            status: 'success',
            message: 'Lấy chi tiết lịch hẹn thành công',
            data,
        });
    } catch (error: any) {
        const statusCode = error.message?.includes('Không tìm thấy') ? 404 : 400;
        return res.status(statusCode).json({
            status: 'error',
            message: error.message || 'Lỗi hệ thống khi lấy chi tiết lịch hẹn',
        });
    }
};

// ============================================================
// DOCTOR: Hủy lịch hẹn
// ============================================================

/**
 * DELETE /api/v1/doctor/appointments/:id
 * Bác sĩ hủy lịch hẹn thuộc ca trực của mình
 * Body hoặc Query (tùy chọn): { cancel_reason?: string }
 */
export const cancelDoctorAppointmentAPI = async (req: Request, res: Response) => {
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

        const appointmentId = Number(req.params.id);
        if (!appointmentId || isNaN(appointmentId)) {
            return res.status(400).json({
                status: 'error',
                message: 'ID lịch hẹn không hợp lệ',
            });
        }

        const data = await cancelAppointmentByDoctorOrAdminService(
            appointmentId,
            'DOCTOR',
            doctor.id
        );

        return res.status(200).json({
            status: 'success',
            message: 'Hủy lịch hẹn thành công',
            data,
        });
    } catch (error: any) {
        const statusCode = error.message?.includes('Không tìm thấy') ? 404 : 400;
        return res.status(statusCode).json({
            status: 'error',
            message: error.message || 'Lỗi khi hủy lịch hẹn',
        });
    }
};

// ============================================================
// DOCTOR: Cập nhật trạng thái lịch hẹn
// ============================================================

/**
 * PUT /api/v1/doctor/appointments/:id/status
 * Bác sĩ cập nhật trạng thái lịch hẹn theo tiến trình khám (PENDING → CONFIRMED → COMPLETED / NO_SHOW)
 * Body: { status: string }
 */
export const updateDoctorAppointmentStatusAPI = async (req: Request, res: Response) => {
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

        const appointmentId = Number(req.params.id);
        if (!appointmentId || isNaN(appointmentId)) {
            return res.status(400).json({
                status: 'error',
                message: 'ID lịch hẹn không hợp lệ',
            });
        }

        const { status } = req.body;
        if (!status) {
            return res.status(400).json({
                status: 'error',
                message: 'Trạng thái mới là bắt buộc',
            });
        }

        const data = await updateAppointmentStatusService(
            appointmentId,
            String(status),
            'DOCTOR',
            doctor.id
        );

        return res.status(200).json({
            status: 'success',
            message: 'Cập nhật trạng thái lịch hẹn thành công',
            data,
        });
    } catch (error: any) {
        const statusCode = error.message?.includes('Không tìm thấy') ? 404 : 400;
        return res.status(statusCode).json({
            status: 'error',
            message: error.message || 'Lỗi khi cập nhật trạng thái lịch hẹn',
        });
    }
};

// ============================================================
// ADMIN: Xem danh sách tất cả lịch hẹn
// ============================================================

/**
 * GET /api/v1/admin/appointments
 * Admin xem danh sách tất cả lịch hẹn trên hệ thống
 * Query params: ?page=1&pageSize=10&status=PENDING&from_date=2026-09-01&to_date=2026-09-30&search=keyword&doctor_id=1
 */
export const getAdminAppointmentsAPI = async (req: Request, res: Response) => {
    try {
        const { page, status, from_date, to_date, search, doctor_id } = req.query;

        const data = await getAllAppointmentsAdminService({
            page: page ? Number(page) : undefined,
            status: status ? String(status) : undefined,
            from_date: from_date ? String(from_date) : undefined,
            to_date: to_date ? String(to_date) : undefined,
            search: search ? String(search) : undefined,
            doctor_id: doctor_id ? Number(doctor_id) : undefined,
        });

        return res.status(200).json({
            status: 'success',
            message: 'Lấy danh sách lịch hẹn thành công',
            data,
        });
    } catch (error: any) {
        return res.status(500).json({
            status: 'error',
            message: error.message || 'Lỗi hệ thống khi lấy danh sách lịch hẹn',
        });
    }
};

/**
 * GET /api/v1/admin/appointments/:id
 * Admin xem chi tiết bất kỳ lịch hẹn nào trên hệ thống
 */
export const getAdminAppointmentDetailAPI = async (req: Request, res: Response) => {
    try {
        const appointmentId = Number(req.params.id);
        if (!appointmentId || isNaN(appointmentId)) {
            return res.status(400).json({
                status: 'error',
                message: 'ID lịch hẹn không hợp lệ',
            });
        }

        const data = await getAppointmentDetailService(appointmentId, {
            role: RoleType.ADMIN,
        });

        return res.status(200).json({
            status: 'success',
            message: 'Lấy chi tiết lịch hẹn thành công',
            data,
        });
    } catch (error: any) {
        const statusCode = error.message?.includes('Không tìm thấy') ? 404 : 400;
        return res.status(statusCode).json({
            status: 'error',
            message: error.message || 'Lỗi hệ thống khi lấy chi tiết lịch hẹn',
        });
    }
};

// ============================================================
// ADMIN: Hủy lịch hẹn
// ============================================================

/**
 * DELETE /api/v1/admin/appointments/:id
 * Admin hủy bất kỳ lịch hẹn nào trên hệ thống
 * Body hoặc Query (tùy chọn): { cancel_reason?: string }
 */
export const cancelAdminAppointmentAPI = async (req: Request, res: Response) => {
    try {
        const appointmentId = Number(req.params.id);
        if (!appointmentId || isNaN(appointmentId)) {
            return res.status(400).json({
                status: 'error',
                message: 'ID lịch hẹn không hợp lệ',
            });
        }

        const data = await cancelAppointmentByDoctorOrAdminService(
            appointmentId,
            'ADMIN'
        );

        return res.status(200).json({
            status: 'success',
            message: 'Hủy lịch hẹn thành công',
            data,
        });
    } catch (error: any) {
        const statusCode = error.message?.includes('Không tìm thấy') ? 404 : 400;
        return res.status(statusCode).json({
            status: 'error',
            message: error.message || 'Lỗi khi hủy lịch hẹn',
        });
    }
};

// ============================================================
// ADMIN: Cập nhật trạng thái lịch hẹn
// ============================================================

/**
 * PUT /api/v1/admin/appointments/:id/status
 * Admin cập nhật trạng thái bất kỳ lịch hẹn nào
 * Body: { status: string }
 */
export const updateAdminAppointmentStatusAPI = async (req: Request, res: Response) => {
    try {
        const appointmentId = Number(req.params.id);
        if (!appointmentId || isNaN(appointmentId)) {
            return res.status(400).json({
                status: 'error',
                message: 'ID lịch hẹn không hợp lệ',
            });
        }

        const { status } = req.body;
        if (!status) {
            return res.status(400).json({
                status: 'error',
                message: 'Trạng thái mới là bắt buộc',
            });
        }

        const data = await updateAppointmentStatusService(
            appointmentId,
            String(status),
            'ADMIN'
        );

        return res.status(200).json({
            status: 'success',
            message: 'Cập nhật trạng thái lịch hẹn thành công',
            data,
        });
    } catch (error: any) {
        const statusCode = error.message?.includes('Không tìm thấy') ? 404 : 400;
        return res.status(statusCode).json({
            status: 'error',
            message: error.message || 'Lỗi khi cập nhật trạng thái lịch hẹn',
        });
    }
};
