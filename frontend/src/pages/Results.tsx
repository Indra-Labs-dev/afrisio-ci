import { useParams, useNavigate, Link } from "react-router-dom";
import { useAttempt } from "@/hooks/useApi";
import { Loader2 } from "lucide-react";

const Results = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: result, isLoading, isError } = useAttempt(Number(id));

  if (isLoading) {
    return (
      <div className="container flex min-h-[60vh] items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !result) {
    return (
      <div className="container py-20 text-center">
        <h1 className="font-heading text-2xl font-bold">Résultats introuvables</h1>
        <button
          onClick={() => navigate("/quiz")}
          className="mt-4 rounded-lg bg-primary px-6 py-2 text-primary-foreground"
        >
          Retour au catalogue
        </button>
      </div>
    );
  }

  const { attempt, answers } = result;
  const { quiz } = attempt;
  const percentage = Math.round(attempt.percentage);
  const passed = percentage >= 50;

  // Build a quick lookup: question_id → { correct_option_id, selected_option_id, is_correct }
  const answerMap = new Map(answers.map((a) => [a.question_id, a]));

  // Rebuild ordered questions list from the quiz (no answers exposed server-side at GET /quiz)
  // But /api/attempts/{id} returns full answer data — we use that.
  const mins = Math.floor(attempt.time_spent_seconds / 60);
  const secs = attempt.time_spent_seconds % 60;

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-2xl">
        {/* Score card */}
        <div className="mb-10 rounded-xl border bg-card p-8 text-center card-shadow">
          <div
            className={`mb-4 inline-flex h-24 w-24 items-center justify-center rounded-full text-4xl font-bold ${
              passed ? "bg-accent text-primary" : "bg-destructive/10 text-destructive"
            }`}
          >
            {percentage}%
          </div>
          <h1 className="mb-2 font-heading text-2xl font-bold">
            {passed ? "Félicitations ! 🎉" : "Continuez vos efforts ! 💪"}
          </h1>
          <p className="text-muted-foreground">
            Vous avez obtenu{" "}
            <span className="font-semibold text-foreground">
              {attempt.score}/{attempt.max_score}
            </span>{" "}
            points
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            ⏱️ Temps : {mins}m {secs}s
          </p>
          <p className="mt-1 text-sm text-muted-foreground font-medium">
            📚 {quiz.title}
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <Link
              to={`/quiz/${quiz.id}`}
              className="rounded-lg border px-6 py-2 font-medium hover:bg-muted"
            >
              Recommencer
            </Link>
            <Link
              to="/quiz"
              className="rounded-lg bg-primary px-6 py-2 font-medium text-primary-foreground hover:opacity-90"
            >
              Autre quiz
            </Link>
          </div>
        </div>

        {/* Corrections per question */}
        <h2 className="mb-6 font-heading text-xl font-bold">Corrections détaillées</h2>
        <div className="space-y-4">
          {answers.map((ans, i) => {
            const isCorrect = ans.is_correct;
            return (
              <div
                key={ans.question_id}
                className={`rounded-xl border p-6 ${
                  isCorrect
                    ? "border-primary/30 bg-accent/30"
                    : "border-destructive/30 bg-destructive/5"
                }`}
              >
                <div className="mb-3 flex items-start gap-3">
                  <span
                    className={`mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      isCorrect
                        ? "bg-primary text-primary-foreground"
                        : "bg-destructive text-destructive-foreground"
                    }`}
                  >
                    {isCorrect ? "✓" : "✗"}
                  </span>
                  <h3 className="font-medium">Question {i + 1}</h3>
                </div>
                <div className="ml-9 space-y-1 text-sm">
                  {!isCorrect && ans.selected_option_id && (
                    <p className="text-destructive">
                      Votre réponse : Option #{ans.selected_option_id}
                    </p>
                  )}
                  {!isCorrect && !ans.selected_option_id && (
                    <p className="text-muted-foreground italic">Aucune réponse sélectionnée</p>
                  )}
                  <p className="font-medium text-primary">
                    Bonne réponse : Option #{ans.correct_option_id}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Results;
