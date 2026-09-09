import { PriceRange } from '../../config/constant.js';

export interface AddToCartData {
    package_id: number;
    quantity?: number;
}

export interface UpdateCartQuantityData {
    quantity: number;
}

export interface GetCartsAdminOptions {
    page?: number;
    pageSize?: number;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    priceRanges?: PriceRange[];
}
