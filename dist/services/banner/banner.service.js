"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBannerService = exports.changeBannerStatusService = exports.updateBannerService = exports.createBannerService = exports.getBannersService = exports.getActiveBannersClientService = void 0;
const client_js_1 = require("../../config/client.js");
const constant_js_1 = require("../../config/constant.js");
/**
 * Lấy danh sách banner cho Client/User hiển thị marketing
 * - Chỉ lấy các banner đang hoạt động (is_active: true)
 * - Sắp xếp theo sort_order tăng dần và id giảm dần
 * - Không search, không phân trang
 */
const getActiveBannersClientService = async () => {
    const banners = await client_js_1.prisma.banner.findMany({
        where: { is_active: true },
        orderBy: [
            { sort_order: 'asc' },
            { id: 'desc' },
        ],
    });
    return banners;
};
exports.getActiveBannersClientService = getActiveBannersClientService;
/**
 * Lấy danh sách banner cho Admin
 * - Hỗ trợ tìm kiếm theo tiêu đề (search)
 * - Lọc theo trạng thái hiển thị (status: 'active' | 'inactive' | 'all')
 * - Sắp xếp theo sort_order tăng dần và id giảm dần
 * - Phân trang
 */
const getBannersService = async (options) => {
    const search = options?.search?.trim();
    const status = options?.status || 'all';
    const where = {};
    if (status === 'active' || status === 'true') {
        where.is_active = true;
    }
    else if (status === 'inactive' || status === 'false') {
        where.is_active = false;
    }
    // Nếu status === 'all' hoặc không xác định thì không filter is_active
    if (search) {
        where.title = { contains: search };
    }
    const orderBy = [
        { sort_order: 'asc' },
        { id: 'desc' },
    ];
    if (options?.all) {
        const banners = await client_js_1.prisma.banner.findMany({
            where,
            orderBy,
        });
        return {
            banners,
            pagination: {
                total: banners.length,
                page: 1,
                pageSize: banners.length,
                totalPages: 1,
            },
        };
    }
    const page = Math.max(1, Number(options?.page || 1));
    const size = options?.pageSize ? Math.max(1, Number(options.pageSize)) : constant_js_1.pageSize;
    const skip = (page - 1) * size;
    const [total, banners] = await client_js_1.prisma.$transaction([
        client_js_1.prisma.banner.count({ where }),
        client_js_1.prisma.banner.findMany({
            where,
            skip,
            take: size,
            orderBy,
        }),
    ]);
    return {
        banners,
        pagination: {
            total,
            page,
            pageSize: size,
            totalPages: Math.ceil(total / size),
        },
    };
};
exports.getBannersService = getBannersService;
/**
 * Thêm mới banner
 * sort_order: tự động tăng (increment) dựa vào số lượng banner hiện có
 */
const createBannerService = async (data) => {
    // Đếm số lượng banner hiện có để tự động gán sort_order increment
    const currentCount = await client_js_1.prisma.banner.count();
    const sortOrder = data.sort_order !== undefined && data.sort_order !== null
        ? data.sort_order
        : currentCount + 1;
    const banner = await client_js_1.prisma.banner.create({
        data: {
            title: data.title,
            image_url: data.image_url,
            link_url: data.link_url ?? null,
            sort_order: sortOrder,
            is_active: data.is_active ?? true,
        },
    });
    return banner;
};
exports.createBannerService = createBannerService;
/**
 * Cập nhật thông tin banner
 * - Không giới hạn khoảng sort_order.
 * - Nếu sort_order trùng với banner khác thì hoán đổi (swap) sort_order cho nhau.
 */
const updateBannerService = async (bannerId, data) => {
    const banner = await client_js_1.prisma.banner.findUnique({
        where: { id: bannerId },
    });
    if (!banner) {
        throw new Error('Banner không tồn tại');
    }
    const updateData = {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.image_url !== undefined && { image_url: data.image_url }),
        ...(data.link_url !== undefined && { link_url: data.link_url }),
    };
    // Xử lý sort_order: nếu trùng với banner khác thì hoán đổi (swap) cho nhau
    if (data.sort_order !== undefined && data.sort_order !== null) {
        if (data.sort_order !== banner.sort_order) {
            // Tìm banner khác đang sở hữu sort_order này
            const conflictingBanner = await client_js_1.prisma.banner.findFirst({
                where: {
                    id: { not: bannerId },
                    sort_order: data.sort_order,
                },
            });
            // Nếu tìm thấy banner trùng sort_order -> Hoán đổi vị trí của 2 banner
            if (conflictingBanner) {
                const [_, updated] = await client_js_1.prisma.$transaction([
                    client_js_1.prisma.banner.update({
                        where: { id: conflictingBanner.id },
                        data: { sort_order: banner.sort_order },
                    }),
                    client_js_1.prisma.banner.update({
                        where: { id: bannerId },
                        data: {
                            ...updateData,
                            sort_order: data.sort_order,
                        },
                    }),
                ]);
                return updated;
            }
        }
        updateData.sort_order = data.sort_order;
    }
    await client_js_1.prisma.banner.update({
        where: { id: bannerId },
        data: updateData,
    });
    return true;
};
exports.updateBannerService = updateBannerService;
/**
 * Cập nhật trạng thái hiển thị của banner (is_active)
 */
const changeBannerStatusService = async (bannerId, is_active) => {
    const banner = await client_js_1.prisma.banner.findUnique({
        where: { id: bannerId },
    });
    if (!banner) {
        throw new Error('Banner không tồn tại');
    }
    await client_js_1.prisma.banner.update({
        where: { id: bannerId },
        data: { is_active },
    });
    return true;
};
exports.changeBannerStatusService = changeBannerStatusService;
/**
 * Xóa cứng banner khỏi database (Hard delete)
 */
const deleteBannerService = async (bannerId) => {
    const banner = await client_js_1.prisma.banner.findUnique({
        where: { id: bannerId },
    });
    if (!banner) {
        throw new Error('Banner không tồn tại');
    }
    await client_js_1.prisma.banner.delete({
        where: { id: bannerId },
    });
    return true;
};
exports.deleteBannerService = deleteBannerService;
