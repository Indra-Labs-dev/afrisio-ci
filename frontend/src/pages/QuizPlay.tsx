import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { scoreRandomQuiz } from "@/api/client";
import { useStartQuiz, useSubmitQuiz } from "@/hooks/useApi";
import { DIFFICULTY_LABEL } from "@/api/types";
import type { QuizDetailResponse, QuizStartResponse } from "@/api/types";
import { Loader2 } from "lucide-react";
import { DashboardLoader, Spinner } from "@/components/ui/loaders";
import { useSounds } from "@/hooks/useSounds";
import { toast } from "sonner";

const QuizPlay = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

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
  const { correct, wrong, win, click } = useSounds();

  const quiz: QuizDetailResponse | undefined = session?.quiz;

  // Kick off the quiz session on the backend when user clicks "Démarrer"
  const handleStart = () => {
    if (!id) return;
    
    if (id === "random") {
      const stored = sessionStorage.getItem("random_quiz");
      if (stored) {
        const parsed = JSON.parse(stored) as QuizDetailResponse;
        setSession({ attempt_id: -1, quiz: parsed });
        setTimeLeft(parsed.duration_minutes * 60);
        setStarted(true);
        startedAt.current = Date.now();
      } else {
        navigate("/quiz");
      }
      return;
    }

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

    if (id === "random") {
      scoreRandomQuiz({
        attempt_id: -1,
        answers: answersPayload,
        time_spent_seconds: timeSpent,
      }).then(result => {
        // Enregistrer le résultat dans le local storage de façon temporaire
        sessionStorage.setItem("random_result", JSON.stringify(result));
        navigate("/results/random");
      }).catch(() => {
        alert("Erreur lors de la correction de l'examen blanc.");
      });
      return;
    }

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
  }, [session, quiz, answers, submitMutation, navigate, id]);

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
    if (id === "random") {
      const stored = sessionStorage.getItem("random_quiz");
      if (stored) {
        setPreview(JSON.parse(stored));
      } else {
        navigate("/quiz/random");
      }
      return;
    }

    fetch(`/api/quizzes/${id}`)
      .then((r) => r.json())
      .then(setPreview)
      .catch(() => null);
  }, [id, navigate]);

  // ── Error / Not found ─────────────────────────────────────────────────────
  if (!preview && !started) {
    return (
      <div className="container flex min-h-[60vh] items-center justify-center py-12">
        <DashboardLoader />
      </div>
    );
  }

  // ── Challenge Toast ───────────────────────────────────────────────────────
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    if (query.get("challenge") === "1" && preview && !started) {
      toast.info("Un ami vous a défié ! Quel sera votre score ? ⚔️", {
        position: "top-center",
        duration: 5000,
        id: "challenge-toast" // Prevents duplicate toasts
      });
    }
  }, [location.search, preview, started]);

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
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 font-medium text-primary-foreground transition-all hover:opacity-90 disabled:opacity-60 hover:shadow-lg hover:-translate-y-0.5 duration-200"
          >
            {startMutation.isPending && <Spinner size="sm" variant="white" />}
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
                  onClick={() => {
                    click();
                    setAnswers((prev) => ({ ...prev, [question.id]: option.id }));
                  }}
                  className={`w-full rounded-lg border p-4 text-left transition-all hover:-translate-y-0.5 duration-150 ${
                    selectedOptionId === option.id
                      ? "border-primary bg-accent text-accent-foreground shadow-md"
                      : "hover:bg-muted hover:border-primary/40"
                  }`}
                >
                  <span className={`mr-3 inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                    selectedOptionId === option.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}>
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
              onClick={() => { win(); handleFinish(); }}
              disabled={submitMutation.isPending}
              className="flex items-center gap-2 rounded-lg bg-secondary px-6 py-2 font-medium text-secondary-foreground transition-all hover:opacity-90 disabled:opacity-60"
            >
              {submitMutation.isPending && <Spinner size="sm" variant="white" />}
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
