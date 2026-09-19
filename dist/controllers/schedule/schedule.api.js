"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteScheduleAPI = exports.updateScheduleAPI = exports.bulkCreateScheduleAPI = exports.createScheduleAPI = exports.getScheduleDetailAPI = exports.getSchedulesAPI = void 0;
const schedule_service_js_1 = require("../../services/schedule/schedule.service.js");
const CreateSchedule_Schema_js_1 = require("../../model/Schema/Schedule/CreateSchedule_Schema.js");
const UpdateSchedule_Schema_js_1 = require("../../model/Schema/Schedule/UpdateSchedule_Schema.js");
const constant_js_1 = require("../../config/constant.js");
const client_js_1 = require("../../config/client.js");
/**
 * GET /schedules | /doctor/schedules | /admin/schedules
 * Lấy danh sách lịch làm việc
 * - User: chỉ lấy lịch AVAILABLE (lịch trống để đặt lịch)
 * - Doctor: lấy lịch của chính mình (mọi trạng thái)
 * - Admin: lấy tất cả (mọi trạng thái)
 * Query params: page, doctor_id, date, from_date, to_date, status
 */
const getSchedulesAPI = async (req, res) => {
    try {
        const { page, doctor_id, date, from_date, to_date, status } = req.query;
        const role = req.user?.role;
        // Bệnh nhân / Khách hàng: bắt buộc phải chọn bác sĩ để xem lịch trống
        if (role !== constant_js_1.RoleType.ADMIN && role !== constant_js_1.RoleType.DOCTOR) {
            if (!doctor_id || isNaN(Number(doctor_id))) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Vui lòng chọn bác sĩ (doctor_id) để xem lịch làm việc còn trống',
                });
            }
        }
        // Xác định filter status theo role
        let filterStatus;
        if (role === constant_js_1.RoleType.ADMIN) {
            filterStatus = status || 'all';
        }
        else if (role === constant_js_1.RoleType.DOCTOR) {
            filterStatus = status || 'all';
        }
        else {
            // User: luôn chỉ lấy lịch trống để đặt lịch
            filterStatus = 'AVAILABLE';
        }
        // Doctor: lấy doctor_id truyền vào, nếu không truyền thì tự động lấy theo tài khoản đăng nhập
        let filterDoctorId = doctor_id ? Number(doctor_id) : undefined;
        if (role === constant_js_1.RoleType.DOCTOR && !filterDoctorId) {
            const doctor = await client_js_1.prisma.doctor.findUnique({
                where: { user_id: req.user?.id },
                select: { id: true },
            });
            if (doctor) {
                filterDoctorId = doctor.id;
            }
        }
        // Đối với User nếu không truyền ngày cụ thể hoặc from_date thì mặc định lấy từ ngày hiện tại theo giờ Việt Nam (UTC+7)
        let fromDate = from_date ? String(from_date) : undefined;
        if (role !== constant_js_1.RoleType.ADMIN && role !== constant_js_1.RoleType.DOCTOR && !date && !from_date) {
            fromDate = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' });
        }
        const data = await (0, schedule_service_js_1.getSchedulesService)({
            page: page ? Number(page) : 1,
            doctor_id: filterDoctorId,
            date: date ? String(date) : undefined,
            from_date: fromDate,
            to_date: to_date ? String(to_date) : undefined,
            status: filterStatus,
        });
        return res.status(200).json({
            status: 'success',
            message: 'Lấy danh sách lịch làm việc thành công',
            data,
        });
    }
    catch (error) {
        return res.status(500).json({
            status: 'error',
            message: error.message || 'Lỗi hệ thống khi lấy danh sách lịch làm việc',
        });
    }
};
exports.getSchedulesAPI = getSchedulesAPI;
/**
 * GET /schedules/:id | /doctor/schedules/:id | /admin/schedules/:id
 * Xem chi tiết 1 ca làm việc
 */
const getScheduleDetailAPI = async (req, res) => {
    try {
        const scheduleId = Number(req.params.id);
        if (!scheduleId || isNaN(scheduleId)) {
            return res.status(400).json({
                status: 'error',
                message: 'ID ca làm việc không hợp lệ',
            });
        }
        const data = await (0, schedule_service_js_1.getScheduleByIdService)(scheduleId);
        return res.status(200).json({
            status: 'success',
            message: 'Lấy thông tin ca làm việc thành công',
            data,
        });
    }
    catch (error) {
        return res.status(404).json({
            status: 'error',
            message: error.message || 'Không tìm thấy ca làm việc',
        });
    }
};
exports.getScheduleDetailAPI = getScheduleDetailAPI;
/**
 * POST /doctor/schedules | /admin/schedules
 * Tạo 1 ca làm việc
 * - Doctor: doctor_id tự động lấy từ token
 * - Admin: phải truyền doctor_id
 */
const createScheduleAPI = async (req, res) => {
    try {
        const parsed = await CreateSchedule_Schema_js_1.CreateScheduleSchema.safeParseAsync(req.body);
        if (!parsed.success) {
            const errors = parsed.error.issues.map((i) => `${i.message} (${i.path[0]?.toString()})`);
            return res.status(400).json({
                status: 'error',
                message: errors,
            });
        }
        const data = parsed.data;
        const role = req.user?.role;
        // Doctor: nếu không truyền doctor_id thì tự động lấy theo tài khoản đăng nhập
        if (role === constant_js_1.RoleType.DOCTOR) {
            if (!data.doctor_id) {
                const doctor = await client_js_1.prisma.doctor.findUnique({
                    where: { user_id: req.user?.id },
                    select: { id: true },
                });
                if (!doctor) {
                    return res.status(403).json({
                        status: 'error',
                        message: 'Không tìm thấy hồ sơ bác sĩ của bạn. Vui lòng truyền doctor_id.',
                    });
                }
                data.doctor_id = doctor.id;
            }
        }
        else if (role === constant_js_1.RoleType.ADMIN) {
            if (!data.doctor_id) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Vui lòng truyền doctor_id khi Admin tạo ca làm việc',
                });
            }
        }
        const schedule = await (0, schedule_service_js_1.createScheduleService)(data);
        return res.status(201).json({
            status: 'success',
            message: 'Tạo ca làm việc thành công',
            data: schedule,
        });
    }
    catch (error) {
        return res.status(400).json({
            status: 'error',
            message: error.message || 'Lỗi khi tạo ca làm việc',
        });
    }
};
exports.createScheduleAPI = createScheduleAPI;
/**
 * POST /doctor/schedules/bulk | /admin/schedules/bulk
 * Tạo nhiều ca làm việc cùng lúc
 * - Doctor: doctor_id tự động lấy từ token (hoặc truyền trực tiếp)
 * - Admin: phải truyền doctor_id
 */
const bulkCreateScheduleAPI = async (req, res) => {
    try {
        const parsed = await CreateSchedule_Schema_js_1.BulkCreateScheduleSchema.safeParseAsync(req.body);
        if (!parsed.success) {
            const errors = parsed.error.issues.map((i) => `${i.message} (${i.path[0]?.toString()})`);
            return res.status(400).json({
                status: 'error',
                message: errors,
            });
        }
        const data = parsed.data;
        const role = req.user?.role;
        // Doctor: nếu không truyền doctor_id thì tự động lấy theo tài khoản đăng nhập
        if (role === constant_js_1.RoleType.DOCTOR) {
            if (!data.doctor_id) {
                const doctor = await client_js_1.prisma.doctor.findUnique({
                    where: { user_id: req.user?.id },
                    select: { id: true },
                });
                if (!doctor) {
                    return res.status(403).json({
                        status: 'error',
                        message: 'Không tìm thấy hồ sơ bác sĩ của bạn. Vui lòng truyền doctor_id.',
                    });
                }
                data.doctor_id = doctor.id;
            }
        }
        else if (role === constant_js_1.RoleType.ADMIN) {
            if (!data.doctor_id) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Vui lòng truyền doctor_id khi Admin tạo lịch làm việc',
                });
            }
        }
        const result = await (0, schedule_service_js_1.bulkCreateScheduleService)(data);
        const createdCount = result.created.length;
        const skippedCount = result.skipped.length;
        return res.status(201).json({
            status: 'success',
            message: `Tạo lịch làm việc thành công (${createdCount} ca mới, ${skippedCount} ca đã tồn tại bị bỏ qua)`,
            data: result,
        });
    }
    catch (error) {
        return res.status(400).json({
            status: 'error',
            message: error.message || 'Lỗi khi tạo lịch làm việc',
        });
    }
};
exports.bulkCreateScheduleAPI = bulkCreateScheduleAPI;
/**
 * PUT /doctor/schedules/:id | /admin/schedules/:id
 * Cập nhật ca làm việc (max_number, status)
 * - Doctor: chỉ cập nhật ca của chính mình
 * - Admin: cập nhật được tất cả
 */
const updateScheduleAPI = async (req, res) => {
    try {
        const scheduleId = Number(req.params.id);
        if (!scheduleId || isNaN(scheduleId)) {
            return res.status(400).json({
                status: 'error',
                message: 'ID ca làm việc không hợp lệ',
            });
        }
        const parsed = await UpdateSchedule_Schema_js_1.UpdateScheduleSchema.safeParseAsync(req.body);
        if (!parsed.success) {
            const errors = parsed.error.issues.map((i) => `${i.message} (${i.path[0]?.toString()})`);
            return res.status(400).json({
                status: 'error',
                message: errors,
            });
        }
        const role = req.user?.role;
        let requestDoctorId;
        // Doctor: truyền doctor_id để kiểm tra ownership
        if (role === constant_js_1.RoleType.DOCTOR) {
            const doctor = await client_js_1.prisma.doctor.findUnique({
                where: { user_id: req.user?.id },
                select: { id: true },
            });
            requestDoctorId = doctor?.id;
        }
        // Admin: không truyền requestDoctorId → bỏ qua ownership check
        const updated = await (0, schedule_service_js_1.updateScheduleService)(scheduleId, parsed.data, requestDoctorId);
        return res.status(200).json({
            status: 'success',
            message: 'Cập nhật ca làm việc thành công',
            data: updated,
        });
    }
    catch (error) {
        return res.status(400).json({
            status: 'error',
            message: error.message || 'Lỗi khi cập nhật ca làm việc',
        });
    }
};
exports.updateScheduleAPI = updateScheduleAPI;
/**
 * DELETE /admin/schedules/:id
 * Xóa cứng ca làm việc (chỉ Admin)
 */
const deleteScheduleAPI = async (req, res) => {
    try {
        const scheduleId = Number(req.params.id || req.body.id || req.query.id);
        if (!scheduleId || isNaN(scheduleId)) {
            return res.status(400).json({
                status: 'error',
                message: 'ID ca làm việc không hợp lệ',
            });
        }
        await (0, schedule_service_js_1.deleteScheduleService)(scheduleId);
        return res.status(200).json({
            status: 'success',
            message: 'Xóa ca làm việc thành công',
        });
    }
    catch (error) {
        return res.status(400).json({
            status: 'error',
            message: error.message || 'Lỗi khi xóa ca làm việc',
        });
    }
};
exports.deleteScheduleAPI = deleteScheduleAPI;
