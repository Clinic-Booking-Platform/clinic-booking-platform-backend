import multer from 'multer';
import path from 'path';
import { v4 } from 'uuid';

// Cấu hình chung cho Multer
const createMulter = (dir: string = 'images') => {
    return multer({
        storage: multer.diskStorage({
            destination: path.join(__dirname, '../public', dir),
            filename: (req, file, cb) => {
                cb(null, v4() + path.extname(file.originalname));
            }
        }),
        limits: {
            fileSize: 1024 * 1024 * 5 // Max 5MB
        },
        fileFilter: (req: Express.Request, file: Express.Multer.File, cb: Function) => {
            if (
                file.mimetype === 'image/png' ||
                file.mimetype === 'image/jpg' ||
                file.mimetype === 'image/jpeg' ||
                file.mimetype === 'image/webp'
            ) {
                cb(null, true);
            } else {
                cb(new Error('Only JPEG, JPG, PNG and WEBP images are allowed.'), false);
            }
        }
    });
};

// 1. Middleware Upload 1 file ảnh (Avatar, Thumbnail...)
export const uploadSingleMiddleware = (fieldName: string = 'file', dir: string = 'images') => {
    return createMulter(dir).single(fieldName);
};

// 2. Middleware Upload nhiều file ảnh (Gallery, Album chi tiết...)
export const uploadMultipleMiddleware = (fieldName: string = 'files', maxCount: number = 10, dir: string = 'images') => {
    return createMulter(dir).array(fieldName, maxCount);
};

export default uploadSingleMiddleware;

