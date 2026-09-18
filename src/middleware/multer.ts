import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 } from 'uuid';
import { Request, Response, NextFunction } from 'express';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';
// Cấu hình chung cho Multer
const createMulter = (dir: string = 'images') => {
    const storage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: async (req, file) => {
            // Lấy tên gốc của file (bỏ đuôi .png/.jpg đi)
            const nameWithoutExt = path.parse(file.originalname).name;
            return {
                folder: `clinic_booking/${dir}`, // Tạo thư mục trên Cloudinary: clinic_booking/images
                allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'jfif'],
                public_id: `${Date.now()}-${v4().slice(0, 8)}-${nameWithoutExt}`,
            };
        },
    });

    return multer({
        storage: storage,
        limits: {
            fileSize: 1024 * 1024 * 5, // Tối đa 5MB
        },
        fileFilter: (req: Express.Request, file: Express.Multer.File, cb: Function) => {
            const allowedExts = /\.(jpe?g|png|webp|jfif)$/i;
            const allowedMimes = [
                'image/png',
                'image/jpg',
                'image/jpeg',
                'image/pjpeg',
                'image/webp',
                'image/jfif',
                'application/octet-stream', // Postman hoặc một số client gửi mimetype này
            ];

            const extname = path.extname(file.originalname).toLowerCase();
            const isExtValid = allowedExts.test(extname);
            const isMimeValid = allowedMimes.includes((file.mimetype || '').toLowerCase());

            // Chấp nhận nếu phần mở rộng là ảnh hợp lệ (jpg/png/webp) HOẶC mimetype hợp lệ
            if (isExtValid || isMimeValid) {
                cb(null, true);
            } else {
                cb(new Error(`Chỉ chấp nhận các định dạng ảnh JPEG, JPG, PNG và WEBP. File nhận được: "${file.originalname}" (mimetype: ${file.mimetype})`), false);
            }
        },
    });
};

// 1. Middleware Upload 1 file ảnh (Avatar, Thumbnail...)
export const uploadSingleMiddleware = (fieldName: string = 'file', dir: string = 'images') => {
    const upload = createMulter(dir).single(fieldName);

    return (req: Request, res: Response, next: NextFunction) => {
        upload(req, res, (err: any) => {
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({
                        status: 'error',
                        message: 'Dung lượng file vượt quá giới hạn cho phép (tối đa 5MB)',
                    });
                }
                if (err.code === 'LIMIT_UNEXPECTED_FILE') {
                    return res.status(400).json({
                        status: 'error',
                        message: `Tên field không đúng (yêu cầu field name là "${fieldName}")`,
                    });
                }
                return res.status(400).json({
                    status: 'error',
                    message: `Lỗi upload: ${err.message}`,
                });
            } else if (err) {
                return res.status(400).json({
                    status: 'error',
                    message: err.message || 'Lỗi khi tải file lên',
                });
            }
            next();
        });
    };
};

// 2. Middleware Upload nhiều file ảnh (Gallery, Album chi tiết...)
export const uploadMultipleMiddleware = (fieldName: string = 'files', maxCount: number = 10, dir: string = 'images') => {
    const upload = createMulter(dir).array(fieldName, maxCount);

    return (req: Request, res: Response, next: NextFunction) => {
        upload(req, res, (err: any) => {
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({
                        status: 'error',
                        message: 'Dung lượng file vượt quá giới hạn cho phép (tối đa 5MB)',
                    });
                }
                if (err.code === 'LIMIT_UNEXPECTED_FILE') {
                    return res.status(400).json({
                        status: 'error',
                        message: `Số lượng file vượt quá tối đa (${maxCount} file) hoặc sai tên field "${fieldName}"`,
                    });
                }
                return res.status(400).json({
                    status: 'error',
                    message: `Lỗi upload: ${err.message}`,
                });
            } else if (err) {
                return res.status(400).json({
                    status: 'error',
                    message: err.message || 'Lỗi khi tải danh sách file lên',
                });
            }
            next();
        });
    };
};

export default uploadSingleMiddleware;
