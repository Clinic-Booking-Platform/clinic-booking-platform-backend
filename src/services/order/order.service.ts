import { prisma } from '../../config/client.js';
import {
    pageSize as defaultPageSize,
    AppointmentStatus,
    PaymentStatus,
    ORDER_PAYMENT_TIMEOUT_MINUTES,
} from '../../config/constant.js';
import { GetOrdersQuery, GetOrdersAdminQuery } from '../../types/order/Order.js';

/**
 * Lấy danh sách lịch sử đơn hàng của người dùng hiện tại
 * Hỗ trợ phân trang và lọc theo trạng thái thanh toán (PAID, UNPAID, FAILED)
 */
export const getOrdersByUserService = async (
    userId: number,
    query: GetOrdersQuery
) => {
    const page = Math.max(1, Number(query.page || 1));
    const size = Math.max(1, Number(query.pageSize || defaultPageSize));
    const skip = (page - 1) * size;

    const now = new Date();
    const expiryThreshold = new Date(now.getTime() - ORDER_PAYMENT_TIMEOUT_MINUTES * 60 * 1000);

    // Tự động xóa mềm các đơn hàng chưa thanh toán của user này nếu đã quá 15 phút
    await prisma.order.updateMany({
        where: {
            user_id: userId,
            payment_status: { in: [PaymentStatus.UNPAID, PaymentStatus.FAILED] },
            deleted_at: null,
            created_at: { lt: expiryThreshold },
        },
        data: {
            deleted_at: now,
            payment_status: PaymentStatus.FAILED,
        },
    });

    const where: any = {
        user_id: userId,
    };

    if (query.status) {
        where.payment_status = query.status.toUpperCase();
    }

    const [total, orders] = await prisma.$transaction([
        prisma.order.count({ where }),
        prisma.order.findMany({
            where,
            skip,
            take: size,
            orderBy: { created_at: 'desc' },
        }),
    ]);

    const formattedOrders = orders.map((order) => {
        const isPaid = order.payment_status === PaymentStatus.PAID;
        const expiresAt = new Date(order.created_at.getTime() + ORDER_PAYMENT_TIMEOUT_MINUTES * 60 * 1000);
        const isExpired = !isPaid && now > expiresAt;

        return {
            id: order.id,
            order_code: order.order_code,
            total_price: Number(order.total_price),
            payment_method: order.payment_method,
            payment_status: order.payment_status,
            created_at: order.created_at,
            expires_at: expiresAt,
            is_expired: isExpired,
            deleted_at: order.deleted_at,
        };
    });

    return {
        orders: formattedOrders,
        pagination: {
            total,
            page,
            pageSize: size,
            totalPages: Math.ceil(total / size),
        },
    };
};

/**
 * Lấy thông tin chi tiết một đơn hàng cụ thể của người dùng
 * Hỗ trợ tìm theo id (số) hoặc order_code (chuỗi mã đơn)
 * Kèm thông tin các gói khám và tính toán số lượt khám còn lại của từng gói
 */
export const getOrderDetailByUserService = async (
    userId: number,
    identifier: string | number
) => {
    const isNumeric = typeof identifier === 'number' || /^\d+$/.test(String(identifier));
    const where: any = {
        user_id: userId,
        deleted_at: null,
        ...(isNumeric ? { id: Number(identifier) } : { order_code: String(identifier) }),
    };

    const order = await prisma.order.findFirst({
        where,
        include: {
            order_details: {
                include: {
                    package: {
                        select: {
                            id: true,
                            name: true,
                            thumbnail_url: true,
                            price: true,
                            discount_price: true,
                            description: true,
                        },
                    },
                },
            },
            appointments: {
                where: { deleted_at: null },
                include: {
                    doctor: {
                        include: {
                            user: {
                                select: {
                                    full_name: true,
                                    avatar: true,
                                },
                            },
                        },
                    },
                },
                orderBy: { date: 'asc' },
            },
        },
    });

    if (!order) {
        throw new Error('Không tìm thấy đơn hàng hoặc đơn hàng không thuộc về bạn');
    }

    const formattedOrderDetails = order.order_details.map((detail) => {
        // Lọc các lịch hẹn đã đặt cho gói khám này (loại trừ lịch đã bị hủy)
        const matchingAppointments = order.appointments.filter(
            (apt) => apt.package_id === detail.package_id && apt.status !== AppointmentStatus.CANCELLED
        );
        const usedQuantity = matchingAppointments.length;
        const remainingQuantity = Math.max(0, detail.quantity - usedQuantity);

        return {
            id: detail.id,
            order_id: detail.order_id,
            package_id: detail.package_id,
            quantity: detail.quantity,
            price: Number(detail.price),
            package: {
                id: detail.package.id,
                name: detail.package.name,
                thumbnail_url: detail.package.thumbnail_url,
                price: Number(detail.package.price),
                discount_price: detail.package.discount_price ? Number(detail.package.discount_price) : null,
                description: detail.package.description,
            },
            used_quantity: usedQuantity,
            remaining_quantity: remainingQuantity,
            appointments: matchingAppointments.map((apt) => ({
                id: apt.id,
                doctor_id: apt.doctor_id,
                doctor: apt.doctor ? {
                    id: apt.doctor.id,
                    full_name: apt.doctor.user.full_name,
                    avatar: apt.doctor.user.avatar,
                } : null,
                date: apt.date,
                time_type: apt.time_type,
                appointment_type: apt.appointment_type,
                meeting_link: apt.meeting_link,
                patient_name: apt.patient_name,
                patient_phone: apt.patient_phone,
                symptoms: apt.symptoms,
                status: apt.status,
            })),
        };
    });

    const isPaid = order.payment_status === PaymentStatus.PAID;
    const expiresAt = new Date(order.created_at.getTime() + ORDER_PAYMENT_TIMEOUT_MINUTES * 60 * 1000);
    const isExpired = !isPaid && new Date() > expiresAt;

    // Nếu đơn hàng chưa thanh toán và đã quá 15 phút -> tự động xóa mềm
    if (isExpired && order.deleted_at === null) {
        const nowExpired = new Date();
        await prisma.order.update({
            where: { id: order.id },
            data: {
                payment_status: PaymentStatus.FAILED,
                deleted_at: nowExpired,
            },
        });
        order.payment_status = PaymentStatus.FAILED;
        order.deleted_at = nowExpired;
    }

    return {
        id: order.id,
        order_code: order.order_code,
        total_price: Number(order.total_price),
        payment_method: order.payment_method,
        payment_status: order.payment_status,
        created_at: order.created_at,
        expires_at: expiresAt,
        is_expired: isExpired,
        deleted_at: order.deleted_at,
        total_items: order.order_details.reduce((sum, item) => sum + item.quantity, 0),
        order_details: formattedOrderDetails,
    };
};

/**
 * Hủy đơn hàng chưa thanh toán (UNPAID)
 * - Chỉ cho phép hủy khi đơn hàng thuộc về user và đang ở trạng thái UNPAID
 */
export const cancelOrderService = async (
    userId: number,
    identifier: string | number
) => {
    const isNumeric = typeof identifier === 'number' || /^\d+$/.test(String(identifier));
    const where: any = {
        user_id: userId,
        ...(isNumeric ? { id: Number(identifier) } : { order_code: String(identifier) }),
    };

    const order = await prisma.order.findFirst({ where });

    if (!order) {
        throw new Error('Không tìm thấy đơn hàng hoặc đơn hàng không thuộc về bạn');
    }

    if (order.deleted_at !== null) {
        throw new Error('Đơn hàng này đã được hủy trước đó.');
    }

    if (order.payment_status === PaymentStatus.PAID) {
        throw new Error('Không thể hủy đơn hàng đã thanh toán thành công. Vui lòng liên hệ bộ phận hỗ trợ.');
    }

    const updatedOrder = await prisma.order.update({
        where: { id: order.id },
        data: {
            deleted_at: new Date(),
            payment_status: PaymentStatus.FAILED,
        },
    });

    return {
        id: updatedOrder.id,
        order_code: updatedOrder.order_code,
        deleted_at: updatedOrder.deleted_at,
        payment_status: updatedOrder.payment_status,
        message: 'Hủy đơn hàng thành công',
    };
};

/**
 * Lấy danh sách toàn bộ đơn hàng trên hệ thống dành cho Admin
 * Hỗ trợ phân trang, tìm kiếm (theo order_code, tên user, email, số điện thoại),
 * lọc theo trạng thái (status: PAID, UNPAID, FAILED, CANCELLED) và khoảng thời gian (from_date, to_date)
 */
export const getAllOrdersAdminService = async (query: GetOrdersAdminQuery) => {
    const page = Math.max(1, Number(query.page || 1));
    const size = Math.max(1, Number(query.pageSize || defaultPageSize));
    const skip = (page - 1) * size;

    const now = new Date();
    const expiryThreshold = new Date(now.getTime() - ORDER_PAYMENT_TIMEOUT_MINUTES * 60 * 1000);

    // Tự động xóa mềm các đơn hàng chưa thanh toán trên toàn hệ thống nếu đã quá 15 phút
    await prisma.order.updateMany({
        where: {
            payment_status: { in: [PaymentStatus.UNPAID, PaymentStatus.FAILED] },
            deleted_at: null,
            created_at: { lt: expiryThreshold },
        },
        data: {
            deleted_at: now,
            payment_status: PaymentStatus.FAILED,
        },
    });

    const where: any = {};

    // Lọc theo từ khóa tìm kiếm (order_code hoặc thông tin khách hàng)
    if (query.search && query.search.trim() !== '') {
        const keyword = query.search.trim();
        where.OR = [
            { order_code: { contains: keyword } },
            {
                user: {
                    full_name: { contains: keyword },
                },
            },
            {
                user: {
                    email: { contains: keyword },
                },
            },
            {
                user: {
                    phone_number: { contains: keyword },
                },
            },
        ];
    }

    // Lọc theo trạng thái thanh toán hoặc đã hủy
    if (query.status) {
        const upperStatus = query.status.toUpperCase();
        if (upperStatus === PaymentStatus.CANCELLED) {
            where.deleted_at = { not: null };
        } else {
            where.payment_status = upperStatus;
        }
    }

    // Lọc theo khoảng ngày tạo
    if (query.from_date || query.to_date) {
        where.created_at = {};
        if (query.from_date) {
            where.created_at.gte = new Date(query.from_date);
        }
        if (query.to_date) {
            const toDate = new Date(query.to_date);
            if (query.to_date.length <= 10) {
                toDate.setHours(23, 59, 59, 999);
            }
            where.created_at.lte = toDate;
        }
    }

    const [total, orders] = await prisma.$transaction([
        prisma.order.count({ where }),
        prisma.order.findMany({
            where,
            skip,
            take: size,
            orderBy: { created_at: 'desc' },
            include: {
                user: {
                    select: {
                        id: true,
                        full_name: true,
                        email: true,
                        phone_number: true,
                        avatar: true,
                    },
                },
            },
        }),
    ]);

    const formattedOrders = orders.map((order) => {
        const isPaid = order.payment_status === PaymentStatus.PAID;
        const expiresAt = new Date(order.created_at.getTime() + ORDER_PAYMENT_TIMEOUT_MINUTES * 60 * 1000);
        const isExpired = !isPaid && now > expiresAt;

        return {
            id: order.id,
            order_code: order.order_code,
            total_price: Number(order.total_price),
            payment_method: order.payment_method,
            payment_status: order.payment_status,
            created_at: order.created_at,
            expires_at: expiresAt,
            is_expired: isExpired,
            deleted_at: order.deleted_at,
            user: order.user,
        };
    });

    return {
        orders: formattedOrders,
        pagination: {
            total,
            page,
            pageSize: size,
            totalPages: Math.ceil(total / size),
        },
    };
};

/**
 * Lấy chi tiết đơn hàng dành cho Admin theo id (số) hoặc order_code (chuỗi)
 * Bao gồm đầy đủ thông tin khách hàng, các gói khám trong đơn, tiến độ sử dụng gói và lịch hẹn liên quan
 */
export const getOrderDetailAdminService = async (identifier: string | number) => {
    const isNumeric = typeof identifier === 'number' || /^\d+$/.test(String(identifier));
    const where: any = isNumeric ? { id: Number(identifier) } : { order_code: String(identifier) };

    const order = await prisma.order.findFirst({
        where,
        include: {
            user: {
                select: {
                    id: true,
                    full_name: true,
                    email: true,
                    phone_number: true,
                    avatar: true,
                    gender: true,
                    date_of_birth: true,
                },
            },
            order_details: {
                include: {
                    package: {
                        select: {
                            id: true,
                            name: true,
                            thumbnail_url: true,
                            price: true,
                            discount_price: true,
                            description: true,
                        },
                    },
                },
            },
            appointments: {
                where: { deleted_at: null },
                include: {
                    doctor: {
                        include: {
                            user: {
                                select: {
                                    full_name: true,
                                    avatar: true,
                                },
                            },
                        },
                    },
                },
                orderBy: { date: 'asc' },
            },
        },
    });

    if (!order) {
        throw new Error('Không tìm thấy đơn hàng trên hệ thống');
    }

    const formattedOrderDetails = order.order_details.map((detail) => {
        const matchingAppointments = order.appointments.filter(
            (apt) => apt.package_id === detail.package_id && apt.status !== AppointmentStatus.CANCELLED
        );
        const usedQuantity = matchingAppointments.length;
        const remainingQuantity = Math.max(0, detail.quantity - usedQuantity);

        return {
            id: detail.id,
            order_id: detail.order_id,
            package_id: detail.package_id,
            quantity: detail.quantity,
            price: Number(detail.price),
            package: {
                id: detail.package.id,
                name: detail.package.name,
                thumbnail_url: detail.package.thumbnail_url,
                price: Number(detail.package.price),
                discount_price: detail.package.discount_price ? Number(detail.package.discount_price) : null,
                description: detail.package.description,
            },
            used_quantity: usedQuantity,
            remaining_quantity: remainingQuantity,
            appointments: matchingAppointments.map((apt) => ({
                id: apt.id,
                doctor_id: apt.doctor_id,
                doctor: apt.doctor ? {
                    id: apt.doctor.id,
                    full_name: apt.doctor.user.full_name,
                    avatar: apt.doctor.user.avatar,
                } : null,
                date: apt.date,
                time_type: apt.time_type,
                appointment_type: apt.appointment_type,
                meeting_link: apt.meeting_link,
                patient_name: apt.patient_name,
                patient_phone: apt.patient_phone,
                symptoms: apt.symptoms,
                status: apt.status,
            })),
        };
    });

    const isPaid = order.payment_status === PaymentStatus.PAID;
    const expiresAt = new Date(order.created_at.getTime() + ORDER_PAYMENT_TIMEOUT_MINUTES * 60 * 1000);
    const isExpired = !isPaid && new Date() > expiresAt;

    if (isExpired && order.deleted_at === null) {
        const nowExpired = new Date();
        await prisma.order.update({
            where: { id: order.id },
            data: {
                payment_status: PaymentStatus.FAILED,
                deleted_at: nowExpired,
            },
        });
        order.payment_status = PaymentStatus.FAILED;
        order.deleted_at = nowExpired;
    }

    return {
        id: order.id,
        order_code: order.order_code,
        total_price: Number(order.total_price),
        payment_method: order.payment_method,
        payment_status: order.payment_status,
        created_at: order.created_at,
        expires_at: expiresAt,
        is_expired: isExpired,
        deleted_at: order.deleted_at,
        user: order.user,
        total_items: order.order_details.reduce((sum, item) => sum + item.quantity, 0),
        order_details: formattedOrderDetails,
    };
};
