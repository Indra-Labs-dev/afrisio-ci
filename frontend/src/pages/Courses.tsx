import { Link, useSearchParams } from "react-router-dom";
import { useCourses, useCategories } from "@/hooks/useApi";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ComponentLoader } from "@/components/ui/loaders";

const Courses = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategoryStr = searchParams.get("category");
  const selectedCategory = selectedCategoryStr ? Number(selectedCategoryStr) : undefined;

  const { data: courses = [], isLoading: isLoadingCourses } = useCourses(
    selectedCategory ? { category_id: selectedCategory } : undefined
  );
  const { data: categories = [] } = useCategories();

  return (
    <div className="container py-12">
      <div className="mb-10 text-center">
        <h1 className="font-heading text-4xl font-bold">📚 Cours & Révisions</h1>
        <p className="mt-3 text-muted-foreground">
          Fiches de révision, leçons structurées et ressources pour vos concours
        </p>
      </div>

      {/* Category filter */}
      <div className="mb-8 flex flex-wrap justify-center gap-2">
        <button
          onClick={() => setSearchParams({})}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            !selectedCategory
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-accent"
          }`}
        >
          Toutes
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSearchParams({ category: String(cat.id) })}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              selectedCategory === cat.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {isLoadingCourses ? (
        <div className="py-20">
          <ComponentLoader />
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Link key={course.id} to={`/cours/${course.id}`}>
              <Card className="h-full transition-all hover:card-hover-shadow">
                <CardHeader>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-2xl">{course.category?.icon || "📘"}</span>
                    <Badge variant="outline" className="bg-accent text-accent-foreground">
                      Bases
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                  <CardDescription>{course.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>📖 Structure modulaire</span>
                    <span>⏱️ À votre rythme</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {!isLoadingCourses && courses.length === 0 && (
        <div className="py-20 text-center text-muted-foreground">
          <p className="text-lg">Aucun cours disponible dans cette catégorie pour le moment.</p>
        </div>
      )}
    </div>
  );
};

export default Courses;
