"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAdminAppointmentStatusAPI = exports.cancelAdminAppointmentAPI = exports.getAdminAppointmentDetailAPI = exports.getAdminAppointmentsAPI = exports.updateDoctorAppointmentStatusAPI = exports.cancelDoctorAppointmentAPI = exports.getDoctorAppointmentDetailAPI = exports.getDoctorAppointmentsAPI = exports.cancelAppointmentAPI = exports.getAppointmentDetailAPI = exports.getAppointmentsAPI = exports.bookFromOrderAPI = exports.createAppointmentAPI = void 0;
const appointment_service_js_1 = require("../../services/appointment/appointment.service.js");
const CreateAppointment_Schema_js_1 = require("../../model/Schema/Appointment/CreateAppointment_Schema.js");
const BookFromOrder_Schema_js_1 = require("../../model/Schema/Appointment/BookFromOrder_Schema.js");
const client_js_1 = require("../../config/client.js");
const constant_js_1 = require("../../config/constant.js");
/**
 * POST /api/v1/appointments
 * Bệnh nhân đặt lịch khám Offline
 * Body: { doctor_id, date, time_type, patient_name, patient_phone, symptoms? }
 */
const createAppointmentAPI = async (req, res) => {
    try {
        // Validate body
        const parsed = await CreateAppointment_Schema_js_1.CreateAppointmentSchema.safeParseAsync(req.body);
        if (!parsed.success) {
            const errors = parsed.error.issues.map((i) => `${i.message} (${i.path[0]?.toString()})`);
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
        const appointment = await (0, appointment_service_js_1.createAppointmentService)({
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
    }
    catch (error) {
        return res.status(400).json({
            status: 'error',
            message: error.message || 'Lỗi khi đặt lịch khám',
        });
    }
};
exports.createAppointmentAPI = createAppointmentAPI;
/**
 * POST /api/v1/appointments/book-from-order/:id
 * Bệnh nhân đặt lịch khám từ gói khám đã thanh toán (id là order_detail_id)
 * Body: { doctor_id, date, time_type, patient_name, patient_phone, symptoms? }
 */
const bookFromOrderAPI = async (req, res) => {
    try {
        const orderDetailId = Number(req.params.id);
        if (!orderDetailId || isNaN(orderDetailId)) {
            return res.status(400).json({
                status: 'error',
                message: 'ID gói khám không hợp lệ',
            });
        }
        const parsed = await BookFromOrder_Schema_js_1.BookFromOrderSchema.safeParseAsync(req.body);
        if (!parsed.success) {
            const errors = parsed.error.issues.map((i) => `${i.message} (${i.path[0]?.toString()})`);
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
        const appointment = await (0, appointment_service_js_1.bookAppointmentFromOrderService)({
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
    }
    catch (error) {
        return res.status(400).json({
            status: 'error',
            message: error.message || 'Lỗi khi đặt lịch khám từ gói khám',
        });
    }
};
exports.bookFromOrderAPI = bookFromOrderAPI;
// ============================================================
// USER: Lịch sử lịch hẹn
// ============================================================
/**
 * GET /api/v1/appointments
 * Lấy danh sách lịch sử lịch hẹn của người dùng hiện tại
 * Query params: ?page=1&pageSize=5&status=PENDING
 */
const getAppointmentsAPI = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Vui lòng đăng nhập để xem lịch sử lịch hẹn',
            });
        }
        const { page, status } = req.query;
        const data = await (0, appointment_service_js_1.getAppointmentsByUserService)(Number(userId), {
            page: page ? Number(page) : undefined,
            status: status ? String(status) : undefined,
        });
        return res.status(200).json({
            status: 'success',
            message: 'Lấy danh sách lịch hẹn thành công',
            data,
        });
    }
    catch (error) {
        return res.status(500).json({
            status: 'error',
            message: error.message || 'Lỗi hệ thống khi lấy danh sách lịch hẹn',
        });
    }
};
exports.getAppointmentsAPI = getAppointmentsAPI;
/**
 * GET /api/v1/appointments/:id
 * Lấy thông tin chi tiết một lịch hẹn của người dùng hiện tại
 */
const getAppointmentDetailAPI = async (req, res) => {
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
        const data = await (0, appointment_service_js_1.getAppointmentDetailService)(appointmentId, {
            userId: Number(userId),
            role: constant_js_1.RoleType.USER,
        });
        return res.status(200).json({
            status: 'success',
            message: 'Lấy chi tiết lịch hẹn thành công',
            data,
        });
    }
    catch (error) {
        const statusCode = error.message?.includes('Không tìm thấy') ? 404 : 400;
        return res.status(statusCode).json({
            status: 'error',
            message: error.message || 'Lỗi hệ thống khi lấy chi tiết lịch hẹn',
        });
    }
};
exports.getAppointmentDetailAPI = getAppointmentDetailAPI;
// ============================================================
// USER: Hủy lịch hẹn
// ============================================================
/**
 * DELETE /api/v1/appointments/:id
 * Bệnh nhân tự hủy lịch hẹn của mình (chỉ khi đang ở trạng thái PENDING)
 */
const cancelAppointmentAPI = async (req, res) => {
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
        const data = await (0, appointment_service_js_1.cancelAppointmentByUserService)(Number(userId), appointmentId);
        return res.status(200).json({
            status: 'success',
            message: 'Hủy lịch hẹn thành công',
            data,
        });
    }
    catch (error) {
        const statusCode = error.message?.includes('Không tìm thấy') ? 404 : 400;
        return res.status(statusCode).json({
            status: 'error',
            message: error.message || 'Lỗi khi hủy lịch hẹn',
        });
    }
};
exports.cancelAppointmentAPI = cancelAppointmentAPI;
// ============================================================
// DOCTOR: Xem danh sách lịch hẹn
// ============================================================
/**
 * GET /api/v1/doctor/appointments
 * Bác sĩ xem danh sách lịch hẹn của bản thân
 * Query params: ?page=1&pageSize=10&status=CONFIRMED&from_date=2026-09-01&to_date=2026-09-30&search=keyword
 */
const getDoctorAppointmentsAPI = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Vui lòng đăng nhập',
            });
        }
        // Lấy doctor_id từ user_id
        const doctor = await client_js_1.prisma.doctor.findUnique({
            where: { user_id: Number(userId) },
        });
        if (!doctor) {
            return res.status(403).json({
                status: 'error',
                message: 'Tài khoản của bạn không phải là bác sĩ.',
            });
        }
        const { page, status, from_date, to_date, search } = req.query;
        const data = await (0, appointment_service_js_1.getAppointmentsByDoctorService)(doctor.id, {
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
    }
    catch (error) {
        return res.status(500).json({
            status: 'error',
            message: error.message || 'Lỗi hệ thống khi lấy danh sách lịch hẹn',
        });
    }
};
exports.getDoctorAppointmentsAPI = getDoctorAppointmentsAPI;
/**
 * GET /api/v1/doctor/appointments/:id
 * Bác sĩ xem chi tiết một lịch hẹn thuộc ca trực của mình
 */
const getDoctorAppointmentDetailAPI = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Vui lòng đăng nhập',
            });
        }
        const doctor = await client_js_1.prisma.doctor.findUnique({
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
        const data = await (0, appointment_service_js_1.getAppointmentDetailService)(appointmentId, {
            doctorId: doctor.id,
            role: constant_js_1.RoleType.DOCTOR,
        });
        return res.status(200).json({
            status: 'success',
            message: 'Lấy chi tiết lịch hẹn thành công',
            data,
        });
    }
    catch (error) {
        const statusCode = error.message?.includes('Không tìm thấy') ? 404 : 400;
        return res.status(statusCode).json({
            status: 'error',
            message: error.message || 'Lỗi hệ thống khi lấy chi tiết lịch hẹn',
        });
    }
};
exports.getDoctorAppointmentDetailAPI = getDoctorAppointmentDetailAPI;
// ============================================================
// DOCTOR: Hủy lịch hẹn
// ============================================================
/**
 * DELETE /api/v1/doctor/appointments/:id
 * Bác sĩ hủy lịch hẹn thuộc ca trực của mình
 * Body hoặc Query (tùy chọn): { cancel_reason?: string }
 */
const cancelDoctorAppointmentAPI = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Vui lòng đăng nhập',
            });
        }
        const doctor = await client_js_1.prisma.doctor.findUnique({
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
        const data = await (0, appointment_service_js_1.cancelAppointmentByDoctorOrAdminService)(appointmentId, 'DOCTOR', doctor.id);
        return res.status(200).json({
            status: 'success',
            message: 'Hủy lịch hẹn thành công',
            data,
        });
    }
    catch (error) {
        const statusCode = error.message?.includes('Không tìm thấy') ? 404 : 400;
        return res.status(statusCode).json({
            status: 'error',
            message: error.message || 'Lỗi khi hủy lịch hẹn',
        });
    }
};
exports.cancelDoctorAppointmentAPI = cancelDoctorAppointmentAPI;
// ============================================================
// DOCTOR: Cập nhật trạng thái lịch hẹn
// ============================================================
/**
 * PUT /api/v1/doctor/appointments/:id/status
 * Bác sĩ cập nhật trạng thái lịch hẹn theo tiến trình khám (PENDING → CONFIRMED → COMPLETED / NO_SHOW)
 * Body: { status: string }
 */
const updateDoctorAppointmentStatusAPI = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Vui lòng đăng nhập',
            });
        }
        const doctor = await client_js_1.prisma.doctor.findUnique({
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
        const data = await (0, appointment_service_js_1.updateAppointmentStatusService)(appointmentId, String(status), 'DOCTOR', doctor.id);
        return res.status(200).json({
            status: 'success',
            message: 'Cập nhật trạng thái lịch hẹn thành công',
            data,
        });
    }
    catch (error) {
        const statusCode = error.message?.includes('Không tìm thấy') ? 404 : 400;
        return res.status(statusCode).json({
            status: 'error',
            message: error.message || 'Lỗi khi cập nhật trạng thái lịch hẹn',
        });
    }
};
exports.updateDoctorAppointmentStatusAPI = updateDoctorAppointmentStatusAPI;
// ============================================================
// ADMIN: Xem danh sách tất cả lịch hẹn
// ============================================================
/**
 * GET /api/v1/admin/appointments
 * Admin xem danh sách tất cả lịch hẹn trên hệ thống
 * Query params: ?page=1&pageSize=10&status=PENDING&from_date=2026-09-01&to_date=2026-09-30&search=keyword&doctor_id=1
 */
const getAdminAppointmentsAPI = async (req, res) => {
    try {
        const { page, status, from_date, to_date, search, doctor_id } = req.query;
        const data = await (0, appointment_service_js_1.getAllAppointmentsAdminService)({
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
    }
    catch (error) {
        return res.status(500).json({
            status: 'error',
            message: error.message || 'Lỗi hệ thống khi lấy danh sách lịch hẹn',
        });
    }
};
exports.getAdminAppointmentsAPI = getAdminAppointmentsAPI;
/**
 * GET /api/v1/admin/appointments/:id
 * Admin xem chi tiết bất kỳ lịch hẹn nào trên hệ thống
 */
const getAdminAppointmentDetailAPI = async (req, res) => {
    try {
        const appointmentId = Number(req.params.id);
        if (!appointmentId || isNaN(appointmentId)) {
            return res.status(400).json({
                status: 'error',
                message: 'ID lịch hẹn không hợp lệ',
            });
        }
        const data = await (0, appointment_service_js_1.getAppointmentDetailService)(appointmentId, {
            role: constant_js_1.RoleType.ADMIN,
        });
        return res.status(200).json({
            status: 'success',
            message: 'Lấy chi tiết lịch hẹn thành công',
            data,
        });
    }
    catch (error) {
        const statusCode = error.message?.includes('Không tìm thấy') ? 404 : 400;
        return res.status(statusCode).json({
            status: 'error',
            message: error.message || 'Lỗi hệ thống khi lấy chi tiết lịch hẹn',
        });
    }
};
exports.getAdminAppointmentDetailAPI = getAdminAppointmentDetailAPI;
// ============================================================
// ADMIN: Hủy lịch hẹn
// ============================================================
/**
 * DELETE /api/v1/admin/appointments/:id
 * Admin hủy bất kỳ lịch hẹn nào trên hệ thống
 * Body hoặc Query (tùy chọn): { cancel_reason?: string }
 */
const cancelAdminAppointmentAPI = async (req, res) => {
    try {
        const appointmentId = Number(req.params.id);
        if (!appointmentId || isNaN(appointmentId)) {
            return res.status(400).json({
                status: 'error',
                message: 'ID lịch hẹn không hợp lệ',
            });
        }
        const data = await (0, appointment_service_js_1.cancelAppointmentByDoctorOrAdminService)(appointmentId, 'ADMIN');
        return res.status(200).json({
            status: 'success',
            message: 'Hủy lịch hẹn thành công',
            data,
        });
    }
    catch (error) {
        const statusCode = error.message?.includes('Không tìm thấy') ? 404 : 400;
        return res.status(statusCode).json({
            status: 'error',
            message: error.message || 'Lỗi khi hủy lịch hẹn',
        });
    }
};
exports.cancelAdminAppointmentAPI = cancelAdminAppointmentAPI;
// ============================================================
// ADMIN: Cập nhật trạng thái lịch hẹn
// ============================================================
/**
 * PUT /api/v1/admin/appointments/:id/status
 * Admin cập nhật trạng thái bất kỳ lịch hẹn nào
 * Body: { status: string }
 */
const updateAdminAppointmentStatusAPI = async (req, res) => {
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
        const data = await (0, appointment_service_js_1.updateAppointmentStatusService)(appointmentId, String(status), 'ADMIN');
        return res.status(200).json({
            status: 'success',
            message: 'Cập nhật trạng thái lịch hẹn thành công',
            data,
        });
    }
    catch (error) {
        const statusCode = error.message?.includes('Không tìm thấy') ? 404 : 400;
        return res.status(statusCode).json({
            status: 'error',
            message: error.message || 'Lỗi khi cập nhật trạng thái lịch hẹn',
        });
    }
};
exports.updateAdminAppointmentStatusAPI = updateAdminAppointmentStatusAPI;
