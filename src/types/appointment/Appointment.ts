export interface CreateAppointmentData {
    user_id: number;
    doctor_id: number;
    date: string;           // YYYY-MM-DD
    time_type: string;      // Ca khám: T1, T2, T3...
    patient_name: string;
    patient_phone: string;
    symptoms?: string;
}

export interface BookFromOrderData {
    user_id: number;
    order_detail_id: number;
    doctor_id: number;
    date: string;
    time_type: string;
    patient_name: string;
    patient_phone: string;
    symptoms?: string;
}

// ============================================================
// Query interfaces cho các API mới
// ============================================================

/**
 * Query params cho API lịch sử lịch hẹn của User
 */
export interface GetUserAppointmentsQuery {
    page?: number;
    status?: string;        // PENDING | CONFIRMED | COMPLETED | CANCELLED | NO_SHOW
}

/**
 * Query params cho API danh sách lịch hẹn của Doctor
 */
export interface GetDoctorAppointmentsQuery {
    page?: number;
    status?: string;        // PENDING | CONFIRMED | COMPLETED | CANCELLED | NO_SHOW
    from_date?: string;     // YYYY-MM-DD
    to_date?: string;       // YYYY-MM-DD
    search?: string;        // Tìm theo tên bệnh nhân hoặc SĐT
}

/**
 * Query params cho API danh sách lịch hẹn của Admin
 */
export interface GetAdminAppointmentsQuery {
    page?: number;
    status?: string;        // PENDING | CONFIRMED | COMPLETED | CANCELLED | NO_SHOW
    from_date?: string;     // YYYY-MM-DD
    to_date?: string;       // YYYY-MM-DD
    search?: string;        // Tìm theo tên bệnh nhân, SĐT, tên bác sĩ
    doctor_id?: number;     // Lọc theo bác sĩ
}
