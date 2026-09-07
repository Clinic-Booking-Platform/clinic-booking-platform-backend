import { prisma } from '../../config/client.js';
import { RoleType, pageSize as defaultPageSize, pageSize } from '../../config/constant.js';
import { GetUsersOptions, UpdateUserData } from '../../types/user/User.js';


/**
 * Lấy danh sách người dùng thông thường (chỉ role USER, không lấy ADMIN và DOCTOR)
 */
export const getUsersService = async (options?: GetUsersOptions) => {
    const page = Math.max(1, Number(options?.page || 1));
    const search = options?.search?.trim();
    const status = options?.status || 'all';

    const where: any = {
        role: {
            name: RoleType.USER,
        },
    };

    if (status === 'active') {
        where.deleted_at = null;
    } else if (status === 'deleted') {
        where.deleted_at = { not: null };
    }

    if (search) {
        where.OR = [
            { full_name: { contains: search } },
            { email: { contains: search } },
            { phone_number: { contains: search } },
        ];
    }

    const skip = (page - 1) * pageSize;
    const [total, users] = await Promise.all([
        prisma.user.count({ where }),
        prisma.user.findMany({
            where,
            omit: { password: true },
            skip,
            take: pageSize,
            orderBy: { id: 'desc' },
        }),
    ]);

    return {
        users,
        pagination: {
            total,
            page,
            pageSize: pageSize,
            totalPages: Math.ceil(total / pageSize),
        },
    };
};

/**
 * Xóa mềm người dùng (chỉ áp dụng cho role USER)
 */
export const deleteUserService = async (userId: number) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { role: true },
    });

    if (!user) {
        throw new Error('Người dùng không tồn tại');
    }

    if (user.role?.name === RoleType.ADMIN) {
        throw new Error('Không thể xóa tài khoản Quản trị viên (ADMIN)');
    }

    if (user.role?.name === RoleType.DOCTOR) {
        throw new Error('Đây là tài khoản Bác sĩ. Vui lòng thao tác tại mục Quản lý Bác sĩ (/admin/doctors/:id)');
    }

    if (user.deleted_at !== null) {
        throw new Error('Tài khoản này đã bị xóa từ trước');
    }

    await prisma.user.update({
        where: { id: userId },
        data: { deleted_at: new Date() },
    });

    return true;
};

/**
 * Khôi phục người dùng đã xóa mềm (chỉ áp dụng cho role USER)
 */
export const restoreUserService = async (userId: number) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { role: true },
    });

    if (!user) {
        throw new Error('Người dùng không tồn tại');
    }

    if (user.role?.name === RoleType.ADMIN) {
        throw new Error('Không thể thao tác trên tài khoản Quản trị viên (ADMIN)');
    }

    if (user.role?.name === RoleType.DOCTOR) {
        throw new Error('Đây là tài khoản Bác sĩ. Vui lòng thao tác tại mục Quản lý Bác sĩ (/admin/doctors-restore/:id)');
    }

    if (user.deleted_at === null) {
        throw new Error('Tài khoản này đang hoạt động bình thường, không cần khôi phục');
    }

    await prisma.user.update({
        where: { id: userId },
        data: { deleted_at: null },
    });

    return true;
};

export const getMeService = async (userId: number) => {
    const user = await prisma.user.findUnique({
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
    if (user.role?.name !== RoleType.DOCTOR) {
        const { doctor, ...userWithoutDoctor } = user;
        return userWithoutDoctor;
    }

    return user;
};



/**
 * Cập nhật thông tin tài khoản người dùng đang đăng nhập
 * Hỗ trợ cập nhật thêm thông tin Bác sĩ (chuyên khoa, giá, mô tả) nếu role là DOCTOR
 */
export const updateMeService = async (userId: number, data: UpdateUserData) => {
    const user = await prisma.user.findUnique({
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
    const userUpdateData: any = {};
    if (data.full_name !== undefined) userUpdateData.full_name = data.full_name;
    if (data.phone_number !== undefined) userUpdateData.phone_number = data.phone_number;
    if (data.gender !== undefined) userUpdateData.gender = data.gender;
    if (data.avatar !== undefined) userUpdateData.avatar = data.avatar;
    if (data.date_of_birth !== undefined) {
        userUpdateData.date_of_birth = data.date_of_birth ? new Date(data.date_of_birth) : null;
    }

    // Chuẩn bị dữ liệu cập nhật Doctor (nếu user là Bác sĩ)
    const doctorUpdateData: any = {};
    if (user.role?.name === RoleType.DOCTOR) {
        if (data.specialty_id !== undefined) {
            const specialty = await prisma.specialty.findUnique({
                where: { id: data.specialty_id },
            });
            if (!specialty) {
                throw new Error('Chuyên khoa không tồn tại');
            }
            doctorUpdateData.specialty_id = data.specialty_id;
        }
        if (data.description !== undefined) doctorUpdateData.description = data.description;
        if (data.price !== undefined) doctorUpdateData.price = data.price;
    }

    // Thực hiện transaction để cập nhật đồng bộ
    const updated = await prisma.$transaction(async (tx) => {
        if (Object.keys(userUpdateData).length > 0) {
            await tx.user.update({
                where: { id: userId },
                data: userUpdateData,
            });
        }

        if (user.role?.name === RoleType.DOCTOR && Object.keys(doctorUpdateData).length > 0) {
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
    if (updated.role?.name !== RoleType.DOCTOR) {
        const { doctor, ...userWithoutDoctor } = updated;
        return userWithoutDoctor;
    }

    return updated;
};
