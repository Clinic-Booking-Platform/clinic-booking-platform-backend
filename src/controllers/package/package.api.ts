import { Request, Response } from 'express';
import {
    createPackageService,
    deletePackageService,
    getPackagesService,
    getPackageByIdService,
    restorePackageService,
    updatePackageService,
} from '../../services/package/package.service.js';
import {
    CreatePackageSchema,
    UpdatePackageSchema,
} from '../../model/Schema/Package/Package_Schema.js';
import { RoleType } from '../../config/constant.js';

/**
 * GET /packages hoặc GET /admin/packages
 * Lấy danh sách gói khám
 * - Với Admin: xem được cả gói khám đã xóa hoặc lọc theo status ('active' | 'deleted' | 'all').
 * - Với User/Doctor: chỉ lấy gói khám đang hoạt động ('active').
 * Query params (tùy chọn):
 * - page: Phân trang (mặc định: 1)
 * - search: Tìm kiếm theo tên gói khám
 * - status: 'active' | 'deleted' | 'all' (áp dụng cho Admin)
 */
export const getPackagesAPI = async (req: Request, res: Response) => {
    try {
        const { page, search, status } = req.query;
        const isAdmin = req.user?.role === RoleType.ADMIN;

        // Admin mặc định lấy tất cả ('all'), User/Doctor luôn chỉ lấy gói khám đang mở ('active')
        const filterStatus = isAdmin ? ((status as any) || 'all') : 'active';

        const data = await getPackagesService({
            page: page ? Number(page) : 1,
            search: search ? String(search) : undefined,
            status: filterStatus,
        });

        return res.status(200).json({
            status: 'success',
            message: 'Lấy danh sách gói khám thành công',
            data,
        });
    } catch (error: any) {
        return res.status(500).json({
            status: 'error',
            message: error.message || 'Lỗi hệ thống khi lấy danh sách gói khám',
        });
    }
};

/**
 * GET /packages/:id hoặc GET /admin/packages/:id
 * Lấy thông tin chi tiết của 1 gói khám (kèm package_detail nếu có)
 */
export const getPackagesDetailAPI = async (req: Request, res: Response) => {
    try {
        const packageId = Number(req.params.id);
        if (!packageId || isNaN(packageId)) {
            return res.status(400).json({
                status: 'error',
                message: 'ID gói khám không hợp lệ',
            });
        }

        const isAdmin = req.user?.role === RoleType.ADMIN;
        const data = await getPackageByIdService(packageId, isAdmin);

        return res.status(200).json({
            status: 'success',
            message: 'Lấy thông tin chi tiết gói khám thành công',
            data,
        });
    } catch (error: any) {
        return res.status(404).json({
            status: 'error',
            message: error.message || 'Không tìm thấy thông tin gói khám',
        });
    }
};

/**
 * POST /admin/packages
 * Thêm mới gói khám (Yêu cầu quyền Admin)
 */
export const postPackagesAPI = async (req: Request, res: Response) => {
    try {
        const parsed = await CreatePackageSchema.safeParseAsync(req.body);
        if (!parsed.success) {
            const errors = parsed.error.issues.map(
                (i) => `${i.message} (${i.path[0]?.toString()})`
            );
            return res.status(400).json({
                status: 'error',
                message: errors,
            });
        }

        const data = await createPackageService(parsed.data);

        return res.status(201).json({
            status: 'success',
            message: 'Tạo gói khám mới thành công',
            data,
        });
    } catch (error: any) {
        return res.status(400).json({
            status: 'error',
            message: error.message || 'Lỗi khi tạo gói khám mới',
        });
    }
};

/**
 * PUT /admin/packages/:id
 * Cập nhật thông tin gói khám (Yêu cầu quyền Admin)
 * Sử dụng UpdatePackageSchema (.partial()) để validate
 */
export const updatePackagesAPI = async (req: Request, res: Response) => {
    try {
        const packageId = Number(req.params.id);
        if (!packageId || isNaN(packageId)) {
            return res.status(400).json({
                status: 'error',
                message: 'ID gói khám không hợp lệ',
            });
        }

        const parsed = await UpdatePackageSchema.safeParseAsync(req.body);
        if (!parsed.success) {
            const errors = parsed.error.issues.map(
                (i) => `${i.message} (${i.path[0]?.toString()})`
            );
            return res.status(400).json({
                status: 'error',
                message: errors,
            });
        }

        const data = await updatePackageService(packageId, parsed.data);

        return res.status(200).json({
            status: 'success',
            message: 'Cập nhật thông tin gói khám thành công',
            data,
        });
    } catch (error: any) {
        return res.status(400).json({
            status: 'error',
            message: error.message || 'Lỗi khi cập nhật gói khám',
        });
    }
};

/**
 * DELETE /admin/packages/:id
 * Xóa mềm gói khám – Ngừng cung cấp (Yêu cầu quyền Admin)
 */
export const deletePackagesAPI = async (req: Request, res: Response) => {
    try {
        const packageId = Number(req.params.id || req.body.id || req.query.id);
        if (!packageId || isNaN(packageId)) {
            return res.status(400).json({
                status: 'error',
                message: 'ID gói khám không hợp lệ',
            });
        }

        await deletePackageService(packageId);

        return res.status(200).json({
            status: 'success',
            message: 'Xóa mềm gói khám thành công',
        });
    } catch (error: any) {
        return res.status(400).json({
            status: 'error',
            message: error.message || 'Lỗi khi xóa gói khám',
        });
    }
};

/**
 * POST /admin/packages-restore/:id
 * Khôi phục gói khám đã bị xóa mềm (Yêu cầu quyền Admin)
 */
export const restorePackagesAPI = async (req: Request, res: Response) => {
    try {
        const packageId = Number(req.params.id || req.body.id || req.query.id);
        if (!packageId || isNaN(packageId)) {
            return res.status(400).json({
                status: 'error',
                message: 'ID gói khám không hợp lệ',
            });
        }

        await restorePackageService(packageId);

        return res.status(200).json({
            status: 'success',
            message: 'Khôi phục gói khám thành công',
        });
    } catch (error: any) {
        return res.status(400).json({
            status: 'error',
            message: error.message || 'Lỗi khi khôi phục gói khám',
        });
    }
};
