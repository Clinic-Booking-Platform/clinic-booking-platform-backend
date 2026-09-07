import { Request, Response } from 'express';

/**
 * Upload 1 file ảnh (Avatar, Thumbnail...)
 * Request: multipart/form-data với field 'file' hoặc 'image'
 */
export const uploadSingleFile = async (req: Request, res: Response) => {
    try {
        const file = req.file;

        if (!file) {
            return res.status(400).json({
                status: 'error',
                message: 'Vui lòng chọn file ảnh để tải lên (field: "file")',
            });
        }

        const fileUrl = `/images/${file.filename}`;

        return res.status(200).json({
            status: 'success',
            message: 'Tải ảnh lên thành công',
            data: {
                url: fileUrl,
                filename: file.filename,
                originalName: file.originalname,
                mimetype: file.mimetype,
                size: file.size,
            },
        });
    } catch (error: any) {
        console.error('Error in uploadSingleFile:', error);
        return res.status(500).json({
            status: 'error',
            message: error.message || 'Lỗi máy chủ khi tải ảnh lên',
        });
    }
};

/**
 * Upload nhiều file ảnh cùng lúc (Ảnh chi tiết sản phẩm, Gallery...)
 * Request: multipart/form-data với field 'files' hoặc 'images' (Tối đa 10 ảnh)
 */
export const uploadMultipleFiles = async (req: Request, res: Response) => {
    try {
        const files = req.files as Express.Multer.File[];

        if (!files || files.length === 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Vui lòng chọn ít nhất 1 file ảnh để tải lên (field: "files")',
            });
        }

        const uploadedList = files.map((file, index) => ({
            url: `/images/${file.filename}`,
            filename: file.filename,
            originalName: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            displayOrder: index + 1,
        }));

        return res.status(200).json({
            status: 'success',
            message: `Tải lên thành công ${files.length} ảnh`,
            data: uploadedList,
        });
    } catch (error: any) {
        console.error('Error in uploadMultipleFiles:', error);
        return res.status(500).json({
            status: 'error',
            message: error.message || 'Lỗi máy chủ khi tải danh sách ảnh lên',
        });
    }
};
