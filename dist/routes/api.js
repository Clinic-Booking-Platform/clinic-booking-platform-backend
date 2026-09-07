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
// Tài khoản cá nhân
exports.userRouter.get('/me', user_controller_js_1.getMeAPI);
exports.userRouter.put('/me', user_controller_js_1.putMeAPI);
// Xem danh sách và chi tiết bác sĩ
exports.userRouter.get('/doctors', doctor_api_js_1.getDoctorsAPI);
exports.userRouter.get('/doctors/:id', doctor_api_js_1.getDoctorDetailAPI);
// ============================================================
// DOCTOR ROUTES (Dành riêng cho Bác sĩ)
// ============================================================
// ============================================================
// ADMIN ROUTES (Dành riêng cho Quản trị viên)
// ============================================================
// 1. Quản lý Bác sĩ (Doctor Management)
exports.adminRouter.post('/doctors', auth_api_js_1.registerDoctorAPI);
exports.adminRouter.get('/doctors', doctor_api_js_1.getDoctorsAPI);
exports.adminRouter.get('/doctors/:id', doctor_api_js_1.getDoctorDetailAPI);
exports.adminRouter.put('/doctors/:id', doctor_api_js_1.updateDoctorAPI);
exports.adminRouter.delete('/doctors/:id', doctor_api_js_1.deleteDoctorAPI);
exports.adminRouter.post('/doctors-restore/:id', doctor_api_js_1.restoreDoctorAPI);
// 2. Quản lý Người dùng (User Management)
exports.adminRouter.get('/user', user_controller_js_1.getUsersAPI);
exports.adminRouter.delete('/user/:id', user_controller_js_1.deleteUserAPI);
exports.adminRouter.post('/user-restore/:id', user_controller_js_1.restoreUserAPI);
