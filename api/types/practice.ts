// Practice Exam related types

export interface PracticeQuestion {
  id: string;
  category: string; // e.g., 'AML', 'KYC', 'SAR'
  question_text: string;
  options: string[]; // JSON array of strings
  correct_option_index: number;
  explanation: string;
  is_free: boolean; // 5 free questions rule
  created_at: string;
}

export interface PracticeSession {
  id: string;
  user_id: string;
  started_at: string;
  completed_at?: string;
  score?: number;
  total_questions: number;
  status: 'in_progress' | 'completed';
}

export interface PracticeAnswer {
  id: string;
  session_id: string;
  question_id: string;
  selected_option_index: number;
  is_correct: boolean;
  answered_at: string;
}
