// Based on the user requirements, this file defines the comprehensive schema.

export type UserRole = 'member' | 'admin' | 'superadmin';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type EnrollmentStatus = 'active' | 'expired' | 'completed';
export type CertificateStatus = 'active' | 'revoked';

export interface User {
  id: string; // UUID
  email: string;
  full_name_en: string;
  full_name_zh: string; // Optional
  role: UserRole;
  is_active: boolean; // Admin can disable login
  created_at: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  price_member: number;
  price_non_member: number;
  duration_minutes: number;
  is_published: boolean;
  preview_video_url?: string; // 1-minute preview
  full_video_url?: string; // HLS/Signed URL
}

export interface Chapter {
  id: string;
  course_id: string;
  title: string;
  order_index: number;
}

export interface Lesson {
  id: string;
  chapter_id: string;
  title: string;
  video_url: string;
  duration_seconds: number;
  order_index: number;
}

export interface InVideoQuestion {
  id: string;
  lesson_id: string;
  timestamp_seconds: number; // When to pause video
  question_text: string;
  options: string[]; // JSON array
  correct_option_index: number;
  explanation: string;
}

export interface PracticeQuestion {
  id: string;
  category: string; // e.g., 'AML', 'KYC'
  question_text: string;
  options: string[];
  correct_option_index: number;
  explanation: string;
  is_free_preview: boolean; // For the "5 free questions" rule
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  status: EnrollmentStatus;
  expires_at: string; // 90-day expiry
  purchased_at: string;
  progress_seconds: number; // Track video progress
  completed_at?: string;
}

export interface Certificate {
  id: string;
  unique_code: string; // For QR verification
  user_id: string;
  course_id: string;
  issue_date: string;
  expiry_date?: string; // Optional
  status: CertificateStatus;
  pdf_url: string;
}

export interface Payment {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  provider: 'stripe' | 'manual';
  provider_transaction_id: string;
  status: PaymentStatus;
  product_type: 'course' | 'practice' | 'membership';
  product_id: string; // ID of course or practice package
  receipt_url?: string; // Uploaded receipt for manual payments
  created_at: string;
}

export interface AuditLog {
  id: string;
  actor_id: string; // Admin ID
  action: string; // e.g., 'REVOKE_CERTIFICATE', 'DISABLE_USER'
  target_id: string;
  details: any; // JSON
  created_at: string;
}
