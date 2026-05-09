export interface HeroSlide {
  id: number;
  title_sw: string;
  title_en: string;
  subtitle_sw: string;
  subtitle_en: string;
  image: string;
  link_url: string | null;
  sort_order: number;
  is_active: boolean;
  status: "draft" | "published" | "archived";
}

export interface NewsItem {
  id: number;
  title_sw: string;
  title_en: string;
  slug: string;
  excerpt_sw: string;
  excerpt_en: string;
  body_sw: string;
  body_en: string;
  category: number;
  date_published: string;
  featured_image: string | null;
  pdf_document: string | null;
  status: "draft" | "published" | "archived";
}

export interface NewsCategory {
  id: number;
  name_sw: string;
  name_en: string;
  slug: string;
}

export interface Vacancy {
  id: number;
  title_sw: string;
  title_en: string;
  slug: string;
  institution_sw: string;
  institution_en: string;
  description_sw: string;
  description_en: string;
  date_posted: string;
  deadline_date: string | null;
  pdf_document: string | null;
  status: "draft" | "published" | "closed";
}

export interface Interview {
  id: number;
  title_sw: string;
  title_en: string;
  slug: string;
  institution_en: string;
  institution_sw: string;
  interview_type: "written" | "face_to_face" | "practical" | "screening";
  description_sw: string;
  description_en: string;
  date_posted: string;
  pdf_document: string | null;
  status: "draft" | "published";
}

export interface Institution {
  id: number;
  name_sw: string;
  name_en: string;
  slug: string;
}

export interface BoardMember {
  id: number;
  name: string;
  title_role_sw: string;
  title_role_en: string;
  photo: string | null;
  bio_sw: string;
  bio_en: string;
  sort_order: number;
  status: "draft" | "published" | "archived";
}

export interface Department {
  id: number;
  name_sw: string;
  name_en: string;
  head_name: string;
  description_sw: string;
  description_en: string;
  image: string | null;
  sort_order: number;
  status: "draft" | "published" | "archived";
}

export interface Unit {
  id: number;
  name_sw: string;
  name_en: string;
  department: number;
  head_name: string;
  description_sw: string;
  description_en: string;
  sort_order: number;
  status: "draft" | "published" | "archived";
}

export interface Page {
  id: number;
  slug: string;
  title_sw: string;
  title_en: string;
  body_sw: string;
  body_en: string;
  status: "draft" | "published" | "archived";
}

export interface Service {
  id: number;
  name_sw: string;
  name_en: string;
  description_sw: string;
  description_en: string;
  document: string | null;
  sort_order: number;
  status: "draft" | "published" | "archived";
}

export interface ContactSubmission {
  id: number;
  full_name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
  is_read: boolean;
  status: "new" | "replied" | "closed";
  reply_message: string | null;
  reply_sent_at: string | null;
}

export interface SiteSetting {
  id: number;
  key: string;
  value_sw: string;
  value_en: string;
}