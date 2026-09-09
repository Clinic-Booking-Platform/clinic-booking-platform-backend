import { PriceRange } from '../../config/constant.js';

export interface GetPackagesOptions {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: 'all' | 'active' | 'deleted';
    minPrice?: number;
    maxPrice?: number;
    priceRanges?: PriceRange[];
}

export interface CreatePackageData {
    name: string;
    description?: string | null;
    thumbnail_url?: string | null;
    price: number;
    discount_price?: number | null;
    html_content?: string | null;
}

export interface UpdatePackageData {
    name?: string;
    description?: string | null;
    thumbnail_url?: string | null;
    price?: number;
    discount_price?: number | null;
    html_content?: string | null;
}
