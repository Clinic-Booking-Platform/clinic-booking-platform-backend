"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePrescriptionItemAPI = exports.updatePrescriptionAPI = exports.createPrescriptionAPI = exports.getAdminPrescriptionAPI = exports.getDoctorPrescriptionAPI = exports.getUserPrescriptionAPI = void 0;
const client_js_1 = require("../../config/client.js");
const constant_js_1 = require("../../config/constant.js");
const prescription_service_js_1 = require("../../services/prescription/prescription.service.js");
const CreatePrescription_Schema_js_1 = require("../../model/Schema/Prescription/CreatePrescription_Schema.js");
const UpdatePrescription_Schema_js_1 = require("../../model/Schema/Prescription/UpdatePrescription_Schema.js");
// ============================================================
// USER: Xem đơn thuốc theo hồ sơ bệnh án
// ============================================================
/**
 * GET /prescriptions/medical-record/:medicalRecordId
 * Bệnh nhân xem đơn thuốc theo hồ sơ bệnh án của mình
 */
const getUserPrescriptionAPI = async (req, res) => {
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
        const data = await (0, prescription_service_js_1.getPrescriptionByMedicalRecordService)(medicalRecordId, {
            userId: Number(userId),
            role: constant_js_1.RoleType.USER,
        });
        return res.status(200).json({
            status: 'success',
            message: 'Lấy đơn thuốc thành công',
            data,
        });
    }
    catch (error) {
        const statusCode = error.message?.includes('Không tìm thấy') ? 404 : 400;
        return res.status(statusCode).json({
            status: 'error',
            message: error.message || 'Lỗi hệ thống khi lấy đơn thuốc',
        });
    }
};
exports.getUserPrescriptionAPI = getUserPrescriptionAPI;
// ============================================================
// DOCTOR: Xem đơn thuốc theo hồ sơ bệnh án
// ============================================================
/**
 * GET /doctor/prescriptions/medical-record/:medicalRecordId
 * Bác sĩ xem đơn thuốc theo hồ sơ bệnh án ca trực của mình
 */
const getDoctorPrescriptionAPI = async (req, res) => {
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
        const medicalRecordId = Number(req.params.medicalRecordId);
        if (!medicalRecordId || isNaN(medicalRecordId)) {
            return res.status(400).json({
                status: 'error',
                message: 'ID hồ sơ bệnh án không hợp lệ',
            });
        }
        const data = await (0, prescription_service_js_1.getPrescriptionByMedicalRecordService)(medicalRecordId, {
            doctorId: doctor.id,
            role: constant_js_1.RoleType.DOCTOR,
        });
        return res.status(200).json({
            status: 'success',
            message: 'Lấy đơn thuốc thành công',
            data,
        });
    }
    catch (error) {
        const statusCode = error.message?.includes('Không tìm thấy') ? 404 : 400;
        return res.status(statusCode).json({
            status: 'error',
            message: error.message || 'Lỗi hệ thống khi lấy đơn thuốc',
        });
    }
};
exports.getDoctorPrescriptionAPI = getDoctorPrescriptionAPI;
// ============================================================
// ADMIN: Xem đơn thuốc theo hồ sơ bệnh án
// ============================================================
/**
 * GET /admin/prescriptions/medical-record/:medicalRecordId
 * Admin xem đơn thuốc theo bất kỳ hồ sơ bệnh án nào
 */
const getAdminPrescriptionAPI = async (req, res) => {
    try {
        const medicalRecordId = Number(req.params.medicalRecordId);
        if (!medicalRecordId || isNaN(medicalRecordId)) {
            return res.status(400).json({
                status: 'error',
                message: 'ID hồ sơ bệnh án không hợp lệ',
            });
        }
        const data = await (0, prescription_service_js_1.getPrescriptionByMedicalRecordService)(medicalRecordId, {
            role: constant_js_1.RoleType.ADMIN,
        });
        return res.status(200).json({
            status: 'success',
            message: 'Lấy đơn thuốc thành công',
            data,
        });
    }
    catch (error) {
        const statusCode = error.message?.includes('Không tìm thấy') ? 404 : 400;
        return res.status(statusCode).json({
            status: 'error',
            message: error.message || 'Lỗi hệ thống khi lấy đơn thuốc',
        });
    }
};
exports.getAdminPrescriptionAPI = getAdminPrescriptionAPI;
// ============================================================
// DOCTOR: Kê đơn thuốc
// ============================================================
/**
 * POST /doctor/prescriptions/medical-record/:medicalRecordId
 * Bác sĩ kê đơn thuốc (thêm các loại thuốc vào bệnh án)
 * Body: { items: [ { medicine_name, dosage, quantity, unit, instructions? } ] }
 */
const createPrescriptionAPI = async (req, res) => {
    try {
        const parsed = await CreatePrescription_Schema_js_1.CreatePrescriptionSchema.safeParseAsync(req.body);
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
        const medicalRecordId = Number(req.params.medicalRecordId);
        if (!medicalRecordId || isNaN(medicalRecordId)) {
            return res.status(400).json({
                status: 'error',
                message: 'ID hồ sơ bệnh án không hợp lệ',
            });
        }
        const data = await (0, prescription_service_js_1.createPrescriptionService)(doctor.id, medicalRecordId, parsed.data);
        return res.status(201).json({
            status: 'success',
            message: 'Kê đơn thuốc thành công',
            data,
        });
    }
    catch (error) {
        const statusCode = error.message?.includes('Không tìm thấy') ? 404 : 400;
        return res.status(statusCode).json({
            status: 'error',
            message: error.message || 'Lỗi khi kê đơn thuốc',
        });
    }
};
exports.createPrescriptionAPI = createPrescriptionAPI;
// ============================================================
// DOCTOR: Điều chỉnh đơn thuốc
// ============================================================
/**
 * PUT /doctor/prescriptions/medical-record/:medicalRecordId
 * Bác sĩ điều chỉnh đơn thuốc (cập nhật lại toàn bộ danh sách thuốc)
 * Body: { items: [ { medicine_name, dosage, quantity, unit, instructions? } ] }
 */
const updatePrescriptionAPI = async (req, res) => {
    try {
        const parsed = await UpdatePrescription_Schema_js_1.UpdatePrescriptionSchema.safeParseAsync(req.body);
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
        const medicalRecordId = Number(req.params.medicalRecordId);
        if (!medicalRecordId || isNaN(medicalRecordId)) {
            return res.status(400).json({
                status: 'error',
                message: 'ID hồ sơ bệnh án không hợp lệ',
            });
        }
        const data = await (0, prescription_service_js_1.updatePrescriptionService)(doctor.id, medicalRecordId, parsed.data);
        return res.status(200).json({
            status: 'success',
            message: 'Cập nhật đơn thuốc thành công',
            data,
        });
    }
    catch (error) {
        const statusCode = error.message?.includes('Không tìm thấy') ? 404 : 400;
        return res.status(statusCode).json({
            status: 'error',
            message: error.message || 'Lỗi khi điều chỉnh đơn thuốc',
        });
    }
};
exports.updatePrescriptionAPI = updatePrescriptionAPI;
// ============================================================
// DOCTOR: Xóa một loại thuốc khỏi đơn thuốc
// ============================================================
/**
 * DELETE /doctor/prescriptions/:itemId
 * Bác sĩ xóa một loại thuốc trong đơn
 */
const deletePrescriptionItemAPI = async (req, res) => {
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
        const itemId = Number(req.params.itemId);
        if (!itemId || isNaN(itemId)) {
            return res.status(400).json({
                status: 'error',
                message: 'ID thuốc không hợp lệ',
            });
        }
        const data = await (0, prescription_service_js_1.deletePrescriptionItemService)(doctor.id, itemId);
        return res.status(200).json({
            status: 'success',
            message: 'Xóa thuốc khỏi đơn thành công',
            data,
        });
    }
    catch (error) {
        const statusCode = error.message?.includes('Không tìm thấy') ? 404 : 400;
        return res.status(statusCode).json({
            status: 'error',
            message: error.message || 'Lỗi khi xóa thuốc khỏi đơn',
        });
    }
};
exports.deletePrescriptionItemAPI = deletePrescriptionItemAPI;
