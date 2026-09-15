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
import {
    deleteBannersAPI,
    getBannersAPI,
    postBannersAPI,
    statusBannersAPI,
    updateBannersAPI,
} from '../controllers/banner/banner.api.js';
import {
    getSchedulesAPI,
    getScheduleDetailAPI,
    createScheduleAPI,
    bulkCreateScheduleAPI,
    updateScheduleAPI,
    deleteScheduleAPI,
} from '../controllers/schedule/schedule.api.js';
import {
    getPublicArticlesAPI,
    getPublicArticleDetailAPI,
    getDoctorArticlesAPI,
    getDoctorArticleDetailAPI,
    createDoctorArticleAPI,
    updateDoctorArticleAPI,
    getAdminArticlesAPI,
    getAdminArticleDetailAPI,
    createAdminArticleAPI,
    updateAdminArticleAPI,
    deleteAdminArticleAPI,
} from '../controllers/article/article.api.js';
import {
    createAppointmentAPI,
    bookFromOrderAPI
} from '../controllers/appointment/appointment.api.js';
import {
    checkoutCartPaymentAPI,
    verifyPaymentReturnAPI,
    getBankListAPI,
    repayOrderPaymentAPI,
} from '../controllers/payment/payment.api.js';
import {
    getOrdersAPI,
    getOrderDetailAPI,
    cancelOrderAPI,
    getOrderAdminsAPI,
    getOrderDetailAdminAPI,
} from '../controllers/order/order.api.js';

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
// ARTICLES (public - không cần JWT)
// ============================================================
authRouter.get('/articles', getPublicArticlesAPI);
authRouter.get('/articles/:slug', getPublicArticleDetailAPI);

// ============================================================
// PAYMENT CALLBACK & PUBLIC INFO (không cần JWT)
// ============================================================
authRouter.get('/payment/vnpay-return', verifyPaymentReturnAPI);
authRouter.get('/payment/banks', getBankListAPI);

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
// userRouter.delete('/cart', deleteCartsAPI);

//banner
userRouter.get('/banners', getBannersAPI);

//schedule – Xem lịch trống của bác sĩ để đặt lịch
userRouter.get('/schedules', getSchedulesAPI);
userRouter.get('/schedules/:id', getScheduleDetailAPI);

//article – Xem bài viết
userRouter.get('/articles', getPublicArticlesAPI);
userRouter.get('/articles/:slug', getPublicArticleDetailAPI);

//appointment – Đặt lịch khám Offline & Từ đơn hàng
userRouter.post('/appointments', createAppointmentAPI);
userRouter.post('/appointments/book-from-order/:id', bookFromOrderAPI);

//payment – Thanh toán giỏ hàng qua VNPay 
userRouter.post('/payment/checkout-cart', checkoutCartPaymentAPI);
userRouter.post('/payment/repay/:id', repayOrderPaymentAPI);

//order – Đơn hàng của người dùng
userRouter.get('/orders', getOrdersAPI);
userRouter.get('/orders/:id', getOrderDetailAPI);
userRouter.delete('/orders/:id', cancelOrderAPI);



// ============================================================
// DOCTOR ROUTES (Dành riêng cho Bác sĩ)
// ============================================================
// schedule – Quản lý lịch làm việc của bác sĩ
doctorRouter.get('/schedules', getSchedulesAPI);
doctorRouter.get('/schedules/:id', getScheduleDetailAPI);
doctorRouter.post('/schedules', createScheduleAPI);
doctorRouter.post('/schedules/bulk', bulkCreateScheduleAPI);
doctorRouter.put('/schedules/:id', updateScheduleAPI);

// article – Quản lý bài viết của bác sĩ
doctorRouter.get('/articles', getDoctorArticlesAPI);
doctorRouter.get('/articles/:id', getDoctorArticleDetailAPI);
doctorRouter.post('/articles', createDoctorArticleAPI);
doctorRouter.put('/articles/:id', updateDoctorArticleAPI);

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


//banner
adminRouter.get('/banners', getBannersAPI);
adminRouter.post('/banners', postBannersAPI);
adminRouter.put('/banners/:id', updateBannersAPI);
adminRouter.put('/banners-status/:id', statusBannersAPI);
adminRouter.delete('/banners/:id', deleteBannersAPI);

//schedule – Quản lý lịch làm việc (full quyền + xóa cứng)
adminRouter.get('/schedules', getSchedulesAPI);
adminRouter.get('/schedules/:id', getScheduleDetailAPI);
adminRouter.post('/schedules', createScheduleAPI);
adminRouter.post('/schedules/bulk', bulkCreateScheduleAPI);
adminRouter.put('/schedules/:id', updateScheduleAPI);
adminRouter.delete('/schedules/:id', deleteScheduleAPI);

//article – Quản lý bài viết (full quyền + xóa mềm)
adminRouter.get('/articles', getAdminArticlesAPI);
adminRouter.get('/articles/:id', getAdminArticleDetailAPI);
adminRouter.post('/articles', createAdminArticleAPI);
adminRouter.put('/articles/:id', updateAdminArticleAPI);
adminRouter.delete('/articles/:id', deleteAdminArticleAPI);

//order - Quản lý đơn hàng 
adminRouter.get('/orders', getOrderAdminsAPI);
adminRouter.get('/orders/:id', getOrderDetailAdminAPI);