import { prisma } from '../../config/client.js';
import { pageSize as defaultPageSize } from '../../config/constant.js';
import {
    AddToCartData,
    GetCartsAdminOptions,
    UpdateCartQuantityData,
} from '../../types/cart/Cart.js';

/**
 * Hàm hỗ trợ: Cập nhật lại cột `sum` trong bảng Cart
 */
const updateCartSum = async (cartId: number) => {
    const aggregate = await prisma.cartDetail.aggregate({
        where: { cart_id: cartId },
        _sum: { quantity: true },
    });
    const totalQuantity = aggregate._sum.quantity || 0;

    await prisma.cart.update({
        where: { id: cartId },
        data: { sum: totalQuantity },
    });

    return totalQuantity;
};

/**
 * Lấy giỏ hàng của người dùng hiện tại
 * - Nếu người dùng chưa có giỏ hàng (hoặc đã bị xóa hết sản phẩm): trả về cấu trúc rỗng (không tạo bản ghi rác trong DB)
 * - Kèm thông tin chi tiết gói khám, tính tổng số lượng và tổng tiền
 */
export const getCartByUserService = async (userId: number) => {
    let cart = await prisma.cart.findUnique({
        where: { user_id: userId },
        include: {
            cart_details: {
                include: {
                    package: {
                        select: {
                            id: true,
                            name: true,
                            thumbnail_url: true,
                            price: true,
                            discount_price: true,
                            deleted_at: true,
                        },
                    },
                },
                orderBy: { id: 'desc' },
            },
        },
    });

    // Nếu chưa có giỏ hàng hoặc giỏ hàng đã bị xóa
    if (!cart) {
        return {
            id: null,
            user_id: userId,
            sum: 0,
            cart_details: [],
            total_items: 0,
            total_amount: 0,
        };
    }

    let total_amount = 0;
    let computed_sum = 0;

    for (const item of cart.cart_details) {
        computed_sum += item.quantity;
        total_amount += Number(item.price) * item.quantity;
    }

    // Tự động đồng bộ lại cột sum nếu có sự chênh lệch
    if (cart.sum !== computed_sum) {
        await prisma.cart.update({
            where: { id: cart.id },
            data: { sum: computed_sum },
        });
        cart.sum = computed_sum;
    }

    return {
        ...cart,
        total_items: cart.sum,
        total_amount,
    };
};

/**
 * Thêm gói khám vào giỏ hàng:
 * - Kiểm tra gói khám tồn tại và còn hoạt động (deleted_at == null)
 * - Kiểm tra xem người dùng đã có giỏ hàng chưa:
 *   + Nếu chưa có: Tạo mới giỏ hàng và thêm gói khám với số lượng mặc định (1)
 *   + Nếu đã có:
 *       * Gói khám đã có trong giỏ ➔ Cập nhật số lượng + 1 (hoặc + quantity gửi lên)
 *       * Gói khám chưa có trong giỏ ➔ Thêm mới vào giỏ với số lượng mặc định (1)
 * - Tự động cập nhật cột `sum` trong bảng Cart
 */
export const addToCartService = async (userId: number, data: AddToCartData) => {
    const pkg = await prisma.package.findUnique({
        where: { id: data.package_id },
    });

    if (!pkg || pkg.deleted_at !== null) {
        throw new Error('Gói khám không tồn tại hoặc đã ngừng cung cấp');
    }

    const effectivePrice = pkg.discount_price ?? pkg.price;
    // Tự động là 1 mỗi khi bấm thêm vào giỏ hàng, người dùng không cần nhập quantity
    const quantityToAdd = 1;

    // 1. Kiểm tra xem người dùng đã có giỏ hàng chưa
    let cart = await prisma.cart.findUnique({
        where: { user_id: userId },
    });

    // 2. Nếu chưa có giỏ hàng ➔ Tạo mới giỏ hàng và thêm chi tiết gói khám
    if (!cart) {
        await prisma.cart.create({
            data: {
                user_id: userId,
                sum: quantityToAdd,
                cart_details: {
                    create: {
                        package_id: data.package_id,
                        quantity: quantityToAdd,
                        price: effectivePrice,
                    },
                },
            },
        });

        return true;
    }

    // 3. Nếu đã có giỏ hàng ➔ Kiểm tra gói khám đã có trong giỏ chưa
    const existingItem = await prisma.cartDetail.findFirst({
        where: {
            cart_id: cart.id,
            package_id: data.package_id,
        },
    });

    if (existingItem) {
        // Đã có trong giỏ ➔ Cộng dồn số lượng (+ quantityToAdd, mặc định là +1)
        await prisma.cartDetail.update({
            where: { id: existingItem.id },
            data: {
                quantity: existingItem.quantity + quantityToAdd,
                price: effectivePrice,
            },
        });
    } else {
        // Chưa có trong giỏ ➔ Thêm mới vào giỏ
        await prisma.cartDetail.create({
            data: {
                cart_id: cart.id,
                package_id: data.package_id,
                quantity: quantityToAdd,
                price: effectivePrice,
            },
        });
    }

    // Cập nhật lại cột sum trong bảng Cart
    await updateCartSum(cart.id);

    return true;
};

/**
 * Cập nhật số lượng của một gói khám trong giỏ hàng (Gán đè số lượng tuyệt đối)
 * - Tự động cập nhật cột `sum` trong bảng Cart
 */
export const updateCartQuantityService = async (
    userId: number,
    packageId: number,
    quantity: number
) => {
    const cart = await prisma.cart.findUnique({
        where: { user_id: userId },
    });

    if (!cart) {
        throw new Error('Giỏ hàng không tồn tại');
    }

    const existingItem = await prisma.cartDetail.findFirst({
        where: {
            cart_id: cart.id,
            OR: [
                { package_id: packageId },
                { id: packageId },
            ],
        },
        include: {
            package: true,
        },
    });

    if (!existingItem) {
        throw new Error('Gói khám không có trong giỏ hàng');
    }

    if (existingItem.package.deleted_at !== null) {
        throw new Error('Gói khám này đã ngừng cung cấp, vui lòng xóa khỏi giỏ hàng');
    }

    const effectivePrice = existingItem.package.discount_price ?? existingItem.package.price;

    await prisma.cartDetail.update({
        where: { id: existingItem.id },
        data: {
            quantity,
            price: effectivePrice,
        },
    });

    // Cập nhật lại cột sum trong bảng Cart
    await updateCartSum(cart.id);

    // Trả về dữ liệu giỏ hàng mới nhất đã cập nhật số lượng
    return getCartByUserService(userId);
};

/**
 * Xóa từng gói khám khỏi giỏ hàng:
 * - Xóa bản ghi cart_detail tương ứng
 * - Kiểm tra nếu xóa gói khám cuối cùng trong giỏ (không còn sản phẩm nào) ➔ Xóa luôn giỏ hàng trong DB
 * - Nếu vẫn còn gói khám khác ➔ Cập nhật lại cột `sum` trong bảng Cart
 */
export const deleteCartItemService = async (userId: number, packageId: number) => {
    const cart = await prisma.cart.findUnique({
        where: { user_id: userId },
    });

    if (!cart) {
        throw new Error('Giỏ hàng không tồn tại');
    }

    const existingItem = await prisma.cartDetail.findFirst({
        where: {
            cart_id: cart.id,
            OR: [
                { package_id: packageId },
                { id: packageId },
            ],
        },
    });

    if (!existingItem) {
        throw new Error('Gói khám không có trong giỏ hàng');
    }

    // Xóa item khỏi cart_details
    await prisma.cartDetail.delete({
        where: { id: existingItem.id },
    });

    // Kiểm tra số lượng sản phẩm còn lại trong giỏ
    const remainingCount = await prisma.cartDetail.count({
        where: { cart_id: cart.id },
    });

    // Nếu không còn sản phẩm nào (đã xóa sản phẩm cuối cùng) ➔ Xóa luôn giỏ hàng
    if (remainingCount === 0) {
        await prisma.cart.delete({
            where: { id: cart.id },
        });
        return {
            cart_deleted: true,
            message: 'Đã xóa sản phẩm cuối cùng và xóa luôn giỏ hàng thành công',
        };
    }

    // Nếu vẫn còn sản phẩm khác ➔ cập nhật lại cột sum
    await updateCartSum(cart.id);

    return {
        cart_deleted: false,
        message: 'Xóa gói khám khỏi giỏ hàng thành công',
    };
};

/**
 * Xóa toàn bộ giỏ hàng:
 * - Xóa sạch tất cả chi tiết gói khám trong giỏ
 * - Xóa luôn bản ghi Cart trong database
 */
export const clearCartService = async (userId: number) => {
    const cart = await prisma.cart.findUnique({
        where: { user_id: userId },
    });

    if (!cart) {
        throw new Error('Giỏ hàng không tồn tại');
    }

    // Xóa toàn bộ chi tiết và xóa luôn giỏ hàng trong 1 transaction
    await prisma.$transaction([
        prisma.cartDetail.deleteMany({
            where: { cart_id: cart.id },
        }),
        prisma.cart.delete({
            where: { id: cart.id },
        }),
    ]);

    return {
        cart_deleted: true,
        message: 'Đã xóa toàn bộ giỏ hàng thành công',
    };
};

/**
 * Lấy danh sách giỏ hàng cho Quản trị viên (Admin)
 * Hỗ trợ phân trang và tìm kiếm theo thông tin người dùng
 */
export const getAllCartsAdminService = async (options?: GetCartsAdminOptions) => {
    const page = Math.max(1, Number(options?.page || 1));
    const size = options?.pageSize || defaultPageSize;
    const skip = (page - 1) * size;
    const search = options?.search?.trim();
    const minPrice = options?.minPrice;
    const maxPrice = options?.maxPrice;

    const where: any = {};

    if (search) {
        where.user = {
            OR: [
                { full_name: { contains: search } },
                { email: { contains: search } },
                { phone_number: { contains: search } },
            ],
        };
    }

    // Lọc theo các khoảng giá tiền kết hợp mệnh đề OR (100-300, 300-500, 500-1000, tren-1000)
    let priceRanges = options?.priceRanges ? [...options.priceRanges] : [];

    if (
        priceRanges.length === 0 &&
        (minPrice !== undefined || maxPrice !== undefined)
    ) {
        priceRanges.push({ min: minPrice, max: maxPrice });
    }

    if (priceRanges.length > 0) {
        const orConditions = priceRanges.map((r) => {
            const min = r.min !== undefined && !isNaN(r.min) ? r.min : 0;
            const max = r.max !== undefined && !isNaN(r.max) ? r.max : 999999999999;
            return `(SUM(quantity * price) >= ${min} AND SUM(quantity * price) <= ${max})`;
        });

        const havingSql = orConditions.join(' OR ');

        const matchingCarts = await prisma.$queryRawUnsafe<Array<{ cart_id: number }>>(`
            SELECT cart_id
            FROM cart_details
            GROUP BY cart_id
            HAVING ${havingSql}
        `);

        const matchedIds = matchingCarts.map((m) => m.cart_id);
        where.id = { in: matchedIds };
    }

    const [total, carts] = await prisma.$transaction([
        prisma.cart.count({ where }),
        prisma.cart.findMany({
            where,
            skip,
            take: size,
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
            orderBy: { id: 'desc' },
        }),
    ]);

    // Lấy ID của các giỏ hàng trong trang hiện tại để tính tổng tiền (loại bỏ load cart_details đầy đủ cho nhẹ)
    const cartIds = carts.map((c) => c.id);
    const amountMap: Record<number, number> = {};

    if (cartIds.length > 0) {
        const details = await prisma.cartDetail.findMany({
            where: { cart_id: { in: cartIds } },
            select: { cart_id: true, quantity: true, price: true },
        });

        for (const item of details) {
            amountMap[item.cart_id] =
                (amountMap[item.cart_id] || 0) + Number(item.price) * item.quantity;
        }
    }

    const formattedCarts = carts.map((c) => ({
        id: c.id,
        user_id: c.user_id,
        sum: c.sum,
        user: c.user,
        total_items: c.sum,
        total_amount: amountMap[c.id] || 0,
    }));

    return {
        carts: formattedCarts,
        pagination: {
            total,
            page,
            pageSize: size,
            totalPages: Math.ceil(total / size),
        },
    };
};

/**
 * Lấy thông tin chi tiết một giỏ hàng cụ thể dành cho Quản trị viên (Admin)
 * Hỗ trợ tìm theo cart_id hoặc user_id
 * Trả về đầy đủ: thông tin user, chi tiết gói khám (cart_details), total_items, total_amount
 */
export const getCartDetailAdminService = async (identifier: number) => {
    const cart = await prisma.cart.findFirst({
        where: {
            OR: [
                { id: identifier },
                { user_id: identifier },
            ],
        },
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
            cart_details: {
                include: {
                    package: {
                        select: {
                            id: true,
                            name: true,
                            thumbnail_url: true,
                            price: true,
                            discount_price: true,
                            deleted_at: true,
                        },
                    },
                },
                orderBy: { id: 'desc' },
            },
        },
    });

    if (!cart) {
        throw new Error('Không tìm thấy giỏ hàng của người dùng');
    }

    let total_amount = 0;
    for (const item of cart.cart_details) {
        total_amount += Number(item.price) * item.quantity;
    }

    return {
        ...cart,
        total_items: cart.sum,
        total_amount,
    };
};
