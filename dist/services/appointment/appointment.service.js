"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllAppointmentsAdminService = exports.updateAppointmentStatusService = exports.cancelAppointmentByDoctorOrAdminService = exports.getAppointmentsByDoctorService = exports.cancelAppointmentByUserService = exports.getAppointmentsByUserService = exports.getAppointmentDetailService = exports.appointmentDetailInclude = exports.bookAppointmentFromOrderService = exports.createAppointmentService = void 0;
const dayjs_1 = __importDefault(require("dayjs"));
const utc_js_1 = __importDefault(require("dayjs/plugin/utc.js"));
const timezone_js_1 = __importDefault(require("dayjs/plugin/timezone.js"));
const client_js_1 = require("../../config/client.js");
const constant_js_1 = require("../../config/constant.js");
const uuid_1 = require("uuid");
dayjs_1.default.extend(utc_js_1.default);
dayjs_1.default.extend(timezone_js_1.default);
/**
 * Đặt lịch khám Offline
 *
 * Nghiệp vụ:
 * 1. Kiểm tra bác sĩ tồn tại và chưa bị xóa mềm
 * 2. Kiểm tra ngày & giờ khám không phải quá khứ (dùng dayjs UTC+7)
 * 3. Kiểm tra bác sĩ có lịch làm việc (Schedule) vào ngày + ca đó và còn trống (Pessimistic Lock)
 * 4. Kiểm tra bệnh nhân không đặt trùng lịch (cùng bác sĩ, cùng ngày, cùng ca)
 * 5. Tạo Appointment với trạng thái PENDING
 */
const createAppointmentService = async (data) => {
    // 1. Kiểm tra ngày và giờ không phải trong quá khứ theo giờ Việt Nam (UTC+7)
    const nowVN = (0, dayjs_1.default)().tz('Asia/Ho_Chi_Minh');
    const todayVN = nowVN.format('YYYY-MM-DD');
    if (data.date < todayVN) {
        throw new Error('Không thể đặt lịch cho ngày trong quá khứ');
    }
    // Nếu đặt lịch cho ngày hôm nay, kiểm tra ca khám đã qua giờ bắt đầu chưa
    if (data.date === todayVN) {
        const timeSlot = constant_js_1.TimeTypeMap[data.time_type];
        if (timeSlot) {
            const currentTime = nowVN.format('HH:mm');
            if (currentTime >= timeSlot.startTime) {
                throw new Error(`Ca khám ${data.time_type} (${timeSlot.label}) đã qua giờ bắt đầu (${timeSlot.startTime}). Vui lòng chọn ca khám khác hoặc ngày tiếp theo.`);
            }
        }
    }
    const appointmentDate = new Date(`${data.date}T00:00:00.000Z`);
    // Thực hiện toàn bộ quy trình kiểm tra và tạo lịch trong 1 Transaction duy nhất
    return await client_js_1.prisma.$transaction(async (tx) => {
        // 1. Kiểm tra bác sĩ tồn tại và chưa bị xóa mềm
        const doctor = await tx.doctor.findUnique({
            where: { id: data.doctor_id },
            include: { user: { select: { full_name: true } } },
        });
        if (!doctor) {
            throw new Error('Bác sĩ không tồn tại');
        }
        if (doctor.deleted_at !== null) {
            throw new Error('Bác sĩ này hiện không hoạt động');
        }
        // 2. Tìm và KHÓA dòng ca làm việc bằng Pessimistic Lock (SELECT ... FOR UPDATE)
        // Khi 2 người cùng đặt chỗ cuối cùng, người thứ 2 sẽ bị giữ lại chờ người thứ 1 hoàn tất
        const schedules = await tx.$queryRaw `
            SELECT id, doctor_id, date, time_type, max_number, status 
            FROM schedules 
            WHERE doctor_id = ${data.doctor_id} 
              AND date = ${data.date} 
              AND time_type = ${data.time_type}
            LIMIT 1
            FOR UPDATE
        `;
        const schedule = schedules[0];
        if (!schedule) {
            throw new Error(`Bác sĩ ${doctor.user.full_name} không có lịch làm việc vào ngày ${data.date} - Ca ${data.time_type}`);
        }
        if (schedule.status !== constant_js_1.ScheduleStatus.AVAILABLE) {
            throw new Error(`Ca khám này hiện không khả dụng (Trạng thái: ${schedule.status})`);
        }
        const maxNumber = Number(schedule.max_number);
        const scheduleId = Number(schedule.id);
        // 3. Đếm số lịch hẹn đang hoạt động trong ca này (PENDING + CONFIRMED)
        const currentBookings = await tx.appointment.count({
            where: {
                doctor_id: data.doctor_id,
                date: appointmentDate,
                time_type: data.time_type,
                status: { in: [constant_js_1.AppointmentStatus.PENDING, constant_js_1.AppointmentStatus.CONFIRMED] },
                deleted_at: null,
            },
        });
        // Kiểm tra đã đạt giới hạn tối đa chưa
        if (currentBookings >= maxNumber) {
            throw new Error(`Ca khám này đã đạt giới hạn số lượng tối đa (${currentBookings}/${maxNumber} bệnh nhân). Vui lòng chọn ca khám hoặc ngày khác.`);
        }
        // 4. Kiểm tra bệnh nhân không đặt trùng lịch
        const existingAppointment = await tx.appointment.findFirst({
            where: {
                user_id: data.user_id,
                doctor_id: data.doctor_id,
                date: appointmentDate,
                time_type: data.time_type,
                status: { in: [constant_js_1.AppointmentStatus.PENDING, constant_js_1.AppointmentStatus.CONFIRMED] },
                deleted_at: null,
            },
        });
        if (existingAppointment) {
            throw new Error(`Bạn đã có lịch hẹn với bác sĩ ${doctor.user.full_name} vào ngày ${data.date} - Ca ${data.time_type}`);
        }
        // 5. Tạo Appointment
        await tx.appointment.create({
            data: {
                user_id: data.user_id,
                doctor_id: data.doctor_id,
                date: appointmentDate,
                time_type: data.time_type,
                appointment_type: 'OFFLINE',
                patient_name: data.patient_name,
                patient_phone: data.patient_phone,
                symptoms: data.symptoms || null,
                status: constant_js_1.AppointmentStatus.PENDING,
            },
            include: {
                doctor: {
                    select: {
                        id: true,
                        user: {
                            select: { full_name: true, avatar: true },
                        },
                        specialty: {
                            select: { id: true, name: true },
                        },
                        price: true,
                    },
                },
            },
        });
        // 6. Nếu ca khám này vừa chạm giới hạn tối đa, cập nhật status của schedule thành FULL
        if (currentBookings + 1 >= maxNumber) {
            await tx.schedule.update({
                where: { id: scheduleId },
                data: { status: constant_js_1.ScheduleStatus.FULL },
            });
        }
        return true;
    });
};
exports.createAppointmentService = createAppointmentService;
/**
 * Đặt lịch khám Online từ Gói khám đã mua (Order Detail)
 */
const bookAppointmentFromOrderService = async (data) => {
    const nowVN = (0, dayjs_1.default)().tz('Asia/Ho_Chi_Minh');
    const todayVN = nowVN.format('YYYY-MM-DD');
    if (data.date < todayVN) {
        throw new Error('Không thể đặt lịch cho ngày trong quá khứ');
    }
    if (data.date === todayVN) {
        const timeSlot = constant_js_1.TimeTypeMap[data.time_type];
        if (timeSlot) {
            const currentTime = nowVN.format('HH:mm');
            if (currentTime >= timeSlot.startTime) {
                throw new Error(`Ca khám ${data.time_type} (${timeSlot.label}) đã qua giờ bắt đầu (${timeSlot.startTime}). Vui lòng chọn ca khám khác hoặc ngày tiếp theo.`);
            }
        }
    }
    const appointmentDate = new Date(`${data.date}T00:00:00.000Z`);
    return await client_js_1.prisma.$transaction(async (tx) => {
        // 1. Lấy thông tin OrderDetail kèm Order
        const orderDetail = await tx.orderDetail.findUnique({
            where: { id: data.order_detail_id },
            include: { order: true, package: true },
        });
        if (!orderDetail) {
            throw new Error('Không tìm thấy gói khám này trong lịch sử mua hàng.');
        }
        // Kiểm tra đơn hàng đã bị hủy hoặc xóa mềm
        if (orderDetail.order.deleted_at !== null) {
            throw new Error('Đơn hàng này đã bị hủy hoặc không còn hiệu lực.');
        }
        // Kiểm tra gói khám còn hiệu lực hay đã bị xóa
        if (orderDetail.package.deleted_at !== null) {
            throw new Error('Gói khám này hiện đã ngừng cung cấp.');
        }
        if (orderDetail.order.user_id !== data.user_id) {
            throw new Error('Gói khám này không thuộc về bạn.');
        }
        if (orderDetail.order.payment_status !== constant_js_1.PaymentStatus.PAID) {
            throw new Error('Đơn hàng chứa gói khám này chưa được thanh toán thành công.');
        }
        // 2. Kiểm tra số lượng đã sử dụng (bao gồm các ca đang chờ, đã xác nhận và đã hoàn thành)
        const usedCount = await tx.appointment.count({
            where: {
                order_id: orderDetail.order_id,
                package_id: orderDetail.package_id,
                status: { in: [constant_js_1.AppointmentStatus.PENDING, constant_js_1.AppointmentStatus.CONFIRMED, constant_js_1.AppointmentStatus.COMPLETED] },
                deleted_at: null,
            },
        });
        if (usedCount >= orderDetail.quantity) {
            throw new Error(`Bạn đã sử dụng hết số lượng của gói khám này trong đơn hàng.`);
        }
        // 3. Kiểm tra bác sĩ và lịch trình (Tương tự đặt lịch offline)
        const doctor = await tx.doctor.findUnique({
            where: { id: data.doctor_id },
            include: { user: { select: { full_name: true } } },
        });
        if (!doctor || doctor.deleted_at !== null) {
            throw new Error('Bác sĩ không tồn tại hoặc hiện không hoạt động.');
        }
        const schedules = await tx.$queryRaw `
            SELECT id, doctor_id, date, time_type, max_number, status 
            FROM schedules 
            WHERE doctor_id = ${data.doctor_id} 
              AND date = ${data.date} 
              AND time_type = ${data.time_type}
            LIMIT 1
            FOR UPDATE
        `;
        const schedule = schedules[0];
        if (!schedule) {
            throw new Error(`Bác sĩ ${doctor.user.full_name} không có lịch làm việc vào ngày ${data.date} - Ca ${data.time_type}`);
        }
        if (schedule.status !== constant_js_1.ScheduleStatus.AVAILABLE) {
            throw new Error(`Ca khám này hiện không khả dụng.`);
        }
        const maxNumber = Number(schedule.max_number);
        const scheduleId = Number(schedule.id);
        const currentBookings = await tx.appointment.count({
            where: {
                doctor_id: data.doctor_id,
                date: appointmentDate,
                time_type: data.time_type,
                status: { in: [constant_js_1.AppointmentStatus.PENDING, constant_js_1.AppointmentStatus.CONFIRMED] },
                deleted_at: null,
            },
        });
        if (currentBookings >= maxNumber) {
            throw new Error(`Ca khám này đã đạt giới hạn số lượng tối đa. Vui lòng chọn ca khám hoặc ngày khác.`);
        }
        // Kiểm tra trùng lịch của user
        const existingAppointment = await tx.appointment.findFirst({
            where: {
                user_id: data.user_id,
                doctor_id: data.doctor_id,
                date: appointmentDate,
                time_type: data.time_type,
                status: { in: [constant_js_1.AppointmentStatus.PENDING, constant_js_1.AppointmentStatus.CONFIRMED] },
                deleted_at: null,
            },
        });
        if (existingAppointment) {
            throw new Error(`Bạn đã có lịch hẹn với bác sĩ ${doctor.user.full_name} vào ngày ${data.date} - Ca ${data.time_type}`);
        }
        // 4. Tạo Appointment
        const appointment = await tx.appointment.create({
            data: {
                user_id: data.user_id,
                doctor_id: data.doctor_id,
                order_id: orderDetail.order_id,
                package_id: orderDetail.package_id,
                date: appointmentDate,
                time_type: data.time_type,
                appointment_type: 'ONLINE', // Mua gói khám online
                patient_name: data.patient_name,
                patient_phone: data.patient_phone,
                symptoms: data.symptoms || null,
                status: constant_js_1.AppointmentStatus.PENDING, // Đã thanh toán nên confirmed luôn
            },
        });
        // 5. Sinh meeting link bảo mật và lưu
        const meetingLink = `https://meet.jit.si/ClinicBooking-Apt-${appointment.id}-${(0, uuid_1.v4)()}`;
        await tx.appointment.update({
            where: { id: appointment.id },
            data: { meeting_link: meetingLink }
        });
        // 6. Cập nhật Schedule nếu full
        if (currentBookings + 1 >= maxNumber) {
            await tx.schedule.update({
                where: { id: scheduleId },
                data: { status: constant_js_1.ScheduleStatus.FULL },
            });
        }
        return {
            ...appointment,
            meeting_link: meetingLink,
        };
    });
};
exports.bookAppointmentFromOrderService = bookAppointmentFromOrderService;
// ============================================================
// APPOINTMENT DETAIL INCLUDE – Dùng cho API xem chi tiết lịch hẹn
// ============================================================
exports.appointmentDetailInclude = {
    user: {
        select: {
            id: true,
            full_name: true,
            email: true,
            phone_number: true,
            avatar: true,
            gender: true,
            date_of_birth: true,
        },
    },
    doctor: {
        include: {
            user: {
                select: {
                    id: true,
                    full_name: true,
                    email: true,
                    phone_number: true,
                    avatar: true,
                },
            },
            specialty: {
                select: {
                    id: true,
                    name: true,
                    image_url: true,
                },
            },
        },
    },
    package: {
        select: {
            id: true,
            name: true,
            thumbnail_url: true,
            price: true,
            discount_price: true,
            description: true,
        },
    },
    order: {
        select: {
            id: true,
            order_code: true,
            total_price: true,
            payment_method: true,
            payment_status: true,
            created_at: true,
        },
    },
    medical_record: {
        include: {
            prescriptions: true,
            attachments: true,
        },
    },
};
/**
 * Lấy thông tin chi tiết một lịch hẹn (kèm đầy đủ thông tin quan hệ)
 * Phân quyền: User chỉ xem của mình, Doctor xem ca trực của mình, Admin xem tất cả
 */
const getAppointmentDetailService = async (appointmentId, options) => {
    const appointment = await client_js_1.prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: exports.appointmentDetailInclude,
    });
    if (!appointment) {
        throw new Error('Không tìm thấy lịch hẹn');
    }
    // Bệnh nhân chỉ xem được lịch hẹn của mình
    if (options?.role === constant_js_1.RoleType.USER && options.userId && appointment.user_id !== options.userId) {
        throw new Error('Lịch hẹn này không thuộc về bạn');
    }
    // Bác sĩ chỉ xem được lịch hẹn thuộc ca trực của mình
    if (options?.role === constant_js_1.RoleType.DOCTOR && options.doctorId && appointment.doctor_id !== options.doctorId) {
        throw new Error('Bạn không có quyền xem lịch hẹn này. Lịch hẹn không thuộc ca trực của bạn');
    }
    return appointment;
};
exports.getAppointmentDetailService = getAppointmentDetailService;
// ============================================================
// USER: Lịch sử lịch hẹn
// ============================================================
/**
 * Lấy danh sách lịch sử lịch hẹn của người dùng hiện tại (chỉ lấy thông tin lịch hẹn, không include)
 * Hỗ trợ phân trang và lọc theo trạng thái
 */
const getAppointmentsByUserService = async (userId, query) => {
    const page = Math.max(1, Number(query?.page || 1));
    const skip = (page - 1) * constant_js_1.pageSize;
    const where = {
        user_id: userId,
    };
    if (query?.status && query.status.toUpperCase() !== 'ALL') {
        where.status = query.status.toUpperCase();
    }
    const [total, appointments] = await client_js_1.prisma.$transaction([
        client_js_1.prisma.appointment.count({ where }),
        client_js_1.prisma.appointment.findMany({
            where,
            skip,
            take: constant_js_1.pageSize,
            orderBy: { date: 'desc' },
        }),
    ]);
    return {
        appointments,
        pagination: {
            total,
            page,
            pageSize: constant_js_1.pageSize,
            totalPages: Math.ceil(total / constant_js_1.pageSize),
        },
    };
};
exports.getAppointmentsByUserService = getAppointmentsByUserService;
// ============================================================
// USER: Hủy lịch hẹn
// ============================================================
/**
 * Bệnh nhân tự hủy lịch hẹn của mình
 *
 * Nghiệp vụ:
 * 1. Kiểm tra lịch hẹn thuộc về user
 * 2. Chỉ cho phép hủy khi chưa bị hủy và đang ở trạng thái PENDING hoặc CONFIRMED
 * 3. Phải hủy trước giờ khám ít nhất 2 giờ
 * 4. Cập nhật trạng thái thành CANCELLED và deleted_at = new Date() (giống như order)
 * 5. Nếu ca khám đang FULL, mở lại thành AVAILABLE
 */
const cancelAppointmentByUserService = async (userId, appointmentId) => {
    return await client_js_1.prisma.$transaction(async (tx) => {
        const appointment = await tx.appointment.findUnique({
            where: { id: appointmentId },
        });
        if (!appointment) {
            throw new Error('Không tìm thấy lịch hẹn.');
        }
        if (appointment.user_id !== userId) {
            throw new Error('Lịch hẹn này không thuộc về bạn.');
        }
        if (appointment.deleted_at !== null || appointment.status === constant_js_1.AppointmentStatus.CANCELLED) {
            throw new Error('Lịch hẹn này đã được hủy trước đó.');
        }
        // Chỉ cho phép bệnh nhân hủy khi lịch hẹn đang ở trạng thái PENDING (chờ duyệt).
        // Nếu Bác sĩ hoặc Admin đã chuyển trạng thái (CONFIRMED, COMPLETED,...) thì bệnh nhân không được tự hủy nữa.
        if (appointment.status !== constant_js_1.AppointmentStatus.PENDING) {
            throw new Error(`Không thể hủy lịch hẹn vì lịch hẹn đã được bác sĩ hoặc phòng khám tiếp nhận.`);
        }
        const now = new Date();
        // Cập nhật trạng thái thành CANCELLED và set deleted_at (giống như order)
        const updatedAppointment = await tx.appointment.update({
            where: { id: appointmentId },
            data: {
                status: constant_js_1.AppointmentStatus.CANCELLED,
                deleted_at: now,
            },
        });
        // Mở lại ca khám nếu đang FULL
        if (appointment.doctor_id) {
            const schedule = await tx.schedule.findFirst({
                where: {
                    doctor_id: appointment.doctor_id,
                    date: appointment.date,
                    time_type: appointment.time_type,
                    status: constant_js_1.ScheduleStatus.FULL,
                },
            });
            if (schedule) {
                await tx.schedule.update({
                    where: { id: schedule.id },
                    data: { status: constant_js_1.ScheduleStatus.AVAILABLE },
                });
            }
        }
        return {
            id: updatedAppointment.id,
            status: updatedAppointment.status,
            deleted_at: updatedAppointment.deleted_at,
            message: 'Hủy lịch hẹn thành công',
        };
    });
};
exports.cancelAppointmentByUserService = cancelAppointmentByUserService;
// ============================================================
// DOCTOR: Xem danh sách lịch hẹn của bản thân
// ============================================================
/**
 * Lấy danh sách lịch hẹn của bác sĩ hiện tại
 * Hỗ trợ phân trang, lọc theo trạng thái, khoảng ngày, tìm kiếm bệnh nhân
 */
const getAppointmentsByDoctorService = async (doctorId, query) => {
    const page = Math.max(1, Number(query?.page || 1));
    const skip = (page - 1) * constant_js_1.pageSize;
    const where = {
        doctor_id: doctorId,
    };
    // Lọc theo trạng thái
    if (query?.status && query.status.toUpperCase() !== 'ALL') {
        where.status = query.status.toUpperCase();
    }
    // Lọc theo khoảng ngày
    if (query?.from_date || query?.to_date) {
        where.date = {};
        if (query.from_date) {
            where.date.gte = new Date(`${query.from_date}T00:00:00.000Z`);
        }
        if (query.to_date) {
            where.date.lte = new Date(`${query.to_date}T23:59:59.999Z`);
        }
    }
    // Tìm kiếm theo tên hoặc SĐT bệnh nhân
    if (query?.search && query.search.trim() !== '') {
        const keyword = query.search.trim();
        where.OR = [
            { patient_name: { contains: keyword } },
            { patient_phone: { contains: keyword } },
        ];
    }
    const [total, appointments] = await client_js_1.prisma.$transaction([
        client_js_1.prisma.appointment.count({ where }),
        client_js_1.prisma.appointment.findMany({
            where,
            skip,
            take: constant_js_1.pageSize,
            orderBy: { date: 'desc' },
        }),
    ]);
    return {
        appointments,
        pagination: {
            total,
            page,
            pageSize: constant_js_1.pageSize,
            totalPages: Math.ceil(total / constant_js_1.pageSize),
        },
    };
};
exports.getAppointmentsByDoctorService = getAppointmentsByDoctorService;
// ============================================================
// DOCTOR / ADMIN: Hủy lịch hẹn
// ============================================================
/**
 * Bác sĩ hoặc Admin hủy lịch hẹn
 *
 * Nghiệp vụ:
 * - Bác sĩ chỉ được hủy lịch hẹn thuộc ca trực của mình
 * - Admin có toàn quyền hủy bất kỳ lịch hẹn nào
 * - Chỉ hủy được khi trạng thái PENDING hoặc CONFIRMED
 * - Cập nhật trạng thái thành CANCELLED và deleted_at = new Date() (giống như order)
 * - Mở lại slot ca khám nếu đang FULL
 */
const cancelAppointmentByDoctorOrAdminService = async (appointmentId, role, doctorId) => {
    return await client_js_1.prisma.$transaction(async (tx) => {
        const appointment = await tx.appointment.findUnique({
            where: { id: appointmentId },
        });
        if (!appointment) {
            throw new Error('Không tìm thấy lịch hẹn.');
        }
        // Bác sĩ chỉ được hủy lịch của mình
        if (role === 'DOCTOR' && appointment.doctor_id !== doctorId) {
            throw new Error('Bạn không có quyền hủy lịch hẹn này. Lịch hẹn không thuộc ca trực của bạn.');
        }
        if (appointment.deleted_at !== null || appointment.status === constant_js_1.AppointmentStatus.CANCELLED) {
            throw new Error('Lịch hẹn này đã được hủy trước đó.');
        }
        if (appointment.status !== constant_js_1.AppointmentStatus.PENDING &&
            appointment.status !== constant_js_1.AppointmentStatus.CONFIRMED) {
            throw new Error(`Không thể hủy lịch hẹn ở trạng thái "${appointment.status}". Chỉ có thể hủy khi đang ở trạng thái PENDING hoặc CONFIRMED.`);
        }
        const now = new Date();
        // Cập nhật trạng thái thành CANCELLED và set deleted_at
        const updatedAppointment = await tx.appointment.update({
            where: { id: appointmentId },
            data: {
                status: constant_js_1.AppointmentStatus.CANCELLED,
                deleted_at: now,
            },
        });
        // Mở lại ca khám nếu đang FULL
        if (appointment.doctor_id) {
            const schedule = await tx.schedule.findFirst({
                where: {
                    doctor_id: appointment.doctor_id,
                    date: appointment.date,
                    time_type: appointment.time_type,
                    status: constant_js_1.ScheduleStatus.FULL,
                },
            });
            if (schedule) {
                await tx.schedule.update({
                    where: { id: schedule.id },
                    data: { status: constant_js_1.ScheduleStatus.AVAILABLE },
                });
            }
        }
        return {
            id: updatedAppointment.id,
            status: updatedAppointment.status,
            deleted_at: updatedAppointment.deleted_at,
            message: 'Hủy lịch hẹn thành công',
        };
    });
};
exports.cancelAppointmentByDoctorOrAdminService = cancelAppointmentByDoctorOrAdminService;
// ============================================================
// DOCTOR / ADMIN: Cập nhật trạng thái lịch hẹn
// ============================================================
/**
 * Cập nhật trạng thái lịch hẹn theo tiến trình khám bệnh
 * (PENDING → CONFIRMED → COMPLETED / NO_SHOW)
 *
 * Quy tắc chuyển trạng thái:
 * - PENDING    → CONFIRMED (Xác nhận lịch)
 * - CONFIRMED  → COMPLETED (Đã khám xong) | NO_SHOW (Bệnh nhân không đến)
 * - CANCELLED  → Phải sử dụng API hủy lịch hẹn riêng (DELETE)
 */
const VALID_TRANSITIONS = {
    [constant_js_1.AppointmentStatus.PENDING]: [constant_js_1.AppointmentStatus.CONFIRMED],
    [constant_js_1.AppointmentStatus.CONFIRMED]: [constant_js_1.AppointmentStatus.COMPLETED, constant_js_1.AppointmentStatus.NO_SHOW],
};
const updateAppointmentStatusService = async (appointmentId, newStatus, role, doctorId) => {
    return await client_js_1.prisma.$transaction(async (tx) => {
        const appointment = await tx.appointment.findUnique({
            where: { id: appointmentId },
        });
        if (!appointment) {
            throw new Error('Không tìm thấy lịch hẹn.');
        }
        // Bác sĩ chỉ được cập nhật lịch hẹn của mình
        if (role === 'DOCTOR' && appointment.doctor_id !== doctorId) {
            throw new Error('Bạn không có quyền cập nhật lịch hẹn này. Lịch hẹn không thuộc ca trực của bạn.');
        }
        if (appointment.deleted_at !== null || appointment.status === constant_js_1.AppointmentStatus.CANCELLED) {
            throw new Error('Lịch hẹn này đã bị hủy, không thể thay đổi trạng thái.');
        }
        const upperStatus = newStatus.toUpperCase();
        if (upperStatus === constant_js_1.AppointmentStatus.CANCELLED) {
            throw new Error('Không thể hủy lịch hẹn bằng API này. Vui lòng sử dụng API hủy lịch hẹn chuyên biệt (DELETE /appointments/:id).');
        }
        // Kiểm tra trạng thái mới có hợp lệ không
        const validStatuses = Object.values(constant_js_1.AppointmentStatus);
        if (!validStatuses.includes(upperStatus)) {
            throw new Error(`Trạng thái "${newStatus}" không hợp lệ. Các trạng thái hợp lệ: ${validStatuses.join(', ')}`);
        }
        // Kiểm tra quy tắc chuyển trạng thái
        const allowedNext = VALID_TRANSITIONS[appointment.status];
        if (!allowedNext || !allowedNext.includes(upperStatus)) {
            throw new Error(`Vui lòng chọn trạng thái kế tiếp.`);
        }
        // Cập nhật trạng thái
        const updatedAppointment = await tx.appointment.update({
            where: { id: appointmentId },
            data: { status: upperStatus },
        });
        return updatedAppointment;
    });
};
exports.updateAppointmentStatusService = updateAppointmentStatusService;
// ============================================================
// ADMIN: Xem tất cả lịch hẹn trên hệ thống
// ============================================================
/**
 * Lấy danh sách tất cả lịch hẹn trên hệ thống dành cho Admin (không include)
 * Hỗ trợ phân trang, tìm kiếm, lọc theo trạng thái, khoảng ngày, bác sĩ
 */
const getAllAppointmentsAdminService = async (query) => {
    const page = Math.max(1, Number(query?.page || 1));
    const size = query?.pageSize ? Math.max(1, Number(query.pageSize)) : constant_js_1.pageSize;
    const skip = (page - 1) * size;
    const where = {};
    // Lọc theo trạng thái
    if (query?.status && query.status.toUpperCase() !== 'ALL') {
        where.status = query.status.toUpperCase();
    }
    // Lọc theo bác sĩ
    if (query?.doctor_id) {
        where.doctor_id = Number(query.doctor_id);
    }
    // Lọc theo khoảng ngày
    if (query?.from_date || query?.to_date) {
        where.date = {};
        if (query.from_date) {
            where.date.gte = new Date(`${query.from_date}T00:00:00.000Z`);
        }
        if (query.to_date) {
            where.date.lte = new Date(`${query.to_date}T23:59:59.999Z`);
        }
    }
    // Tìm kiếm theo tên bệnh nhân, SĐT, tên bác sĩ
    if (query?.search && query.search.trim() !== '') {
        const keyword = query.search.trim();
        where.OR = [
            { patient_name: { contains: keyword } },
            { patient_phone: { contains: keyword } },
            {
                doctor: {
                    user: { full_name: { contains: keyword } },
                },
            },
            {
                user: {
                    full_name: { contains: keyword },
                },
            },
        ];
    }
    const [total, appointments] = await client_js_1.prisma.$transaction([
        client_js_1.prisma.appointment.count({ where }),
        client_js_1.prisma.appointment.findMany({
            where,
            include: {
                doctor: {
                    select: {
                        id: true,
                        user: { select: { id: true, full_name: true, avatar: true } },
                        specialty: { select: { id: true, name: true } },
                    },
                },
                package: {
                    select: { id: true, name: true, price: true },
                },
            },
            skip,
            take: size,
            orderBy: { date: 'desc' },
        }),
    ]);
    return {
        appointments,
        pagination: {
            total,
            page,
            pageSize: size,
            totalPages: Math.ceil(total / size),
        },
    };
};
exports.getAllAppointmentsAdminService = getAllAppointmentsAdminService;
