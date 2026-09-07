"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerDoctorAPI = exports.registerAPI = exports.loginAPI = void 0;
const auth_services_js_1 = require("../../../middleware/auth.services.js");
const RegisterUser_Schemas_js_1 = require("../../../model/Schema/Auth/RegisterUser_Schemas.js");
const LoginUser_Schema_js_1 = require("../../../model/Schema/Auth/LoginUser_Schema.js");
const auth_service_js_1 = require("../../auth/auth.service.js");
const RegisterDoctor_Schema_js_1 = require("../../../model/Schema/Auth/RegisterDoctor_Schema.js");
// ============================================================
// POST /login
// ============================================================
const loginAPI = async (req, res) => {
    try {
        const parsed = await LoginUser_Schema_js_1.LoginUserSchema.safeParseAsync(req.body);
        if (!parsed.success) {
            const errors = parsed.error.issues.map((i) => `${i.message} (${i.path[0]?.toString()})`);
            res.status(400).json({ message: errors });
            return;
        }
        const identifier = (parsed.data.email);
        const { password } = parsed.data;
        const token = await (0, auth_services_js_1.loginService)(identifier, password);
        res.status(200).json({ data: token, message: 'Đăng nhập thành công' });
    }
    catch (error) {
        res.status(401).json({ data: null, message: error.message });
    }
};
exports.loginAPI = loginAPI;
// ============================================================
// POST /register
// ============================================================
const registerAPI = async (req, res) => {
    try {
        const parsed = await RegisterUser_Schemas_js_1.RegisterUserSchema.safeParseAsync(req.body);
        if (!parsed.success) {
            const errors = parsed.error.issues.map((i) => `${i.message} (${i.path[0]?.toString()})`);
            res.status(400).json({ message: errors });
            return;
        }
        const { email, fullname, password } = parsed.data;
        await (0, auth_service_js_1.Register_User)(email, password, fullname);
        res.status(201).json({ message: 'Đăng ký thành công' });
    }
    catch (error) {
        res.status(500).json({ data: null, message: error.message });
    }
};
exports.registerAPI = registerAPI;
const registerDoctorAPI = async (req, res) => {
    try {
        const parsed = await RegisterDoctor_Schema_js_1.RegisterDoctorSchema.safeParseAsync(req.body);
        if (!parsed.success) {
            const errors = parsed.error.issues.map((i) => `${i.message} (${i.path[0]?.toString()})`);
            res.status(400).json({ message: errors });
            return;
        }
        const { email, fullname, password, specialty_id } = parsed.data;
        await (0, auth_service_js_1.Register_Doctor)(email, password, fullname, +specialty_id);
        res.status(201).json({ message: 'Đăng ký thành công' });
    }
    catch (error) {
        res.status(500).json({ data: null, message: error.message });
    }
};
exports.registerDoctorAPI = registerDoctorAPI;
