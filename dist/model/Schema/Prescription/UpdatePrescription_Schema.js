"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePrescriptionSchema = void 0;
const CreatePrescription_Schema_js_1 = require("./CreatePrescription_Schema.js");
/**
 * Schema validate khi Bác sĩ điều chỉnh đơn thuốc
 * Áp dụng cho: PUT /doctor/prescriptions/medical-record/:medicalRecordId
 */
exports.UpdatePrescriptionSchema = CreatePrescription_Schema_js_1.CreatePrescriptionSchema;
