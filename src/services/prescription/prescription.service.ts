import { prisma } from '../../config/client.js';
import { MedicalRecordStatus, RoleType } from '../../config/constant.js';
import {
    CreatePrescriptionData,
    UpdatePrescriptionData,
} from '../../types/prescription/Prescription.js';

// ============================================================
// INCLUDE – Dùng cho lấy chi tiết đơn thuốc theo bệnh án
// ============================================================
const prescriptionMedicalRecordInclude = {
    prescriptions: true,
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
// XEM ĐƠN THUỐC THEO HỒ SƠ BỆNH ÁN (Phân quyền theo role)
// ============================================================
/**
 * Lấy đơn thuốc theo hồ sơ bệnh án
 * - User: chỉ xem được đơn thuốc của mình (appointment.user_id === userId)
 * - Doctor: chỉ xem được đơn thuốc ca trực của mình (appointment.doctor_id === doctorId)
 * - Admin: xem được bất kỳ đơn thuốc nào
 */
export const getPrescriptionByMedicalRecordService = async (
    medicalRecordId: number,
    options?: {
        userId?: number;
        doctorId?: number;
        role?: string;
    }
) => {
    const record = await prisma.medicalRecord.findUnique({
        where: { id: medicalRecordId },
        include: prescriptionMedicalRecordInclude,
    });

    if (!record) {
        throw new Error('Không tìm thấy hồ sơ bệnh án');
    }

    // Bệnh nhân chỉ xem được đơn thuốc của chính mình
    if (options?.role === RoleType.USER && options.userId && record.appointment.user_id !== options.userId) {
        throw new Error('Đơn thuốc này không thuộc về bạn');
    }

    // Bệnh nhân chỉ xem được đơn thuốc khi hồ sơ bệnh án đã được bác sĩ ký xác nhận (SIGNED)
    if (options?.role === RoleType.USER && record.status !== MedicalRecordStatus.SIGNED) {
        throw new Error(
            'Bác sĩ đang trong quá trình thăm khám và kê đơn. Vui lòng chờ bác sĩ hoàn tất và ký xác nhận hồ sơ bệnh án.'
        );
    }

    // Bác sĩ chỉ xem được đơn thuốc thuộc ca trực của mình
    if (options?.role === RoleType.DOCTOR && options.doctorId && record.appointment.doctor_id !== options.doctorId) {
        throw new Error('Bạn không có quyền xem đơn thuốc này');
    }

    return {
        medical_record: {
            id: record.id,
            record_code: record.record_code,
            diagnosis: record.diagnosis,
            icd10_code: record.icd10_code,
            icd10_name: record.icd10_name,
            doctor_advice: record.doctor_advice,
            re_examination_date: record.re_examination_date,
            status: record.status,
            appointment: record.appointment,
        },
        prescriptions: record.prescriptions,
    };
};

// ============================================================
// DOCTOR: KÊ ĐƠN THUỐC (Thêm các loại thuốc vào bệnh án)
// ============================================================
/**
 * Kê đơn thuốc cho một hồ sơ bệnh án
 *
 * Nghiệp vụ:
 * 1. Bệnh án phải tồn tại
 * 2. Bệnh án thuộc ca trực của bác sĩ (appointment.doctor_id === doctorId)
 * 3. Bệnh án phải ở trạng thái DRAFT (chưa ký)
 * 4. Bệnh án phải có chẩn đoán xác định
 * 5. Bệnh án chưa có thuốc nào (prescriptions.length === 0)
 * 6. Lưu danh sách thuốc (PrescriptionItem)
 */
export const createPrescriptionService = async (
    doctorId: number,
    medicalRecordId: number,
    data: CreatePrescriptionData
) => {
    return await prisma.$transaction(async (tx) => {
        // 1. Kiểm tra bệnh án tồn tại
        const record = await tx.medicalRecord.findUnique({
            where: { id: medicalRecordId },
            include: {
                appointment: true,
                prescriptions: true,
            },
        });

        if (!record) {
            throw new Error('Không tìm thấy hồ sơ bệnh án');
        }

        // 2. Kiểm tra quyền sở hữu ca trực
        if (record.appointment.doctor_id !== doctorId) {
            throw new Error('Hồ sơ bệnh án này không thuộc ca trực của bạn');
        }

        // 3. Kiểm tra trạng thái bệnh án
        if (record.status === MedicalRecordStatus.SIGNED) {
            throw new Error('Hồ sơ bệnh án đã được ký xác nhận, không thể kê đơn thuốc');
        }

        // 4. Bác sĩ phải có chẩn đoán xác định trước khi kê đơn
        if (!record.diagnosis || record.diagnosis.trim() === '') {
            throw new Error('Hồ sơ bệnh án chưa có chẩn đoán. Vui lòng cập nhật chẩn đoán trước khi kê đơn thuốc.');
        }

        // 5. Kiểm tra chưa có đơn thuốc
        if (record.prescriptions && record.prescriptions.length > 0) {
            throw new Error(
                'Hồ sơ bệnh án này đã có đơn thuốc. Vui lòng sử dụng chức năng điều chỉnh đơn thuốc.'
            );
        }

        // 5. Tạo các loại thuốc trong đơn
        await tx.prescriptionItem.createMany({
            data: data.items.map((item) => ({
                medical_record_id: medicalRecordId,
                medicine_name: item.medicine_name,
                dosage: item.dosage,
                quantity: item.quantity,
                unit: item.unit,
                instructions: item.instructions || null,
            })),
        });

        return true;
    });
};

// ============================================================
// DOCTOR: ĐIỀU CHỈNH ĐƠN THUỐC (Cập nhật toàn bộ danh sách thuốc)
// ============================================================
/**
 * Điều chỉnh đơn thuốc cho một hồ sơ bệnh án
 *
 * Nghiệp vụ:
 * 1. Bệnh án phải tồn tại
 * 2. Bệnh án thuộc ca trực của bác sĩ
 * 3. Bệnh án phải ở trạng thái DRAFT (chưa ký)
 * 4. Xóa danh sách thuốc cũ, thay thế bằng danh sách mới
 */
export const updatePrescriptionService = async (
    doctorId: number,
    medicalRecordId: number,
    data: UpdatePrescriptionData
) => {
    return await prisma.$transaction(async (tx) => {
        // 1. Kiểm tra bệnh án
        const record = await tx.medicalRecord.findUnique({
            where: { id: medicalRecordId },
            include: { appointment: true },
        });

        if (!record) {
            throw new Error('Không tìm thấy hồ sơ bệnh án');
        }

        // 2. Kiểm tra quyền sở hữu ca trực
        if (record.appointment.doctor_id !== doctorId) {
            throw new Error('Bạn không có quyền điều chỉnh đơn thuốc của hồ sơ bệnh án này');
        }

        // 3. Kiểm tra trạng thái bệnh án
        if (record.status === MedicalRecordStatus.SIGNED) {
            throw new Error(
                'Hồ sơ bệnh án đã được ký xác nhận, không thể chỉnh sửa đơn thuốc'
            );
        }

        // 4. Đồng bộ: Xóa toàn bộ thuốc cũ của bệnh án này
        await tx.prescriptionItem.deleteMany({
            where: { medical_record_id: medicalRecordId },
        });

        // 5. Thêm danh sách thuốc mới
        await tx.prescriptionItem.createMany({
            data: data.items.map((item) => ({
                medical_record_id: medicalRecordId,
                medicine_name: item.medicine_name,
                dosage: item.dosage,
                quantity: item.quantity,
                unit: item.unit,
                instructions: item.instructions || null,
            })),
        });

        return true;
    });
};

// ============================================================
// DOCTOR: XÓA MỘT LOẠI THUỐC KHỎI ĐƠN
// ============================================================
/**
 * Xóa một loại thuốc cụ thể khỏi đơn thuốc
 *
 * Nghiệp vụ:
 * 1. Loại thuốc phải tồn tại
 * 2. Bệnh án chứa thuốc này thuộc ca trực của bác sĩ
 * 3. Bệnh án chưa được ký (DRAFT)
 */
export const deletePrescriptionItemService = async (
    doctorId: number,
    itemId: number
) => {
    const item = await prisma.prescriptionItem.findUnique({
        where: { id: itemId },
        include: {
            medical_record: {
                include: { appointment: true },
            },
        },
    });

    if (!item) {
        throw new Error('Không tìm thấy loại thuốc này trong đơn thuốc');
    }

    if (item.medical_record.appointment.doctor_id !== doctorId) {
        throw new Error('Bạn không có quyền xóa thuốc trong đơn thuốc này');
    }

    if (item.medical_record.status === MedicalRecordStatus.SIGNED) {
        throw new Error(
            'Hồ sơ bệnh án đã được ký xác nhận, không thể xóa thuốc khỏi đơn'
        );
    }

    await prisma.prescriptionItem.delete({
        where: { id: itemId },
    });

    return true;
};
