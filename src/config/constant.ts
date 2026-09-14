export const RoleType = {
    ADMIN: 'ADMIN',
    USER: 'USER',
    DOCTOR: 'DOCTOR',
};

export const AppointmentStatus = {
    PENDING: 'PENDING',
    CONFIRMED: 'CONFIRMED',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
    NO_SHOW: 'NO_SHOW',
} as const;

export type AppointmentStatusType = (typeof AppointmentStatus)[keyof typeof AppointmentStatus];

export const ScheduleStatus = {
    AVAILABLE: 'AVAILABLE',
    FULL: 'FULL',
    CANCELLED: 'CANCELLED',
} as const;

export type ScheduleStatusType = (typeof ScheduleStatus)[keyof typeof ScheduleStatus];

export const PaymentStatus = {
    UNPAID: 'UNPAID',
    PAID: 'PAID',
    FAILED: 'FAILED',
} as const;

export type PaymentStatusType = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export const PaymentMethod = {
    VNPAY: 'VNPAY',
    CASH: 'CASH',
} as const;

export type PaymentMethodType = (typeof PaymentMethod)[keyof typeof PaymentMethod];


/**
 * Định nghĩa và quy đổi các ca khám (Time Type)
 * T1 - T4: Buổi sáng (08:00 - 12:00)
 * T5 - T8: Buổi chiều (13:00 - 17:00)
 */
export interface TimeSlot {
    key: string;
    label: string;       // "08:00 - 09:00"
    startTime: string;   // "08:00"
    endTime: string;     // "09:00"
}

export const TimeTypeMap: Record<string, TimeSlot> = {
    T1: { key: 'T1', label: '08:00 - 09:00', startTime: '08:00', endTime: '09:00' },
    T2: { key: 'T2', label: '09:00 - 10:00', startTime: '09:00', endTime: '10:00' },
    T3: { key: 'T3', label: '10:00 - 11:00', startTime: '10:00', endTime: '11:00' },
    T4: { key: 'T4', label: '11:00 - 12:00', startTime: '11:00', endTime: '12:00' },
    T5: { key: 'T5', label: '13:00 - 14:00', startTime: '13:00', endTime: '14:00' },
    T6: { key: 'T6', label: '14:00 - 15:00', startTime: '14:00', endTime: '15:00' },
    T7: { key: 'T7', label: '15:00 - 16:00', startTime: '15:00', endTime: '16:00' },
    T8: { key: 'T8', label: '16:00 - 17:00', startTime: '16:00', endTime: '17:00' },
};

export const pageSize = 5;

export interface PriceRange {
    min?: number;
    max?: number;
}

/**
 * Phân tích chuỗi hoặc mảng khoảng giá, ví dụ:
 * - '100-300' ➔ { min: 100000, max: 300000 }
 * - '300-500' ➔ { min: 300000, max: 500000 }
 * - '500-1000' ➔ { min: 500000, max: 1000000 }
 * - 'tren-1000' / '>1000' / '1000+' ➔ { min: 1000000 }
 * Có thể truyền nhiều khoảng: '100-300,500-1000' hoặc ['100-300', '500-1000']
 */
export const parsePriceRanges = (input?: any): PriceRange[] => {
    if (!input) return [];

    const rawList: string[] = Array.isArray(input)
        ? input.map((i) => String(i))
        : String(input).split(',');

    const ranges: PriceRange[] = [];

    for (let item of rawList) {
        item = item.trim().toLowerCase();
        if (!item) continue;

        // Xử lý các dạng: "tren-1000", "tren-1000k", ">1000", "1000+", "over-1000"
        if (
            item.startsWith('tren-') ||
            item.startsWith('tren') ||
            item.startsWith('over-') ||
            item.startsWith('>') ||
            item.endsWith('+')
        ) {
            const numStr = item.replace(/[^0-9]/g, '');
            let min = Number(numStr);
            if (!isNaN(min) && min > 0) {
                if (min < 10000) min *= 1000; // 1000 -> 1,000,000đ
                ranges.push({ min });
            }
            continue;
        }

        // Xử lý khoảng "100-300", "300-500", "500-1000"
        if (item.includes('-')) {
            const parts = item.split('-');
            let min = Number(parts[0].trim().replace(/[^0-9]/g, ''));
            let max = Number(parts[1].trim().replace(/[^0-9]/g, ''));

            if (!isNaN(min) && !isNaN(max)) {
                if (min < 10000) min *= 1000; // 100 -> 100,000đ
                if (max < 10000) max *= 1000; // 300 -> 300,000đ
                ranges.push({ min, max });
            }
        }
    }

    return ranges;
};

