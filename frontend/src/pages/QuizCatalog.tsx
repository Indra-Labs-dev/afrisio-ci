import { Link, useSearchParams } from "react-router-dom";
import { useQuizzes, useCategories } from "@/hooks/useApi";
import { DIFFICULTY_LABEL, CATEGORY_ICON } from "@/api/types";
import { ComponentLoader } from "@/components/ui/loaders";

const difficultyColor = (d: string) => {
  if (d === "easy") return "bg-accent text-accent-foreground";
  if (d === "medium") return "bg-secondary/10 text-secondary";
  return "bg-destructive/10 text-destructive";
};

const QuizCatalog = () => {
  const [searchParams] = useSearchParams();
  const catParam = searchParams.get("category"); // stringified category id

  const { data: categories = [], isLoading: catLoading } = useCategories();
  const { data: quizzes = [], isLoading: quizLoading } = useQuizzes(
    catParam ? { category_id: Number(catParam) } : undefined
  );

  const isLoading = catLoading || quizLoading;

  return (
    <div className="container py-12">
      <h1 className="mb-2 font-heading text-3xl font-bold">Catalogue des Quiz</h1>
      <p className="mb-8 text-muted-foreground">
        Sélectionnez un quiz pour commencer votre préparation
      </p>

      {/* Category filters */}
      <div className="mb-8 flex flex-wrap gap-2">
        <Link
          to="/quiz"
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            !catParam
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-accent"
          }`}
        >
          Tous
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            to={`/quiz?category=${cat.id}`}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              catParam === String(cat.id)
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            {CATEGORY_ICON[cat.name] ?? "📚"} {cat.name}
          </Link>
        ))}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="py-20">
          <ComponentLoader />
        </div>
      )}

      {/* Quiz cards */}
      {!isLoading && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="group flex flex-col rounded-xl border bg-card p-6 transition-all hover:card-hover-shadow"
            >
              <div className="mb-3 flex items-center gap-2">
                <span
                  className={`rounded-full px-3 py-0.5 text-xs font-medium ${difficultyColor(quiz.difficulty)}`}
                >
                  {DIFFICULTY_LABEL[quiz.difficulty] ?? quiz.difficulty}
                </span>
                <span className="text-xs text-muted-foreground">
                  {quiz.duration_minutes} min
                </span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {CATEGORY_ICON[quiz.category.name] ?? "📚"} {quiz.category.name}
                </span>
              </div>
              <h3 className="mb-2 font-heading text-lg font-semibold">{quiz.title}</h3>
              <p className="mb-4 flex-1 text-sm text-muted-foreground">{quiz.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {quiz.question_count} questions
                </span>
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
      )}

      {!isLoading && quizzes.length === 0 && (
        <div className="py-20 text-center text-muted-foreground">
          Aucun quiz disponible dans cette catégorie pour le moment.
        </div>
      )}
    </div>
  );
};

export default QuizCatalog;
