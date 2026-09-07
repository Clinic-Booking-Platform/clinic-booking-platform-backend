import { Request, Response } from 'express';
import { loginService } from '../../middleware/auth.services.js';
import { RegisterUserSchema } from '../../model/Schema/Auth/RegisterUser_Schemas.js';
import { LoginUserSchema } from '../../model/Schema/Auth/LoginUser_Schema.js';
import { Register_Doctor, Register_User } from '../../services/auth/auth.service.js';
import { RegisterDoctorSchema } from '../../model/Schema/Auth/RegisterDoctor_Schema.js';

// ============================================================
// POST /login
// ============================================================
export const loginAPI = async (req: Request, res: Response) => {
    try {
        const parsed = await LoginUserSchema.safeParseAsync(req.body);
        if (!parsed.success) {
            const errors = parsed.error.issues.map(
                (i) => `${i.message} (${i.path[0]?.toString()})`
            );
            res.status(400).json({ message: errors });
            return;
        }

        const identifier = (parsed.data.email) as string;
        const { password } = parsed.data;
        const token = await loginService(identifier, password);
        res.status(200).json({ data: token, message: 'Đăng nhập thành công' });
    } catch (error) {
        res.status(401).json({ data: null, message: (error as Error).message });
    }
};

// ============================================================
// POST /register
// ============================================================
export const registerAPI = async (req: Request, res: Response) => {
    try {
        const parsed = await RegisterUserSchema.safeParseAsync(req.body);
        if (!parsed.success) {
            const errors = parsed.error.issues.map(
                (i) => `${i.message} (${i.path[0]?.toString()})`
            );
            res.status(400).json({ message: errors });
            return;
        }

        const { email, fullname, password } = parsed.data;
        await Register_User(email, password, fullname);
        res.status(201).json({ message: 'Đăng ký thành công' });
    } catch (error) {
        res.status(500).json({ data: null, message: (error as Error).message });
    }
};
export const registerDoctorAPI = async (req: Request, res: Response) => {
    try {
        const parsed = await RegisterDoctorSchema.safeParseAsync(req.body);
        if (!parsed.success) {
            const errors = parsed.error.issues.map(
                (i) => `${i.message} (${i.path[0]?.toString()})`
            );
            res.status(400).json({ message: errors });
            return;
        }

        const { email, fullname, password, specialty_id, price } = parsed.data;
        await Register_Doctor(email, password, fullname, price, +specialty_id,);
        res.status(201).json({ message: 'Đăng ký thành công' });
    } catch (error) {
        res.status(500).json({ data: null, message: (error as Error).message });
    }
};