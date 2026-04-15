import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuizzes, useCategories } from "@/hooks/useApi";
import { DIFFICULTY_LABEL, CATEGORY_ICON } from "@/api/types";
import { ComponentLoader } from "@/components/ui/loaders";
import { Dices, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const LIMIT = 18;

const difficultyColor = (d: string) => {
  if (d === "easy") return "bg-accent text-accent-foreground";
  if (d === "medium") return "bg-secondary/10 text-secondary";
  return "bg-destructive/10 text-destructive";
};

const QuizCatalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const catParam = searchParams.get("category");
  const diffParam = searchParams.get("difficulty");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const skip = (page - 1) * LIMIT;

  const { data: categories = [], isLoading: catLoading } = useCategories();
  const { data: paginated, isLoading: quizLoading } = useQuizzes({
    category_id: catParam ? Number(catParam) : undefined,
    difficulty: diffParam || undefined,
    skip,
    limit: LIMIT,
  });

  const quizzes = paginated?.items ?? [];
  const totalPages = paginated?.pages ?? 1;
  const total = paginated?.total ?? 0;
  const isLoading = catLoading || quizLoading;

  // Client-side search filter on the current page
  const filtered = search.trim()
    ? quizzes.filter((q) =>
        q.title.toLowerCase().includes(search.toLowerCase()) ||
        q.description?.toLowerCase().includes(search.toLowerCase())
      )
    : quizzes;

  const setFilter = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
    setPage(1);
  };

  return (
    <div className="container py-12">
      <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold">Catalogue des Quiz</h1>
          <p className="mt-1 text-muted-foreground">
            {total > 0 ? `${total} quiz disponibles` : "Sélectionnez un quiz pour commencer votre préparation"}
          </p>
        </div>
        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher un quiz..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border bg-background py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Examen Blanc CTA */}
      <div className="mb-8 flex items-center justify-between gap-4 rounded-2xl border bg-gradient-to-r from-primary/10 to-secondary/10 p-5">
        <div>
          <h2 className="font-heading text-lg font-bold">🎲 Examen Blanc</h2>
          <p className="text-sm text-muted-foreground">
            20 questions aléatoires issues de toutes les matières
          </p>
        </div>
        <Link
          to="/quiz/generate-random"
          className="flex shrink-0 items-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-medium text-primary-foreground transition-all hover:opacity-90 hover:shadow-lg hover:-translate-y-0.5 duration-200"
        >
          <Dices className="h-4 w-4" />
          Lancer
        </Link>
      </div>

      {/* Filters row */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* Category filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter("category", null)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              !catParam ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            Toutes
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilter("category", String(cat.id))}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                catParam === String(cat.id)
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              {CATEGORY_ICON[cat.name] ?? "📚"} {cat.name}
            </button>
          ))}
        </div>

        {/* Difficulty filter */}
        <div className="flex gap-2 sm:ml-auto">
          {[null, "easy", "medium", "hard"].map((diff) => (
            <button
              key={diff ?? "all"}
              onClick={() => setFilter("difficulty", diff)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                (diffParam ?? null) === diff
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              {diff ? DIFFICULTY_LABEL[diff] : "Tous niveaux"}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="py-20">
          <ComponentLoader />
        </div>
      )}

      {/* Quiz cards grid */}
      {!isLoading && (
        <>
          {filtered.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground">
              Aucun quiz disponible dans cette catégorie pour le moment.
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((quiz) => (
                <div
                  key={quiz.id}
                  className="group flex flex-col rounded-xl border bg-card p-6 transition-all hover:card-hover-shadow"
                >
                  <div className="mb-3 flex items-center gap-2">
                    <span className={`rounded-full px-3 py-0.5 text-xs font-medium ${difficultyColor(quiz.difficulty)}`}>
                      {DIFFICULTY_LABEL[quiz.difficulty] ?? quiz.difficulty}
                    </span>
                    <span className="text-xs text-muted-foreground">{quiz.duration_minutes} min</span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {CATEGORY_ICON[quiz.category.name] ?? "📚"} {quiz.category.name}
                    </span>
                  </div>
                  <h3 className="mb-2 font-heading text-lg font-semibold">{quiz.title}</h3>
                  <p className="mb-4 flex-1 text-sm text-muted-foreground">{quiz.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{quiz.question_count} questions</span>
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

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="icon"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {/* Page numbers */}
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                // Show pages around the current page
                let pageNum: number;
                if (totalPages <= 7) {
                  pageNum = i + 1;
                } else if (page <= 4) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 3) {
                  pageNum = totalPages - 6 + i;
                } else {
                  pageNum = page - 3 + i;
                }
                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === page ? "default" : "outline"}
                    size="icon"
                    onClick={() => setPage(pageNum)}
                    className="h-9 w-9 text-sm"
                  >
                    {pageNum}
                  </Button>
                );
              })}

              <Button
                variant="outline"
                size="icon"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>

              <span className="ml-2 text-sm text-muted-foreground">
                Page {page} sur {totalPages}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default QuizCatalog;
