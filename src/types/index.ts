// Based on the database schema defined in the backend

export interface User {
  id: string;
  email: string;
  full_name_en: string;
  full_name_zh: string;
  role: 'member' | 'admin' | 'superadmin';
}

export interface Course {
  id: string;
  title_en: string;
  description_en: string;
  thumbnail_url: string;
  price_member: number;
  price_non_member: number;
  duration_minutes: number;
}

export interface Enrollment {
  id: string;
  status: 'active' | 'expired' | 'completed';
  expires_at: string;
  progress_seconds: number;
}

export interface Certificate {
  id: string;
  unique_code: string;
  course_title: string;
  issue_date: string;
  pdf_url: string;
}

export interface PracticeQuestion {
  id: string;
  question_text: string;
  options: string[];
}
