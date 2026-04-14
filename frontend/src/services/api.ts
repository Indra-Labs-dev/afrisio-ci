const API_BASE = 'http://localhost:8000/api';

// Category types
export interface Category {
  id: number;
  name: string;
  description: string | null;
  icon: string | null;
}

// Option types
export interface Option {
  id: number;
  option_text: string;
  is_correct: boolean;
  order: number;
}

// Question types
export interface Question {
  id: number;
  question_text: string;
  question_type: string;
  points: number;
  order: number;
  options: Option[];
}

// Quiz types
export interface Quiz {
  id: number;
  title: string;
  description: string | null;
  duration_minutes: number;
  difficulty: string;
  is_active: boolean;
  category_id: number;
  created_at: string;
  category: Category;
  question_count: number;
}

export interface QuizDetail extends Quiz {
  questions: Question[];
}

// Attempt types
export interface QuizAttempt {
  id: number;
  quiz_id: number;
  score: number;
  max_score: number;
  percentage: number;
  started_at: string;
  completed_at: string | null;
  time_spent_seconds: number;
  quiz: Quiz;
}

export interface UserAnswer {
  question_id: number;
  selected_option_id: number | null;
  is_correct: boolean;
  correct_option_id: number;
}

export interface QuizResult {
  attempt: QuizAttempt;
  answers: UserAnswer[];
}

export interface QuizStartResponse {
  attempt_id: number;
  quiz: QuizDetail;
}

export interface QuizSubmitData {
  attempt_id: number;
  answers: { question_id: number; selected_option_id: number | null }[];
  time_spent_seconds: number;
}

// API functions
export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(`${API_BASE}/categories`);
  if (!res.ok) throw new Error('Error loading categories');
  return res.json();
}

export async function fetchCategory(id: number): Promise<Category> {
  const res = await fetch(`${API_BASE}/categories/${id}`);
  if (!res.ok) throw new Error('Error loading category');
  return res.json();
}

export async function fetchQuizzes(categoryId?: number, difficulty?: string): Promise<Quiz[]> {
  const params = new URLSearchParams();
  if (categoryId) params.set('category_id', String(categoryId));
  if (difficulty) params.set('difficulty', difficulty);
  const res = await fetch(`${API_BASE}/quizzes?${params}`);
  if (!res.ok) throw new Error('Error loading quizzes');
  return res.json();
}

export async function fetchQuiz(id: number): Promise<QuizDetail> {
  const res = await fetch(`${API_BASE}/quizzes/${id}`);
  if (!res.ok) throw new Error('Error loading quiz');
  return res.json();
}

export async function startQuiz(quizId: number): Promise<QuizStartResponse> {
  const res = await fetch(`${API_BASE}/quizzes/${quizId}/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Error starting quiz');
  return res.json();
}

export async function submitQuiz(data: QuizSubmitData): Promise<QuizResult> {
  const res = await fetch(`${API_BASE}/quizzes/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error submitting quiz');
  return res.json();
}

export async function fetchAttempt(attemptId: number): Promise<QuizResult> {
  const res = await fetch(`${API_BASE}/attempts/${attemptId}`);
  if (!res.ok) throw new Error('Error loading attempt');
  return res.json();
}

export async function fetchAttempts(limit: number = 10): Promise<QuizResult[]> {
  const res = await fetch(`${API_BASE}/attempts?limit=${limit}`);
  if (!res.ok) throw new Error('Error loading attempts');
  return res.json();
}
