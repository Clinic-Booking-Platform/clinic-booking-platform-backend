import express, { Application, Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
dotenv.config();

import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger/swagger.config.js';
import { adminRouter, authRouter, doctorRouter, userRouter } from './routes/api.js';
import { initialData } from './seed/Seed.js';

const app: Application = express();
const port = process.env.PORT || 8080;
const hostname = process.env.HOST_NAME || 'localhost';

// ============================================================
// MIDDLEWARE
// ============================================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files – ảnh upload có thể truy cập qua /images/<filename>
app.use('/images', express.static(path.join(process.cwd(), 'src/public/images')));

// ============================================================
// SWAGGER API DOCS
// ============================================================
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
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
app.get('/api-docs-json', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

// ============================================================
// ROUTES
// ============================================================
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // Khung thời gian 15 phút
    max: 100, // Tối đa 100 requests mỗi IP trong 15 phút
    message: {
        status: 429,
        message: 'Bạn đã gửi quá nhiều yêu cầu, vui lòng thử lại sau 15 phút!'
    },
    standardHeaders: true, // Trả về thông tin giới hạn trong header `RateLimit-*`
    legacyHeaders: false, // Tắt header cũ `X-RateLimit-*`
});

initialData().catch((err) => {
    console.warn('⚠️ Seed data skipped or table not created yet:', err.message);
});
app.use(limiter);
app.use('/', authRouter);
app.use('/admin', adminRouter);
app.use('/', userRouter);
app.use('/doctor', doctorRouter);

// 404 handler
app.use((req: Request, res: Response) => {
    res.status(404).json({ message: 'Route not found' });
});

app.listen(port as number, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}`);
});