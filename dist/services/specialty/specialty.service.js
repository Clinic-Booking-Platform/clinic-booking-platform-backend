"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSpecialtyByIdService = exports.getSpecialtiesService = void 0;
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
    // Nếu client truyền query `page` -> thực hiện phân trang
    if (options?.page) {
        const page = Math.max(1, Number(options.page));
        const size = options.pageSize || constant_js_1.pageSize;
        const skip = (page - 1) * size;
        const [total, specialties] = await Promise.all([
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
    }
    // Không truyền `page` -> lấy toàn bộ danh sách chuyên khoa (tiện cho dropdown / trang chủ)
    const specialties = await client_js_1.prisma.specialty.findMany({
        where,
        include,
        orderBy: { id: 'asc' },
    });
    return {
        specialties,
        total: specialties.length,
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
