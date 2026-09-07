// api routes
import express from 'express';
import { loginAPI, registerDoctorAPI } from '../controllers/auth/auth.api.js';
import { registerAPI } from '../controllers/auth/auth.api.js';
import { uploadMultipleMiddleware, uploadSingleMiddleware } from '../middleware/multer.js';
import { uploadMultipleFiles, uploadSingleFile } from '../controllers/upload/upload.api.js';
import { authMiddlewareADMIN, authMiddlewareClients, authMiddlewareDOCTOR } from '../middleware/auth.services.js';
import { deleteUserAPI, getMeAPI, getUsersAPI, putMeAPI, restoreUserAPI } from '../controllers/user/user.controller.js';
import { deleteDoctorAPI, getDoctorDetailAPI, getDoctorsAPI, restoreDoctorAPI, updateDoctorAPI } from '../controllers/doctor/doctor.api.js';

export const authRouter = express.Router();
export const adminRouter = express.Router();
export const userRouter = express.Router();
export const doctorRouter = express.Router();

userRouter.use(authMiddlewareClients);
adminRouter.use(authMiddlewareADMIN);
doctorRouter.use(authMiddlewareDOCTOR);

// ============================================================
// AUTH – Đăng nhập / Đăng ký (public)
// ============================================================
authRouter.post('/login', loginAPI);
authRouter.post('/register', registerAPI);

// ============================================================
// UPLOAD – Upload file (cần JWT)
// ============================================================
authRouter.post('/upload/single', authMiddlewareClients, uploadSingleMiddleware('file'), uploadSingleFile);
authRouter.post('/upload/multiple', authMiddlewareClients, uploadMultipleMiddleware('files', 10), uploadMultipleFiles);

// ============================================================
// CLIENTS ROUTES (User / Doctor / Admin đã đăng nhập)
// ============================================================
// Tài khoản cá nhân
userRouter.get('/me', getMeAPI);
userRouter.put('/me', putMeAPI);

// Xem danh sách và chi tiết bác sĩ
userRouter.get('/doctors', getDoctorsAPI);
userRouter.get('/doctors/:id', getDoctorDetailAPI);

// ============================================================
// DOCTOR ROUTES (Dành riêng cho Bác sĩ)
// ============================================================

// ============================================================
// ADMIN ROUTES (Dành riêng cho Quản trị viên)
// ============================================================
// 1. Quản lý Bác sĩ (Doctor Management)
adminRouter.post('/doctors', registerDoctorAPI);
adminRouter.get('/doctors', getDoctorsAPI);
adminRouter.get('/doctors/:id', getDoctorDetailAPI);
adminRouter.put('/doctors/:id', updateDoctorAPI);
adminRouter.delete('/doctors/:id', deleteDoctorAPI);
adminRouter.post('/doctors-restore/:id', restoreDoctorAPI);

// 2. Quản lý Người dùng (User Management)
adminRouter.get('/user', getUsersAPI);
adminRouter.delete('/user/:id', deleteUserAPI);
adminRouter.post('/user-restore/:id', restoreUserAPI);
