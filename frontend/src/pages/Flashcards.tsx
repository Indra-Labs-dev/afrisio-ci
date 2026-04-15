import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchFlashcards, deleteFlashcard } from "@/api/client";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { DashboardLoader } from "@/components/ui/loaders";
import { useState } from "react";
import { Trash2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const Flashcards = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [flipped, setFlipped] = useState<Record<number, boolean>>({});

  const { data: flashcards = [], isLoading } = useQuery({
    queryKey: ["flashcards"],
    queryFn: fetchFlashcards,
    enabled: isAuthenticated,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteFlashcard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flashcards"] });
      toast.success("Carte supprimée avec succès");
    },
  });

  if (authLoading) return <div className="container py-20"><DashboardLoader /></div>;
  if (!isAuthenticated) return <Navigate to="/connexion" state={{ from: "/flashcards" }} replace />;

  const toggleFlip = (id: number) => {
    setFlipped((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold">Vos Flashcards</h1>
            <p className="mt-1 text-muted-foreground">
              Révisez les questions qui vous ont posé problème.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <DashboardLoader />
          </div>
        ) : flashcards.length === 0 ? (
          <div className="rounded-xl border border-dashed py-20 text-center">
            <h2 className="text-xl font-medium text-muted-foreground">Aucune flashcard pour le moment</h2>
            <p className="mt-2 text-sm text-muted-foreground/80">
              Vous pouvez ajouter des flashcards depuis la page de correction d'un quiz.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
            {flashcards.map((f) => {
              const q = f.question;
              const isFlipped = flipped[f.id];
              const correctOption = q.options.find((o) => o.is_correct);

              return (
                <div key={f.id} className="group relative min-h-[250px] [perspective:1000px]">
                  <div
                    onClick={() => toggleFlip(f.id)}
                    className={`absolute h-full w-full cursor-pointer transition-all duration-500 [transform-style:preserve-3d] ${
                      isFlipped ? "[transform:rotateY(180deg)]" : ""
                    }`}
                  >
                    {/* Front */}
                    <div className="absolute inset-0 backface-hidden rounded-xl border bg-card p-6 shadow-sm flex flex-col items-center justify-center text-center">
                      <div className="mb-4 text-primary">
                        <RotateCcw className="mx-auto mb-2 h-6 w-6 opacity-50" />
                        <span className="text-xs font-semibold uppercase tracking-wider opacity-80">
                          Appuyez pour révéler
                        </span>
                      </div>
                      <h3 className="text-lg font-medium">{q.question_text}</h3>
                    </div>

                    {/* Back */}
                    <div className="absolute inset-0 backface-hidden rounded-xl border bg-primary/10 p-6 shadow-sm [transform:rotateY(180deg)] flex flex-col justify-center">
                      <div className="space-y-4">
                        <div>
                          <span className="text-xs font-semibold uppercase text-muted-foreground">
                            Bonne réponse
                          </span>
                          <div className="mt-1 font-medium text-primary">
                            {correctOption?.option_text || "Non spécifiée"}
                          </div>
                        </div>
                        {q.explanation && (
                          <div>
                            <span className="text-xs font-semibold uppercase text-muted-foreground">
                              Explication
                            </span>
                            <p className="mt-1 text-sm leading-relaxed text-foreground/90">
                              {q.explanation}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="absolute bottom-4 right-4" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => deleteMutation.mutate(f.id)}
                          title="Supprimer la flashcard"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Flashcards;
