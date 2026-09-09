"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCartDetailAdminAPI = exports.deleteCartsAPI = exports.updateCartQuantityAPI = exports.postCartsAPI = exports.getCartsAPI = void 0;
const cart_service_js_1 = require("../../services/cart/cart.service.js");
const Cart_Schema_js_1 = require("../../model/Schema/Cart/Cart_Schema.js");
const constant_js_1 = require("../../config/constant.js");
/**
 * GET /cart (User) hoặc GET /admin/carts (Admin)
 * - Với User: Lấy thông tin chi tiết giỏ hàng cá nhân kèm tổng số lượng và tổng tiền.
 * - Với Admin: Lấy danh sách toàn bộ giỏ hàng của người dùng trên hệ thống kèm phân trang.
 */
const getCartsAPI = async (req, res) => {
    try {
        const isAdminRoute = req.baseUrl.includes('/admin') ||
            req.originalUrl.includes('/admin') ||
            (req.user?.role === constant_js_1.RoleType.ADMIN && req.path === '/carts');
        if (isAdminRoute && req.user?.role === constant_js_1.RoleType.ADMIN) {
            const { page, search, min_price, max_price, minPrice, maxPrice, price_range, price_ranges, } = req.query;
            const min = min_price ?? minPrice;
            const max = max_price ?? maxPrice;
            const parsedRanges = (0, constant_js_1.parsePriceRanges)(price_range || price_ranges);
            const data = await (0, cart_service_js_1.getAllCartsAdminService)({
                page: page ? Number(page) : 1,
                search: search ? String(search) : undefined,
                minPrice: min !== undefined && min !== '' && !isNaN(Number(min)) ? Number(min) : undefined,
                maxPrice: max !== undefined && max !== '' && !isNaN(Number(max)) ? Number(max) : undefined,
                priceRanges: parsedRanges.length > 0 ? parsedRanges : undefined,
            });
            return res.status(200).json({
                status: 'success',
                message: 'Lấy danh sách giỏ hàng thành công',
                data,
            });
        }
        // Lấy giỏ hàng của người dùng hiện tại
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Vui lòng đăng nhập để xem giỏ hàng',
            });
        }
        const data = await (0, cart_service_js_1.getCartByUserService)(Number(userId));
        return res.status(200).json({
            status: 'success',
            message: 'Lấy thông tin giỏ hàng thành công',
            data,
        });
    }
    catch (error) {
        return res.status(500).json({
            status: 'error',
            message: error.message || 'Lỗi hệ thống khi lấy giỏ hàng',
        });
    }
};
exports.getCartsAPI = getCartsAPI;
/**
 * POST /cart/items
 * Thêm gói khám vào giỏ hàng (Cộng dồn số lượng nếu gói khám đã có trong giỏ)
 */
const postCartsAPI = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Vui lòng đăng nhập để thêm gói khám vào giỏ hàng',
            });
        }
        const parsed = await Cart_Schema_js_1.AddToCartSchema.safeParseAsync(req.body);
        if (!parsed.success) {
            const errors = parsed.error.issues.map((i) => `${i.message} (${i.path[0]?.toString()})`);
            return res.status(400).json({
                status: 'error',
                message: errors,
            });
        }
        const data = await (0, cart_service_js_1.addToCartService)(Number(userId), parsed.data);
        return res.status(200).json({
            status: 'success',
            message: 'Thêm gói khám vào giỏ hàng thành công',
            data,
        });
    }
    catch (error) {
        return res.status(400).json({
            status: 'error',
            message: error.message || 'Lỗi khi thêm gói khám vào giỏ hàng',
        });
    }
};
exports.postCartsAPI = postCartsAPI;
/**
 * PUT /cart-quantity/:packageId
 * Cập nhật số lượng gói khám trong giỏ hàng (Gán đè số lượng tuyệt đối)
 */
const updateCartQuantityAPI = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Vui lòng đăng nhập để cập nhật giỏ hàng',
            });
        }
        const packageId = Number(req.params.packageId);
        if (!packageId || isNaN(packageId)) {
            return res.status(400).json({
                status: 'error',
                message: 'ID gói khám không hợp lệ',
            });
        }
        const parsed = await Cart_Schema_js_1.UpdateCartQuantitySchema.safeParseAsync(req.body);
        if (!parsed.success) {
            const errors = parsed.error.issues.map((i) => `${i.message} (${i.path[0]?.toString()})`);
            return res.status(400).json({
                status: 'error',
                message: errors,
            });
        }
        const data = await (0, cart_service_js_1.updateCartQuantityService)(Number(userId), packageId, parsed.data.quantity);
        return res.status(200).json({
            status: 'success',
            message: 'Cập nhật số lượng gói khám thành công',
            data,
        });
    }
    catch (error) {
        return res.status(400).json({
            status: 'error',
            message: error.message || 'Lỗi khi cập nhật số lượng gói khám',
        });
    }
};
exports.updateCartQuantityAPI = updateCartQuantityAPI;
/**
 * DELETE /carts/:packageId hoặc DELETE /cart
 * - Nếu không truyền packageId hoặc truyền 'all' / 'clear' -> Xóa toàn bộ giỏ hàng và xóa luôn Cart
 * - Nếu truyền packageId -> Xóa gói khám đó, nếu là gói khám cuối cùng trong giỏ thì xóa luôn Cart
 */
const deleteCartsAPI = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Vui lòng đăng nhập để thực hiện xóa gói khám khỏi giỏ hàng',
            });
        }
        const rawPackageId = req.params.packageId || req.body.package_id || req.query.package_id;
        // Trường hợp xóa toàn bộ giỏ hàng (khi gọi DELETE /cart hoặc DELETE /carts/all)
        if (!rawPackageId || rawPackageId === 'all' || rawPackageId === 'clear') {
            const result = await (0, cart_service_js_1.clearCartService)(Number(userId));
            return res.status(200).json({
                status: 'success',
                message: result.message,
                data: result,
            });
        }
        const packageId = Number(rawPackageId);
        if (isNaN(packageId)) {
            return res.status(400).json({
                status: 'error',
                message: 'ID gói khám không hợp lệ',
            });
        }
        const result = await (0, cart_service_js_1.deleteCartItemService)(Number(userId), packageId);
        return res.status(200).json({
            status: 'success',
            message: result.message,
            data: result,
        });
    }
    catch (error) {
        return res.status(400).json({
            status: 'error',
            message: error.message || 'Lỗi khi xóa gói khám khỏi giỏ hàng',
        });
    }
};
exports.deleteCartsAPI = deleteCartsAPI;
/**
 * GET /admin/carts/:id
 * Lấy thông tin chi tiết giỏ hàng của người dùng (Dành cho Admin)
 * :id có thể là cart_id hoặc user_id
 */
const getCartDetailAdminAPI = async (req, res) => {
    try {
        const rawId = req.params.id || req.query.id;
        const identifier = Number(rawId);
        if (!rawId || isNaN(identifier)) {
            return res.status(400).json({
                status: 'error',
                message: 'ID giỏ hàng hoặc ID người dùng không hợp lệ',
            });
        }
        const data = await (0, cart_service_js_1.getCartDetailAdminService)(identifier);
        return res.status(200).json({
            status: 'success',
            message: 'Lấy chi tiết giỏ hàng người dùng thành công',
            data,
        });
    }
    catch (error) {
        return res.status(404).json({
            status: 'error',
            message: error.message || 'Không tìm thấy giỏ hàng của người dùng',
        });
    }
};
exports.getCartDetailAdminAPI = getCartDetailAdminAPI;
