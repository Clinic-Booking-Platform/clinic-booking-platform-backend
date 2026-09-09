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
const user_controller_js_1 = require("../controllers/user/user.controller.js");
const doctor_api_js_1 = require("../controllers/doctor/doctor.api.js");
const specialty_api_js_1 = require("../controllers/specialty/specialty.api.js");
const package_api_js_1 = require("../controllers/package/package.api.js");
const cart_api_js_1 = require("../controllers/cart/cart.api.js");
exports.authRouter = express_1.default.Router();
exports.adminRouter = express_1.default.Router();
exports.userRouter = express_1.default.Router();
exports.doctorRouter = express_1.default.Router();
exports.userRouter.use(auth_services_js_1.authMiddlewareClients);
exports.adminRouter.use(auth_services_js_1.authMiddlewareADMIN);
exports.doctorRouter.use(auth_services_js_1.authMiddlewareDOCTOR);
// ============================================================
// AUTH – Đăng nhập / Đăng ký (public)
// ============================================================
exports.authRouter.post('/login', auth_api_js_1.loginAPI);
exports.authRouter.post('/register', auth_api_js_2.registerAPI);
// ============================================================
// UPLOAD – Upload file (cần JWT)
// ============================================================
exports.authRouter.post('/upload/single', auth_services_js_1.authMiddlewareClients, (0, multer_js_1.uploadSingleMiddleware)('file'), upload_api_js_1.uploadSingleFile);
exports.authRouter.post('/upload/multiple', auth_services_js_1.authMiddlewareClients, (0, multer_js_1.uploadMultipleMiddleware)('files', 10), upload_api_js_1.uploadMultipleFiles);
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
exports.userRouter.delete('/cart', cart_api_js_1.deleteCartsAPI);
// ============================================================
// DOCTOR ROUTES (Dành riêng cho Bác sĩ)
// ============================================================
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
