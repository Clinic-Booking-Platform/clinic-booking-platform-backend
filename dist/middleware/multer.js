"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMultipleMiddleware = exports.uploadSingleMiddleware = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
const cloudinary_js_1 = __importDefault(require("../config/cloudinary.js"));
// Cấu hình chung cho Multer
const createMulter = (dir = 'images') => {
    const storage = new multer_storage_cloudinary_1.CloudinaryStorage({
        cloudinary: cloudinary_js_1.default,
        params: async (req, file) => {
            // Lấy tên gốc của file (bỏ đuôi .png/.jpg đi)
            const nameWithoutExt = path_1.default.parse(file.originalname).name;
            return {
                folder: `clinic_booking/${dir}`, // Tạo thư mục trên Cloudinary: clinic_booking/images
                allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'jfif'],
                public_id: `${Date.now()}-${(0, uuid_1.v4)().slice(0, 8)}-${nameWithoutExt}`,
            };
        },
    });
    return (0, multer_1.default)({
        storage: storage,
        limits: {
            fileSize: 1024 * 1024 * 5, // Tối đa 5MB
        },
        fileFilter: (req, file, cb) => {
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
            const extname = path_1.default.extname(file.originalname).toLowerCase();
            const isExtValid = allowedExts.test(extname);
            const isMimeValid = allowedMimes.includes((file.mimetype || '').toLowerCase());
            // Chấp nhận nếu phần mở rộng là ảnh hợp lệ (jpg/png/webp) HOẶC mimetype hợp lệ
            if (isExtValid || isMimeValid) {
                cb(null, true);
            }
            else {
                cb(new Error(`Chỉ chấp nhận các định dạng ảnh JPEG, JPG, PNG và WEBP. File nhận được: "${file.originalname}" (mimetype: ${file.mimetype})`), false);
            }
        },
    });
};
// 1. Middleware Upload 1 file ảnh (Avatar, Thumbnail...)
const uploadSingleMiddleware = (fieldName = 'file', dir = 'images') => {
    const upload = createMulter(dir).single(fieldName);
    return (req, res, next) => {
        upload(req, res, (err) => {
            if (err instanceof multer_1.default.MulterError) {
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
            }
            else if (err) {
                return res.status(400).json({
                    status: 'error',
                    message: err.message || 'Lỗi khi tải file lên',
                });
            }
            next();
        });
    };
};
exports.uploadSingleMiddleware = uploadSingleMiddleware;
// 2. Middleware Upload nhiều file ảnh (Gallery, Album chi tiết...)
const uploadMultipleMiddleware = (fieldName = 'files', maxCount = 10, dir = 'images') => {
    const upload = createMulter(dir).array(fieldName, maxCount);
    return (req, res, next) => {
        upload(req, res, (err) => {
            if (err instanceof multer_1.default.MulterError) {
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
            }
            else if (err) {
                return res.status(400).json({
                    status: 'error',
                    message: err.message || 'Lỗi khi tải danh sách file lên',
                });
            }
            next();
        });
    };
};
exports.uploadMultipleMiddleware = uploadMultipleMiddleware;
exports.default = exports.uploadSingleMiddleware;
