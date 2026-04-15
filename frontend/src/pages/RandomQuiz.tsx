import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLoader } from "@/components/ui/loaders";
import type { QuizDetailResponse } from "@/api/types";

const RandomQuiz = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/quizzes/random?count=20")
      .then((res) => {
        if (!res.ok) throw new Error("Impossible de charger les questions");
        return res.json() as Promise<QuizDetailResponse>;
      })
      .then((quiz) => {
        // Start an attempt using the first real quiz's ID as a placeholder
        // We actually launch the quiz via QuizPlay with the quiz data stored in sessionStorage
        sessionStorage.setItem("random_quiz", JSON.stringify(quiz));
        navigate("/quiz/random");
      })
      .catch((e) => setError(e.message));
  }, [navigate]);

  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-6 py-12">
      {error ? (
        <div className="rounded-xl border bg-destructive/10 p-8 text-center">
          <p className="text-lg font-medium text-destructive">{error}</p>
          <button
            onClick={() => navigate("/quiz")}
            className="mt-4 rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground"
          >
            Retour au catalogue
          </button>
        </div>
      ) : (
        <>
          <DashboardLoader />
          <p className="text-center text-muted-foreground animate-pulse">
            🎲 Sélection de 20 questions aléatoires en cours…
          </p>
        </>
      )}
    </div>
  );
};

export default RandomQuiz;
