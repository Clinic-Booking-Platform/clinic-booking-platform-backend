export interface GetOrdersQuery {
    page?: number;
    pageSize?: number;
    status?: string;
}

export interface GetOrdersAdminQuery {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: string;
    from_date?: string;
    to_date?: string;
}

export interface PackageSummary {
    id: number;
    name: string;
    thumbnail_url: string | null;
    price: number;
    discount_price: number | null;
}

export interface OrderItemSummary {
    id: number;
    order_id: number;
    package_id: number;
    quantity: number;
    price: number;
    package: PackageSummary;
}

export interface OrderDetailWithUsage extends OrderItemSummary {
    used_quantity: number;
    remaining_quantity: number;
    appointments: Array<{
        id: number;
        doctor_id: number | null;
        doctor?: {
            id: number;
            user: {
                full_name: string;
                avatar: string | null;
            };
        } | null;
        date: Date | string;
        time_type: string;
        appointment_type: string;
        meeting_link: string | null;
        patient_name: string;
        patient_phone: string;
        symptoms: string | null;
        status: string;
    }>;
}
