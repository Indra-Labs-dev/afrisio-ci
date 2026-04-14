import { useQuery } from "@tanstack/react-query";
import { fetchLeaderboard } from "@/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { CATEGORY_ICON, DIFFICULTY_LABEL } from "@/api/types";

const medalEmoji = ["🥇", "🥈", "🥉"];

const Leaderboard = () => {
  const { data: results = [], isLoading } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: () => fetchLeaderboard(20),
  });

  const entries = results.map((r, i) => ({
    rank: i + 1,
    quizTitle: r.attempt.quiz.title,
    categoryName: r.attempt.quiz.category.name,
    difficulty: r.attempt.quiz.difficulty,
    score: r.attempt.score,
    maxScore: r.attempt.max_score,
    percentage: Math.round(r.attempt.percentage),
    timeSpent: r.attempt.time_spent_seconds,
    completedAt: r.attempt.completed_at,
  }));

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-2 text-center font-heading text-4xl font-bold">🏆 Classement</h1>
        <p className="mb-10 text-center text-muted-foreground">
          Meilleures performances sur la plateforme
        </p>

        {isLoading && (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {!isLoading && entries.length === 0 && (
          <div className="py-20 text-center text-muted-foreground">
            Aucune session complétée pour l'instant. Commencez un quiz !
          </div>
        )}

        {/* Podium */}
        {!isLoading && entries.length >= 3 && (
          <div className="mb-10 flex items-end justify-center gap-4">
            {[1, 0, 2].map((idx) => {
              const e = entries[idx];
              const heights = ["h-32", "h-40", "h-24"];
              const hIdx = idx === 0 ? 1 : idx === 1 ? 0 : 2;
              return (
                <div key={e.rank} className="flex flex-col items-center">
                  <span className="mb-2 text-3xl">{medalEmoji[e.rank - 1]}</span>
                  <div className="mb-1 max-w-[110px] truncate text-center font-heading text-sm font-semibold">
                    {e.quizTitle}
                  </div>
                  <div className="text-xs text-muted-foreground">{e.percentage}%</div>
                  <div
                    className={`mt-2 ${heights[hIdx]} w-20 rounded-t-xl bg-gradient-to-t from-primary/60 to-primary flex items-center justify-center`}
                  >
                    <span className="font-heading text-2xl font-bold text-primary-foreground">
                      {e.rank}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Full list */}
        {!isLoading && entries.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Classement complet</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {entries.map((e) => {
                  const mins = Math.floor(e.timeSpent / 60);
                  const secs = e.timeSpent % 60;
                  return (
                    <div
                      key={`${e.rank}-${e.quizTitle}`}
                      className={`flex items-center gap-4 rounded-lg px-4 py-3 transition-colors ${
                        e.rank <= 3 ? "bg-accent/50" : "hover:bg-muted"
                      }`}
                    >
                      <span className="w-8 text-center font-heading font-bold text-muted-foreground">
                        {e.rank <= 3 ? medalEmoji[e.rank - 1] : `#${e.rank}`}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium">{e.quizTitle}</div>
                        <div className="text-xs text-muted-foreground">
                          {CATEGORY_ICON[e.categoryName] ?? "📚"} {e.categoryName} ·{" "}
                          {DIFFICULTY_LABEL[e.difficulty]} · {mins}m{secs}s
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-accent text-accent-foreground shrink-0">
                        {e.score}/{e.maxScore}
                      </Badge>
                      <span className="shrink-0 font-heading font-bold text-primary">
                        {e.percentage}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
