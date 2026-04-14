import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useStartQuiz, useSubmitQuiz } from "@/hooks/useApi";
import { DIFFICULTY_LABEL } from "@/api/types";
import type { QuizDetailResponse, QuizStartResponse } from "@/api/types";
import { Loader2 } from "lucide-react";

const QuizPlay = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const startMutation = useStartQuiz();
  const submitMutation = useSubmitQuiz();

  // Session state
  const [session, setSession] = useState<QuizStartResponse | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  // answers: map question_id → selected option_id
  const [answers, setAnswers] = useState<Record<number, number | null>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [started, setStarted] = useState(false);
  const startedAt = useRef<number>(Date.now());

  const quiz: QuizDetailResponse | undefined = session?.quiz;

  // Kick off the quiz session on the backend when user clicks "Démarrer"
  const handleStart = () => {
    if (!id) return;
    startMutation.mutate(Number(id), {
      onSuccess: (data) => {
        setSession(data);
        setTimeLeft(data.quiz.duration_minutes * 60);
        setStarted(true);
        startedAt.current = Date.now();
      },
    });
  };

  // Countdown timer
  useEffect(() => {
    if (!started || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [started, timeLeft]);

  const handleFinish = useCallback(() => {
    if (!session || !quiz) return;
    const timeSpent = Math.floor((Date.now() - startedAt.current) / 1000);

    const answersPayload = quiz.questions.map((q) => ({
      question_id: q.id,
      selected_option_id: answers[q.id] ?? null,
    }));

    submitMutation.mutate(
      {
        attempt_id: session.attempt_id,
        answers: answersPayload,
        time_spent_seconds: timeSpent,
      },
      {
        onSuccess: (result) => {
          navigate(`/results/${result.attempt.id}`);
        },
      }
    );
  }, [session, quiz, answers, submitMutation, navigate]);

  // Auto-submit on timeout
  useEffect(() => {
    if (started && timeLeft === 0) handleFinish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, timeLeft]);

  // ── Pre-start: fetch a preview of the quiz ─────────────────────────────────
  // We do a lightweight GET to show title/description before the user clicks start
  const [preview, setPreview] = useState<{ title: string; description?: string; duration_minutes: number; difficulty: string; question_count: number } | null>(null);
  useEffect(() => {
    if (!id) return;
    fetch(`http://localhost:8000/api/quizzes/${id}`)
      .then((r) => r.json())
      .then(setPreview)
      .catch(() => null);
  }, [id]);

  // ── Error / Not found ─────────────────────────────────────────────────────
  if (!preview && !started) {
    return (
      <div className="container flex min-h-[60vh] items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // ── Pre-start screen ──────────────────────────────────────────────────────
  if (!started && preview) {
    return (
      <div className="container flex min-h-[60vh] items-center justify-center py-12">
        <div className="mx-auto max-w-md rounded-xl border bg-card p-8 text-center card-shadow">
          <h1 className="mb-2 font-heading text-2xl font-bold">{preview.title}</h1>
          <p className="mb-6 text-muted-foreground">{preview.description}</p>
          <div className="mb-6 flex justify-center gap-6 text-sm text-muted-foreground">
            <span>📝 {preview.question_count} questions</span>
            <span>⏱️ {preview.duration_minutes} min</span>
            <span className="capitalize">
              📊 {DIFFICULTY_LABEL[preview.difficulty] ?? preview.difficulty}
            </span>
          </div>
          {startMutation.isError && (
            <p className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              Erreur lors du démarrage du quiz. Réessayez.
            </p>
          )}
          <button
            onClick={handleStart}
            disabled={startMutation.isPending}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 font-medium text-primary-foreground transition-all hover:opacity-90 disabled:opacity-60"
          >
            {startMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Démarrer le quiz
          </button>
        </div>
      </div>
    );
  }

  if (!quiz) return null;

  // ── Quiz in progress ──────────────────────────────────────────────────────
  const sortedQuestions = [...quiz.questions].sort((a, b) => a.order - b.order);
  const question = sortedQuestions[currentIndex];
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const selectedOptionId = answers[question.id] ?? null;

  return (
    <div className="container py-8">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Question {currentIndex + 1}/{sortedQuestions.length}
          </span>
          <span
            className={`rounded-full px-4 py-1 font-heading text-sm font-semibold ${
              timeLeft < 60
                ? "bg-destructive/10 text-destructive"
                : "bg-accent text-accent-foreground"
            }`}
          >
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </span>
        </div>

        {/* Progress bar */}
        <div className="mb-8 h-2 rounded-full bg-muted">
          <div
            className="h-2 rounded-full bg-primary transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / sortedQuestions.length) * 100}%` }}
          />
        </div>

        {/* Question */}
        <div className="mb-8 rounded-xl border bg-card p-8 card-shadow">
          <h2 className="mb-6 font-heading text-xl font-semibold">{question.question_text}</h2>
          <div className="space-y-3">
            {[...question.options]
              .sort((a, b) => a.order - b.order)
              .map((option, i) => (
                <button
                  key={option.id}
                  onClick={() =>
                    setAnswers((prev) => ({ ...prev, [question.id]: option.id }))
                  }
                  className={`w-full rounded-lg border p-4 text-left transition-all ${
                    selectedOptionId === option.id
                      ? "border-primary bg-accent text-accent-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  <span className="mr-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-muted text-sm font-medium">
                    {String.fromCharCode(65 + i)}
                  </span>
                  {option.option_text}
                </button>
              ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            disabled={currentIndex === 0}
            className="rounded-lg border px-6 py-2 font-medium transition-all hover:bg-muted disabled:opacity-40"
          >
            Précédent
          </button>
          {currentIndex < sortedQuestions.length - 1 ? (
            <button
              onClick={() => setCurrentIndex((i) => i + 1)}
              className="rounded-lg bg-primary px-6 py-2 font-medium text-primary-foreground transition-all hover:opacity-90"
            >
              Suivant
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={submitMutation.isPending}
              className="flex items-center gap-2 rounded-lg bg-secondary px-6 py-2 font-medium text-secondary-foreground transition-all hover:opacity-90 disabled:opacity-60"
            >
              {submitMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Terminer
            </button>
          )}
        </div>

        {submitMutation.isError && (
          <p className="mt-4 rounded-lg bg-destructive/10 p-3 text-center text-sm text-destructive">
            Erreur lors de la soumission. Réessayez.
          </p>
        )}
      </div>
    </div>
  );
};

export default QuizPlay;
