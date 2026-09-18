import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import { prisma } from '../../config/client.js';
import {
    CreateMedicalRecordData,
    UpdateMedicalRecordData,
    GetUserMedicalRecordsQuery,
    GetDoctorMedicalRecordsQuery,
    GetAdminMedicalRecordsQuery,
} from '../../types/medical-record/MedicalRecord.js';
import { AppointmentStatus, MedicalRecordStatus, pageSize, RoleType } from '../../config/constant.js';

dayjs.extend(utc);
dayjs.extend(timezone);

// ============================================================
// INCLUDE – Dùng chung cho API xem chi tiết bệnh án
// ============================================================
const medicalRecordDetailInclude = {
    prescriptions: true,
    attachments: true,
    appointment: {
        include: {
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
        },
    },
};

// ============================================================
// SELECT – Dùng cho danh sách (chỉ lấy các trường cần thiết, siêu nhẹ)
// ============================================================
const medicalRecordListSelect = {
    id: true,
    record_code: true,
    diagnosis: true,
    status: true,
    re_examination_date: true,
    created_at: true,
    appointment: {
        select: {
            id: true,
            date: true,
            time_type: true,
            patient_name: true,
            doctor: {
                select: {
                    user: {
                        select: {
                            full_name: true,
                        },
                    },
                },
            },
        },
    },
};

// ============================================================
// Sinh mã bệnh án tự động: BA{YYYYMMDD}-{XXX}
// ============================================================
const generateRecordCode = async (): Promise<string> => {
    const today = dayjs().tz('Asia/Ho_Chi_Minh').format('YYYYMMDD');
    const prefix = `BA${today}-`;

    // Đếm số bệnh án đã tạo trong ngày hôm nay
    const count = await prisma.medicalRecord.count({
        where: {
            record_code: { startsWith: prefix },
        },
    });

    const seq = String(count + 1).padStart(3, '0');
    return `${prefix}${seq}`;
};

// ============================================================
// DOCTOR: Tạo hồ sơ bệnh án
// ============================================================

/**
 * Tạo hồ sơ bệnh án cho một lịch hẹn
 *
 * Nghiệp vụ:
 * 1. Kiểm tra appointment tồn tại và thuộc ca trực của bác sĩ (doctor_id)
 * 2. Kiểm tra appointment.status === CONFIRMED
 * 3. Kiểm tra chưa có bệnh án (mỗi lịch hẹn chỉ có 1 bệnh án - quan hệ 1:1)
 * 4. Tự sinh record_code
 * 5. Tạo MedicalRecord với status = DRAFT
 * 6. Nếu có attachments → tạo MedicalRecordAttachment (<<extend>>)
 */
export const createMedicalRecordService = async (
    doctorId: number,
    data: CreateMedicalRecordData
) => {
    return await prisma.$transaction(async (tx) => {
        // 1. Kiểm tra appointment
        const appointment = await tx.appointment.findUnique({
            where: { id: data.appointment_id },
            include: { medical_record: true },
        });

        if (!appointment) {
            throw new Error('Không tìm thấy lịch hẹn');
        }

        // 2. Kiểm tra appointment thuộc ca trực của bác sĩ
        if (appointment.doctor_id !== doctorId) {
            throw new Error('Lịch hẹn này không thuộc ca trực của bạn');
        }

        // 3. Kiểm tra trạng thái lịch hẹn phải là CONFIRMED
        if (appointment.status !== AppointmentStatus.CONFIRMED) {
            throw new Error(
                `Chỉ có thể tạo hồ sơ bệnh án khi lịch hẹn đã được xác nhận.`
            );
        }

        // 4. Kiểm tra chưa có bệnh án (1:1)
        if (appointment.medical_record) {
            throw new Error(
                `Lịch hẹn này đã có hồ sơ bệnh án (Mã: ${appointment.medical_record.record_code}). Vui lòng cập nhật thay vì tạo mới.`
            );
        }

        // 5. Sinh mã bệnh án
        const recordCode = await generateRecordCode();

        // 6. Tạo MedicalRecord
        const medicalRecord = await tx.medicalRecord.create({
            data: {
                appointment_id: data.appointment_id,
                record_code: recordCode,
                symptoms: data.symptoms || null,
                clinical_examination: data.clinical_examination || null,
                diagnosis: data.diagnosis,
                icd10_code: data.icd10_code || null,
                icd10_name: data.icd10_name || null,
                blood_pressure: data.blood_pressure || null,
                pulse: data.pulse ?? null,
                temperature: data.temperature ?? null,
                weight: data.weight ?? null,
                height: data.height ?? null,
                doctor_advice: data.doctor_advice || null,
                re_examination_date: data.re_examination_date
                    ? new Date(`${data.re_examination_date}T00:00:00.000Z`)
                    : null,
                consultation_type: data.consultation_type || appointment.appointment_type,
                recommendation: data.recommendation || null,
                status: MedicalRecordStatus.DRAFT,
            },
        });

        // 7. Tạo attachments nếu có (<<extend>>)
        if (data.attachments && data.attachments.length > 0) {
            await tx.medicalRecordAttachment.createMany({
                data: data.attachments.map((att) => ({
                    medical_record_id: medicalRecord.id,
                    file_url: att.file_url,
                    file_name: att.file_name,
                    description: att.description || null,
                })),
            });
        }

        return true;
    });
};

// ============================================================
// DOCTOR: Cập nhật hồ sơ bệnh án
// ============================================================

/**
 * Cập nhật hồ sơ bệnh án
 *
 * Nghiệp vụ:
 * 1. Kiểm tra bệnh án tồn tại
 * 2. Kiểm tra bệnh án thuộc ca trực của bác sĩ (qua appointment.doctor_id)
 * 3. Kiểm tra bệnh án chưa được ký (status === DRAFT)
 * 4. KHÔNG kiểm tra status lịch hẹn (theo yêu cầu)
 * 5. Cập nhật các field được gửi lên
 * 6. Nếu có attachments mới → thêm vào bảng medical_record_attachments
 */
export const updateMedicalRecordService = async (
    doctorId: number,
    recordId: number,
    data: UpdateMedicalRecordData
) => {
    return await prisma.$transaction(async (tx) => {
        // 1. Kiểm tra bệnh án tồn tại
        const record = await tx.medicalRecord.findUnique({
            where: { id: recordId },
            include: { appointment: true },
        });

        if (!record) {
            throw new Error('Không tìm thấy hồ sơ bệnh án');
        }

        // 2. Kiểm tra quyền sở hữu
        if (record.appointment.doctor_id !== doctorId) {
            throw new Error('Bạn không có quyền chỉnh sửa hồ sơ bệnh án này');
        }

        // 3. Kiểm tra bệnh án chưa được ký
        if (record.status === MedicalRecordStatus.SIGNED) {
            throw new Error(
                'Hồ sơ bệnh án đã được ký xác nhận, không thể chỉnh sửa'
            );
        }

        // 4. Chuẩn bị dữ liệu cập nhật (chỉ update field được gửi lên)
        const updateData: any = {};

        if (data.symptoms !== undefined) updateData.symptoms = data.symptoms || null;
        if (data.clinical_examination !== undefined) updateData.clinical_examination = data.clinical_examination || null;
        if (data.diagnosis !== undefined) updateData.diagnosis = data.diagnosis;
        if (data.icd10_code !== undefined) updateData.icd10_code = data.icd10_code || null;
        if (data.icd10_name !== undefined) updateData.icd10_name = data.icd10_name || null;
        if (data.blood_pressure !== undefined) updateData.blood_pressure = data.blood_pressure || null;
        if (data.pulse !== undefined) updateData.pulse = data.pulse ?? null;
        if (data.temperature !== undefined) updateData.temperature = data.temperature ?? null;
        if (data.weight !== undefined) updateData.weight = data.weight ?? null;
        if (data.height !== undefined) updateData.height = data.height ?? null;
        if (data.doctor_advice !== undefined) updateData.doctor_advice = data.doctor_advice || null;
        if (data.re_examination_date !== undefined) {
            updateData.re_examination_date = data.re_examination_date
                ? new Date(`${data.re_examination_date}T00:00:00.000Z`)
                : null;
        }
        if (data.consultation_type !== undefined) updateData.consultation_type = data.consultation_type;
        if (data.recommendation !== undefined) updateData.recommendation = data.recommendation || null;

        // 5. Cập nhật bệnh án
        await tx.medicalRecord.update({
            where: { id: recordId },
            data: updateData,
        });

        // 6. Đồng bộ toàn bộ danh sách attachments (nếu trường attachments được gửi lên)
        if (data.attachments !== undefined) {
            // Xóa toàn bộ file cũ của bệnh án này để thay thế bằng mảng mới
            await tx.medicalRecordAttachment.deleteMany({
                where: { medical_record_id: recordId },
            });

            // Chèn danh sách file mới mà Bác sĩ giữ lại
            if (data.attachments.length > 0) {
                await tx.medicalRecordAttachment.createMany({
                    data: data.attachments.map((att) => ({
                        medical_record_id: recordId,
                        file_url: att.file_url,
                        file_name: att.file_name,
                        description: att.description || null,
                    })),
                });
            }
        }

        return true;
    });
};

// ============================================================
// DOCTOR: Ký xác nhận & Đóng hồ sơ bệnh án
// ============================================================

/**
 * Ký xác nhận đóng hồ sơ bệnh án
 *
 * Nghiệp vụ:
 * 1. Kiểm tra bệnh án tồn tại
 * 2. Kiểm tra bệnh án thuộc ca trực của bác sĩ
 * 3. Kiểm tra status === DRAFT (chưa ký)
 * 4. Chuyển status → SIGNED, set signed_at = now()
 * 5. Sau khi ký → KHÔNG THỂ chỉnh sửa bất kỳ thông tin nào
 */
export const signMedicalRecordService = async (
    doctorId: number,
    recordId: number
) => {
    const record = await prisma.medicalRecord.findUnique({
        where: { id: recordId },
        include: { appointment: true },
    });

    if (!record) {
        throw new Error('Không tìm thấy hồ sơ bệnh án');
    }

    if (record.appointment.doctor_id !== doctorId) {
        throw new Error('Bạn không có quyền ký xác nhận hồ sơ bệnh án này');
    }

    if (record.status === MedicalRecordStatus.SIGNED) {
        throw new Error('Hồ sơ bệnh án này đã được ký xác nhận trước đó');
    }

    await prisma.medicalRecord.update({
        where: { id: recordId },
        data: {
            status: MedicalRecordStatus.SIGNED,
            signed_at: new Date(),
        },
    });

    return true;
};

// ============================================================
// CHI TIẾT – Xem chi tiết 1 bệnh án (phân quyền theo role)
// ============================================================

/**
 * Lấy chi tiết hồ sơ bệnh án
 * Phân quyền: User chỉ xem của mình, Doctor xem ca mình, Admin xem tất cả
 */
export const getMedicalRecordDetailService = async (
    recordId: number,
    options?: {
        userId?: number;
        doctorId?: number;
        role?: string;
    }
) => {
    const record = await prisma.medicalRecord.findUnique({
        where: { id: recordId },
        include: medicalRecordDetailInclude,
    });

    if (!record) {
        throw new Error('Không tìm thấy hồ sơ bệnh án');
    }

    // Bệnh nhân chỉ xem được bệnh án của mình
    if (options?.role === RoleType.USER && options.userId && record.appointment.user_id !== options.userId) {
        throw new Error('Hồ sơ bệnh án này không thuộc về bạn');
    }

    // Bác sĩ chỉ xem được bệnh án thuộc ca trực của mình
    if (options?.role === RoleType.DOCTOR && options.doctorId && record.appointment.doctor_id !== options.doctorId) {
        throw new Error('Bạn không có quyền xem hồ sơ bệnh án này');
    }

    return record;
};

// ============================================================
// USER: Danh sách hồ sơ bệnh án của mình
// ============================================================

/**
 * Lấy danh sách hồ sơ bệnh án của bệnh nhân
 * Join qua appointment.user_id === userId
 */
export const getMedicalRecordsByUserService = async (
    userId: number,
    query?: GetUserMedicalRecordsQuery
) => {
    const page = Math.max(1, Number(query?.page || 1));
    const skip = (page - 1) * pageSize;

    const where: any = {
        appointment: {
            user_id: userId,
        },
    };

    const [total, records] = await prisma.$transaction([
        prisma.medicalRecord.count({ where }),
        prisma.medicalRecord.findMany({
            where,
            skip,
            take: pageSize,
            orderBy: { created_at: 'desc' },
            select: medicalRecordListSelect,
        }),
    ]);

    return {
        records,
        pagination: {
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
        },
    };
};

// ============================================================
// DOCTOR: Danh sách hồ sơ bệnh án của bác sĩ
// ============================================================

/**
 * Lấy danh sách hồ sơ bệnh án của bác sĩ
 * Join qua appointment.doctor_id === doctorId
 * Hỗ trợ phân trang, tìm kiếm, lọc theo khoảng ngày
 */
export const getMedicalRecordsByDoctorService = async (
    doctorId: number,
    query?: GetDoctorMedicalRecordsQuery
) => {
    const page = Math.max(1, Number(query?.page || 1));
    const skip = (page - 1) * pageSize;

    const where: any = {
        appointment: {
            doctor_id: doctorId,
        },
    };

    // Lọc theo khoảng ngày (dựa trên ngày tạo bệnh án)
    if (query?.from_date || query?.to_date) {
        where.created_at = {};
        if (query.from_date) {
            where.created_at.gte = new Date(`${query.from_date}T00:00:00.000Z`);
        }
        if (query.to_date) {
            where.created_at.lte = new Date(`${query.to_date}T23:59:59.999Z`);
        }
    }

    // Tìm kiếm theo tên bệnh nhân hoặc mã bệnh án
    if (query?.search && query.search.trim() !== '') {
        const keyword = query.search.trim();
        where.OR = [
            { record_code: { contains: keyword } },
            { diagnosis: { contains: keyword } },
            { appointment: { patient_name: { contains: keyword } } },
        ];
    }

    const [total, records] = await prisma.$transaction([
        prisma.medicalRecord.count({ where }),
        prisma.medicalRecord.findMany({
            where,
            skip,
            take: pageSize,
            orderBy: { created_at: 'desc' },
            select: medicalRecordListSelect,
        }),
    ]);

    return {
        records,
        pagination: {
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
        },
    };
};

// ============================================================
// ADMIN: Danh sách tất cả hồ sơ bệnh án
// ============================================================

/**
 * Admin xem danh sách tất cả hồ sơ bệnh án trên hệ thống
 * Hỗ trợ phân trang, tìm kiếm, lọc theo khoảng ngày, lọc theo bác sĩ
 */
export const getAllMedicalRecordsAdminService = async (
    query?: GetAdminMedicalRecordsQuery
) => {
    const page = Math.max(1, Number(query?.page || 1));
    const skip = (page - 1) * pageSize;

    const where: any = {};

    // Lọc theo bác sĩ
    if (query?.doctor_id) {
        where.appointment = {
            ...where.appointment,
            doctor_id: query.doctor_id,
        };
    }

    // Lọc theo khoảng ngày
    if (query?.from_date || query?.to_date) {
        where.created_at = {};
        if (query.from_date) {
            where.created_at.gte = new Date(`${query.from_date}T00:00:00.000Z`);
        }
        if (query.to_date) {
            where.created_at.lte = new Date(`${query.to_date}T23:59:59.999Z`);
        }
    }

    // Tìm kiếm theo mã bệnh án, tên bệnh nhân, chẩn đoán
    if (query?.search && query.search.trim() !== '') {
        const keyword = query.search.trim();
        where.OR = [
            { record_code: { contains: keyword } },
            { diagnosis: { contains: keyword } },
            { appointment: { patient_name: { contains: keyword } } },
        ];
    }

    const [total, records] = await prisma.$transaction([
        prisma.medicalRecord.count({ where }),
        prisma.medicalRecord.findMany({
            where,
            skip,
            take: pageSize,
            orderBy: { created_at: 'desc' },
            select: medicalRecordListSelect,
        }),
    ]);

    return {
        records,
        pagination: {
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
        },
    };
};
