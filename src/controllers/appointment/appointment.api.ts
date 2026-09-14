import { Request, Response } from 'express';
import { createAppointmentService, bookAppointmentFromOrderService } from '../../services/appointment/appointment.service.js';
import { CreateAppointmentSchema } from '../../model/Schema/Appointment/CreateAppointment_Schema.js';
import { BookFromOrderSchema } from '../../model/Schema/Appointment/BookFromOrder_Schema.js';

/**
 * POST /api/v1/appointments
 * Bệnh nhân đặt lịch khám Offline
 * Body: { doctor_id, date, time_type, patient_name, patient_phone, symptoms? }
 */
export const createAppointmentAPI = async (req: Request, res: Response) => {
    try {
        // Validate body
        const parsed = await CreateAppointmentSchema.safeParseAsync(req.body);
        if (!parsed.success) {
            const errors = parsed.error.issues.map(
                (i) => `${i.message} (${i.path[0]?.toString()})`
            );
            return res.status(400).json({
                status: 'error',
                message: errors,
            });
        }

        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Vui lòng đăng nhập',
            });
        }

        const appointment = await createAppointmentService({
            user_id: userId,
            doctor_id: parsed.data.doctor_id,
            date: parsed.data.date,
            time_type: parsed.data.time_type,
            patient_name: parsed.data.patient_name,
            patient_phone: parsed.data.patient_phone,
            symptoms: parsed.data.symptoms,
        });

        return res.status(201).json({
            status: 'success',
            message: 'Đặt lịch khám thành công',
            data: appointment,
        });
    } catch (error: any) {
        return res.status(400).json({
            status: 'error',
            message: error.message || 'Lỗi khi đặt lịch khám',
        });
    }
};

/**
 * POST /api/v1/appointments/book-from-order/:id
 * Bệnh nhân đặt lịch khám từ gói khám đã thanh toán (id là order_detail_id)
 * Body: { doctor_id, date, time_type, patient_name, patient_phone, symptoms? }
 */
export const bookFromOrderAPI = async (req: Request, res: Response) => {
    try {
        const orderDetailId = Number(req.params.id);
        if (!orderDetailId || isNaN(orderDetailId)) {
            return res.status(400).json({
                status: 'error',
                message: 'ID gói khám không hợp lệ',
            });
        }

        const parsed = await BookFromOrderSchema.safeParseAsync(req.body);
        if (!parsed.success) {
            const errors = parsed.error.issues.map(
                (i) => `${i.message} (${i.path[0]?.toString()})`
            );
            return res.status(400).json({
                status: 'error',
                message: errors,
            });
        }

        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Vui lòng đăng nhập',
            });
        }

        const appointment = await bookAppointmentFromOrderService({
            user_id: userId,
            order_detail_id: orderDetailId,
            doctor_id: parsed.data.doctor_id,
            date: parsed.data.date,
            time_type: parsed.data.time_type,
            patient_name: parsed.data.patient_name,
            patient_phone: parsed.data.patient_phone,
            symptoms: parsed.data.symptoms,
        });

        return res.status(201).json({
            status: 'success',
            message: 'Đặt lịch khám thành công',
            data: appointment,
        });
    } catch (error: any) {
        return res.status(400).json({
            status: 'error',
            message: error.message || 'Lỗi khi đặt lịch khám từ gói khám',
        });
    }
};
