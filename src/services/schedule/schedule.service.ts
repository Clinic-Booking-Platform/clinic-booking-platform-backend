import { prisma } from '../../config/client.js';
import { AppointmentStatus, pageSize as defaultPageSize } from '../../config/constant.js';
import {
    GetSchedulesOptions,
    CreateScheduleData,
    UpdateScheduleData,
    BulkCreateScheduleData,
} from '../../types/schedule/Schedule.js';

// Include thông tin bác sĩ + chuyên khoa khi query schedule
const scheduleInclude = {
    doctor: {
        select: {
            id: true,
            user: {
                select: {
                    id: true,
                    full_name: true,
                    avatar: true,
                },
            },
            specialty: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    },
};

/**
 * Lấy danh sách lịch làm việc
 * Hỗ trợ phân trang, lọc theo doctor_id, date, from_date, to_date, status
 */
export const getSchedulesService = async (options?: GetSchedulesOptions) => {
    const page = Math.max(1, Number(options?.page || 1));
    const size = options?.pageSize || defaultPageSize;
    const status = options?.status || 'AVAILABLE';

    const where: any = {};

    // Lọc theo trạng thái
    if (status !== 'all') {
        where.status = status;
    }

    // Nếu lấy lịch khả dụng (AVAILABLE), chỉ lấy của bác sĩ đang hoạt động (chưa bị xóa mềm)
    if (status === 'AVAILABLE') {
        where.doctor = { deleted_at: null };
    }

    // Lọc theo bác sĩ
    if (options?.doctor_id) {
        where.doctor_id = Number(options.doctor_id);
    }

    // Lọc theo ngày cụ thể
    if (options?.date) {
        where.date = new Date(`${options.date}T00:00:00.000Z`);
    } else {
        // Lọc theo khoảng ngày
        if (options?.from_date || options?.to_date) {
            where.date = {};
            if (options?.from_date) {
                where.date.gte = new Date(`${options.from_date}T00:00:00.000Z`);
            }
            if (options?.to_date) {
                where.date.lte = new Date(`${options.to_date}T00:00:00.000Z`);
            }
        }
    }

    const skip = (page - 1) * size;
    const [total, schedules] = await prisma.$transaction([
        prisma.schedule.count({ where }),
        prisma.schedule.findMany({
            where,
            include: scheduleInclude,
            skip,
            take: size,
            orderBy: [{ date: 'asc' }, { time_type: 'asc' }],
        }),
    ]);

    // Tính toán số lượng bệnh nhân đã đặt (current_number) cho từng ca làm việc
    const schedulesWithBookings = await Promise.all(
        schedules.map(async (s) => {
            const current_number = await prisma.appointment.count({
                where: {
                    doctor_id: s.doctor_id,
                    date: s.date,
                    time_type: s.time_type,
                    status: { not: AppointmentStatus.CANCELLED },
                    deleted_at: null,
                },
            });
            return {
                ...s,
                current_number,
            };
        })
    );

    return {
        schedules: schedulesWithBookings,
        pagination: {
            total,
            page,
            pageSize: size,
            totalPages: Math.ceil(total / size),
        },
    };
};

/**
 * Xem chi tiết 1 ca làm việc theo ID
 */
export const getScheduleByIdService = async (scheduleId: number) => {
    const schedule = await prisma.schedule.findUnique({
        where: { id: scheduleId },
        include: scheduleInclude,
    });

    if (!schedule) {
        throw new Error('Ca làm việc không tồn tại');
    }

    const current_number = await prisma.appointment.count({
        where: {
            doctor_id: schedule.doctor_id,
            date: schedule.date,
            time_type: schedule.time_type,
            status: { not: AppointmentStatus.CANCELLED },
            deleted_at: null,
        },
    });

    return {
        ...schedule,
        current_number,
    };
};

/**
 * Tạo 1 ca làm việc
 * - Kiểm tra doctor tồn tại và chưa bị xóa mềm
 * - Kiểm tra không trùng lặp (doctor_id + date + time_type)
 * - Không cho tạo lịch cho ngày trong quá khứ
 */
export const createScheduleService = async (data: CreateScheduleData) => {
    // Kiểm tra bác sĩ tồn tại
    const doctor = await prisma.doctor.findUnique({
        where: { id: data.doctor_id },
        include: { user: { select: { full_name: true } } },
    });

    if (!doctor) {
        throw new Error('Bác sĩ không tồn tại');
    }

    if (doctor.deleted_at !== null) {
        throw new Error('Bác sĩ này đã bị xóa, không thể tạo lịch làm việc');
    }

    // Kiểm tra ngày không phải quá khứ theo múi giờ Việt Nam (UTC+7)
    const todayVN = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' });
    if (data.date < todayVN) {
        throw new Error('Không thể tạo lịch làm việc cho ngày trong quá khứ');
    }

    const scheduleDate = new Date(`${data.date}T00:00:00.000Z`);

    // Kiểm tra trùng lặp
    const existing = await prisma.schedule.findFirst({
        where: {
            doctor_id: data.doctor_id,
            date: scheduleDate,
            time_type: data.time_type,
        },
    });

    if (existing) {
        throw new Error(
            `Ca làm việc này đã tồn tại (${doctor.user.full_name} - ${data.date} - Ca ${data.time_type})`
        );
    }

    const schedule = await prisma.schedule.create({
        data: {
            doctor_id: data.doctor_id,
            date: scheduleDate,
            time_type: data.time_type,
            max_number: data.max_number ?? 10,
            status: 'AVAILABLE',
        },

    });

    return true;
};

/**
 * Tạo nhiều ca làm việc cùng lúc cho 1 bác sĩ trong 1 ngày
 * - Bỏ qua các ca đã tồn tại (không báo lỗi)
 */
export const bulkCreateScheduleService = async (data: BulkCreateScheduleData) => {
    // Kiểm tra bác sĩ tồn tại
    const doctor = await prisma.doctor.findUnique({
        where: { id: data.doctor_id },
    });

    if (!doctor) {
        throw new Error('Bác sĩ không tồn tại');
    }

    if (doctor.deleted_at !== null) {
        throw new Error('Bác sĩ này đã bị xóa, không thể tạo lịch làm việc');
    }

    // Kiểm tra ngày không phải quá khứ theo múi giờ Việt Nam (UTC+7)
    const todayVN = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' });
    if (data.date < todayVN) {
        throw new Error('Không thể tạo lịch làm việc cho ngày trong quá khứ');
    }

    const scheduleDate = new Date(`${data.date}T00:00:00.000Z`);

    // Tìm các ca đã tồn tại
    const existingSchedules = await prisma.schedule.findMany({
        where: {
            doctor_id: data.doctor_id,
            date: scheduleDate,
            time_type: { in: data.time_types },
        },
        select: { time_type: true },
    });

    const existingTimeTypes = new Set(existingSchedules.map((s) => s.time_type));
    const newTimeTypes = data.time_types.filter((t) => !existingTimeTypes.has(t));
    const skippedTimeTypes = data.time_types.filter((t) => existingTimeTypes.has(t));

    // Tạo các ca mới trong transaction
    const created = await prisma.$transaction(
        newTimeTypes.map((time_type) =>
            prisma.schedule.create({
                data: {
                    doctor_id: data.doctor_id,
                    date: scheduleDate,
                    time_type,
                    max_number: data.max_number ?? 10,
                    status: 'AVAILABLE',
                },
                select: { id: true, time_type: true, date: true, max_number: true, status: true },
            })
        )
    );

    return {
        created,
        skipped: skippedTimeTypes,
    };
};

/**
 * Cập nhật ca làm việc (max_number, status)
 * - Doctor chỉ được cập nhật ca của chính mình
 * - Admin cập nhật được tất cả
 */
export const updateScheduleService = async (
    scheduleId: number,
    data: UpdateScheduleData,
    requestDoctorId?: number // Nếu có: kiểm tra ownership (Doctor). Nếu null: Admin.
) => {
    const schedule = await prisma.schedule.findUnique({
        where: { id: scheduleId },
    });

    if (!schedule) {
        throw new Error('Ca làm việc không tồn tại');
    }

    // Kiểm tra quyền sở hữu nếu là Doctor
    if (requestDoctorId && schedule.doctor_id !== requestDoctorId) {
        throw new Error('Bạn chỉ được cập nhật ca làm việc của chính mình');
    }

    const updateData: any = {};
    if (data.max_number !== undefined) updateData.max_number = data.max_number;
    if (data.status !== undefined) updateData.status = data.status;

    const updated = await prisma.schedule.update({
        where: { id: scheduleId },
        data: updateData,
        include: scheduleInclude,
    });

    return true;
};

/**
 * Xóa cứng ca làm việc (chỉ Admin)
 * - Không cho xóa nếu đã có Appointment liên kết
 */
export const deleteScheduleService = async (scheduleId: number) => {
    const schedule = await prisma.schedule.findUnique({
        where: { id: scheduleId },
    });

    if (!schedule) {
        throw new Error('Ca làm việc không tồn tại');
    }

    // Kiểm tra có lịch hẹn liên kết không
    // Appointment liên kết qua doctor_id + date + time_type
    const linkedAppointment = await prisma.appointment.findFirst({
        where: {
            doctor_id: schedule.doctor_id,
            date: schedule.date,
            time_type: schedule.time_type,
            deleted_at: null,
        },
    });

    if (linkedAppointment) {
        throw new Error('Không thể xóa ca này vì đã có lịch hẹn liên kết');
    }

    // Xóa cứng
    await prisma.schedule.delete({
        where: { id: scheduleId },
    });

    return true;
};
