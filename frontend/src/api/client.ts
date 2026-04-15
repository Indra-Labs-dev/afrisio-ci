import type {
  Category,
  QuizResponse,
  QuizDetailResponse,
  QuizStartResponse,
  QuizSubmit,
  QuizResultResponse,
  UserRegister,
  UserLogin,
  TokenResponse,
  UserResponse,
  DashboardResponse,
  CourseResponse,
  CourseDetailResponse,
  FlashcardCreate,
  FlashcardResponse,
  QuestionCommentCreate,
  QuestionCommentResponse,
  PaginatedQuizResponse,
} from "./types";

// ─── Auth token storage ───────────────────────────────────────────────────────
const TOKEN_KEY = "afrisio_token";
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t: string) => localStorage.setItem(TOKEN_KEY, t);
export const removeToken = () => localStorage.removeItem(TOKEN_KEY);

// ─── HTTP helper ──────────────────────────────────────────────────────────────
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(path, { headers, ...init });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(detail?.detail ?? `API ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const register = (data: UserRegister): Promise<TokenResponse> =>
  request("/api/auth/register", { method: "POST", body: JSON.stringify(data) });

export const login = (data: UserLogin): Promise<TokenResponse> =>
  request("/api/auth/login", { method: "POST", body: JSON.stringify(data) });

export const fetchMe = (): Promise<UserResponse> => request("/api/auth/me");

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const fetchDashboard = (): Promise<DashboardResponse> => request("/api/dashboard");

// ─── Categories ───────────────────────────────────────────────────────────────
export const fetchCategories = (): Promise<Category[]> => request("/api/categories");

// ─── Quizzes ──────────────────────────────────────────────────────────────────
export const fetchQuizzes = (params?: {
  category_id?: number;
  difficulty?: string;
  skip?: number;
  limit?: number;
}): Promise<PaginatedQuizResponse> => {
  const qs = new URLSearchParams();
  if (params?.category_id) qs.set("category_id", String(params.category_id));
  if (params?.difficulty) qs.set("difficulty", params.difficulty);
  qs.set("skip", String(params?.skip ?? 0));
  qs.set("limit", String(params?.limit ?? 20));
  return request(`/api/quizzes?${qs}`);
};

export const fetchQuiz = (id: number): Promise<QuizDetailResponse> =>
  request(`/api/quizzes/${id}`);

// ─── Quiz flow ────────────────────────────────────────────────────────────────
export const startQuiz = (quizId: number): Promise<QuizStartResponse> =>
  request(`/api/quizzes/${quizId}/start`, { method: "POST" });

export const submitQuiz = (payload: QuizSubmit): Promise<QuizResultResponse> =>
  request("/api/quizzes/submit", { method: "POST", body: JSON.stringify(payload) });

export const scoreRandomQuiz = (payload: QuizSubmit): Promise<QuizResultResponse> =>
  request("/api/quizzes/random/score", { method: "POST", body: JSON.stringify(payload) });

// ─── Attempts ─────────────────────────────────────────────────────────────────
export const fetchAttempt = (id: number): Promise<QuizResultResponse> =>
  request(`/api/attempts/${id}`);

export const fetchAttempts = (limit = 20): Promise<QuizResultResponse[]> =>
  request(`/api/attempts?limit=${limit}`);

// ─── Leaderboard ──────────────────────────────────────────────────────────────
export const fetchLeaderboard = (limit = 20): Promise<QuizResultResponse[]> =>
  request(`/api/leaderboard?limit=${limit}`);

// ─── Courses ──────────────────────────────────────────────────────────────────
export const fetchCourses = (params?: { category_id?: number }): Promise<CourseResponse[]> => {
  const qs = new URLSearchParams();
  if (params?.category_id) qs.set("category_id", String(params.category_id));
  const query = qs.toString() ? `?${qs}` : "";
  return request(`/api/courses${query}`);
};

export const fetchCourse = (id: number): Promise<CourseDetailResponse> =>
  request(`/api/courses/${id}`);

// ─── Flashcards ───────────────────────────────────────────────────────────────
export const fetchFlashcards = (): Promise<FlashcardResponse[]> =>
  request("/api/flashcards");

export const addFlashcard = (data: FlashcardCreate): Promise<FlashcardResponse> =>
  request("/api/flashcards", { method: "POST", body: JSON.stringify(data) });

export const deleteFlashcard = (id: number): Promise<void> =>
  request(`/api/flashcards/${id}`, { method: "DELETE" });

// ─── Comments ─────────────────────────────────────────────────────────────────
export const fetchQuestionComments = (questionId: number): Promise<QuestionCommentResponse[]> =>
  request(`/api/questions/${questionId}/comments`);

export const addQuestionComment = (questionId: number, data: QuestionCommentCreate): Promise<QuestionCommentResponse> =>
  request(`/api/questions/${questionId}/comments`, { method: "POST", body: JSON.stringify(data) });
