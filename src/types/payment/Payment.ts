export interface CheckoutCartData {
    user_id: number;
    client_ip?: string;
}

export interface CreatePaymentUrlResult {
    order_code: string;
    payment_url: string;
    qr_content?: string;
    total_price: number;
}

export interface VerifyReturnResult {
    isSuccess: boolean;
    isVerified: boolean;
    message: string;
    order_code: string;
}
