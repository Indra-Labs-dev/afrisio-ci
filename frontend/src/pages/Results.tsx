import { useParams, useNavigate, Link } from "react-router-dom";
import { useAttempt } from "@/hooks/useApi";
import { DashboardLoader } from "@/components/ui/loaders";

const Results = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isRandom = id === "random";
  const { data: dbResult, isLoading, isError } = useAttempt(isRandom ? 0 : Number(id));

  const result = isRandom 
    ? (sessionStorage.getItem("random_result") ? JSON.parse(sessionStorage.getItem("random_result") as string) : null)
    : dbResult;

  if (!isRandom && isLoading) {
    return (
      <div className="container flex min-h-[60vh] items-center justify-center py-12">
        <DashboardLoader />
      </div>
    );
  }

  if ((!isRandom && isError) || !result) {
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
          <div className="mt-6 flex flex-wrap justify-center gap-4 print:hidden">
            <button
              onClick={() => window.print()}
              className="rounded-lg border px-6 py-2 font-medium hover:bg-muted transition-colors flex items-center gap-2"
              title="Imprimer les résultats"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M224,96V104a8,8,0,0,1-16,0V96a16,16,0,0,0-16-16H64A16,16,0,0,0,48,96v8a8,8,0,0,1-16,0V96A32,32,0,0,1,64,64H192A32,32,0,0,1,224,96Z"></path><path d="M200,120H56a24,24,0,0,0-24,24v64a24,24,0,0,0,24,24H72v16a8,8,0,0,0,8,8h96a8,8,0,0,0,8-8V232h16a24,24,0,0,0,24-24V144A24,24,0,0,0,200,120Zm-32,120H88V168h80Zm40-32a8,8,0,0,1-8,8H184V160a8,8,0,0,0-8-8H80a8,8,0,0,0-8,8v56H56a8,8,0,0,1-8-8V144a8,8,0,0,1,8-8H200a8,8,0,0,1,8,8Zm-24-52a12,12,0,1,1,12-12A12,12,0,0,1,184,156Z"></path></svg>
              Imprimer
            </button>
            <Link
              to={isRandom ? "/quiz/generate-random" : `/quiz/${quiz.id}`}
              className="rounded-lg border px-6 py-2 font-medium hover:bg-muted transition-colors"
            >
              Recommencer
            </Link>
            <Link
              to="/quiz"
              className="rounded-lg bg-primary px-6 py-2 font-medium text-primary-foreground hover:opacity-90 transition-opacity"
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
                  <div>
                    <h3 className="font-medium text-lg">Question {i + 1}</h3>
                    {ans.question_text && <p className="text-foreground mt-1 font-medium">{ans.question_text}</p>}
                  </div>
                </div>
                <div className="ml-9 space-y-2 text-sm">
                  {!isCorrect && ans.selected_option_text && (
                    <div className="rounded-md bg-destructive/10 p-3 text-destructive">
                      <span className="font-semibold">Votre réponse :</span> {ans.selected_option_text}
                    </div>
                  )}
                  {!isCorrect && !ans.selected_option_id && (
                    <div className="rounded-md bg-muted p-3 text-muted-foreground italic">
                      Aucune réponse sélectionnée
                    </div>
                  )}
                  <div className="rounded-md bg-primary/10 p-3 text-primary">
                      <span className="font-semibold">Bonne réponse :</span> {ans.correct_option_text || `Option #${ans.correct_option_id}`}
                  </div>
                  
                  {ans.explanation && (
                    <div className="mt-4 rounded-md bg-muted/50 p-4 border text-foreground/80">
                      <h4 className="font-semibold mb-1 text-foreground">Explication :</h4>
                      <p>{ans.explanation}</p>
                    </div>
                  )}
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
