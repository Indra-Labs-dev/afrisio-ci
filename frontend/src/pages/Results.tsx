import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import { quizzes } from "@/data/quizData";

interface ResultState {
  answers: (number | null)[];
  score: number;
  total: number;
}

const Results = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const quiz = quizzes.find((q) => q.id === id);
  const state = location.state as ResultState | null;

  if (!quiz || !state) {
    return (
      <div className="container py-20 text-center">
        <h1 className="font-heading text-2xl font-bold">Résultats introuvables</h1>
        <button onClick={() => navigate("/quiz")} className="mt-4 rounded-lg bg-primary px-6 py-2 text-primary-foreground">
          Retour au catalogue
        </button>
      </div>
    );
  }

  const percentage = Math.round((state.score / state.total) * 100);
  const passed = percentage >= 50;

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-2xl">
        {/* Score card */}
        <div className="mb-10 rounded-xl border bg-card p-8 text-center card-shadow">
          <div className={`mb-4 inline-flex h-24 w-24 items-center justify-center rounded-full text-4xl font-bold ${passed ? "bg-accent text-primary" : "bg-destructive/10 text-destructive"}`}>
            {percentage}%
          </div>
          <h1 className="mb-2 font-heading text-2xl font-bold">
            {passed ? "Félicitations ! 🎉" : "Continuez vos efforts ! 💪"}
          </h1>
          <p className="text-muted-foreground">
            Vous avez obtenu {state.score}/{state.total} bonnes réponses
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <Link to={`/quiz/${quiz.id}`} className="rounded-lg border px-6 py-2 font-medium hover:bg-muted">
              Recommencer
            </Link>
            <Link to="/quiz" className="rounded-lg bg-primary px-6 py-2 font-medium text-primary-foreground hover:opacity-90">
              Autre quiz
            </Link>
          </div>
        </div>

        {/* Corrections */}
        <h2 className="mb-6 font-heading text-xl font-bold">Corrections détaillées</h2>
        <div className="space-y-4">
          {quiz.questions.map((q, i) => {
            const userAnswer = state.answers[i];
            const isCorrect = userAnswer === q.correctAnswer;
            return (
              <div key={q.id} className={`rounded-xl border p-6 ${isCorrect ? "border-primary/30 bg-accent/30" : "border-destructive/30 bg-destructive/5"}`}>
                <div className="mb-3 flex items-start gap-3">
                  <span className={`mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${isCorrect ? "bg-primary text-primary-foreground" : "bg-destructive text-destructive-foreground"}`}>
                    {isCorrect ? "✓" : "✗"}
                  </span>
                  <h3 className="font-medium">{q.text}</h3>
                </div>
                <div className="ml-9 space-y-1 text-sm">
                  {userAnswer !== null && userAnswer !== q.correctAnswer && (
                    <p className="text-destructive">Votre réponse : {q.options[userAnswer]}</p>
                  )}
                  <p className="font-medium text-primary">Bonne réponse : {q.options[q.correctAnswer]}</p>
                  <p className="mt-2 text-muted-foreground">{q.explanation}</p>
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
