import { prisma } from '../../config/client.js';
import { pageSize as defaultPageSize } from '../../config/constant.js';
import {
    CreateBannerData,
    GetBannersOptions,
    UpdateBannerData,
} from '../../types/banner/Banner.js';

/**
 * Lấy danh sách banner cho Client/User hiển thị marketing
 * - Chỉ lấy các banner đang hoạt động (is_active: true)
 * - Sắp xếp theo sort_order tăng dần và id giảm dần
 * - Không search, không phân trang
 */
export const getActiveBannersClientService = async () => {
    const banners = await prisma.banner.findMany({
        where: { is_active: true },
        orderBy: [
            { sort_order: 'asc' },
            { id: 'desc' },
        ],
    });

    return banners;
};

/**
 * Lấy danh sách banner cho Admin
 * - Hỗ trợ tìm kiếm theo tiêu đề (search)
 * - Lọc theo trạng thái hiển thị (status: 'active' | 'inactive' | 'all')
 * - Sắp xếp theo sort_order tăng dần và id giảm dần
 * - Phân trang
 */
export const getBannersService = async (options?: GetBannersOptions) => {
    const search = options?.search?.trim();
    const status = options?.status || 'all';

    const where: any = {};

    if (status === 'active' || status === 'true') {
        where.is_active = true;
    } else if (status === 'inactive' || status === 'false') {
        where.is_active = false;
    }
    // Nếu status === 'all' hoặc không xác định thì không filter is_active

    if (search) {
        where.title = { contains: search };
    }

    const orderBy = [
        { sort_order: 'asc' as const },
        { id: 'desc' as const },
    ];

    if (options?.all) {
        const banners = await prisma.banner.findMany({
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
    const size = options?.pageSize ? Math.max(1, Number(options.pageSize)) : defaultPageSize;
    const skip = (page - 1) * size;

    const [total, banners] = await prisma.$transaction([
        prisma.banner.count({ where }),
        prisma.banner.findMany({
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


/**
 * Thêm mới banner
 * sort_order: tự động tăng (increment) dựa vào số lượng banner hiện có
 */
export const createBannerService = async (data: CreateBannerData) => {
    // Đếm số lượng banner hiện có để tự động gán sort_order increment
    const currentCount = await prisma.banner.count();
    const sortOrder =
        data.sort_order !== undefined && data.sort_order !== null
            ? data.sort_order
            : currentCount + 1;

    const banner = await prisma.banner.create({
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

/**
 * Cập nhật thông tin banner
 * - Không giới hạn khoảng sort_order.
 * - Nếu sort_order trùng với banner khác thì hoán đổi (swap) sort_order cho nhau.
 */
export const updateBannerService = async (bannerId: number, data: UpdateBannerData) => {
    const banner = await prisma.banner.findUnique({
        where: { id: bannerId },
    });

    if (!banner) {
        throw new Error('Banner không tồn tại');
    }

    const updateData: any = {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.image_url !== undefined && { image_url: data.image_url }),
        ...(data.link_url !== undefined && { link_url: data.link_url }),
    };

    // Xử lý sort_order: nếu trùng với banner khác thì hoán đổi (swap) cho nhau
    if (data.sort_order !== undefined && data.sort_order !== null) {
        if (data.sort_order !== banner.sort_order) {
            // Tìm banner khác đang sở hữu sort_order này
            const conflictingBanner = await prisma.banner.findFirst({
                where: {
                    id: { not: bannerId },
                    sort_order: data.sort_order,
                },
            });

            // Nếu tìm thấy banner trùng sort_order -> Hoán đổi vị trí của 2 banner
            if (conflictingBanner) {
                const [_, updated] = await prisma.$transaction([
                    prisma.banner.update({
                        where: { id: conflictingBanner.id },
                        data: { sort_order: banner.sort_order },
                    }),
                    prisma.banner.update({
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

    await prisma.banner.update({
        where: { id: bannerId },
        data: updateData,
    });

    return true;
};

/**
 * Cập nhật trạng thái hiển thị của banner (is_active)
 */
export const changeBannerStatusService = async (bannerId: number, is_active: boolean) => {
    const banner = await prisma.banner.findUnique({
        where: { id: bannerId },
    });

    if (!banner) {
        throw new Error('Banner không tồn tại');
    }

    await prisma.banner.update({
        where: { id: bannerId },
        data: { is_active },
    });

    return true;
};

/**
 * Xóa cứng banner khỏi database (Hard delete)
 */
export const deleteBannerService = async (bannerId: number) => {
    const banner = await prisma.banner.findUnique({
        where: { id: bannerId },
    });

    if (!banner) {
        throw new Error('Banner không tồn tại');
    }

    await prisma.banner.delete({
        where: { id: bannerId },
    });

    return true;
};
