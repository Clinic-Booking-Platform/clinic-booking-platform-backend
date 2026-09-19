"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteArticle = exports.updateArticle = exports.createArticle = exports.getArticleById = exports.getArticleBySlug = exports.getArticles = void 0;
const client_js_1 = require("../../config/client.js");
const constant_js_1 = require("../../config/constant.js");
// Simple helper to create slug from title
function generateSlug(title) {
    return title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // remove diacritics
        .replace(/đ/g, "d").replace(/Đ/g, "D")
        .replace(/[^a-z0-9\s-]/g, "") // remove non-alphanumeric chars
        .trim()
        .replace(/\s+/g, "-") // replace spaces with hyphens
        .replace(/-+/g, "-"); // remove consecutive hyphens
}
// Helper: Author select chứa user_id, full_name, avatar từ quan hệ user
const authorSelect = {
    id: true,
    user: {
        select: {
            id: true,
            full_name: true,
            avatar: true,
        },
    },
};
const getArticles = async (options) => {
    const { page = 1, pageSize = constant_js_1.pageSize, search, specialty_id, author_id, status, showDeleted = false } = options;
    const skip = (page - 1) * pageSize;
    const where = {};
    if (status === 'deleted') {
        where.deleted_at = { not: null };
    }
    else if (status === 'active') {
        where.deleted_at = null;
    }
    else if (status === 'all' || showDeleted) {
        // Lấy tất cả bài viết bao gồm cả bài đã bị xóa mềm (không lọc deleted_at)
    }
    else {
        // Mặc định chỉ lấy bài chưa xóa (active)
        where.deleted_at = null;
    }
    if (search) {
        where.title = { contains: search };
    }
    if (specialty_id) {
        where.specialty_id = specialty_id;
    }
    if (author_id) {
        where.author_id = author_id;
    }
    const [total, articles] = await client_js_1.prisma.$transaction([
        client_js_1.prisma.article.count({ where }),
        client_js_1.prisma.article.findMany({
            where,
            skip,
            take: pageSize,
            orderBy: { created_at: 'desc' },
            include: {
                author: {
                    select: authorSelect,
                },
                specialty: {
                    select: { id: true, name: true },
                },
            },
        }),
    ]);
    return {
        articles,
        pagination: {
            page,
            pageSize,
            total,
            totalPages: Math.ceil(total / pageSize)
        }
    };
};
exports.getArticles = getArticles;
const getArticleBySlug = async (slugOrId) => {
    const isNumeric = !isNaN(Number(slugOrId));
    const where = isNumeric
        ? { id: Number(slugOrId), deleted_at: null }
        : { slug: slugOrId, deleted_at: null };
    const article = await client_js_1.prisma.article.findFirst({
        where,
        include: {
            article_detail: true,
            author: {
                select: authorSelect,
            },
            specialty: {
                select: { id: true, name: true }
            }
        }
    });
    if (!article)
        return null;
    // Tự động tăng view
    await client_js_1.prisma.article.update({
        where: { id: article.id },
        data: { views: { increment: 1 } }
    });
    // Gắn số view mới để trả về luôn
    article.views += 1;
    return article;
};
exports.getArticleBySlug = getArticleBySlug;
const getArticleById = async (id) => {
    return client_js_1.prisma.article.findUnique({
        where: { id },
        include: {
            article_detail: true,
            author: {
                select: authorSelect,
            },
            specialty: {
                select: { id: true, name: true }
            }
        }
    });
};
exports.getArticleById = getArticleById;
const createArticle = async (data) => {
    if (!data.author_id) {
        throw new Error('author_id is required');
    }
    const trimmedTitle = data.title.trim();
    // Kiểm tra tiêu đề bài viết không được trùng (với các bài viết chưa bị xóa)
    const existingArticleWithTitle = await client_js_1.prisma.article.findFirst({
        where: {
            title: trimmedTitle,
            deleted_at: null,
        },
    });
    if (existingArticleWithTitle) {
        throw new Error('Tiêu đề bài viết đã tồn tại, vui lòng chọn tiêu đề khác');
    }
    let slug = generateSlug(trimmedTitle);
    // Xử lý trùng lặp slug (nếu có bài viết cũ đã xóa hoặc trùng slug)
    let existingArticle = await client_js_1.prisma.article.findUnique({ where: { slug } });
    let counter = 1;
    while (existingArticle) {
        slug = `${generateSlug(trimmedTitle)}-${counter}`;
        existingArticle = await client_js_1.prisma.article.findUnique({ where: { slug } });
        counter++;
    }
    return client_js_1.prisma.$transaction(async (tx) => {
        const article = await tx.article.create({
            data: {
                title: trimmedTitle,
                slug,
                thumbnail_url: data.thumbnail_url,
                short_description: data.short_description,
                author_id: data.author_id,
                specialty_id: data.specialty_id,
            }
        });
        await tx.articleDetail.create({
            data: {
                article_id: article.id,
                html_content: data.html_content
            }
        });
        return article;
    });
};
exports.createArticle = createArticle;
const updateArticle = async (id, data, authorIdContext) => {
    const existingArticle = await client_js_1.prisma.article.findUnique({ where: { id } });
    if (!existingArticle) {
        throw new Error('Không tìm thấy bài viết');
    }
    // Nếu truyền authorIdContext (từ Bác sĩ đang login), kiểm tra quyền sở hữu
    if (authorIdContext && existingArticle.author_id !== authorIdContext) {
        throw new Error('Bạn không có quyền cập nhật bài viết của bác sĩ khác');
    }
    let newSlug = existingArticle.slug;
    if (data.title && data.title.trim() !== existingArticle.title) {
        const trimmedTitle = data.title.trim();
        // Kiểm tra tiêu đề bài viết không được trùng với bài viết khác
        const duplicateTitle = await client_js_1.prisma.article.findFirst({
            where: {
                title: trimmedTitle,
                id: { not: id },
                deleted_at: null,
            },
        });
        if (duplicateTitle) {
            throw new Error('Tiêu đề bài viết đã tồn tại, vui lòng chọn tiêu đề khác');
        }
        newSlug = generateSlug(trimmedTitle);
        let checkSlug = await client_js_1.prisma.article.findFirst({
            where: { slug: newSlug, id: { not: id } }
        });
        let counter = 1;
        while (checkSlug) {
            newSlug = `${generateSlug(trimmedTitle)}-${counter}`;
            checkSlug = await client_js_1.prisma.article.findFirst({
                where: { slug: newSlug, id: { not: id } }
            });
            counter++;
        }
    }
    return client_js_1.prisma.$transaction(async (tx) => {
        const articleData = {};
        if (data.title !== undefined) {
            articleData.title = data.title;
            articleData.slug = newSlug;
        }
        if (data.thumbnail_url !== undefined)
            articleData.thumbnail_url = data.thumbnail_url;
        if (data.short_description !== undefined)
            articleData.short_description = data.short_description;
        const updatedArticle = await tx.article.update({
            where: { id },
            data: articleData
        });
        if (data.html_content !== undefined) {
            await tx.articleDetail.update({
                where: { article_id: id },
                data: { html_content: data.html_content }
            });
        }
        return updatedArticle;
    });
};
exports.updateArticle = updateArticle;
const deleteArticle = async (id) => {
    return client_js_1.prisma.article.update({
        where: { id },
        data: { deleted_at: new Date() }
    });
};
exports.deleteArticle = deleteArticle;
