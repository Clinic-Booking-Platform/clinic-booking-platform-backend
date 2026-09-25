"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const cors_1 = __importDefault(require("cors"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_config_js_1 = require("./swagger/swagger.config.js");
const api_js_1 = require("./routes/api.js");
const Seed_js_1 = require("./seed/Seed.js");
const rateLimit_middleware_js_1 = require("./middleware/rateLimit.middleware.js");
const app = (0, express_1.default)();
app.set('trust proxy', 1);
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
// SWAGGER API DOCS
// ============================================================
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_config_js_1.swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Clinic Booking API Docs',
    swaggerOptions: {
        docExpansion: 'none',
        filter: true,
        tagsSorter: 'alpha',
        operationsSorter: 'method',
        persistAuthorization: true,
    },
}));
app.get('/api-docs-json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swagger_config_js_1.swaggerSpec);
});
// ============================================================
// RATE LIMITER & ROUTES
// ============================================================
app.use(rateLimit_middleware_js_1.generalLimiter);
(0, Seed_js_1.initialData)().catch((err) => {
    console.warn('⚠️ Seed data skipped or table not created yet:', err.message);
});
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
