"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerSpec = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const path_1 = __importDefault(require("path"));
const options = {
    definition: {
        openapi: '3.0.3',
        info: {
            title: 'Clinic Booking Platform API',
            version: '1.0.0',
            description: `
Tài liệu API của hệ thống **Đặt lịch Phòng khám**.

## Phân quyền (Authorization)
| Tag Prefix | Role yêu cầu | Mô tả |
|---|---|---|
| **[PUBLIC]** | Không cần đăng nhập | API công khai, ai cũng gọi được |
| **[USER]** | Đăng nhập (bất kỳ role) | USER / DOCTOR / ADMIN đều gọi được |
| **[DOCTOR]** | DOCTOR hoặc ADMIN | Chức năng dành cho bác sĩ |
| **[ADMIN]** | Chỉ ADMIN | Chức năng quản trị hệ thống |

## Xác thực (Authentication)
1. Gọi API \`POST /login\` để lấy \`access_token\`
2. Click nút **Authorize** 🔒 phía trên
3. Nhập token vào ô (không cần prefix "Bearer")
4. Tất cả API có biểu tượng 🔒 sẽ tự động gửi token

## Ghi chú
- Các trường đánh dấu **(Bắt buộc)** trong description là required
- Các trường đánh dấu **(Tùy chọn)** có thể bỏ qua
- Enum values được liệt kê trong description của từng field
            `,
        },
        servers: [
            {
                url: 'http://localhost:8080',
                description: 'Local Development',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Nhập JWT access_token lấy từ API POST /login',
                },
            },
        },
        tags: [
            // ── 1. AUTH ──
            { name: '1. Auth', description: 'Đăng nhập, đăng ký tài khoản' },
            // ── 2. PUBLIC ──
            { name: '2. Public - Articles', description: 'Bài viết sức khỏe (công khai, không cần đăng nhập)' },
            { name: '2. Public - Payment Info', description: 'Danh sách ngân hàng VNPay, callback xác thực thanh toán' },
            // ── 3. USER (BỆNH NHÂN / KHÁCH HÀNG) ──
            { name: '3. User - Upload', description: 'Upload ảnh lên Cloudinary (cần đăng nhập)' },
            { name: '3. User - Profile', description: 'Xem và cập nhật thông tin cá nhân /me' },
            { name: '3. User - Doctors', description: 'Tra cứu danh sách bác sĩ đang hoạt động' },
            { name: '3. User - Specialties', description: 'Tra cứu chuyên khoa' },
            { name: '3. User - Packages', description: 'Tra cứu gói khám bệnh' },
            { name: '3. User - Cart', description: 'Quản lý giỏ hàng cá nhân (thêm, sửa, xóa gói khám)' },
            { name: '3. User - Banners', description: 'Lấy danh sách banner quảng cáo hiển thị trang chủ' },
            { name: '3. User - Schedules', description: 'Xem lịch trống của bác sĩ để đặt khám' },
            { name: '3. User - Appointments', description: 'Đặt lịch khám offline, đặt từ đơn hàng, xem lịch sử, hủy lịch' },
            { name: '3. User - Payment', description: 'Thanh toán giỏ hàng qua cổng VNPay' },
            { name: '3. User - Orders', description: 'Xem lịch sử đơn hàng, chi tiết, hủy đơn chưa thanh toán' },
            { name: '3. User - Medical Records', description: 'Xem hồ sơ bệnh án cá nhân (chỉ đọc)' },
            { name: '3. User - Prescriptions', description: 'Xem đơn thuốc theo hồ sơ bệnh án (chỉ đọc)' },
            // ── 4. ADMIN (QUẢN TRỊ VIÊN) ──
            { name: '4. Admin - Doctors', description: 'CRUD tài khoản bác sĩ, xóa mềm, khôi phục (chỉ ADMIN)' },
            { name: '4. Admin - Users', description: 'Quản lý người dùng thường, xóa mềm, khôi phục (chỉ ADMIN)' },
            { name: '4. Admin - Specialties', description: 'CRUD chuyên khoa y tế (chỉ ADMIN)' },
            { name: '4. Admin - Packages', description: 'CRUD gói khám bệnh (chỉ ADMIN)' },
            { name: '4. Admin - Carts', description: 'Xem giỏ hàng của tất cả users trên hệ thống' },
            { name: '4. Admin - Banners', description: 'CRUD banner quảng cáo, bật/tắt hiển thị' },
            { name: '4. Admin - Schedules', description: 'Quản lý lịch làm việc toàn bộ bác sĩ (bao gồm xóa cứng)' },
            { name: '4. Admin - Articles', description: 'Quản lý tất cả bài viết trên hệ thống' },
            { name: '4. Admin - Orders', description: 'Quản lý đơn hàng toàn hệ thống' },
            { name: '4. Admin - Appointments', description: 'Quản lý toàn bộ lịch hẹn khám trên hệ thống' },
            { name: '4. Admin - Medical Records', description: 'Xem tất cả hồ sơ bệnh án (chỉ đọc)' },
            { name: '4. Admin - Prescriptions', description: 'Xem đơn thuốc của tất cả bệnh án (chỉ đọc)' },
            // ── 5. DOCTOR (BÁC SĨ) ──
            { name: '5. Doctor - Schedules', description: 'Quản lý ca làm việc của bác sĩ (yêu cầu DOCTOR hoặc ADMIN)' },
            { name: '5. Doctor - Articles', description: 'Quản lý bài viết do bác sĩ tự viết' },
            { name: '5. Doctor - Appointments', description: 'Quản lý lịch hẹn bệnh nhân thuộc ca trực' },
            { name: '5. Doctor - Medical Records', description: 'Tạo, chỉnh sửa, ký đóng hồ sơ bệnh án' },
            { name: '5. Doctor - Prescriptions', description: 'Kê đơn thuốc, chỉnh sửa, xóa thuốc trong đơn' },
        ],
    },
    apis: [
        path_1.default.join(process.cwd(), 'src/swagger/paths/*.yaml').replace(/\\/g, '/'),
        path_1.default.join(process.cwd(), 'src/swagger/components/*.yaml').replace(/\\/g, '/'),
        './src/swagger/paths/*.yaml',
        './src/swagger/components/*.yaml',
    ],
};
exports.swaggerSpec = (0, swagger_jsdoc_1.default)(options);
