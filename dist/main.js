"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
require("./types/express.d.ts");
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
dotenv_1.default.config();
const cors_1 = __importDefault(require("cors"));
const api_js_1 = require("./routes/api.js");
const Seed_js_1 = require("./seed/Seed.js");
const app = (0, express_1.default)();
const port = process.env.PORT || 8080;
const hostname = process.env.HOST_NAME || 'localhost';
// ============================================================
// MIDDLEWARE
// ============================================================
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Static files – ảnh upload có thể truy cập qua /images/<filename>
app.use('/images', express_1.default.static(path_1.default.join(process.cwd(), 'src/public/images')));
// ============================================================
// ROUTES
// ============================================================
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // Khung thời gian 15 phút
    max: 100, // Tối đa 100 requests mỗi IP trong 15 phút
    message: {
        status: 429,
        message: 'Bạn đã gửi quá nhiều yêu cầu, vui lòng thử lại sau 15 phút!'
    },
    standardHeaders: true, // Trả về thông tin giới hạn trong header `RateLimit-*`
    legacyHeaders: false, // Tắt header cũ `X-RateLimit-*`
});
(0, Seed_js_1.initialData)();
app.use(limiter);
app.use('/', api_js_1.authRouter);
app.use('/admin', api_js_1.adminRouter);
app.use('/', api_js_1.userRouter);
app.use('/doctor', api_js_1.doctorRouter);
// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});
app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}`);
});
