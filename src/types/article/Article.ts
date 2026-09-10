export interface GetArticlesOptions {
  page?: number;
  pageSize?: number;
  search?: string;
  specialty_id?: number;
  author_id?: number;
  status?: 'active' | 'deleted' | 'all' | string;
  showDeleted?: boolean;
}

export interface CreateArticleData {
  title: string;
  thumbnail_url?: string;
  short_description?: string;
  html_content: string;
  specialty_id?: number;
  author_id?: number; // Optional for Doctor, required for Admin (handled in logic)
}

export interface UpdateArticleData {
  title?: string;
  thumbnail_url?: string;
  short_description?: string;
  html_content?: string;
}
