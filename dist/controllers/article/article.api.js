"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAdminArticleAPI = exports.updateAdminArticleAPI = exports.createAdminArticleAPI = exports.getAdminArticleDetailAPI = exports.getAdminArticlesAPI = exports.updateDoctorArticleAPI = exports.createDoctorArticleAPI = exports.getDoctorArticleDetailAPI = exports.getDoctorArticlesAPI = exports.getPublicArticleDetailAPI = exports.getPublicArticlesAPI = void 0;
const article_service_js_1 = require("../../services/article/article.service.js");
const CreateArticle_Schema_js_1 = require("../../model/Schema/Article/CreateArticle_Schema.js");
const UpdateArticle_Schema_js_1 = require("../../model/Schema/Article/UpdateArticle_Schema.js");
const client_js_1 = require("../../config/client.js");
// Helper: Lấy thông tin doctor (id, specialty_id) từ user_id (token)
const getDoctorFromUser = async (userId) => {
    return client_js_1.prisma.doctor.findUnique({
        where: { user_id: userId },
        select: { id: true, specialty_id: true }
    });
};
// ================= USER (PUBLIC) CONTROLLERS =================
const getPublicArticlesAPI = async (req, res) => {
    try {
        const { page, search, specialty_id, author_id } = req.query;
        const data = await (0, article_service_js_1.getArticles)({
            page: page ? Number(page) : 1,
            search: search ? String(search) : undefined,
            specialty_id: specialty_id ? Number(specialty_id) : undefined,
            author_id: author_id ? Number(author_id) : undefined,
            showDeleted: false
        });
        return res.status(200).json({
            status: 'success',
            message: 'Lấy danh sách bài viết thành công',
            data
        });
    }
    catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
};
exports.getPublicArticlesAPI = getPublicArticlesAPI;
const getPublicArticleDetailAPI = async (req, res) => {
    try {
        const { slug } = req.params;
        const article = await (0, article_service_js_1.getArticleBySlug)(slug);
        if (!article) {
            return res.status(404).json({ status: 'error', message: 'Không tìm thấy bài viết' });
        }
        return res.status(200).json({
            status: 'success',
            message: 'Lấy chi tiết bài viết thành công',
            data: article
        });
    }
    catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
};
exports.getPublicArticleDetailAPI = getPublicArticleDetailAPI;
// ================= DOCTOR CONTROLLERS =================
const getDoctorArticlesAPI = async (req, res) => {
    try {
        const { page, search, showDeleted, status } = req.query;
        const doctor = await getDoctorFromUser(Number(req.user?.id));
        if (!doctor)
            return res.status(403).json({ status: 'error', message: 'Tài khoản không phải bác sĩ' });
        // Doctor: Mặc định status là 'all' để xem toàn bộ bài viết của mình (kể cả bài đã xóa)
        const filterStatus = status ? String(status) : 'all';
        const data = await (0, article_service_js_1.getArticles)({
            page: page ? Number(page) : 1,
            search: search ? String(search) : undefined,
            author_id: doctor.id,
            showDeleted: showDeleted === 'true',
            status: filterStatus
        });
        return res.status(200).json({ status: 'success', message: 'Lấy danh sách bài viết thành công', data });
    }
    catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
};
exports.getDoctorArticlesAPI = getDoctorArticlesAPI;
const getDoctorArticleDetailAPI = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const doctor = await getDoctorFromUser(Number(req.user?.id));
        if (!doctor)
            return res.status(403).json({ status: 'error', message: 'Tài khoản không phải bác sĩ' });
        const article = await (0, article_service_js_1.getArticleById)(id);
        if (!article || article.author_id !== doctor.id) {
            return res.status(404).json({ status: 'error', message: 'Không tìm thấy bài viết hoặc bạn không có quyền xem' });
        }
        return res.status(200).json({ status: 'success', data: article });
    }
    catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
};
exports.getDoctorArticleDetailAPI = getDoctorArticleDetailAPI;
const createDoctorArticleAPI = async (req, res) => {
    try {
        const parsed = CreateArticle_Schema_js_1.CreateArticle_Schema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ status: 'error', message: parsed.error.issues.map(i => i.message) });
        }
        const doctor = await getDoctorFromUser(Number(req.user?.id));
        if (!doctor)
            return res.status(403).json({ status: 'error', message: 'Tài khoản không phải bác sĩ' });
        // Gán bắt buộc author_id là chính bác sĩ đang login
        parsed.data.author_id = doctor.id;
        // Tự động lấy specialty_id từ hồ sơ bác sĩ (nếu form không truyền hoặc để trống)
        parsed.data.specialty_id = parsed.data.specialty_id || doctor.specialty_id;
        const newArticle = await (0, article_service_js_1.createArticle)(parsed.data);
        return res.status(201).json({ status: 'success', message: 'Tạo bài viết thành công', data: newArticle });
    }
    catch (error) {
        return res.status(400).json({ status: 'error', message: error.message });
    }
};
exports.createDoctorArticleAPI = createDoctorArticleAPI;
const updateDoctorArticleAPI = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const parsed = UpdateArticle_Schema_js_1.UpdateArticle_Schema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ status: 'error', message: parsed.error.issues.map(i => i.message) });
        }
        const doctor = await getDoctorFromUser(Number(req.user?.id));
        if (!doctor)
            return res.status(403).json({ status: 'error', message: 'Tài khoản không phải bác sĩ' });
        const updated = await (0, article_service_js_1.updateArticle)(id, parsed.data, doctor.id);
        return res.status(200).json({ status: 'success', message: 'Cập nhật bài viết thành công', data: updated });
    }
    catch (error) {
        return res.status(400).json({ status: 'error', message: error.message });
    }
};
exports.updateDoctorArticleAPI = updateDoctorArticleAPI;
// ================= ADMIN CONTROLLERS =================
const getAdminArticlesAPI = async (req, res) => {
    try {
        const { page, search, specialty_id, author_id, showDeleted, status } = req.query;
        // Admin: Mặc định status là 'all' để xem toàn bộ bài viết (kể cả bài đã xóa)
        const filterStatus = status ? String(status) : 'all';
        const data = await (0, article_service_js_1.getArticles)({
            page: page ? Number(page) : 1,
            search: search ? String(search) : undefined,
            specialty_id: specialty_id ? Number(specialty_id) : undefined,
            author_id: author_id ? Number(author_id) : undefined,
            showDeleted: showDeleted === 'true',
            status: filterStatus,
        });
        return res.status(200).json({ status: 'success', message: 'Lấy danh sách bài viết thành công', data });
    }
    catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
};
exports.getAdminArticlesAPI = getAdminArticlesAPI;
const getAdminArticleDetailAPI = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const article = await (0, article_service_js_1.getArticleById)(id);
        if (!article)
            return res.status(404).json({ status: 'error', message: 'Không tìm thấy bài viết' });
        return res.status(200).json({ status: 'success', data: article });
    }
    catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
};
exports.getAdminArticleDetailAPI = getAdminArticleDetailAPI;
const createAdminArticleAPI = async (req, res) => {
    try {
        const parsed = CreateArticle_Schema_js_1.CreateArticle_Schema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ status: 'error', message: parsed.error.issues.map(i => i.message) });
        }
        if (!parsed.data.author_id) {
            return res.status(400).json({ status: 'error', message: 'Admin cần chọn tác giả (author_id) cho bài viết' });
        }
        // Truy vấn thông tin bác sĩ từ author_id để lấy specialty_id
        const doctor = await client_js_1.prisma.doctor.findUnique({
            where: { id: parsed.data.author_id },
            select: { id: true, specialty_id: true }
        });
        if (!doctor) {
            return res.status(400).json({ status: 'error', message: 'Không tìm thấy thông tin bác sĩ đã chọn' });
        }
        // Tự động gán specialty_id từ bác sĩ đã chọn (nếu form không truyền)
        parsed.data.specialty_id = parsed.data.specialty_id || doctor.specialty_id;
        const newArticle = await (0, article_service_js_1.createArticle)(parsed.data);
        return res.status(201).json({ status: 'success', message: 'Tạo bài viết thành công', data: newArticle });
    }
    catch (error) {
        return res.status(400).json({ status: 'error', message: error.message });
    }
};
exports.createAdminArticleAPI = createAdminArticleAPI;
const updateAdminArticleAPI = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const parsed = UpdateArticle_Schema_js_1.UpdateArticle_Schema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ status: 'error', message: parsed.error.issues.map(i => i.message) });
        }
        const updated = await (0, article_service_js_1.updateArticle)(id, parsed.data);
        return res.status(200).json({ status: 'success', message: 'Cập nhật bài viết thành công', data: updated });
    }
    catch (error) {
        return res.status(400).json({ status: 'error', message: error.message });
    }
};
exports.updateAdminArticleAPI = updateAdminArticleAPI;
const deleteAdminArticleAPI = async (req, res) => {
    try {
        const id = Number(req.params.id);
        await (0, article_service_js_1.deleteArticle)(id);
        return res.status(200).json({ status: 'success', message: 'Đã xóa bài viết thành công' });
    }
    catch (error) {
        return res.status(400).json({ status: 'error', message: error.message });
    }
};
exports.deleteAdminArticleAPI = deleteAdminArticleAPI;
