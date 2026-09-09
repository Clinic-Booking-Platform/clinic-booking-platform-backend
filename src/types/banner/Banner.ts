export interface GetBannersOptions {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: 'all' | 'active' | 'inactive' | string;
    all?: boolean;
}

export interface CreateBannerData {
    title: string;
    image_url: string;
    link_url?: string | null;
    sort_order?: number;
    is_active?: boolean;
}

export interface UpdateBannerData {
    title?: string;
    image_url?: string;
    link_url?: string | null;
    sort_order?: number;
}

export interface ChangeBannerStatusData {
    is_active: boolean;
}
