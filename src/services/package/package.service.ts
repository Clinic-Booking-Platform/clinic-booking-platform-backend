import { prisma } from '../../config/client.js';
import { pageSize as defaultPageSize } from '../../config/constant.js';
import {
    CreatePackageData,
    GetPackagesOptions,
    UpdatePackageData,
} from '../../types/package/Package.js';

/**
 * Lấy danh sách gói khám
 * Hỗ trợ tìm kiếm theo tên, phân trang, và lọc trạng thái hoạt động
 */
export const getPackagesService = async (options?: GetPackagesOptions) => {
    const search = options?.search?.trim();
    const status = options?.status || 'active'; // Mặc định chỉ lấy gói khám đang hoạt động

    const where: any = {};

    if (status === 'active') {
        where.deleted_at = null;
    } else if (status === 'deleted') {
        where.deleted_at = { not: null };
    }

    if (search) {
        where.name = { contains: search };
    }

    const page = Math.max(1, Number(options?.page || 1));
    const size = options?.pageSize || defaultPageSize;
    const skip = (page - 1) * size;

    const [total, packages] = await prisma.$transaction([
        prisma.package.count({ where }),
        prisma.package.findMany({
            where,
            skip,
            take: size,
            orderBy: { id: 'asc' },
        }),
    ]);

    return {
        packages,
        pagination: {
            total,
            page,
            pageSize: size,
            totalPages: Math.ceil(total / size),
        },
    };
};

/**
 * Lấy chi tiết 1 gói khám theo packageId
 * Kèm package_detail (html_content) nếu có
 */
export const getPackageByIdService = async (packageId: number, includeDeleted: boolean = false) => {
    const pkg = await prisma.package.findUnique({
        where: { id: packageId },
        include: {
            package_detail: true,
        },
    });

    if (!pkg) {
        throw new Error('Gói khám không tồn tại');
    }

    if (pkg.deleted_at !== null && !includeDeleted) {
        throw new Error('Gói khám này hiện không còn hoạt động');
    }

    return pkg;
};

/**
 * Thêm mới gói khám
 */
export const createPackageService = async (data: CreatePackageData) => {
    // Kiểm tra tên gói khám trùng lặp (trong số gói khám chưa xóa)
    const existing = await prisma.package.findFirst({
        where: {
            name: data.name,
            deleted_at: null,
        },
    });

    if (existing) {
        throw new Error('Tên gói khám này đã tồn tại');
    }

    // Dùng Interactive Transaction để tạo đồng thời Package và PackageDetail
    // Đảm bảo tính toàn vẹn (ACID): nếu 1 trong 2 lỗi thì tự động rollback
    const newPackage = await prisma.$transaction(async (tx) => {
        const pkg = await tx.package.create({
            data: {
                name: data.name,
                description: data.description,
                thumbnail_url: data.thumbnail_url,
                price: data.price,
                discount_price: data.discount_price,
            },
        });

        let packageDetail = null;
        if (data.html_content) {
            packageDetail = await tx.packageDetail.create({
                data: {
                    package_id: pkg.id,
                    html_content: data.html_content,
                },
            });
        }

        return {
            ...pkg,
            package_detail: packageDetail,
        };
    });

    return true;
};

/**
 * Cập nhật thông tin gói khám
 */
export const updatePackageService = async (packageId: number, data: UpdatePackageData) => {
    const pkg = await prisma.package.findUnique({
        where: { id: packageId },
    });

    if (!pkg) {
        throw new Error('Gói khám không tồn tại');
    }

    if (pkg.deleted_at !== null) {
        throw new Error('Gói khám này đã bị xóa, vui lòng khôi phục trước khi cập nhật');
    }

    // Nếu cập nhật tên, kiểm tra trùng lặp với gói khám khác
    if (data.name && data.name !== pkg.name) {
        const existing = await prisma.package.findFirst({
            where: {
                name: data.name,
                id: { not: packageId },
                deleted_at: null,
            },
        });

        if (existing) {
            throw new Error('Tên gói khám này đã được sử dụng');
        }
    }

    // Nếu chỉ cập nhật discount_price mà không cập nhật price,
    // cần so sánh discount_price mới với price hiện tại
    if (data.discount_price != null && data.price == null) {
        if (data.discount_price >= Number(pkg.price)) {
            throw new Error('Giá khuyến mãi phải nhỏ hơn giá gốc');
        }
    }

    // Transaction cập nhật đồng thời thông tin Package và PackageDetail
    await prisma.$transaction(async (tx) => {
        await tx.package.update({
            where: { id: packageId },
            data: {
                name: data.name,
                description: data.description,
                thumbnail_url: data.thumbnail_url,
                price: data.price,
                discount_price: data.discount_price,
            },
        });

        if (data.html_content !== undefined) {
            await tx.packageDetail.upsert({
                where: { package_id: packageId },
                create: {
                    package_id: packageId,
                    html_content: data.html_content || '',
                },
                update: {
                    html_content: data.html_content || '',
                },
            });
        }

        return tx.package.findUnique({
            where: { id: packageId },
            include: { package_detail: true },
        });
    });

    return true;
};

/**
 * Xóa mềm gói khám (Ngừng cung cấp)
 */
export const deletePackageService = async (packageId: number) => {
    const pkg = await prisma.package.findUnique({
        where: { id: packageId },
    });

    if (!pkg) {
        throw new Error('Gói khám không tồn tại');
    }

    if (pkg.deleted_at !== null) {
        throw new Error('Gói khám này đã bị xóa từ trước');
    }

    // Kiểm tra ràng buộc: Còn lịch hẹn liên kết với gói khám này không
    const activeAppointmentsCount = await prisma.appointment.count({
        where: {
            package_id: packageId,
        },
    });

    if (activeAppointmentsCount > 0) {
        throw new Error(
            `Không thể xóa gói khám này vì vẫn còn ${activeAppointmentsCount} lịch hẹn liên kết`
        );
    }

    await prisma.package.update({
        where: { id: packageId },
        data: { deleted_at: new Date() },
    });

    return true;
};

/**
 * Khôi phục gói khám đã bị xóa mềm
 */
export const restorePackageService = async (packageId: number) => {
    const pkg = await prisma.package.findUnique({
        where: { id: packageId },
    });

    if (!pkg) {
        throw new Error('Gói khám không tồn tại');
    }

    if (pkg.deleted_at === null) {
        throw new Error('Gói khám này đang hoạt động bình thường, không cần khôi phục');
    }

    await prisma.package.update({
        where: { id: packageId },
        data: { deleted_at: null },
    });

    return true;
};
