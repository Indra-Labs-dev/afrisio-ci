import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Question, Quiz, QuizAttempt, QuizResult, Category } from '../services/api';

interface ActiveQuizSession {
  attemptId: number;
  quiz: Quiz;
  questions: Question[];
  answers: Record<number, number | null>; // questionId -> selectedOptionId
  startedAt: number;
  timeSpentSeconds: number;
}

interface QuizState {
  // Active quiz
  activeSession: ActiveQuizSession | null;
  currentQuestionIndex: number;

  // Categories and quizzes
  categories: Category[];
  quizzes: Quiz[];

  // History
  results: QuizResult[];

  // Actions
  setCategories: (categories: Category[]) => void;
  setQuizzes: (quizzes: Quiz[]) => void;
  startQuiz: (attemptId: number, quiz: Quiz, questions: Question[]) => void;
  answerQuestion: (questionId: number, optionId: number | null) => void;
  updateTimeSpent: (seconds: number) => void;
  finishQuiz: (result: QuizResult) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  resetQuiz: () => void;
  addResult: (result: QuizResult) => void;

  // Stats helpers
  getTotalQuizzes: () => number;
  getAverageScore: () => number;
  getBestScore: () => number;
  getRecentResults: (n?: number) => QuizResult[];
  getCategoryStats: () => Record<string, { played: number; avgScore: number }>;
}

export const useQuizStore = create<QuizState>()(
  persist(
    (set, get) => ({
      activeSession: null,
      currentQuestionIndex: 0,
      categories: [],
      quizzes: [],
      results: [],

      setCategories: (categories) => set({ categories }),
      setQuizzes: (quizzes) => set({ quizzes }),

      startQuiz: (attemptId, quiz, questions) => {
        const session: ActiveQuizSession = {
          attemptId,
          quiz,
          questions,
          answers: {},
          startedAt: Date.now(),
          timeSpentSeconds: 0,
        };
        set({ activeSession: session, currentQuestionIndex: 0 });
      },

      answerQuestion: (questionId, optionId) => {
        set((state) => {
          if (!state.activeSession) return state;
          return {
            activeSession: {
              ...state.activeSession,
              answers: { ...state.activeSession.answers, [questionId]: optionId },
            },
          };
        });
      },

      updateTimeSpent: (seconds) => {
        set((state) => {
          if (!state.activeSession) return state;
          return {
            activeSession: {
              ...state.activeSession,
              timeSpentSeconds: seconds,
            },
          };
        });
      },

      finishQuiz: (result) => {
        set((state) => ({
          activeSession: null,
          currentQuestionIndex: 0,
          results: [result, ...state.results].slice(0, 50),
        }));
      },

      nextQuestion: () =>
        set((state) => ({
          currentQuestionIndex: Math.min(
            state.currentQuestionIndex + 1,
            (state.activeSession?.questions.length ?? 1) - 1
          ),
        })),

      prevQuestion: () =>
        set((state) => ({
          currentQuestionIndex: Math.max(0, state.currentQuestionIndex - 1),
        })),

      resetQuiz: () => set({ activeSession: null, currentQuestionIndex: 0 }),

      addResult: (result) => {
        set((state) => ({
          results: [result, ...state.results].slice(0, 50),
        }));
      },

      getTotalQuizzes: () => get().results.length,

      getAverageScore: () => {
        const { results } = get();
        if (!results.length) return 0;
        const sum = results.reduce((acc, r) => acc + r.attempt.percentage, 0);
        return Math.round(sum / results.length);
      },

      getBestScore: () => {
        const { results } = get();
        if (!results.length) return 0;
        return Math.max(...results.map((r) => r.attempt.percentage));
      },

      getRecentResults: (n = 5) => get().results.slice(0, n),

      getCategoryStats: () => {
        const { results } = get();
        const stats: Record<string, { played: number; avgScore: number; totalScore: number }> = {};
        results.forEach((r) => {
          const categoryName = r.attempt.quiz.category.name;
          if (!stats[categoryName]) stats[categoryName] = { played: 0, avgScore: 0, totalScore: 0 };
          stats[categoryName].played++;
          stats[categoryName].totalScore += r.attempt.percentage;
          stats[categoryName].avgScore = Math.round(stats[categoryName].totalScore / stats[categoryName].played);
        });
        return stats;
      },
    }),
    {
      name: 'afrisio-quiz-store',
      partialize: (state) => ({ results: state.results }),
    }
  )
);
