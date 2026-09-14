import { VNPay, ignoreLogger } from 'vnpay';

export const vnpay = new VNPay({
    tmnCode: process.env.VNP_TMN_CODE || '2G93T2WS',
    secureSecret: process.env.VNP_HASH_SECRET || 'JVYXJJJXMILCUMXFMSCRTVNFJGTOPNSG',
    vnpayHost: process.env.VNP_URL_HOST || 'https://sandbox.vnpayment.vn',
    queryDrAndRefundHost: 'https://sandbox.vnpayment.vn', // tùy chọn cho querydr và refund
    testMode: true, // chế độ sandbox thử nghiệm
    enableLog: true,
    loggerFn: ignoreLogger,
    endpoints: {
        paymentEndpoint: 'paymentv2/vpcpay.html',
        queryDrRefundEndpoint: 'merchant_webapi/api/transaction',
        getBankListEndpoint: 'qrpayauth/api/merchant/get_bank_list',
    },
});