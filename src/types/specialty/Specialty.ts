export interface GetSpecialtiesOptions {
    page?: number;
    pageSize?: number;
    all?: boolean;
    search?: string;
    status?: 'all' | 'active' | 'deleted';
}

export interface CreateSpecialtyData {
    name: string;
    description?: string | null;
    image_url?: string | null;
}

export interface UpdateSpecialtyData {
    name?: string;
    description?: string | null;
    image_url?: string | null;
}
