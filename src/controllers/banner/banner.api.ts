import { Request, Response } from 'express';
import {
    changeBannerStatusService,
    createBannerService,
    deleteBannerService,
    getActiveBannersClientService,
    getBannersService,
    updateBannerService,
} from '../../services/banner/banner.service.js';
import {
    ChangeBannerStatusSchema,
    CreateBannerSchema,
    UpdateBannerSchema,
} from '../../model/Schema/Banner/Banner_Schema.js';
import { RoleType } from '../../config/constant.js';

/**
 * GET /banners (User) hoặc GET /admin/banners (Admin)
 * Lấy danh sách banner
 * - Với User: Chỉ lấy toàn bộ banner đang hoạt động (is_active: true) hiển thị marketing trên giao diện (không cần search, không phân trang)
 * - Với Admin: Hỗ trợ phân trang và filter (search, status)
 */
export const getBannersAPI = async (req: Request, res: Response) => {
    try {
        const isAdmin = req.user?.role === RoleType.ADMIN;

        // User: Chỉ dùng hiển thị ra giao diện marketing (không search, không phân trang)
        if (!isAdmin) {
            const banners = await getActiveBannersClientService();
            return res.status(200).json({
                status: 'success',
                message: 'Lấy danh sách banner thành công',
                data: banners,
            });
        }

        // Admin: Có phân trang và filter (search, status)
        const { page, search, status } = req.query;
        const filterStatus = (status as string) || 'all';

        const data = await getBannersService({
            page: page ? Number(page) : 1,
            search: search ? String(search) : undefined,
            status: filterStatus,
        });

        return res.status(200).json({
            status: 'success',
            message: 'Lấy danh sách banner thành công',
            data,
        });
    } catch (error: any) {
        return res.status(500).json({
            status: 'error',
            message: error.message || 'Lỗi hệ thống khi lấy danh sách banner',
        });
    }
};


/**
 * POST /admin/banners
 * Thêm mới banner (Yêu cầu quyền Admin)
 */
export const postBannersAPI = async (req: Request, res: Response) => {
    try {
        const parsed = await CreateBannerSchema.safeParseAsync(req.body);
        if (!parsed.success) {
            const errors = parsed.error.issues.map(
                (i) => `${i.message} (${i.path.join('.')})`
            );
            return res.status(400).json({
                status: 'error',
                message: errors,
            });
        }

        const data = await createBannerService(parsed.data);

        return res.status(201).json({
            status: 'success',
            message: 'Tạo banner mới thành công',
            data,
        });
    } catch (error: any) {
        return res.status(400).json({
            status: 'error',
            message: error.message || 'Lỗi khi tạo banner mới',
        });
    }
};

/**
 * PUT /admin/banners/:id
 * Cập nhật thông tin banner (Yêu cầu quyền Admin)
 * ID được truyền qua URL params
 */
export const updateBannersAPI = async (req: Request, res: Response) => {
    try {
        const bannerId = Number(req.params.id);

        if (!req.params.id || isNaN(bannerId)) {
            return res.status(400).json({
                status: 'error',
                message: 'ID banner không hợp lệ hoặc không được cung cấp',
            });
        }

        const parsed = await UpdateBannerSchema.safeParseAsync(req.body);
        if (!parsed.success) {
            const errors = parsed.error.issues.map(
                (i) => `${i.message} (${i.path.join('.')})`
            );
            return res.status(400).json({
                status: 'error',
                message: errors,
            });
        }

        const data = await updateBannerService(bannerId, parsed.data);

        return res.status(200).json({
            status: 'success',
            message: 'Cập nhật thông tin banner thành công',
            data,
        });
    } catch (error: any) {
        return res.status(400).json({
            status: 'error',
            message: error.message || 'Lỗi khi cập nhật banner',
        });
    }
};

/**
 * PUT /admin/banners-status/:id
 * Cập nhật trạng thái hiển thị của banner (trường is_active kiểu boolean) (Yêu cầu quyền Admin)
 * ID được truyền qua URL params
 */
export const statusBannersAPI = async (req: Request, res: Response) => {
    try {
        const bannerId = Number(req.params.id);

        if (!req.params.id || isNaN(bannerId)) {
            return res.status(400).json({
                status: 'error',
                message: 'ID banner không hợp lệ hoặc không được cung cấp',
            });
        }

        const parsed = await ChangeBannerStatusSchema.safeParseAsync(req.body);
        if (!parsed.success) {
            const errors = parsed.error.issues.map(
                (i) => `${i.message} (${i.path.join('.')})`
            );
            return res.status(400).json({
                status: 'error',
                message: errors,
            });
        }

        const data = await changeBannerStatusService(bannerId, parsed.data.is_active);

        return res.status(200).json({
            status: 'success',
            message: 'Cập nhật trạng thái banner thành công',
            data,
        });
    } catch (error: any) {
        return res.status(400).json({
            status: 'error',
            message: error.message || 'Lỗi khi cập nhật trạng thái banner',
        });
    }
};

/**
 * DELETE /admin/banners/:id
 * Xóa cứng banner khỏi hệ thống (Hard delete) (Yêu cầu quyền Admin)
 * ID được truyền qua URL params
 */
export const deleteBannersAPI = async (req: Request, res: Response) => {
    try {
        const bannerId = Number(req.params.id);

        if (!req.params.id || isNaN(bannerId)) {
            return res.status(400).json({
                status: 'error',
                message: 'ID banner không hợp lệ hoặc không được cung cấp',
            });
        }

        await deleteBannerService(bannerId);

        return res.status(200).json({
            status: 'success',
            message: 'Xóa banner thành công (xóa vĩnh viễn)',
        });
    } catch (error: any) {
        return res.status(400).json({
            status: 'error',
            message: error.message || 'Lỗi khi xóa banner',
        });
    }
};
