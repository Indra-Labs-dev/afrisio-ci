import { useParams, useNavigate, Link } from "react-router-dom";
import { useAttempt } from "@/hooks/useApi";
import { DashboardLoader } from "@/components/ui/loaders";
import { useAuth } from "@/contexts/AuthContext";
import { addFlashcard } from "@/api/client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { QuestionComments } from "@/components/QuestionComments";
import { Certificate } from "@/components/Certificate";
import { Button } from "@/components/ui/button";
import { Download, Share2, Facebook, Twitter, Trophy, BookOpen } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const Results = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isRandom = id === "random";
  const { data: dbResult, isLoading, isError } = useAttempt(isRandom ? 0 : Number(id));

  const result = isRandom 
    ? (sessionStorage.getItem("random_result") ? JSON.parse(sessionStorage.getItem("random_result") as string) : null)
    : dbResult;

  const flashcardMutation = useMutation({
    mutationFn: addFlashcard,
    onSuccess: () => toast.success("Ajouté aux flashcards avec succès !"),
    onError: () => toast.error("Erreur lors de l'ajout aux flashcards."),
  });

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
        <Button onClick={() => navigate("/quiz")} className="mt-4">
          Retour au catalogue
        </Button>
      </div>
    );
  }

  const { attempt, answers } = result;
  const { quiz } = attempt;
  const percentage = Math.round(attempt.percentage);
  const passed = percentage >= 50;
  const mins = Math.floor(attempt.time_spent_seconds / 60);
  const secs = attempt.time_spent_seconds % 60;

  const downloadPDF = async () => {
    const el = document.getElementById("certificate");
    if (!el) return;
    toast.info("Génération du certificat en cours...");
    try {
      const canvas = await html2canvas(el, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("landscape", "px", [canvas.width, canvas.height]);
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(`Certificat-${quiz.title.replace(/\s+/g, "_")}.pdf`);
      toast.success("Certificat téléchargé !");
    } catch (e) {
      console.error(e);
      toast.error("Erreur lors de la génération du PDF.");
    }
  };

  const copyChallengeLink = () => {
    const url = `${window.location.origin}/quiz/${quiz.id}?challenge=1`;
    navigator.clipboard.writeText(url);
    toast.success("Lien de défi copié dans le presse-papiers !");
  };

  const shareText = `Je viens d'obtenir ${percentage}% sur le quiz "${quiz.title}" sur AfriSio ! Peux-tu faire mieux ?`;
  const shareUrl = `${window.location.origin}/quiz/${quiz.id}`;

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-2xl text-center mb-8">
        <h1 className="mb-2 font-heading text-3xl font-bold">
          {passed ? "Félicitations ! 🎉" : "Continuez vos efforts ! 💪"}
        </h1>
        <p className="text-muted-foreground text-lg">
          Vous avez obtenu <span className="font-semibold text-foreground">{attempt.score}/{attempt.max_score}</span> points.
        </p>
        <p className="mt-1 text-sm text-muted-foreground">⏱️ Temps : {mins}m {secs}s | 📚 {quiz.title}</p>
      </div>

      <div className="mx-auto max-w-3xl">
        {/* Score & Actions */}
        <div className="mb-10 flex flex-col md:flex-row gap-6 p-6 md:p-8 rounded-xl border bg-card text-center md:text-left card-shadow items-center justify-between">
          <div className="flex items-center gap-6">
            <div className={`flex h-28 w-28 shrink-0 items-center justify-center rounded-full text-4xl font-bold ${passed ? "bg-accent text-primary" : "bg-destructive/10 text-destructive"}`}>
              {percentage}%
            </div>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <Button variant="outline" size="sm" asChild>
                  <Link to={isRandom ? "/quiz/generate-random" : `/quiz/${quiz.id}`}>🎯 Recommencer</Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/quiz">📚 Autre quiz</Link>
                </Button>
                <Button variant="outline" size="sm" onClick={() => window.print()} className="print:hidden">
                  🖨️ Imprimer
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 w-full md:w-auto">
            {percentage >= 80 && !isRandom && (
              <Button onClick={downloadPDF} className="w-full bg-emerald-600 hover:bg-emerald-700">
                <Download className="mr-2 h-4 w-4" /> Certificat PDF
              </Button>
            )}
            {!isRandom && (
              <>
                <Button onClick={copyChallengeLink} variant="secondary" className="w-full">
                  <Trophy className="mr-2 h-4 w-4" /> Défier un ami
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" className="w-full" onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`)}>
                    <Twitter className="h-4 w-4 text-[#1DA1F2]" />
                  </Button>
                  <Button variant="outline" size="icon" className="w-full" onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`)}>
                    <Facebook className="h-4 w-4 text-[#4267B2]" />
                  </Button>
                  <Button variant="outline" size="icon" className="w-full" onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`)}>
                    <Share2 className="h-4 w-4 text-[#0077b5]" />
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Hidden PDF content */}
        {percentage >= 80 && !isRandom && (
          <Certificate
            fullName={user?.full_name || user?.username || "Étudiant"}
            quizTitle={quiz.title}
            score={percentage}
            date={new Date(attempt.completed_at || new Date()).toLocaleDateString("fr-CI")}
          />
        )}

        {/* Corrections per question */}
        <h2 className="mb-6 font-heading text-xl font-bold">Corrections détaillées</h2>
        <div className="space-y-6 print:space-y-4 print:text-xs">
          {answers.map((ans, i) => {
            const isCorrect = ans.is_correct;
            return (
              <div key={ans.question_id} className={`rounded-xl border p-6 print:border-none print:p-0 ${isCorrect ? "border-primary/30 bg-accent/30" : "border-destructive/30 bg-destructive/5"}`}>
                <div className="mb-3 flex items-start gap-4">
                  <span className={`mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${isCorrect ? "bg-primary text-primary-foreground" : "bg-destructive text-destructive-foreground"}`}>
                    {isCorrect ? "✓" : "✗"}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-heading font-medium text-lg">Question {i + 1}</h3>
                      {!isCorrect && user && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="print:hidden h-8"
                          onClick={() => flashcardMutation.mutate({ question_id: ans.question_id })}
                          disabled={flashcardMutation.isPending}
                        >
                          <BookOpen className="mr-2 h-3.5 w-3.5" />
                          Ajouter aux flashcards
                        </Button>
                      )}
                    </div>
                    {ans.question_text && <p className="text-foreground mt-2 text-base font-medium">{ans.question_text}</p>}
                  </div>
                </div>

                <div className="ml-12 space-y-3 text-sm">
                  {!isCorrect && ans.selected_option_text && (
                    <div className="rounded-md bg-destructive/10 p-3 text-destructive border border-destructive/20">
                      <span className="font-semibold">Votre réponse :</span> {ans.selected_option_text}
                    </div>
                  )}
                  {!isCorrect && !ans.selected_option_id && (
                    <div className="rounded-md bg-muted p-3 text-muted-foreground italic border">
                      Aucune réponse sélectionnée
                    </div>
                  )}
                  <div className="rounded-md bg-primary/10 p-3 text-primary border border-primary/20">
                      <span className="font-semibold">Bonne réponse :</span> {ans.correct_option_text || `Option #${ans.correct_option_id}`}
                  </div>
                  
                  {ans.explanation && (
                    <div className="mt-4 rounded-md bg-muted/30 p-4 border text-foreground/90">
                      <h4 className="font-semibold mb-1 text-foreground">💡 Explication :</h4>
                      <p className="leading-relaxed">{ans.explanation}</p>
                    </div>
                  )}
                </div>

                {/* Discussions */}
                <div className="ml-12 mt-4 print:hidden">
                  <QuestionComments questionId={ans.question_id} />
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
