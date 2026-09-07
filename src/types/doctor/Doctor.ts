export interface GetDoctorsOptions {
    page?: number;
    pageSize?: number;
    specialty_id?: number;
    search?: string;
    status?: 'all' | 'active' | 'deleted';
}

export interface UpdateDoctorData {
    full_name?: string;
    phone_number?: string | null;
    avatar?: string | null;
    specialty_id?: number;
    description?: string | null;
    price?: number;
}
