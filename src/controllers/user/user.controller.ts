import { Request, Response } from 'express';
import {
    getUsersService,
    deleteUserService,
    restoreUserService,
    getMeService,
    updateMeService,
} from '../../services/user/user.service.js';
import { pageSize } from '../../config/constant.js';
import { UpdateUserSchema } from '../../model/Schema/User/UpdateUser_Schema.js';

/**
 * GET /admin/user
 * Lấy danh sách người dùng thông thường (chỉ role USER, không gồm DOCTOR và ADMIN)
 * Query params:
 * - page: Trang hiện tại (mặc định: 1)
 * - search: Tìm kiếm theo tên, email, sđt (tùy chọn)
 * - status: 'all' | 'active' | 'deleted' (mặc định: 'all')
 */
export const getUsersAPI = async (req: Request, res: Response) => {
    try {
        const { page, search, status } = req.query;

        const data = await getUsersService({
            page: page ? Number(page) : 1,
            search: search ? String(search) : undefined,
            status: status as any,
        });

        return res.status(200).json({
            status: 'success',
            message: 'Lấy danh sách người dùng thành công',
            data,
        });
    } catch (error: any) {
        return res.status(500).json({
            status: 'error',
            message: error.message || 'Lỗi hệ thống khi lấy danh sách người dùng',
        });
    }
};

/**
 * DELETE /admin/user
 * Xóa mềm người dùng (set deleted_at = new Date())
 * Nhận id từ: req.query.id, req.body.id hoặc req.params.id
 */
export const deleteUserAPI = async (req: Request, res: Response) => {
    try {
        const rawId = req.params.id || req.body.id || req.query.id;
        const userId = Number(rawId);

        if (!rawId || isNaN(userId)) {
            return res.status(400).json({
                status: 'error',
                message: 'Vui lòng cung cấp ID người dùng hợp lệ (id)',
            });
        }

        const data = await deleteUserService(userId);

        return res.status(200).json({
            status: 'success',
            message: 'Xóa mềm người dùng thành công',
            data,
        });
    } catch (error: any) {
        return res.status(400).json({
            status: 'error',
            message: error.message || 'Lỗi khi xóa người dùng',
        });
    }
};

/**
 * POST /admin/user-restore/:id
 * Khôi phục người dùng đã bị xóa mềm (set deleted_at = null)
 * Nhận id từ: req.params.id, req.body.id hoặc req.query.id
 */
export const restoreUserAPI = async (req: Request, res: Response) => {
    try {
        const rawId = req.params.id || req.body.id || req.query.id;
        const userId = Number(rawId);

        if (!rawId || isNaN(userId)) {
            return res.status(400).json({
                status: 'error',
                message: 'Vui lòng cung cấp ID người dùng hợp lệ (id)',
            });
        }

        const data = await restoreUserService(userId);

        return res.status(200).json({
            status: 'success',
            message: 'Khôi phục người dùng thành công',
            data,
        });
    } catch (error: any) {
        return res.status(400).json({
            status: 'error',
            message: error.message || 'Lỗi khi khôi phục người dùng',
        });
    }
};

export const getMeAPI = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        if (!user || !user.id) {
            return res.status(401).json({
                status: 'error',
                message: 'Không tìm thấy thông tin đăng nhập hoặc token không hợp lệ',
            });
        }

        const me = await getMeService(+user.id);
        return res.status(200).json({
            status: 'success',
            message: 'Lấy thông tin tài khoản thành công',
            data: me,
        });
    } catch (error: any) {
        return res.status(400).json({
            status: 'error',
            message: error.message || 'Lỗi khi lấy thông tin tài khoản',
        });
    }
};
/**
 * PUT /me
 * Cập nhật thông tin cá nhân của người dùng đang đăng nhập
 */
export const putMeAPI = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        if (!user || !user.id) {
            return res.status(401).json({
                status: 'error',
                message: 'Không tìm thấy thông tin đăng nhập hoặc token không hợp lệ',
            });
        }

        const parsed = await UpdateUserSchema.safeParseAsync(req.body);
        if (!parsed.success) {
            const errors = parsed.error.issues.map(
                (i) => `${i.message} (${i.path[0]?.toString()})`
            );
            return res.status(400).json({
                status: 'error',
                message: errors,
            });
        }

        const updated = await updateMeService(+user.id, parsed.data);
        return res.status(200).json({
            status: 'success',
            message: 'Cập nhật thông tin tài khoản thành công',
            data: updated,
        });
    } catch (error: any) {
        return res.status(400).json({
            status: 'error',
            message: error.message || 'Lỗi khi cập nhật thông tin tài khoản',
        });
    }
};
