"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminMedicalRecordDetailAPI = exports.getAdminMedicalRecordsAPI = exports.getUserMedicalRecordDetailAPI = exports.getUserMedicalRecordsAPI = exports.getDoctorMedicalRecordDetailAPI = exports.getDoctorMedicalRecordsAPI = exports.signMedicalRecordAPI = exports.updateMedicalRecordAPI = exports.createMedicalRecordAPI = void 0;
const medical_record_service_js_1 = require("../../services/medical-record/medical-record.service.js");
const CreateMedicalRecord_Schema_js_1 = require("../../model/Schema/MedicalRecord/CreateMedicalRecord_Schema.js");
const UpdateMedicalRecord_Schema_js_1 = require("../../model/Schema/MedicalRecord/UpdateMedicalRecord_Schema.js");
const client_js_1 = require("../../config/client.js");
const constant_js_1 = require("../../config/constant.js");
// ============================================================
// DOCTOR: Tạo hồ sơ bệnh án
// ============================================================
/**
 * POST /api/v1/doctor/medical-records
 * Bác sĩ tạo hồ sơ bệnh án cho lịch hẹn đã xác nhận (CONFIRMED)
 * Body: { appointment_id, diagnosis, symptoms?, clinical_examination?, ... , attachments?[] }
 */
const createMedicalRecordAPI = async (req, res) => {
    try {
        // Validate body
        const parsed = await CreateMedicalRecord_Schema_js_1.CreateMedicalRecordSchema.safeParseAsync(req.body);
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
        const data = await (0, medical_record_service_js_1.createMedicalRecordService)(doctor.id, parsed.data);
        return res.status(201).json({
            status: 'success',
            message: 'Tạo hồ sơ bệnh án thành công',
            data,
        });
    }
    catch (error) {
        const statusCode = error.message?.includes('Không tìm thấy') ? 404 : 400;
        return res.status(statusCode).json({
            status: 'error',
            message: error.message || 'Lỗi khi tạo hồ sơ bệnh án',
        });
    }
};
exports.createMedicalRecordAPI = createMedicalRecordAPI;
// ============================================================
// DOCTOR: Cập nhật hồ sơ bệnh án
// ============================================================
/**
 * PUT /api/v1/doctor/medical-records/:id
 * Bác sĩ cập nhật hồ sơ bệnh án (chỉ khi chưa ký - status = DRAFT)
 * Body: { diagnosis?, symptoms?, clinical_examination?, ... , attachments?[] }
 */
const updateMedicalRecordAPI = async (req, res) => {
    try {
        // Validate body
        const parsed = await UpdateMedicalRecord_Schema_js_1.UpdateMedicalRecordSchema.safeParseAsync(req.body);
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
        const doctor = await client_js_1.prisma.doctor.findUnique({
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
        const data = await (0, medical_record_service_js_1.updateMedicalRecordService)(doctor.id, recordId, parsed.data);
        return res.status(200).json({
            status: 'success',
            message: 'Cập nhật hồ sơ bệnh án thành công',
            data,
        });
    }
    catch (error) {
        const statusCode = error.message?.includes('Không tìm thấy') ? 404 : 400;
        return res.status(statusCode).json({
            status: 'error',
            message: error.message || 'Lỗi khi cập nhật hồ sơ bệnh án',
        });
    }
};
exports.updateMedicalRecordAPI = updateMedicalRecordAPI;
// ============================================================
// DOCTOR: Ký xác nhận & Đóng hồ sơ bệnh án
// ============================================================
/**
 * PUT /api/v1/doctor/medical-records/:id/sign
 * Bác sĩ ký xác nhận đóng hồ sơ bệnh án (DRAFT → SIGNED)
 * Sau khi ký, hồ sơ bệnh án KHÔNG THỂ chỉnh sửa
 */
const signMedicalRecordAPI = async (req, res) => {
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
        const recordId = Number(req.params.id);
        if (!recordId || isNaN(recordId)) {
            return res.status(400).json({
                status: 'error',
                message: 'ID hồ sơ bệnh án không hợp lệ',
            });
        }
        const data = await (0, medical_record_service_js_1.signMedicalRecordService)(doctor.id, recordId);
        return res.status(200).json({
            status: 'success',
            message: 'Ký xác nhận hồ sơ bệnh án thành công. Hồ sơ đã được đóng và không thể chỉnh sửa.',
            data,
        });
    }
    catch (error) {
        const statusCode = error.message?.includes('Không tìm thấy') ? 404 : 400;
        return res.status(statusCode).json({
            status: 'error',
            message: error.message || 'Lỗi khi ký xác nhận hồ sơ bệnh án',
        });
    }
};
exports.signMedicalRecordAPI = signMedicalRecordAPI;
// ============================================================
// DOCTOR: Danh sách hồ sơ bệnh án
// ============================================================
/**
 * GET /api/v1/doctor/medical-records
 * Bác sĩ xem danh sách hồ sơ bệnh án của mình
 * Query params: ?page=1&search=keyword&from_date=2026-09-01&to_date=2026-09-30
 */
const getDoctorMedicalRecordsAPI = async (req, res) => {
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
        const { page, search, from_date, to_date } = req.query;
        const data = await (0, medical_record_service_js_1.getMedicalRecordsByDoctorService)(doctor.id, {
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
    }
    catch (error) {
        return res.status(500).json({
            status: 'error',
            message: error.message || 'Lỗi hệ thống khi lấy danh sách hồ sơ bệnh án',
        });
    }
};
exports.getDoctorMedicalRecordsAPI = getDoctorMedicalRecordsAPI;
// ============================================================
// DOCTOR: Chi tiết hồ sơ bệnh án
// ============================================================
/**
 * GET /api/v1/doctor/medical-records/:id
 * Bác sĩ xem chi tiết hồ sơ bệnh án thuộc ca trực của mình
 */
const getDoctorMedicalRecordDetailAPI = async (req, res) => {
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
        const recordId = Number(req.params.id);
        if (!recordId || isNaN(recordId)) {
            return res.status(400).json({
                status: 'error',
                message: 'ID hồ sơ bệnh án không hợp lệ',
            });
        }
        const data = await (0, medical_record_service_js_1.getMedicalRecordDetailService)(recordId, {
            doctorId: doctor.id,
            role: constant_js_1.RoleType.DOCTOR,
        });
        return res.status(200).json({
            status: 'success',
            message: 'Lấy chi tiết hồ sơ bệnh án thành công',
            data,
        });
    }
    catch (error) {
        const statusCode = error.message?.includes('Không tìm thấy') ? 404 : 400;
        return res.status(statusCode).json({
            status: 'error',
            message: error.message || 'Lỗi hệ thống khi lấy chi tiết hồ sơ bệnh án',
        });
    }
};
exports.getDoctorMedicalRecordDetailAPI = getDoctorMedicalRecordDetailAPI;
// ============================================================
// USER: Danh sách hồ sơ bệnh án
// ============================================================
/**
 * GET /api/v1/medical-records
 * Bệnh nhân xem danh sách hồ sơ bệnh án của mình
 * Query params: ?page=1
 */
const getUserMedicalRecordsAPI = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Vui lòng đăng nhập để xem hồ sơ bệnh án',
            });
        }
        const { page } = req.query;
        const data = await (0, medical_record_service_js_1.getMedicalRecordsByUserService)(Number(userId), {
            page: page ? Number(page) : undefined,
        });
        return res.status(200).json({
            status: 'success',
            message: 'Lấy danh sách hồ sơ bệnh án thành công',
            data,
        });
    }
    catch (error) {
        return res.status(500).json({
            status: 'error',
            message: error.message || 'Lỗi hệ thống khi lấy danh sách hồ sơ bệnh án',
        });
    }
};
exports.getUserMedicalRecordsAPI = getUserMedicalRecordsAPI;
// ============================================================
// USER: Chi tiết hồ sơ bệnh án
// ============================================================
/**
 * GET /api/v1/medical-records/:id
 * Bệnh nhân xem chi tiết hồ sơ bệnh án của mình
 */
const getUserMedicalRecordDetailAPI = async (req, res) => {
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
        const data = await (0, medical_record_service_js_1.getMedicalRecordDetailService)(recordId, {
            userId: Number(userId),
            role: constant_js_1.RoleType.USER,
        });
        return res.status(200).json({
            status: 'success',
            message: 'Lấy chi tiết hồ sơ bệnh án thành công',
            data,
        });
    }
    catch (error) {
        const statusCode = error.message?.includes('Không tìm thấy') ? 404 : 400;
        return res.status(statusCode).json({
            status: 'error',
            message: error.message || 'Lỗi hệ thống khi lấy chi tiết hồ sơ bệnh án',
        });
    }
};
exports.getUserMedicalRecordDetailAPI = getUserMedicalRecordDetailAPI;
// ============================================================
// ADMIN: Danh sách tất cả hồ sơ bệnh án
// ============================================================
/**
 * GET /api/v1/admin/medical-records
 * Admin xem danh sách tất cả hồ sơ bệnh án trên hệ thống
 * Query params: ?page=1&search=keyword&from_date=2026-09-01&to_date=2026-09-30&doctor_id=1
 */
const getAdminMedicalRecordsAPI = async (req, res) => {
    try {
        const { page, search, from_date, to_date, doctor_id } = req.query;
        const data = await (0, medical_record_service_js_1.getAllMedicalRecordsAdminService)({
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
    }
    catch (error) {
        return res.status(500).json({
            status: 'error',
            message: error.message || 'Lỗi hệ thống khi lấy danh sách hồ sơ bệnh án',
        });
    }
};
exports.getAdminMedicalRecordsAPI = getAdminMedicalRecordsAPI;
// ============================================================
// ADMIN: Chi tiết hồ sơ bệnh án
// ============================================================
/**
 * GET /api/v1/admin/medical-records/:id
 * Admin xem chi tiết bất kỳ hồ sơ bệnh án nào trên hệ thống
 */
const getAdminMedicalRecordDetailAPI = async (req, res) => {
    try {
        const recordId = Number(req.params.id);
        if (!recordId || isNaN(recordId)) {
            return res.status(400).json({
                status: 'error',
                message: 'ID hồ sơ bệnh án không hợp lệ',
            });
        }
        const data = await (0, medical_record_service_js_1.getMedicalRecordDetailService)(recordId, {
            role: constant_js_1.RoleType.ADMIN,
        });
        return res.status(200).json({
            status: 'success',
            message: 'Lấy chi tiết hồ sơ bệnh án thành công',
            data,
        });
    }
    catch (error) {
        const statusCode = error.message?.includes('Không tìm thấy') ? 404 : 400;
        return res.status(statusCode).json({
            status: 'error',
            message: error.message || 'Lỗi hệ thống khi lấy chi tiết hồ sơ bệnh án',
        });
    }
};
exports.getAdminMedicalRecordDetailAPI = getAdminMedicalRecordDetailAPI;
