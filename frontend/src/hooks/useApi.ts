import { useQuery, useMutation } from "@tanstack/react-query";
import {
  fetchCategories,
  fetchQuizzes,
  fetchQuiz,
  startQuiz,
  submitQuiz,
  fetchAttempt,
  fetchAttempts,
  fetchCourses,
  fetchCourse,
} from "@/api/client";
import type { QuizSubmit } from "@/api/types";

// ─── Query keys (centralised to avoid typos) ──────────────────────────────────

export const QUERY_KEYS = {
  categories: ["categories"] as const,
  quizzes: (params?: { category_id?: number; difficulty?: string }) =>
    ["quizzes", params] as const,
  quiz: (id: number) => ["quiz", id] as const,
  attempt: (id: number) => ["attempt", id] as const,
  attempts: (limit?: number) => ["attempts", limit] as const,
  courses: (params?: { category_id?: number }) => ["courses", params] as const,
  course: (id: number) => ["course", id] as const,
};

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useCategories() {
  return useQuery({
    queryKey: QUERY_KEYS.categories,
    queryFn: fetchCategories,
    staleTime: 5 * 60 * 1000, // categories rarely change
  });
}

export function useQuizzes(params?: { category_id?: number; difficulty?: string }) {
  return useQuery({
    queryKey: QUERY_KEYS.quizzes(params),
    queryFn: () => fetchQuizzes(params),
    staleTime: 60 * 1000,
  });
}

export function useQuiz(id: number) {
  return useQuery({
    queryKey: QUERY_KEYS.quiz(id),
    queryFn: () => fetchQuiz(id),
    enabled: !!id,
  });
}

export function useStartQuiz() {
  return useMutation({ mutationFn: startQuiz });
}

export function useSubmitQuiz() {
  return useMutation({ mutationFn: (payload: QuizSubmit) => submitQuiz(payload) });
}

export function useAttempt(id: number) {
  return useQuery({
    queryKey: QUERY_KEYS.attempt(id),
    queryFn: () => fetchAttempt(id),
    enabled: !!id,
  });
}

export function useAttempts(limit = 20) {
  return useQuery({
    queryKey: QUERY_KEYS.attempts(limit),
    queryFn: () => fetchAttempts(limit),
  });
}

export function useCourses(params?: { category_id?: number }) {
  return useQuery({
    queryKey: QUERY_KEYS.courses(params),
    queryFn: () => fetchCourses(params),
  });
}

export function useCourse(id: number) {
  return useQuery({
    queryKey: QUERY_KEYS.course(id),
    queryFn: () => fetchCourse(id),
    enabled: !!id,
  });
}
