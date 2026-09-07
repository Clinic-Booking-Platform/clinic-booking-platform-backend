"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Register_Doctor = exports.Register_User = exports.isEmail = void 0;
const auth_services_js_1 = require("../../middleware/auth.services.js");
const client_js_1 = require("../../config/client.js");
const constant_js_1 = require("../../config/constant.js");
// ============================================================
// Kiểm tra email đã tồn tại chưa
// ============================================================
const isEmail = async (email) => {
    return client_js_1.prisma.user.findUnique({ where: { email } });
};
exports.isEmail = isEmail;
// ============================================================
// Tạo tài khoản mới
// ============================================================
const Register_User = async (email, password, fullname) => {
    const hashPassword = await auth_services_js_1.AuthService.hashPassword(password);
    const role = await client_js_1.prisma.role.findFirst({
        where: { name: constant_js_1.RoleType.USER },
    });
    if (!role) {
        throw new Error('Không tìm thấy vai trò Người dùng (USER) trong hệ thống.');
    }
    return client_js_1.prisma.user.create({
        data: {
            email,
            password: hashPassword,
            full_name: fullname,
            roleId: role.id,
        },
    });
};
exports.Register_User = Register_User;
// ============================================================
// Tạo tài khoản Bác sĩ (gồm User + Doctor profile)
// ============================================================
const Register_Doctor = async (email, password, fullname, price, specialty_id, description) => {
    const hashPassword = await auth_services_js_1.AuthService.hashPassword(password);
    const role = await client_js_1.prisma.role.findFirst({
        where: { name: constant_js_1.RoleType.DOCTOR },
    });
    if (!role) {
        throw new Error('Không tìm thấy vai trò Bác sĩ (DOCTOR) trong hệ thống.');
    }
    return client_js_1.prisma.$transaction(async (tx) => {
        // 1. Kiểm tra chuyên khoa có hợp lệ không
        const specialty = await tx.specialty.findFirst({
            where: { id: specialty_id, deleted_at: null },
        });
        if (!specialty) {
            throw new Error('Chuyên khoa không tồn tại hoặc đã bị xóa.');
        }
        // 2. Tạo tài khoản User với vai trò DOCTOR
        const user = await tx.user.create({
            data: {
                email,
                password: hashPassword,
                full_name: fullname,
                roleId: role.id,
            },
        });
        // 3. Tạo hồ sơ Bác sĩ liên kết 1-1 với User vừa tạo
        const doctor = await tx.doctor.create({
            data: {
                user_id: user.id,
                specialty_id: specialty.id,
                price,
                description: description || `Bác sĩ chuyên khoa ${specialty.name}`,
            },
        });
        return true;
    });
};
exports.Register_Doctor = Register_Doctor;
