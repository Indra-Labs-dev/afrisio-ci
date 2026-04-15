import { Link } from "react-router-dom";
import { useCategories, useQuizzes, useAttempts } from "@/hooks/useApi";
import { CATEGORY_ICON } from "@/api/types";
import { Spinner } from "@/components/ui/loaders";

const HeroSection = () => (
  <section className="relative overflow-hidden py-20 md:py-32">
    <div className="absolute inset-0 hero-gradient opacity-5" />
    <div className="container relative">
      <div className="mx-auto max-w-3xl text-center">
        <div className="mb-6 inline-block rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-accent-foreground">
          🇨🇮 Préparation aux concours ivoiriens
        </div>
        <h1 className="mb-6 font-heading text-4xl font-bold tracking-tight md:text-6xl">
          Réussissez vos <span className="text-gradient">concours</span> avec confiance
        </h1>
        <p className="mb-8 text-lg text-muted-foreground md:text-xl">
          Quiz interactifs, examens simulés et corrections détaillées pour vous préparer
          efficacement aux concours en Côte d'Ivoire.
        </p>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            to="/quiz"
            className="inline-flex h-12 items-center rounded-lg bg-primary px-8 font-medium text-primary-foreground transition-all hover:opacity-90"
          >
            Commencer un quiz
          </Link>
          <Link
            to="/quiz"
            className="inline-flex h-12 items-center rounded-lg border bg-card px-8 font-medium transition-all hover:bg-accent"
          >
            Voir les matières
          </Link>
        </div>
      </div>
    </div>
  </section>
);

const StatsSection = () => {
  const { data: quizzes = [] } = useQuizzes();
  const { data: categories = [] } = useCategories();
  const { data: attempts = [] } = useAttempts(100);

  const totalQuestions = quizzes.reduce((acc, q) => acc + q.question_count, 0);

  return (
    <section className="border-y bg-card py-12">
      <div className="container">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {[
            { value: totalQuestions > 0 ? `${totalQuestions}+` : "…", label: "Questions" },
            { value: categories.length > 0 ? String(categories.length) : "…", label: "Matières" },
            { value: quizzes.length > 0 ? String(quizzes.length) : "…", label: "Quiz" },
            { value: attempts.length > 0 ? `${attempts.length}+` : "0", label: "Sessions" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-heading text-3xl font-bold text-primary">{stat.value}</div>
              <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const CategoriesSection = () => {
  const { data: categories = [], isLoading } = useCategories();
  const { data: quizzes = [] } = useQuizzes();

  return (
    <section className="py-20">
      <div className="container">
        <div className="mb-12 text-center">
          <h2 className="font-heading text-3xl font-bold">Catégories de matières</h2>
          <p className="mt-3 text-muted-foreground">
            Choisissez votre domaine et commencez à réviser
          </p>
        </div>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => {
              const count = quizzes.filter((q) => q.category_id === cat.id).length;
              return (
                <Link
                  key={cat.id}
                  to={`/quiz?category=${cat.id}`}
                  className="group flex items-center gap-4 rounded-xl border bg-card p-6 transition-all hover:card-hover-shadow"
                >
                  <span className="text-4xl">{CATEGORY_ICON[cat.name] ?? "📚"}</span>
                  <div>
                    <h3 className="font-heading font-semibold">{cat.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {count} quiz disponible{count !== 1 ? "s" : ""}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

const FeaturesSection = () => (
  <section className="border-t bg-card py-20">
    <div className="container">
      <div className="mb-12 text-center">
        <h2 className="font-heading text-3xl font-bold">Pourquoi AfriSio CI ?</h2>
      </div>
      <div className="grid gap-8 md:grid-cols-3">
        {[
          { icon: "⏱️", title: "Quiz chronométrés", desc: "Préparez-vous dans les conditions réelles des concours" },
          { icon: "✅", title: "Corrections détaillées", desc: "Comprenez chaque réponse avec des explications claires" },
          { icon: "📊", title: "Suivi de progression", desc: "Suivez vos performances et identifiez vos points faibles" },
        ].map((f) => (
          <div key={f.title} className="rounded-xl border p-8 text-center">
            <span className="mb-4 inline-block text-4xl">{f.icon}</span>
            <h3 className="mb-2 font-heading text-lg font-semibold">{f.title}</h3>
            <p className="text-sm text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const Index = () => (
  <>
    <HeroSection />
    <StatsSection />
    <CategoriesSection />
    <FeaturesSection />
  </>
);

export default Index;
