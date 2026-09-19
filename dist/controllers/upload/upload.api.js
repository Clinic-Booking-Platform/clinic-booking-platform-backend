"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMultipleFiles = exports.uploadSingleFile = void 0;
/**
 * Upload 1 file ảnh (Avatar, Thumbnail...)
 * Request: multipart/form-data với field 'file' hoặc 'image'
 */
const uploadSingleFile = async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({
                status: 'error',
                message: 'Vui lòng chọn file ảnh để tải lên (field: "file")',
            });
        }
        const fileUrl = file.path;
        ;
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
    }
    catch (error) {
        console.error('Error in uploadSingleFile:', error);
        return res.status(500).json({
            status: 'error',
            message: error.message || 'Lỗi máy chủ khi tải ảnh lên',
        });
    }
};
exports.uploadSingleFile = uploadSingleFile;
/**
 * Upload nhiều file ảnh cùng lúc (Ảnh chi tiết sản phẩm, Gallery...)
 * Request: multipart/form-data với field 'files' hoặc 'images' (Tối đa 10 ảnh)
 */
const uploadMultipleFiles = async (req, res) => {
    try {
        const files = req.files;
        if (!files || files.length === 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Vui lòng chọn ít nhất 1 file ảnh để tải lên (field: "files")',
            });
        }
        const uploadedList = files.map((file, index) => ({
            url: file.path,
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
    }
    catch (error) {
        console.error('Error in uploadMultipleFiles:', error);
        return res.status(500).json({
            status: 'error',
            message: error.message || 'Lỗi máy chủ khi tải danh sách ảnh lên',
        });
    }
};
exports.uploadMultipleFiles = uploadMultipleFiles;
