"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateMedicalRecordSchema = void 0;
const CreateMedicalRecord_Schema_js_1 = require("./CreateMedicalRecord_Schema.js");
/**
 * Schema validate khi Bác sĩ cập nhật hồ sơ bệnh án
 * Dùng .omit() để bỏ appointment_id (không được đổi lịch hẹn gắn liền)
 * Dùng .partial() để tất cả các field còn lại trở thành optional
 */
exports.UpdateMedicalRecordSchema = CreateMedicalRecord_Schema_js_1.CreateMedicalRecordSchema
    .omit({ appointment_id: true })
    .partial();
