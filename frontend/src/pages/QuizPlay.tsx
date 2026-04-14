import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { quizzes } from "@/data/quizData";

const QuizPlay = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const quiz = quizzes.find((q) => q.id === id);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (quiz) {
      setAnswers(new Array(quiz.questions.length).fill(null));
      setTimeLeft(quiz.duration * 60);
    }
  }, [quiz]);

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
    if (!quiz) return;
    const score = answers.reduce((acc, ans, i) => {
      return acc + (ans === quiz.questions[i].correctAnswer ? 1 : 0);
    }, 0);
    navigate(`/results/${quiz.id}`, { state: { answers, score, total: quiz.questions.length } });
  }, [quiz, answers, navigate]);

  useEffect(() => {
    if (started && timeLeft === 0) handleFinish();
  }, [started, timeLeft, handleFinish]);

  if (!quiz) {
    return (
      <div className="container py-20 text-center">
        <h1 className="font-heading text-2xl font-bold">Quiz introuvable</h1>
        <button onClick={() => navigate("/quiz")} className="mt-4 rounded-lg bg-primary px-6 py-2 text-primary-foreground">
          Retour au catalogue
        </button>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="container flex min-h-[60vh] items-center justify-center py-12">
        <div className="mx-auto max-w-md rounded-xl border bg-card p-8 text-center card-shadow">
          <h1 className="mb-2 font-heading text-2xl font-bold">{quiz.title}</h1>
          <p className="mb-6 text-muted-foreground">{quiz.description}</p>
          <div className="mb-6 flex justify-center gap-6 text-sm text-muted-foreground">
            <span>📝 {quiz.questionCount} questions</span>
            <span>⏱️ {quiz.duration} min</span>
          </div>
          <button
            onClick={() => setStarted(true)}
            className="w-full rounded-lg bg-primary py-3 font-medium text-primary-foreground transition-all hover:opacity-90"
          >
            Démarrer le quiz
          </button>
        </div>
      </div>
    );
  }

  const question = quiz.questions[currentIndex];
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="container py-8">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Question {currentIndex + 1}/{quiz.questions.length}
          </span>
          <span className={`rounded-full px-4 py-1 font-heading text-sm font-semibold ${timeLeft < 60 ? "bg-destructive/10 text-destructive" : "bg-accent text-accent-foreground"}`}>
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </span>
        </div>

        {/* Progress bar */}
        <div className="mb-8 h-2 rounded-full bg-muted">
          <div
            className="h-2 rounded-full bg-primary transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / quiz.questions.length) * 100}%` }}
          />
        </div>

        {/* Question */}
        <div className="mb-8 rounded-xl border bg-card p-8 card-shadow">
          <h2 className="mb-6 font-heading text-xl font-semibold">{question.text}</h2>
          <div className="space-y-3">
            {question.options.map((option, i) => (
              <button
                key={i}
                onClick={() => {
                  const next = [...answers];
                  next[currentIndex] = i;
                  setAnswers(next);
                }}
                className={`w-full rounded-lg border p-4 text-left transition-all ${
                  answers[currentIndex] === i
                    ? "border-primary bg-accent text-accent-foreground"
                    : "hover:bg-muted"
                }`}
              >
                <span className="mr-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-muted text-sm font-medium">
                  {String.fromCharCode(65 + i)}
                </span>
                {option}
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
          {currentIndex < quiz.questions.length - 1 ? (
            <button
              onClick={() => setCurrentIndex((i) => i + 1)}
              className="rounded-lg bg-primary px-6 py-2 font-medium text-primary-foreground transition-all hover:opacity-90"
            >
              Suivant
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="rounded-lg bg-secondary px-6 py-2 font-medium text-secondary-foreground transition-all hover:opacity-90"
            >
              Terminer
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizPlay;
