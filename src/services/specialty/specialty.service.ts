import { prisma } from '../../config/client.js';
import { pageSize as defaultPageSize } from '../../config/constant.js';
import {
    CreateSpecialtyData,
    GetSpecialtiesOptions,
    UpdateSpecialtyData,
} from '../../types/specialty/Specialty.js';

/**
 * Lấy danh sách chuyên khoa
 * Hỗ trợ tìm kiếm theo tên, phân trang hoặc lấy toàn bộ, và lọc trạng thái hoạt động
 */
export const getSpecialtiesService = async (options?: GetSpecialtiesOptions) => {
    const search = options?.search?.trim();
    const status = options?.status || 'active'; // Mặc định chỉ lấy chuyên khoa đang hoạt động

    const where: any = {};

    if (status === 'active') {
        where.deleted_at = null;
    } else if (status === 'deleted') {
        where.deleted_at = { not: null };
    }

    if (search) {
        where.name = { contains: search };
    }

    const include = {
        _count: {
            select: {
                doctors: { where: { deleted_at: null } },
            },
        },
    };

    if (options?.all) {
        const specialties = await prisma.specialty.findMany({
            where,
            include,
            orderBy: { id: 'asc' },
        });

        return {
            specialties,
            pagination: {
                total: specialties.length,
                page: 1,
                pageSize: specialties.length,
                totalPages: 1,
            },
        };
    }

    const page = Math.max(1, Number(options?.page || 1));
    const size = options?.pageSize ? Math.max(1, Number(options.pageSize)) : defaultPageSize;
    const skip = (page - 1) * size;

    const [total, specialties] = await prisma.$transaction([
        prisma.specialty.count({ where }),
        prisma.specialty.findMany({
            where,
            include,
            skip,
            take: size,
            orderBy: { id: 'asc' },
        }),
    ]);

    return {
        specialties,
        pagination: {
            total,
            page,
            pageSize: size,
            totalPages: Math.ceil(total / size),
        },
    };
};

/**
 * Lấy chi tiết 1 chuyên khoa theo specialtyId
 * Kèm danh sách bác sĩ thuộc chuyên khoa này
 */
export const getSpecialtyByIdService = async (specialtyId: number, includeDeleted: boolean = false) => {
    const specialty = await prisma.specialty.findUnique({
        where: { id: specialtyId },
        include: {
            doctors: {
                where: { deleted_at: null },
                include: {
                    user: {
                        select: {
                            id: true,
                            full_name: true,
                            email: true,
                            phone_number: true,
                            avatar: true,
                            gender: true,
                        },
                    },
                },
            },
            _count: {
                select: {
                    doctors: { where: { deleted_at: null } },
                    articles: { where: { deleted_at: null } },
                },
            },
        },
    });

    if (!specialty) {
        throw new Error('Chuyên khoa không tồn tại');
    }

    if (specialty.deleted_at !== null && !includeDeleted) {
        throw new Error('Chuyên khoa này hiện không còn hoạt động');
    }

    return specialty;
};

/**
 * Thêm mới chuyên khoa
 */
export const createSpecialtyService = async (data: CreateSpecialtyData) => {
    // Kiểm tra tên chuyên khoa trùng lặp (trong số chuyên khoa chưa xóa)
    const existing = await prisma.specialty.findFirst({
        where: {
            name: data.name,
        },
    });

    if (existing) {
        throw new Error('Tên chuyên khoa này đã tồn tại');
    }

    const specialty = await prisma.specialty.create({
        data: {
            name: data.name,
            description: data.description,
            image_url: data.image_url,
        },
    });

    return specialty;
};

/**
 * Cập nhật thông tin chuyên khoa
 */
export const updateSpecialtyService = async (specialtyId: number, data: UpdateSpecialtyData) => {
    const specialty = await prisma.specialty.findUnique({
        where: { id: specialtyId },
    });

    if (!specialty) {
        throw new Error('Chuyên khoa không tồn tại');
    }

    if (specialty.deleted_at !== null) {
        throw new Error('Chuyên khoa này đã bị xóa, vui lòng khôi phục trước khi cập nhật');
    }

    // Nếu cập nhật tên, kiểm tra trùng lặp với chuyên khoa khác
    if (data.name && data.name !== specialty.name) {
        const existing = await prisma.specialty.findFirst({
            where: {
                name: data.name,
                id: { not: specialtyId },
                deleted_at: null,
            },
        });

        if (existing) {
            throw new Error('Tên chuyên khoa này đã được sử dụng');
        }
    }

    const updated = await prisma.specialty.update({
        where: { id: specialtyId },
        data: {
            name: data.name,
            description: data.description,
            image_url: data.image_url,
        },
    });

    return updated;
};

/**
 * Xóa mềm chuyên khoa
 */
export const deleteSpecialtyService = async (specialtyId: number) => {
    const specialty = await prisma.specialty.findUnique({
        where: { id: specialtyId },
    });

    if (!specialty) {
        throw new Error('Chuyên khoa không tồn tại');
    }

    if (specialty.deleted_at !== null) {
        throw new Error('Chuyên khoa này đã bị xóa từ trước');
    }

    // Kiểm tra ràng buộc: Còn bác sĩ đang hoạt động trong chuyên khoa này hay không
    const activeDoctorsCount = await prisma.doctor.count({
        where: {
            specialty_id: specialtyId,
            deleted_at: null,
        },
    });

    if (activeDoctorsCount > 0) {
        throw new Error(`Không thể xóa chuyên khoa này vì vẫn còn ${activeDoctorsCount} bác sĩ đang hoạt động`);
    }

    await prisma.specialty.update({
        where: { id: specialtyId },
        data: { deleted_at: new Date() },
    });

    return true;
};

/**
 * Khôi phục chuyên khoa đã bị xóa mềm
 */
export const restoreSpecialtyService = async (specialtyId: number) => {
    const specialty = await prisma.specialty.findUnique({
        where: { id: specialtyId },
    });

    if (!specialty) {
        throw new Error('Chuyên khoa không tồn tại');
    }

    if (specialty.deleted_at === null) {
        throw new Error('Chuyên khoa này đang hoạt động bình thường, không cần khôi phục');
    }

    await prisma.specialty.update({
        where: { id: specialtyId },
        data: { deleted_at: null },
    });

    return true;
};
