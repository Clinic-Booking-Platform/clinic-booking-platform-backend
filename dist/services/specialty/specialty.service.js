"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.restoreSpecialtyService = exports.deleteSpecialtyService = exports.updateSpecialtyService = exports.createSpecialtyService = exports.getSpecialtyByIdService = exports.getSpecialtiesService = void 0;
const client_js_1 = require("../../config/client.js");
const constant_js_1 = require("../../config/constant.js");
/**
 * Lấy danh sách chuyên khoa
 * Hỗ trợ tìm kiếm theo tên, phân trang hoặc lấy toàn bộ, và lọc trạng thái hoạt động
 */
const getSpecialtiesService = async (options) => {
    const search = options?.search?.trim();
    const status = options?.status || 'active'; // Mặc định chỉ lấy chuyên khoa đang hoạt động
    const where = {};
    if (status === 'active') {
        where.deleted_at = null;
    }
    else if (status === 'deleted') {
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
    const page = Math.max(1, Number(options?.page || 1));
    const size = options?.pageSize || constant_js_1.pageSize;
    const skip = (page - 1) * size;
    const [total, specialties] = await client_js_1.prisma.$transaction([
        client_js_1.prisma.specialty.count({ where }),
        client_js_1.prisma.specialty.findMany({
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
exports.getSpecialtiesService = getSpecialtiesService;
/**
 * Lấy chi tiết 1 chuyên khoa theo specialtyId
 * Kèm danh sách bác sĩ thuộc chuyên khoa này
 */
const getSpecialtyByIdService = async (specialtyId, includeDeleted = false) => {
    const specialty = await client_js_1.prisma.specialty.findUnique({
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
exports.getSpecialtyByIdService = getSpecialtyByIdService;
/**
 * Thêm mới chuyên khoa
 */
const createSpecialtyService = async (data) => {
    // Kiểm tra tên chuyên khoa trùng lặp (trong số chuyên khoa chưa xóa)
    const existing = await client_js_1.prisma.specialty.findFirst({
        where: {
            name: data.name,
        },
    });
    if (existing) {
        throw new Error('Tên chuyên khoa này đã tồn tại');
    }
    const specialty = await client_js_1.prisma.specialty.create({
        data: {
            name: data.name,
            description: data.description,
            image_url: data.image_url,
        },
    });
    return specialty;
};
exports.createSpecialtyService = createSpecialtyService;
/**
 * Cập nhật thông tin chuyên khoa
 */
const updateSpecialtyService = async (specialtyId, data) => {
    const specialty = await client_js_1.prisma.specialty.findUnique({
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
        const existing = await client_js_1.prisma.specialty.findFirst({
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
    const updated = await client_js_1.prisma.specialty.update({
        where: { id: specialtyId },
        data: {
            name: data.name,
            description: data.description,
            image_url: data.image_url,
        },
    });
    return updated;
};
exports.updateSpecialtyService = updateSpecialtyService;
/**
 * Xóa mềm chuyên khoa
 */
const deleteSpecialtyService = async (specialtyId) => {
    const specialty = await client_js_1.prisma.specialty.findUnique({
        where: { id: specialtyId },
    });
    if (!specialty) {
        throw new Error('Chuyên khoa không tồn tại');
    }
    if (specialty.deleted_at !== null) {
        throw new Error('Chuyên khoa này đã bị xóa từ trước');
    }
    // Kiểm tra ràng buộc: Còn bác sĩ đang hoạt động trong chuyên khoa này hay không
    const activeDoctorsCount = await client_js_1.prisma.doctor.count({
        where: {
            specialty_id: specialtyId,
            deleted_at: null,
        },
    });
    if (activeDoctorsCount > 0) {
        throw new Error(`Không thể xóa chuyên khoa này vì vẫn còn ${activeDoctorsCount} bác sĩ đang hoạt động`);
    }
    await client_js_1.prisma.specialty.update({
        where: { id: specialtyId },
        data: { deleted_at: new Date() },
    });
    return true;
};
exports.deleteSpecialtyService = deleteSpecialtyService;
/**
 * Khôi phục chuyên khoa đã bị xóa mềm
 */
const restoreSpecialtyService = async (specialtyId) => {
    const specialty = await client_js_1.prisma.specialty.findUnique({
        where: { id: specialtyId },
    });
    if (!specialty) {
        throw new Error('Chuyên khoa không tồn tại');
    }
    if (specialty.deleted_at === null) {
        throw new Error('Chuyên khoa này đang hoạt động bình thường, không cần khôi phục');
    }
    await client_js_1.prisma.specialty.update({
        where: { id: specialtyId },
        data: { deleted_at: null },
    });
    return true;
};
exports.restoreSpecialtyService = restoreSpecialtyService;
