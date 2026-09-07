"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMeService = exports.getMeService = exports.restoreUserService = exports.deleteUserService = exports.getUsersService = void 0;
const client_js_1 = require("../../config/client.js");
const constant_js_1 = require("../../config/constant.js");
/**
 * Lấy danh sách người dùng thông thường (chỉ role USER, không lấy ADMIN và DOCTOR)
 */
const getUsersService = async (options) => {
    const page = Math.max(1, Number(options?.page || 1));
    const search = options?.search?.trim();
    const status = options?.status || 'all';
    const where = {
        role: {
            name: constant_js_1.RoleType.USER,
        },
    };
    if (status === 'active') {
        where.deleted_at = null;
    }
    else if (status === 'deleted') {
        where.deleted_at = { not: null };
    }
    if (search) {
        where.OR = [
            { full_name: { contains: search } },
            { email: { contains: search } },
            { phone_number: { contains: search } },
        ];
    }
    const skip = (page - 1) * constant_js_1.pageSize;
    const [total, users] = await Promise.all([
        client_js_1.prisma.user.count({ where }),
        client_js_1.prisma.user.findMany({
            where,
            omit: { password: true },
            skip,
            take: constant_js_1.pageSize,
            orderBy: { id: 'desc' },
        }),
    ]);
    return {
        users,
        pagination: {
            total,
            page,
            pageSize: constant_js_1.pageSize,
            totalPages: Math.ceil(total / constant_js_1.pageSize),
        },
    };
};
exports.getUsersService = getUsersService;
/**
 * Xóa mềm người dùng (chỉ áp dụng cho role USER)
 */
const deleteUserService = async (userId) => {
    const user = await client_js_1.prisma.user.findUnique({
        where: { id: userId },
        include: { role: true },
    });
    if (!user) {
        throw new Error('Người dùng không tồn tại');
    }
    if (user.role?.name === constant_js_1.RoleType.ADMIN) {
        throw new Error('Không thể xóa tài khoản Quản trị viên (ADMIN)');
    }
    if (user.role?.name === constant_js_1.RoleType.DOCTOR) {
        throw new Error('Đây là tài khoản Bác sĩ. Vui lòng thao tác tại mục Quản lý Bác sĩ (/admin/doctors/:id)');
    }
    if (user.deleted_at !== null) {
        throw new Error('Tài khoản này đã bị xóa từ trước');
    }
    await client_js_1.prisma.user.update({
        where: { id: userId },
        data: { deleted_at: new Date() },
    });
    return true;
};
exports.deleteUserService = deleteUserService;
/**
 * Khôi phục người dùng đã xóa mềm (chỉ áp dụng cho role USER)
 */
const restoreUserService = async (userId) => {
    const user = await client_js_1.prisma.user.findUnique({
        where: { id: userId },
        include: { role: true },
    });
    if (!user) {
        throw new Error('Người dùng không tồn tại');
    }
    if (user.role?.name === constant_js_1.RoleType.ADMIN) {
        throw new Error('Không thể thao tác trên tài khoản Quản trị viên (ADMIN)');
    }
    if (user.role?.name === constant_js_1.RoleType.DOCTOR) {
        throw new Error('Đây là tài khoản Bác sĩ. Vui lòng thao tác tại mục Quản lý Bác sĩ (/admin/doctors-restore/:id)');
    }
    if (user.deleted_at === null) {
        throw new Error('Tài khoản này đang hoạt động bình thường, không cần khôi phục');
    }
    await client_js_1.prisma.user.update({
        where: { id: userId },
        data: { deleted_at: null },
    });
    return true;
};
exports.restoreUserService = restoreUserService;
const getMeService = async (userId) => {
    const user = await client_js_1.prisma.user.findUnique({
        where: { id: userId },
        omit: { password: true },
        include: {
            role: {
                select: {
                    name: true,
                    description: true,
                },
            },
            doctor: {
                include: {
                    specialty: {
                        select: {
                            id: true,
                            name: true,
                            description: true,
                        },
                    },
                },
            },
        },
    });
    if (!user) {
        throw new Error('Người dùng không tồn tại');
    }
    if (user.deleted_at !== null) {
        throw new Error('Tài khoản này đã bị khóa hoặc xóa');
    }
    // Nếu không phải là Bác sĩ thì không cần trả về trường doctor
    if (user.role?.name !== constant_js_1.RoleType.DOCTOR) {
        const { doctor, ...userWithoutDoctor } = user;
        return userWithoutDoctor;
    }
    return user;
};
exports.getMeService = getMeService;
/**
 * Cập nhật thông tin tài khoản người dùng đang đăng nhập
 * Hỗ trợ cập nhật thêm thông tin Bác sĩ (chuyên khoa, giá, mô tả) nếu role là DOCTOR
 */
const updateMeService = async (userId, data) => {
    const user = await client_js_1.prisma.user.findUnique({
        where: { id: userId },
        include: { role: true, doctor: true },
    });
    if (!user) {
        throw new Error('Người dùng không tồn tại');
    }
    if (user.deleted_at !== null) {
        throw new Error('Tài khoản này đã bị khóa hoặc xóa');
    }
    // Chuẩn bị dữ liệu cập nhật User
    const userUpdateData = {};
    if (data.full_name !== undefined)
        userUpdateData.full_name = data.full_name;
    if (data.phone_number !== undefined)
        userUpdateData.phone_number = data.phone_number;
    if (data.gender !== undefined)
        userUpdateData.gender = data.gender;
    if (data.avatar !== undefined)
        userUpdateData.avatar = data.avatar;
    if (data.date_of_birth !== undefined) {
        userUpdateData.date_of_birth = data.date_of_birth ? new Date(data.date_of_birth) : null;
    }
    // Chuẩn bị dữ liệu cập nhật Doctor (nếu user là Bác sĩ)
    const doctorUpdateData = {};
    if (user.role?.name === constant_js_1.RoleType.DOCTOR) {
        if (data.specialty_id !== undefined) {
            const specialty = await client_js_1.prisma.specialty.findUnique({
                where: { id: data.specialty_id },
            });
            if (!specialty) {
                throw new Error('Chuyên khoa không tồn tại');
            }
            doctorUpdateData.specialty_id = data.specialty_id;
        }
        if (data.description !== undefined)
            doctorUpdateData.description = data.description;
        if (data.price !== undefined)
            doctorUpdateData.price = data.price;
    }
    // Thực hiện transaction để cập nhật đồng bộ
    const updated = await client_js_1.prisma.$transaction(async (tx) => {
        if (Object.keys(userUpdateData).length > 0) {
            await tx.user.update({
                where: { id: userId },
                data: userUpdateData,
            });
        }
        if (user.role?.name === constant_js_1.RoleType.DOCTOR && Object.keys(doctorUpdateData).length > 0) {
            await tx.doctor.upsert({
                where: { user_id: userId },
                update: doctorUpdateData,
                create: {
                    user_id: userId,
                    specialty_id: data.specialty_id || 1,
                    description: data.description || '',
                    price: data.price || 150000,
                },
            });
        }
        return tx.user.findUnique({
            where: { id: userId },
            omit: { password: true },
            include: {
                role: {
                    select: {
                        name: true,
                        description: true,
                    },
                },
                doctor: {
                    include: {
                        specialty: {
                            select: {
                                id: true,
                                name: true,
                                description: true,
                            },
                        },
                    },
                },
            },
        });
    });
    if (!updated) {
        throw new Error('Cập nhật thông tin thất bại');
    }
    // Nếu không phải là Doctor thì loại bỏ trường doctor
    if (updated.role?.name !== constant_js_1.RoleType.DOCTOR) {
        const { doctor, ...userWithoutDoctor } = updated;
        return userWithoutDoctor;
    }
    return updated;
};
exports.updateMeService = updateMeService;
