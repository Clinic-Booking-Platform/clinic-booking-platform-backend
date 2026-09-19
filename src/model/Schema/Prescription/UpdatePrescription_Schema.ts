import z from 'zod';
import { CreatePrescriptionSchema } from './CreatePrescription_Schema.js';

/**
 * Schema validate khi Bác sĩ điều chỉnh đơn thuốc
 * Áp dụng cho: PUT /doctor/prescriptions/medical-record/:medicalRecordId
 */
export const UpdatePrescriptionSchema = CreatePrescriptionSchema;

export type UpdatePrescription = z.infer<typeof UpdatePrescriptionSchema>;
