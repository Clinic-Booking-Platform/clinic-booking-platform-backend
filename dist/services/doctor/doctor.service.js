"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.restoreDoctorService = exports.deleteDoctorService = exports.updateDoctorService = exports.getDoctorByIdService = exports.getDoctorsService = void 0;
const client_js_1 = require("../../config/client.js");
const constant_js_1 = require("../../config/constant.js");
/**
 * Lấy danh sách bác sĩ
 * Hỗ trợ phân trang, lọc theo chuyên khoa (specialty_id), tìm kiếm theo tên, lọc trạng thái
 */
const getDoctorsService = async (options) => {
    const page = Math.max(1, Number(options?.page || 1));
    const size = options?.pageSize || constant_js_1.pageSize;
    const search = options?.search?.trim();
    const specialtyId = options?.specialty_id ? Number(options.specialty_id) : undefined;
    const status = options?.status || 'active'; // Mặc định chỉ lấy bác sĩ đang hoạt động
    const where = {};
    if (status === 'active') {
        where.deleted_at = null;
    }
    else if (status === 'deleted') {
        where.deleted_at = { not: null };
    }
    if (specialtyId) {
        where.specialty_id = specialtyId;
    }
    if (search) {
        where.user = {
            full_name: { contains: search },
        };
    }
    const include = {
        user: {
            select: {
                id: true,
                full_name: true,
                email: true,
                phone_number: true,
                avatar: true,
                gender: true,
                deleted_at: true,
            },
        },
        specialty: {
            select: {
                id: true,
                name: true,
                description: true,
            },
        },
    };
    const skip = (page - 1) * size;
    const [total, doctors] = await client_js_1.prisma.$transaction([
        client_js_1.prisma.doctor.count({ where }),
        client_js_1.prisma.doctor.findMany({
            where,
            include,
            skip,
            take: size,
            orderBy: { id: 'desc' },
        }),
    ]);
    return {
        doctors,
        pagination: {
            total,
            page,
            pageSize: size,
            totalPages: Math.ceil(total / size),
        },
    };
};
exports.getDoctorsService = getDoctorsService;
/**
 * Xem chi tiết hồ sơ 1 bác sĩ theo doctorId
 */
const getDoctorByIdService = async (doctorId, includeDeleted = false) => {
    const doctor = await client_js_1.prisma.doctor.findUnique({
        where: { id: doctorId },
        include: {
            user: {
                select: {
                    id: true,
                    full_name: true,
                    email: true,
                    phone_number: true,
                    avatar: true,
                    gender: true,
                    deleted_at: true,
                },
            },
            specialty: {
                select: {
                    id: true,
                    name: true,
                    description: true,
                },
            },
        },
    });
    if (!doctor) {
        throw new Error('Bác sĩ không tồn tại');
    }
    if (doctor.deleted_at !== null && !includeDeleted) {
        throw new Error('Bác sĩ này hiện không còn hoạt động');
    }
    return doctor;
};
exports.getDoctorByIdService = getDoctorByIdService;
/**
 * Admin cập nhật hồ sơ bác sĩ theo doctorId
 */
const updateDoctorService = async (doctorId, data) => {
    const doctor = await client_js_1.prisma.doctor.findUnique({
        where: { id: doctorId },
        include: { user: true },
    });
    if (!doctor) {
        throw new Error('Bác sĩ không tồn tại');
    }
    if (doctor.deleted_at !== null) {
        throw new Error('Hồ sơ bác sĩ này đã bị xóa, vui lòng khôi phục trước khi cập nhật');
    }
    if (data.specialty_id !== undefined) {
        const specialty = await client_js_1.prisma.specialty.findUnique({
            where: { id: data.specialty_id },
        });
        if (!specialty) {
            throw new Error('Chuyên khoa không tồn tại');
        }
    }
    // Dữ liệu bảng Doctor
    const doctorUpdate = {};
    if (data.specialty_id !== undefined)
        doctorUpdate.specialty_id = data.specialty_id;
    if (data.description !== undefined)
        doctorUpdate.description = data.description;
    if (data.price !== undefined)
        doctorUpdate.price = data.price;
    // Dữ liệu bảng User
    const userUpdate = {};
    if (data.full_name !== undefined)
        userUpdate.full_name = data.full_name;
    if (data.phone_number !== undefined)
        userUpdate.phone_number = data.phone_number;
    if (data.avatar !== undefined)
        userUpdate.avatar = data.avatar;
    const updated = await client_js_1.prisma.$transaction(async (tx) => {
        if (Object.keys(doctorUpdate).length > 0) {
            await tx.doctor.update({
                where: { id: doctorId },
                data: doctorUpdate,
            });
        }
        if (Object.keys(userUpdate).length > 0 && doctor.user_id) {
            await tx.user.update({
                where: { id: doctor.user_id },
                data: userUpdate,
            });
        }
        return tx.doctor.findUnique({
            where: { id: doctorId },
            include: {
                user: {
                    select: {
                        id: true,
                        full_name: true,
                        email: true,
                        phone_number: true,
                        avatar: true,
                        gender: true,
                        deleted_at: true,
                    },
                },
                specialty: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                    },
                },
            },
        });
    });
    return updated;
};
exports.updateDoctorService = updateDoctorService;
/**
 * Xóa mềm bác sĩ theo doctorId
 * Đồng thời xóa mềm tài khoản user tương ứng
 */
const deleteDoctorService = async (doctorId) => {
    const doctor = await client_js_1.prisma.doctor.findUnique({
        where: { id: doctorId },
    });
    if (!doctor) {
        throw new Error('Bác sĩ không tồn tại');
    }
    if (doctor.deleted_at !== null) {
        throw new Error('Bác sĩ này đã bị xóa từ trước');
    }
    const now = new Date();
    await client_js_1.prisma.$transaction(async (tx) => {
        // 1. Xóa mềm hồ sơ doctor
        await tx.doctor.update({
            where: { id: doctorId },
            data: { deleted_at: now },
        });
        // 2. Xóa mềm tài khoản user tương ứng
        if (doctor.user_id) {
            await tx.user.update({
                where: { id: doctor.user_id },
                data: { deleted_at: now },
            });
        }
    });
    return true;
};
exports.deleteDoctorService = deleteDoctorService;
/**
 * Khôi phục bác sĩ theo doctorId
 * Đồng thời khôi phục tài khoản user tương ứng
 */
const restoreDoctorService = async (doctorId) => {
    const doctor = await client_js_1.prisma.doctor.findUnique({
        where: { id: doctorId },
    });
    if (!doctor) {
        throw new Error('Bác sĩ không tồn tại');
    }
    if (doctor.deleted_at === null) {
        throw new Error('Bác sĩ này đang hoạt động bình thường, không cần khôi phục');
    }
    await client_js_1.prisma.$transaction(async (tx) => {
        // 1. Khôi phục hồ sơ doctor
        await tx.doctor.update({
            where: { id: doctorId },
            data: { deleted_at: null },
        });
        // 2. Khôi phục tài khoản user tương ứng
        if (doctor.user_id) {
            await tx.user.update({
                where: { id: doctor.user_id },
                data: { deleted_at: null },
            });
        }
    });
    return true;
};
exports.restoreDoctorService = restoreDoctorService;
