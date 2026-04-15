import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useCourse } from "@/hooks/useApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { DashboardLoader } from "@/components/ui/loaders";
import ReactMarkdown from "react-markdown";

const CourseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: course, isLoading, isError } = useCourse(Number(id));
  const [activeLesson, setActiveLesson] = useState(0);

  if (isLoading) {
    return (
      <div className="container flex min-h-[60vh] items-center justify-center py-12">
        <DashboardLoader />
      </div>
    );
  }

  if (isError || !course) {
    return (
      <div className="container py-20 text-center">
        <h1 className="font-heading text-2xl font-bold">Cours introuvable</h1>
        <Link to="/cours" className="mt-4 inline-block text-primary hover:underline">
          ← Retour aux cours
        </Link>
      </div>
    );
  }

  const cat = course.category;
  const lesson = course.lessons[activeLesson];

  return (
    <div className="container py-8">
      <Link to="/cours" className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        ← Retour aux cours
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Sidebar - Lessons list */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{cat?.icon}</span>
                <Badge variant="outline">Bases</Badge>
              </div>
              <CardTitle className="text-xl">{course.title}</CardTitle>
              <p className="text-sm text-muted-foreground">{course.description}</p>
            </CardHeader>
            <CardContent className="space-y-1">
              {course.lessons.map((l, i) => (
                <button
                  key={l.id}
                  onClick={() => setActiveLesson(i)}
                  className={`w-full rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors ${
                    i === activeLesson
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent"
                  }`}
                >
                  <span className="mr-2 text-xs opacity-70">Leçon {i + 1}</span>
                  <br />
                  {l.title}
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {lesson ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl font-heading text-primary">{lesson.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Markdown Content rendered nicely */}
                <div className="prose prose-blue max-w-none text-foreground/90">
                  <ReactMarkdown>{lesson.content}</ReactMarkdown>
                </div>

                {/* Navigation */}
                <div className="flex justify-between pt-4 mt-8 border-t">
                  <Button
                    variant="outline"
                    disabled={activeLesson === 0}
                    onClick={() => setActiveLesson((p) => p - 1)}
                  >
                    ← Précédent
                  </Button>
                  <Button
                    disabled={activeLesson === course.lessons.length - 1}
                    onClick={() => setActiveLesson((p) => p + 1)}
                  >
                    Suivant →
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="py-20 text-center text-muted-foreground">
              Aucune leçon trouvée pour ce cours.
            </div>
          )}

          {/* FAQ / Additional info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">❓ Questions fréquentes</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible>
                <AccordionItem value="q1">
                  <AccordionTrigger>Comment bien réviser ce chapitre ?</AccordionTrigger>
                  <AccordionContent>
                    Lisez d'abord le contenu, puis concentrez-vous sur les points clés. Testez vos connaissances avec les quiz associés à cette matière.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="q2">
                  <AccordionTrigger>Y a-t-il un quiz associé ?</AccordionTrigger>
                  <AccordionContent>
                    Oui ! Rendez-vous dans la section Quiz pour trouver des exercices dans la catégorie {cat?.name}.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
