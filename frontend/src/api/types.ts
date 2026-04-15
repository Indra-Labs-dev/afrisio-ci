// ─── Backend API Types ────────────────────────────────────────────────────────

// ─── Auth ─────────────────────────────────────────────────────────────────────
export interface UserRegister {
  email: string;
  username: string;
  password: string;
  full_name?: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface UserResponse {
  id: number;
  email: string;
  username: string;
  full_name?: string;
  is_active: boolean;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: UserResponse;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export interface CategoryStat {
  category_name: string;
  icon?: string;
  quizzes_done: number;
  avg_percentage: number;
}

export interface DashboardResponse {
  total_quizzes: number;
  avg_score: number;
  best_score: number;
  total_points: number;
  rank: number;
  category_stats: CategoryStat[];
}

// ─── Quiz ─────────────────────────────────────────────────────────────────────
export interface Category {
  id: number;
  name: string;
  description?: string;
  icon?: string;
}

export interface OptionResponse {
  id: number;
  option_text: string;
  is_correct: boolean;
  order: number;
}

export interface QuestionResponse {
  id: number;
  question_text: string;
  question_type: string;
  points: number;
  order: number;
  options: OptionResponse[];
}

export interface QuizResponse {
  id: number;
  title: string;
  description?: string;
  duration_minutes: number;
  difficulty: "easy" | "medium" | "hard";
  is_active: boolean;
  category_id: number;
  created_at: string;
  category: Category;
  question_count: number;
}

export interface QuizDetailResponse extends QuizResponse {
  questions: QuestionResponse[];
}

export interface QuizStartResponse {
  attempt_id: number;
  quiz: QuizDetailResponse;
}

export interface UserAnswerCreate {
  question_id: number;
  selected_option_id?: number | null;
}

export interface QuizSubmit {
  attempt_id: number;
  answers: UserAnswerCreate[];
  time_spent_seconds: number;
}

export interface UserAnswerResponse {
  question_id: number;
  selected_option_id?: number | null;
  is_correct: boolean;
  correct_option_id: number;
  explanation?: string | null;
  question_text?: string | null;
  selected_option_text?: string | null;
  correct_option_text?: string | null;
}

export interface QuizAttemptResponse {
  id: number;
  quiz_id: number;
  score: number;
  max_score: number;
  percentage: number;
  started_at: string;
  completed_at?: string | null;
  time_spent_seconds: number;
  quiz: QuizResponse;
}

export interface QuizResultResponse {
  attempt: QuizAttemptResponse;
  answers: UserAnswerResponse[];
}

// ─── Course ───────────────────────────────────────────────────────────────────
export interface LessonResponse {
  id: number;
  title: string;
  content: string;
  order: number;
}

export interface CourseResponse {
  id: number;
  title: string;
  description?: string;
  category_id: number;
  created_at: string;
  category: Category;
  is_active: boolean;
}

export interface CourseDetailResponse extends CourseResponse {
  lessons: LessonResponse[];
}

// ─── Flashcards ───────────────────────────────────────────────────────────────
export interface FlashcardCreate {
  question_id: number;
}

export interface FlashcardResponse {
  id: number;
  user_id: number;
  question_id: number;
  created_at: string;
  question: QuestionResponse;
}

// ─── Comments ─────────────────────────────────────────────────────────────────
export interface QuestionCommentCreate {
  comment_text: string;
}

export interface QuestionCommentResponse {
  id: number;
  user_id: number;
  question_id: number;
  comment_text: string;
  created_at: string;
  user: UserResponse;
}

// ─── UI helpers ───────────────────────────────────────────────────────────────
export const DIFFICULTY_LABEL: Record<string, string> = {
  easy: "Facile",
  medium: "Moyen",
  hard: "Difficile",
};

export const DIFFICULTY_COLOR: Record<string, string> = {
  easy: "bg-emerald-100 text-emerald-700",
  medium: "bg-amber-100 text-amber-700",
  hard: "bg-red-100 text-red-700",
};

export const CATEGORY_ICON: Record<string, string> = {
  "Culture Générale": "🌍",
  "Mathématiques": "📐",
  "Physique": "⚗️",
  "Sciences Numériques": "💻",
  "Économie": "📈",
  "Français": "📖",
};
