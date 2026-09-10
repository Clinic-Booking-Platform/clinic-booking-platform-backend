export interface GetSchedulesOptions {
    page?: number;
    pageSize?: number;
    doctor_id?: number;
    date?: string;          // YYYY-MM-DD – lọc theo ngày cụ thể
    from_date?: string;     // YYYY-MM-DD – lọc từ ngày
    to_date?: string;       // YYYY-MM-DD – lọc đến ngày
    status?: string;        // AVAILABLE | FULL | CANCELLED | all
}

export interface CreateScheduleData {
    doctor_id: number;
    date: string;           // YYYY-MM-DD
    time_type: string;      // Mã ca: T1, T2, T3, T4...
    max_number?: number;    // Mặc định 10
}

export interface UpdateScheduleData {
    max_number?: number;
    status?: string;        // AVAILABLE | FULL | CANCELLED
}

export interface BulkCreateScheduleData {
    doctor_id: number;
    date: string;           // YYYY-MM-DD
    time_types: string[];   // Tạo nhiều ca cùng lúc: ["T1", "T2", "T3"]
    max_number?: number;
}
