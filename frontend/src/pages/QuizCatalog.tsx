import { Link, useSearchParams } from "react-router-dom";
import { quizzes, categories } from "@/data/quizData";

const QuizCatalog = () => {
  const [searchParams] = useSearchParams();
  const selectedCategory = searchParams.get("category");

  const filtered = selectedCategory
    ? quizzes.filter((q) => q.category === selectedCategory)
    : quizzes;

  const difficultyColor = (d: string) => {
    if (d === "Facile") return "bg-accent text-accent-foreground";
    if (d === "Moyen") return "bg-secondary/10 text-secondary";
    return "bg-destructive/10 text-destructive";
  };

  return (
    <div className="container py-12">
      <h1 className="mb-2 font-heading text-3xl font-bold">Catalogue des Quiz</h1>
      <p className="mb-8 text-muted-foreground">Sélectionnez un quiz pour commencer votre préparation</p>

      {/* Category filters */}
      <div className="mb-8 flex flex-wrap gap-2">
        <Link
          to="/quiz"
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            !selectedCategory ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"
          }`}
        >
          Tous
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            to={`/quiz?category=${cat.id}`}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              selectedCategory === cat.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            {cat.icon} {cat.name}
          </Link>
        ))}
      </div>

      {/* Quiz cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((quiz) => (
          <div key={quiz.id} className="group flex flex-col rounded-xl border bg-card p-6 transition-all hover:card-hover-shadow">
            <div className="mb-3 flex items-center gap-2">
              <span className={`rounded-full px-3 py-0.5 text-xs font-medium ${difficultyColor(quiz.difficulty)}`}>
                {quiz.difficulty}
              </span>
              <span className="text-xs text-muted-foreground">{quiz.duration} min</span>
            </div>
            <h3 className="mb-2 font-heading text-lg font-semibold">{quiz.title}</h3>
            <p className="mb-4 flex-1 text-sm text-muted-foreground">{quiz.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{quiz.questionCount} questions</span>
              <Link
                to={`/quiz/${quiz.id}`}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:opacity-90"
              >
                Commencer
              </Link>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-20 text-center text-muted-foreground">
          Aucun quiz disponible dans cette catégorie pour le moment.
        </div>
      )}
    </div>
  );
};

export default QuizCatalog;
