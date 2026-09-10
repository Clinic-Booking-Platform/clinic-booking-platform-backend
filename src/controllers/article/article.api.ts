import { Request, Response } from 'express';
import {
  getArticles,
  getArticleBySlug,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle
} from '../../services/article/article.service.js';
import { CreateArticle_Schema } from '../../model/Schema/Article/CreateArticle_Schema.js';
import { UpdateArticle_Schema } from '../../model/Schema/Article/UpdateArticle_Schema.js';
import { prisma } from '../../config/client.js';

// Helper: Lấy thông tin doctor (id, specialty_id) từ user_id (token)
const getDoctorFromUser = async (userId: number) => {
  return prisma.doctor.findUnique({
    where: { user_id: userId },
    select: { id: true, specialty_id: true }
  });
};

// ================= USER (PUBLIC) CONTROLLERS =================

export const getPublicArticlesAPI = async (req: Request, res: Response) => {
  try {
    const { page, search, specialty_id, author_id } = req.query;

    const data = await getArticles({
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
  } catch (error: any) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

export const getPublicArticleDetailAPI = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const article = await getArticleBySlug(slug as string);

    if (!article) {
      return res.status(404).json({ status: 'error', message: 'Không tìm thấy bài viết' });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Lấy chi tiết bài viết thành công',
      data: article
    });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};


// ================= DOCTOR CONTROLLERS =================

export const getDoctorArticlesAPI = async (req: Request, res: Response) => {
  try {
    const { page, search, showDeleted, status } = req.query;
    const doctor = await getDoctorFromUser(Number(req.user?.id));
    if (!doctor) return res.status(403).json({ status: 'error', message: 'Tài khoản không phải bác sĩ' });

    // Doctor: Mặc định status là 'all' để xem toàn bộ bài viết của mình (kể cả bài đã xóa)
    const filterStatus = status ? String(status) : 'all';

    const data = await getArticles({
      page: page ? Number(page) : 1,
      search: search ? String(search) : undefined,
      author_id: doctor.id,
      showDeleted: showDeleted === 'true',
      status: filterStatus
    });

    return res.status(200).json({ status: 'success', message: 'Lấy danh sách bài viết thành công', data });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

export const getDoctorArticleDetailAPI = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const doctor = await getDoctorFromUser(Number(req.user?.id));
    if (!doctor) return res.status(403).json({ status: 'error', message: 'Tài khoản không phải bác sĩ' });

    const article = await getArticleById(id);
    if (!article || article.author_id !== doctor.id) {
      return res.status(404).json({ status: 'error', message: 'Không tìm thấy bài viết hoặc bạn không có quyền xem' });
    }

    return res.status(200).json({ status: 'success', data: article });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

export const createDoctorArticleAPI = async (req: Request, res: Response) => {
  try {
    const parsed = CreateArticle_Schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ status: 'error', message: parsed.error.issues.map(i => i.message) });
    }

    const doctor = await getDoctorFromUser(Number(req.user?.id));
    if (!doctor) return res.status(403).json({ status: 'error', message: 'Tài khoản không phải bác sĩ' });

    // Gán bắt buộc author_id là chính bác sĩ đang login
    parsed.data.author_id = doctor.id;

    // Tự động lấy specialty_id từ hồ sơ bác sĩ (nếu form không truyền hoặc để trống)
    parsed.data.specialty_id = parsed.data.specialty_id || doctor.specialty_id;

    const newArticle = await createArticle(parsed.data);
    return res.status(201).json({ status: 'success', message: 'Tạo bài viết thành công', data: newArticle });
  } catch (error: any) {
    return res.status(400).json({ status: 'error', message: error.message });
  }
};

export const updateDoctorArticleAPI = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const parsed = UpdateArticle_Schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ status: 'error', message: parsed.error.issues.map(i => i.message) });
    }

    const doctor = await getDoctorFromUser(Number(req.user?.id));
    if (!doctor) return res.status(403).json({ status: 'error', message: 'Tài khoản không phải bác sĩ' });

    const updated = await updateArticle(id, parsed.data, doctor.id);
    return res.status(200).json({ status: 'success', message: 'Cập nhật bài viết thành công', data: updated });
  } catch (error: any) {
    return res.status(400).json({ status: 'error', message: error.message });
  }
};


// ================= ADMIN CONTROLLERS =================

export const getAdminArticlesAPI = async (req: Request, res: Response) => {
  try {
    const { page, search, specialty_id, author_id, showDeleted, status } = req.query;

    // Admin: Mặc định status là 'all' để xem toàn bộ bài viết (kể cả bài đã xóa)
    const filterStatus = status ? String(status) : 'all';

    const data = await getArticles({
      page: page ? Number(page) : 1,
      search: search ? String(search) : undefined,
      specialty_id: specialty_id ? Number(specialty_id) : undefined,
      author_id: author_id ? Number(author_id) : undefined,
      showDeleted: showDeleted === 'true',
      status: filterStatus,
    });
    return res.status(200).json({ status: 'success', message: 'Lấy danh sách bài viết thành công', data });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

export const getAdminArticleDetailAPI = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const article = await getArticleById(id);
    if (!article) return res.status(404).json({ status: 'error', message: 'Không tìm thấy bài viết' });
    return res.status(200).json({ status: 'success', data: article });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

export const createAdminArticleAPI = async (req: Request, res: Response) => {
  try {
    const parsed = CreateArticle_Schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ status: 'error', message: parsed.error.issues.map(i => i.message) });
    }

    if (!parsed.data.author_id) {
      return res.status(400).json({ status: 'error', message: 'Admin cần chọn tác giả (author_id) cho bài viết' });
    }

    // Truy vấn thông tin bác sĩ từ author_id để lấy specialty_id
    const doctor = await prisma.doctor.findUnique({
      where: { id: parsed.data.author_id },
      select: { id: true, specialty_id: true }
    });

    if (!doctor) {
      return res.status(400).json({ status: 'error', message: 'Không tìm thấy thông tin bác sĩ đã chọn' });
    }

    // Tự động gán specialty_id từ bác sĩ đã chọn (nếu form không truyền)
    parsed.data.specialty_id = parsed.data.specialty_id || doctor.specialty_id;

    const newArticle = await createArticle(parsed.data);
    return res.status(201).json({ status: 'success', message: 'Tạo bài viết thành công', data: newArticle });
  } catch (error: any) {
    return res.status(400).json({ status: 'error', message: error.message });
  }
};

export const updateAdminArticleAPI = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const parsed = UpdateArticle_Schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ status: 'error', message: parsed.error.issues.map(i => i.message) });
    }
    const updated = await updateArticle(id, parsed.data);
    return res.status(200).json({ status: 'success', message: 'Cập nhật bài viết thành công', data: updated });
  } catch (error: any) {
    return res.status(400).json({ status: 'error', message: error.message });
  }
};

export const deleteAdminArticleAPI = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await deleteArticle(id);
    return res.status(200).json({ status: 'success', message: 'Đã xóa bài viết thành công' });
  } catch (error: any) {
    return res.status(400).json({ status: 'error', message: error.message });
  }
};
