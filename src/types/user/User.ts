
export interface GetUsersOptions {
    page?: number;

    search?: string;
    status?: 'all' | 'active' | 'deleted';
}
export interface UpdateUserData {
    full_name?: string;
    phone_number?: string | null;
    date_of_birth?: string | null;
    gender?: string | null;
    avatar?: string | null;
    // Doctor fields
    specialty_id?: number;
    description?: string | null;
    price?: number;
}