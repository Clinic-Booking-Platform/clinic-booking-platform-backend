// api routes
import express from 'express';
import { loginAPI, registerDoctorAPI } from '../controllers/auth/auth.api.js';
import { registerAPI } from '../controllers/auth/auth.api.js';
import { uploadMultipleMiddleware, uploadSingleMiddleware } from '../middleware/multer.js';
import { uploadMultipleFiles, uploadSingleFile } from '../controllers/upload/upload.api.js';
import { authMiddlewareADMIN, authMiddlewareClients, authMiddlewareDOCTOR } from '../middleware/auth.services.js';
import { deleteUserAPI, getMeAPI, getUsersAPI, putMeAPI, restoreUserAPI } from '../controllers/user/user.controller.js';
import { deleteDoctorAPI, getDoctorDetailAPI, getDoctorsAPI, restoreDoctorAPI, updateDoctorAPI } from '../controllers/doctor/doctor.api.js';
import {
    deleteSpecialtyAPI,
    getSpecialtiesAPI,
    getSpecialtiesDetailAPI,
    postSpecialtyAPI,
    restoreSpecialtyAPI,
    updateSpecialtyAPI,
} from '../controllers/specialty/specialty.api.js';
import {
    deletePackagesAPI,
    getPackagesAPI,
    getPackagesDetailAPI,
    postPackagesAPI,
    restorePackagesAPI,
    updatePackagesAPI,
} from '../controllers/package/package.api.js';
import {
    deleteCartsAPI,
    getCartDetailAdminAPI,
    getCartsAPI,
    postCartsAPI,
    updateCartQuantityAPI,
} from '../controllers/cart/cart.api.js';

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
// me
userRouter.get('/me', getMeAPI);
userRouter.put('/me', putMeAPI);

// doctor
userRouter.get('/doctors', getDoctorsAPI);
userRouter.get('/doctors/:id', getDoctorDetailAPI);

//specialty
userRouter.get('/specialties', getSpecialtiesAPI);
userRouter.get('/specialties/:id', getSpecialtiesDetailAPI);

// package
userRouter.get('/packages', getPackagesAPI);
userRouter.get('/packages/:id', getPackagesDetailAPI);


//cart
userRouter.get('/cart', getCartsAPI);
userRouter.post('/cart/items', postCartsAPI);
userRouter.put('/cart-quantity/:packageId', updateCartQuantityAPI);
userRouter.delete('/carts/:packageId', deleteCartsAPI);
userRouter.delete('/cart', deleteCartsAPI);

// ============================================================
// DOCTOR ROUTES (Dành riêng cho Bác sĩ)
// ============================================================

// ============================================================
// ADMIN ROUTES (Dành riêng cho Quản trị viên)
// ============================================================
// doctor
adminRouter.post('/doctors', registerDoctorAPI);
adminRouter.get('/doctors', getDoctorsAPI);
adminRouter.get('/doctors/:id', getDoctorDetailAPI);
adminRouter.put('/doctors/:id', updateDoctorAPI);
adminRouter.delete('/doctors/:id', deleteDoctorAPI);
adminRouter.post('/doctors-restore/:id', restoreDoctorAPI);

// user
adminRouter.get('/user', getUsersAPI);
adminRouter.delete('/user/:id', deleteUserAPI);
adminRouter.post('/user-restore/:id', restoreUserAPI);

// specialty
adminRouter.get('/specialties', getSpecialtiesAPI);
adminRouter.get('/specialties/:id', getSpecialtiesDetailAPI);
adminRouter.post('/specialties', postSpecialtyAPI);
adminRouter.put('/specialties/:id', updateSpecialtyAPI);
adminRouter.delete('/specialties/:id', deleteSpecialtyAPI);
adminRouter.post('/specialties-restore/:id', restoreSpecialtyAPI);


//package
adminRouter.get('/packages', getPackagesAPI);
adminRouter.get('/packages/:id', getPackagesDetailAPI);
adminRouter.post('/packages', postPackagesAPI);
adminRouter.put('/packages/:id', updatePackagesAPI);
adminRouter.delete('/packages/:id', deletePackagesAPI);
adminRouter.post('/packages-restore/:id', restorePackagesAPI);


//cart
adminRouter.get('/carts', getCartsAPI);
adminRouter.get('/carts/:id', getCartDetailAdminAPI);
