import { Link, useSearchParams } from "react-router-dom";
import { courses } from "@/data/courseData";
import { categories } from "@/data/quizData";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const levelColors: Record<string, string> = {
  "Débutant": "bg-accent text-accent-foreground",
  "Intermédiaire": "bg-secondary/15 text-secondary",
  "Avancé": "bg-destructive/15 text-destructive",
};

const Courses = () => {
  const [searchParams] = useSearchParams();
  const selectedCategory = searchParams.get("category");

  const filtered = selectedCategory
    ? courses.filter((c) => c.category === selectedCategory)
    : courses;

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
        <Link
          to="/cours"
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            !selectedCategory
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-accent"
          }`}
        >
          Toutes
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            to={`/cours?category=${cat.id}`}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              selectedCategory === cat.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            {cat.icon} {cat.name}
          </Link>
        ))}
      </div>

      {/* Course grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((course) => {
          const cat = categories.find((c) => c.id === course.category);
          return (
            <Link key={course.id} to={`/cours/${course.id}`}>
              <Card className="h-full transition-all hover:card-hover-shadow">
                <CardHeader>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-2xl">{cat?.icon}</span>
                    <Badge variant="outline" className={levelColors[course.level]}>
                      {course.level}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                  <CardDescription>{course.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>📖 {course.lessonsCount} leçons</span>
                    <span>⏱️ {course.duration}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="py-20 text-center text-muted-foreground">
          <p className="text-lg">Aucun cours disponible dans cette catégorie pour le moment.</p>
        </div>
      )}
    </div>
  );
};

export default Courses;
