// api routes
import express from 'express';
import { loginAPI } from '../services/api/auth/auth.api.js';
import { registerAPI } from '../services/api/auth/auth.api.js';
import { uploadMultipleMiddleware, uploadSingleMiddleware } from '../middleware/multer.js';
import { uploadMultipleFiles, uploadSingleFile } from '../services/api/upload/upload.api.js';
import { authMiddlewareClients } from '../middleware/auth.services.js';

export const authRouter = express.Router();

// ============================================================
// AUTH – Đăng nhập / Đăng ký (public)
// ============================================================
authRouter.post('/login', loginAPI);
authRouter.post('/register', registerAPI);

// ============================================================
// UPLOAD – Upload file (public – có thể thêm authMiddlewareClients nếu cần)
// ============================================================
authRouter.post('/upload/single', uploadSingleMiddleware('file'), uploadSingleFile);
authRouter.post('/upload/multiple', uploadMultipleMiddleware('files', 10), uploadMultipleFiles);

// Example secured upload (cần JWT):
// authRouter.post('/upload/single', authMiddlewareClients, uploadSingleMiddleware('file'), uploadSingleFile);
