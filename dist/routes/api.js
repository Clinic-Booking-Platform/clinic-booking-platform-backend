"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.doctorRouter = exports.userRouter = exports.adminRouter = exports.authRouter = void 0;
// api routes
const express_1 = __importDefault(require("express"));
const auth_api_js_1 = require("../controllers/auth/auth.api.js");
const auth_api_js_2 = require("../controllers/auth/auth.api.js");
const multer_js_1 = require("../middleware/multer.js");
const upload_api_js_1 = require("../controllers/upload/upload.api.js");
const auth_services_js_1 = require("../middleware/auth.services.js");
const rateLimit_middleware_js_1 = require("../middleware/rateLimit.middleware.js");
const user_controller_js_1 = require("../controllers/user/user.controller.js");
const doctor_api_js_1 = require("../controllers/doctor/doctor.api.js");
const specialty_api_js_1 = require("../controllers/specialty/specialty.api.js");
const package_api_js_1 = require("../controllers/package/package.api.js");
const cart_api_js_1 = require("../controllers/cart/cart.api.js");
const banner_api_js_1 = require("../controllers/banner/banner.api.js");
const schedule_api_js_1 = require("../controllers/schedule/schedule.api.js");
const article_api_js_1 = require("../controllers/article/article.api.js");
const appointment_api_js_1 = require("../controllers/appointment/appointment.api.js");
const payment_api_js_1 = require("../controllers/payment/payment.api.js");
const order_api_js_1 = require("../controllers/order/order.api.js");
const medical_record_api_js_1 = require("../controllers/medical-record/medical-record.api.js");
const prescription_api_js_1 = require("../controllers/prescription/prescription.api.js");
exports.authRouter = express_1.default.Router();
exports.adminRouter = express_1.default.Router();
exports.userRouter = express_1.default.Router();
exports.doctorRouter = express_1.default.Router();
exports.userRouter.use(auth_services_js_1.authMiddlewareClients);
exports.adminRouter.use(auth_services_js_1.authMiddlewareADMIN);
exports.doctorRouter.use(auth_services_js_1.authMiddlewareDOCTOR);
// ============================================================
// AUTH – Đăng nhập / Đăng ký (public - bảo vệ bằng authLimiter)
// ============================================================
exports.authRouter.post('/login', rateLimit_middleware_js_1.authLimiter, auth_api_js_1.loginAPI);
exports.authRouter.post('/register', rateLimit_middleware_js_1.authLimiter, auth_api_js_2.registerAPI);
// ============================================================
// UPLOAD – Upload file (cần JWT)
// ============================================================
exports.authRouter.post('/upload/single', auth_services_js_1.authMiddlewareClients, (0, multer_js_1.uploadSingleMiddleware)('file'), upload_api_js_1.uploadSingleFile);
exports.authRouter.post('/upload/multiple', auth_services_js_1.authMiddlewareClients, (0, multer_js_1.uploadMultipleMiddleware)('files', 10), upload_api_js_1.uploadMultipleFiles);
// ============================================================
// ARTICLES (public - không cần JWT)
// ============================================================
exports.authRouter.get('/articles', article_api_js_1.getPublicArticlesAPI);
exports.authRouter.get('/articles/:slug', article_api_js_1.getPublicArticleDetailAPI);
// ============================================================
// PAYMENT CALLBACK & PUBLIC INFO (không cần JWT)
// ============================================================
exports.authRouter.get('/payment/vnpay-return', payment_api_js_1.verifyPaymentReturnAPI);
exports.authRouter.get('/payment/banks', payment_api_js_1.getBankListAPI);
// ============================================================
// CLIENTS ROUTES (User / Doctor / Admin đã đăng nhập)
// ============================================================
// me
exports.userRouter.get('/me', user_controller_js_1.getMeAPI);
exports.userRouter.put('/me', user_controller_js_1.putMeAPI);
// doctor
exports.userRouter.get('/doctors', doctor_api_js_1.getDoctorsAPI);
exports.userRouter.get('/doctors/:id', doctor_api_js_1.getDoctorDetailAPI);
//specialty
exports.userRouter.get('/specialties', specialty_api_js_1.getSpecialtiesAPI);
exports.userRouter.get('/specialties/:id', specialty_api_js_1.getSpecialtiesDetailAPI);
// package
exports.userRouter.get('/packages', package_api_js_1.getPackagesAPI);
exports.userRouter.get('/packages/:id', package_api_js_1.getPackagesDetailAPI);
//cart
exports.userRouter.get('/cart', cart_api_js_1.getCartsAPI);
exports.userRouter.post('/cart/items', cart_api_js_1.postCartsAPI);
exports.userRouter.put('/cart-quantity/:packageId', cart_api_js_1.updateCartQuantityAPI);
exports.userRouter.delete('/carts/:packageId', cart_api_js_1.deleteCartsAPI);
// userRouter.delete('/cart', deleteCartsAPI);
//banner
exports.userRouter.get('/banners', banner_api_js_1.getBannersAPI);
//schedule – Xem lịch trống của bác sĩ để đặt lịch
exports.userRouter.get('/schedules', schedule_api_js_1.getSchedulesAPI);
exports.userRouter.get('/schedules/:id', schedule_api_js_1.getScheduleDetailAPI);
//article – Xem bài viết
exports.userRouter.get('/articles', article_api_js_1.getPublicArticlesAPI);
exports.userRouter.get('/articles/:slug', article_api_js_1.getPublicArticleDetailAPI);
//appointment – Đặt lịch khám Offline & Từ đơn hàng, Xem lịch sử, Chi tiết, Hủy lịch
exports.userRouter.post('/appointments', appointment_api_js_1.createAppointmentAPI);
exports.userRouter.post('/appointments/book-from-order/:id', appointment_api_js_1.bookFromOrderAPI);
exports.userRouter.get('/appointments', appointment_api_js_1.getAppointmentsAPI);
exports.userRouter.get('/appointments/:id', appointment_api_js_1.getAppointmentDetailAPI);
exports.userRouter.delete('/appointments/:id', appointment_api_js_1.cancelAppointmentAPI);
//payment – Thanh toán giỏ hàng qua VNPay 
exports.userRouter.post('/payment/checkout-cart', payment_api_js_1.checkoutCartPaymentAPI);
exports.userRouter.post('/payment/repay/:id', payment_api_js_1.repayOrderPaymentAPI);
//order – Đơn hàng của người dùng
exports.userRouter.get('/orders', order_api_js_1.getOrdersAPI);
exports.userRouter.get('/orders/:id', order_api_js_1.getOrderDetailAPI);
exports.userRouter.delete('/orders/:id', order_api_js_1.cancelOrderAPI);
//medical-record – Hồ sơ bệnh án của bệnh nhân (chỉ xem)
exports.userRouter.get('/medical-records', medical_record_api_js_1.getUserMedicalRecordsAPI);
exports.userRouter.get('/medical-records/:id', medical_record_api_js_1.getUserMedicalRecordDetailAPI);
//prescription – Đơn thuốc của bệnh nhân (theo hồ sơ bệnh án)
exports.userRouter.get('/prescriptions/medical-record/:medicalRecordId', prescription_api_js_1.getUserPrescriptionAPI);
// ============================================================
// DOCTOR ROUTES (Dành riêng cho Bác sĩ)
// ============================================================
// schedule – Quản lý lịch làm việc của bác sĩ
exports.doctorRouter.get('/schedules', schedule_api_js_1.getSchedulesAPI);
exports.doctorRouter.get('/schedules/:id', schedule_api_js_1.getScheduleDetailAPI);
exports.doctorRouter.post('/schedules', schedule_api_js_1.createScheduleAPI);
exports.doctorRouter.post('/schedules/bulk', schedule_api_js_1.bulkCreateScheduleAPI);
exports.doctorRouter.put('/schedules/:id', schedule_api_js_1.updateScheduleAPI);
// article – Quản lý bài viết của bác sĩ
exports.doctorRouter.get('/articles', article_api_js_1.getDoctorArticlesAPI);
exports.doctorRouter.get('/articles/:id', article_api_js_1.getDoctorArticleDetailAPI);
exports.doctorRouter.post('/articles', article_api_js_1.createDoctorArticleAPI);
exports.doctorRouter.put('/articles/:id', article_api_js_1.updateDoctorArticleAPI);
// appointment – Quản lý lịch hẹn của bác sĩ (chỉ xem lịch của bản thân)
exports.doctorRouter.get('/appointments', appointment_api_js_1.getDoctorAppointmentsAPI);
exports.doctorRouter.get('/appointments/:id', appointment_api_js_1.getDoctorAppointmentDetailAPI);
exports.doctorRouter.delete('/appointments/:id', appointment_api_js_1.cancelDoctorAppointmentAPI);
exports.doctorRouter.put('/appointments/:id/status', appointment_api_js_1.updateDoctorAppointmentStatusAPI);
// medical-record – Quản lý hồ sơ bệnh án (tạo, sửa, ký đóng, xem)
exports.doctorRouter.get('/medical-records', medical_record_api_js_1.getDoctorMedicalRecordsAPI);
exports.doctorRouter.get('/medical-records/:id', medical_record_api_js_1.getDoctorMedicalRecordDetailAPI);
exports.doctorRouter.post('/medical-records', medical_record_api_js_1.createMedicalRecordAPI);
exports.doctorRouter.put('/medical-records/:id', medical_record_api_js_1.updateMedicalRecordAPI);
exports.doctorRouter.put('/medical-records/:id/sign', medical_record_api_js_1.signMedicalRecordAPI);
// prescription – Quản lý đơn thuốc (kê đơn, sửa, xóa, xem)
exports.doctorRouter.get('/prescriptions/medical-record/:medicalRecordId', prescription_api_js_1.getDoctorPrescriptionAPI);
exports.doctorRouter.post('/prescriptions/medical-record/:medicalRecordId', prescription_api_js_1.createPrescriptionAPI);
exports.doctorRouter.put('/prescriptions/medical-record/:medicalRecordId', prescription_api_js_1.updatePrescriptionAPI);
exports.doctorRouter.delete('/prescriptions/:itemId', prescription_api_js_1.deletePrescriptionItemAPI);
// ============================================================
// ADMIN ROUTES (Dành riêng cho Quản trị viên)
// ============================================================
// doctor
exports.adminRouter.post('/doctors', auth_api_js_1.registerDoctorAPI);
exports.adminRouter.get('/doctors', doctor_api_js_1.getDoctorsAPI);
exports.adminRouter.get('/doctors/:id', doctor_api_js_1.getDoctorDetailAPI);
exports.adminRouter.put('/doctors/:id', doctor_api_js_1.updateDoctorAPI);
exports.adminRouter.delete('/doctors/:id', doctor_api_js_1.deleteDoctorAPI);
exports.adminRouter.post('/doctors-restore/:id', doctor_api_js_1.restoreDoctorAPI);
// user
exports.adminRouter.get('/user', user_controller_js_1.getUsersAPI);
exports.adminRouter.delete('/user/:id', user_controller_js_1.deleteUserAPI);
exports.adminRouter.post('/user-restore/:id', user_controller_js_1.restoreUserAPI);
// specialty
exports.adminRouter.get('/specialties', specialty_api_js_1.getSpecialtiesAPI);
exports.adminRouter.get('/specialties/:id', specialty_api_js_1.getSpecialtiesDetailAPI);
exports.adminRouter.post('/specialties', specialty_api_js_1.postSpecialtyAPI);
exports.adminRouter.put('/specialties/:id', specialty_api_js_1.updateSpecialtyAPI);
exports.adminRouter.delete('/specialties/:id', specialty_api_js_1.deleteSpecialtyAPI);
exports.adminRouter.post('/specialties-restore/:id', specialty_api_js_1.restoreSpecialtyAPI);
//package
exports.adminRouter.get('/packages', package_api_js_1.getPackagesAPI);
exports.adminRouter.get('/packages/:id', package_api_js_1.getPackagesDetailAPI);
exports.adminRouter.post('/packages', package_api_js_1.postPackagesAPI);
exports.adminRouter.put('/packages/:id', package_api_js_1.updatePackagesAPI);
exports.adminRouter.delete('/packages/:id', package_api_js_1.deletePackagesAPI);
exports.adminRouter.post('/packages-restore/:id', package_api_js_1.restorePackagesAPI);
//cart
exports.adminRouter.get('/carts', cart_api_js_1.getCartsAPI);
exports.adminRouter.get('/carts/:id', cart_api_js_1.getCartDetailAdminAPI);
//banner
exports.adminRouter.get('/banners', banner_api_js_1.getBannersAPI);
exports.adminRouter.post('/banners', banner_api_js_1.postBannersAPI);
exports.adminRouter.put('/banners/:id', banner_api_js_1.updateBannersAPI);
exports.adminRouter.put('/banners-status/:id', banner_api_js_1.statusBannersAPI);
exports.adminRouter.delete('/banners/:id', banner_api_js_1.deleteBannersAPI);
//schedule – Quản lý lịch làm việc (full quyền + xóa cứng)
exports.adminRouter.get('/schedules', schedule_api_js_1.getSchedulesAPI);
exports.adminRouter.get('/schedules/:id', schedule_api_js_1.getScheduleDetailAPI);
exports.adminRouter.post('/schedules', schedule_api_js_1.createScheduleAPI);
exports.adminRouter.post('/schedules/bulk', schedule_api_js_1.bulkCreateScheduleAPI);
exports.adminRouter.put('/schedules/:id', schedule_api_js_1.updateScheduleAPI);
exports.adminRouter.delete('/schedules/:id', schedule_api_js_1.deleteScheduleAPI);
//article – Quản lý bài viết (full quyền + xóa mềm)
exports.adminRouter.get('/articles', article_api_js_1.getAdminArticlesAPI);
exports.adminRouter.get('/articles/:id', article_api_js_1.getAdminArticleDetailAPI);
exports.adminRouter.post('/articles', article_api_js_1.createAdminArticleAPI);
exports.adminRouter.put('/articles/:id', article_api_js_1.updateAdminArticleAPI);
exports.adminRouter.delete('/articles/:id', article_api_js_1.deleteAdminArticleAPI);
//order - Quản lý đơn hàng 
exports.adminRouter.get('/orders', order_api_js_1.getOrderAdminsAPI);
exports.adminRouter.get('/orders/:id', order_api_js_1.getOrderDetailAdminAPI);
//appointment – Quản lý lịch hẹn khám (full quyền)
exports.adminRouter.get('/appointments', appointment_api_js_1.getAdminAppointmentsAPI);
exports.adminRouter.get('/appointments/:id', appointment_api_js_1.getAdminAppointmentDetailAPI);
exports.adminRouter.delete('/appointments/:id', appointment_api_js_1.cancelAdminAppointmentAPI);
exports.adminRouter.put('/appointments/:id/status', appointment_api_js_1.updateAdminAppointmentStatusAPI);
//medical-record – Hồ sơ bệnh án (chỉ xem, read-only)
exports.adminRouter.get('/medical-records', medical_record_api_js_1.getAdminMedicalRecordsAPI);
exports.adminRouter.get('/medical-records/:id', medical_record_api_js_1.getAdminMedicalRecordDetailAPI);
//prescription – Đơn thuốc (chỉ xem, read-only)
exports.adminRouter.get('/prescriptions/medical-record/:medicalRecordId', prescription_api_js_1.getAdminPrescriptionAPI);
