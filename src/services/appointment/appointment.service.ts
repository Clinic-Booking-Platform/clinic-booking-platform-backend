import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import { prisma } from '../../config/client.js';
import { CreateAppointmentData, BookFromOrderData } from '../../types/appointment/Appointment.js';
import { AppointmentStatus, ScheduleStatus, TimeTypeMap, PaymentStatus } from '../../config/constant.js';
import { v4 as uuidv4 } from 'uuid';

dayjs.extend(utc);
dayjs.extend(timezone);

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
export const createAppointmentService = async (data: CreateAppointmentData) => {
    // 1. Kiểm tra ngày và giờ không phải trong quá khứ theo giờ Việt Nam (UTC+7)
    const nowVN = dayjs().tz('Asia/Ho_Chi_Minh');
    const todayVN = nowVN.format('YYYY-MM-DD');

    if (data.date < todayVN) {
        throw new Error('Không thể đặt lịch cho ngày trong quá khứ');
    }

    // Nếu đặt lịch cho ngày hôm nay, kiểm tra ca khám đã qua giờ bắt đầu chưa
    if (data.date === todayVN) {
        const timeSlot = TimeTypeMap[data.time_type];
        if (timeSlot) {
            const currentTime = nowVN.format('HH:mm');

            if (currentTime >= timeSlot.startTime) {
                throw new Error(
                    `Ca khám ${data.time_type} (${timeSlot.label}) đã qua giờ bắt đầu (${timeSlot.startTime}). Vui lòng chọn ca khám khác hoặc ngày tiếp theo.`
                );
            }
        }
    }

    const appointmentDate = new Date(`${data.date}T00:00:00.000Z`);

    // Thực hiện toàn bộ quy trình kiểm tra và tạo lịch trong 1 Transaction duy nhất
    return await prisma.$transaction(async (tx) => {
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
        const schedules: any[] = await tx.$queryRaw`
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
            throw new Error(
                `Bác sĩ ${doctor.user.full_name} không có lịch làm việc vào ngày ${data.date} - Ca ${data.time_type}`
            );
        }

        if (schedule.status !== ScheduleStatus.AVAILABLE) {
            throw new Error(
                `Ca khám này hiện không khả dụng (Trạng thái: ${schedule.status})`
            );
        }

        const maxNumber = Number(schedule.max_number);
        const scheduleId = Number(schedule.id);

        // 3. Đếm số lịch hẹn đang hoạt động trong ca này (PENDING + CONFIRMED)
        const currentBookings = await tx.appointment.count({
            where: {
                doctor_id: data.doctor_id,
                date: appointmentDate,
                time_type: data.time_type,
                status: { in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] },
                deleted_at: null,
            },
        });

        // Kiểm tra đã đạt giới hạn tối đa chưa
        if (currentBookings >= maxNumber) {
            throw new Error(
                `Ca khám này đã đạt giới hạn số lượng tối đa (${currentBookings}/${maxNumber} bệnh nhân). Vui lòng chọn ca khám hoặc ngày khác.`
            );
        }

        // 4. Kiểm tra bệnh nhân không đặt trùng lịch
        const existingAppointment = await tx.appointment.findFirst({
            where: {
                user_id: data.user_id,
                doctor_id: data.doctor_id,
                date: appointmentDate,
                time_type: data.time_type,
                status: { in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] },
                deleted_at: null,
            },
        });

        if (existingAppointment) {
            throw new Error(
                `Bạn đã có lịch hẹn với bác sĩ ${doctor.user.full_name} vào ngày ${data.date} - Ca ${data.time_type}`
            );
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
                status: AppointmentStatus.PENDING,
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
                data: { status: ScheduleStatus.FULL },
            });
        }

        return true;

    });
};

/**
 * Đặt lịch khám Online từ Gói khám đã mua (Order Detail)
 */
export const bookAppointmentFromOrderService = async (data: BookFromOrderData) => {
    const nowVN = dayjs().tz('Asia/Ho_Chi_Minh');
    const todayVN = nowVN.format('YYYY-MM-DD');

    if (data.date < todayVN) {
        throw new Error('Không thể đặt lịch cho ngày trong quá khứ');
    }

    if (data.date === todayVN) {
        const timeSlot = TimeTypeMap[data.time_type];
        if (timeSlot) {
            const currentTime = nowVN.format('HH:mm');
            if (currentTime >= timeSlot.startTime) {
                throw new Error(
                    `Ca khám ${data.time_type} (${timeSlot.label}) đã qua giờ bắt đầu (${timeSlot.startTime}). Vui lòng chọn ca khám khác hoặc ngày tiếp theo.`
                );
            }
        }
    }

    const appointmentDate = new Date(`${data.date}T00:00:00.000Z`);

    return await prisma.$transaction(async (tx) => {
        // 1. Lấy thông tin OrderDetail kèm Order
        const orderDetail = await tx.orderDetail.findUnique({
            where: { id: data.order_detail_id },
            include: { order: true, package: true },
        });

        if (!orderDetail) {
            throw new Error('Không tìm thấy gói khám này trong lịch sử mua hàng.');
        }

        if (orderDetail.order.user_id !== data.user_id) {
            throw new Error('Gói khám này không thuộc về bạn.');
        }

        if (orderDetail.order.payment_status !== PaymentStatus.PAID) {
            throw new Error('Đơn hàng chứa gói khám này chưa được thanh toán thành công.');
        }

        // 2. Kiểm tra số lượng đã sử dụng
        const usedCount = await tx.appointment.count({
            where: {
                order_id: orderDetail.order_id,
                package_id: orderDetail.package_id,
                status: { in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] },
                deleted_at: null,
            },
        });

        if (usedCount >= orderDetail.quantity) {
            throw new Error(`Bạn đã sử dụng hết số lượng (${orderDetail.quantity}) của gói khám này trong đơn hàng.`);
        }

        // 3. Kiểm tra bác sĩ và lịch trình (Tương tự đặt lịch offline)
        const doctor = await tx.doctor.findUnique({
            where: { id: data.doctor_id },
            include: { user: { select: { full_name: true } } },
        });

        if (!doctor || doctor.deleted_at !== null) {
            throw new Error('Bác sĩ không tồn tại hoặc hiện không hoạt động.');
        }

        const schedules: any[] = await tx.$queryRaw`
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

        if (schedule.status !== ScheduleStatus.AVAILABLE) {
            throw new Error(`Ca khám này hiện không khả dụng (Trạng thái: ${schedule.status})`);
        }

        const maxNumber = Number(schedule.max_number);
        const scheduleId = Number(schedule.id);

        const currentBookings = await tx.appointment.count({
            where: {
                doctor_id: data.doctor_id,
                date: appointmentDate,
                time_type: data.time_type,
                status: { in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] },
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
                status: { in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] },
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
                status: AppointmentStatus.CONFIRMED, // Đã thanh toán nên confirmed luôn
            },
        });

        // 5. Sinh meeting link bảo mật và lưu
        const meetingLink = `https://meet.jit.si/ClinicBooking-Apt-${appointment.id}-${uuidv4()}`;
        await tx.appointment.update({
            where: { id: appointment.id },
            data: { meeting_link: meetingLink }
        });

        // 6. Cập nhật Schedule nếu full
        if (currentBookings + 1 >= maxNumber) {
            await tx.schedule.update({
                where: { id: scheduleId },
                data: { status: ScheduleStatus.FULL },
            });
        }

        return {
            ...appointment,
            meeting_link: meetingLink,
        };
    });
};
