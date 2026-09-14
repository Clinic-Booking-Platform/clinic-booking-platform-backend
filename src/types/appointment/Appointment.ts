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
