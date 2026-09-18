import z from 'zod';
import { CreateMedicalRecordSchema } from './CreateMedicalRecord_Schema.js';

/**
 * Schema validate khi Bác sĩ cập nhật hồ sơ bệnh án
 * Dùng .omit() để bỏ appointment_id (không được đổi lịch hẹn gắn liền)
 * Dùng .partial() để tất cả các field còn lại trở thành optional
 */
export const UpdateMedicalRecordSchema = CreateMedicalRecordSchema
    .omit({ appointment_id: true })
    .partial();

export type UpdateMedicalRecord = z.infer<typeof UpdateMedicalRecordSchema>;
