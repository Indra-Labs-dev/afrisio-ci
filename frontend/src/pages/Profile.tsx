import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { fetchAttempts, fetchDashboard } from "@/api/client";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, LogOut } from "lucide-react";
import { CATEGORY_ICON, DIFFICULTY_LABEL } from "@/api/types";

const Profile = () => {
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const navigate = useNavigate();

  const { data: stats } = useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboard,
    enabled: isAuthenticated,
  });

  const { data: attempts = [], isLoading: attemptsLoading } = useQuery({
    queryKey: ["my-attempts"],
    queryFn: () => fetchAttempts(20),
    enabled: isAuthenticated,
  });

  if (authLoading) {
    return (
      <div className="container flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/connexion" state={{ from: "/profil" }} replace />;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 font-heading text-4xl font-bold">👤 Mon Profil</h1>

        <div className="grid gap-6 md:grid-cols-3">
          {/* User info card */}
          <Card className="md:col-span-1">
            <CardContent className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary text-3xl text-primary-foreground">
                {(user?.full_name ?? user?.username ?? "?").charAt(0).toUpperCase()}
              </div>
              <h2 className="font-heading text-lg font-semibold">
                {user?.full_name ?? user?.username}
              </h2>
              <p className="text-sm text-muted-foreground">@{user?.username}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Membre depuis{" "}
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString("fr-CI", {
                      month: "long",
                      year: "numeric",
                    })
                  : "…"}
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3">
                {[
                  { label: "Quiz", value: stats?.total_quizzes ?? "…" },
                  { label: "Moy.", value: stats ? `${stats.avg_score}%` : "…" },
                  { label: "Points", value: stats?.total_points ?? "…" },
                  { label: "Rang", value: stats ? `#${stats.rank}` : "…" },
                ].map((s) => (
                  <div key={s.label} className="rounded-lg bg-muted p-3">
                    <div className="font-heading text-lg font-bold text-primary">{s.value}</div>
                    <div className="text-xs text-muted-foreground">{s.label}</div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleLogout}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium text-destructive transition hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" />
                Se déconnecter
              </button>
            </CardContent>
          </Card>

          {/* Progress & history */}
          <div className="space-y-6 md:col-span-2">
            {/* Subject progress */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">📊 Progression par matière</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {stats && stats.category_stats.length > 0 ? (
                  stats.category_stats.map((cs) => (
                    <div key={cs.category_name}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span>
                          {CATEGORY_ICON[cs.category_name] ?? "📚"} {cs.category_name}
                        </span>
                        <span className="font-medium text-primary">{cs.avg_percentage}%</span>
                      </div>
                      <Progress value={cs.avg_percentage} className="h-2" />
                    </div>
                  ))
                ) : (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    Aucune donnée — commencez un quiz !
                  </p>
                )}
              </CardContent>
            </Card>

            {/* History */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">📋 Historique des quiz</CardTitle>
              </CardHeader>
              <CardContent>
                {attemptsLoading ? (
                  <div className="flex justify-center py-6">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : attempts.length === 0 ? (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    Aucune tentative complétée.{" "}
                    <Link to="/quiz" className="font-medium text-primary hover:underline">
                      Commencer un quiz
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {attempts.map((r) => {
                      const pct = Math.round(r.attempt.percentage);
                      const date = new Date(r.attempt.completed_at!).toLocaleDateString("fr-CI", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      });
                      return (
                        <Link
                          key={r.attempt.id}
                          to={`/results/${r.attempt.id}`}
                          className="flex items-center gap-3 rounded-lg border px-4 py-3 transition hover:bg-muted"
                        >
                          <span className="text-xl">
                            {CATEGORY_ICON[r.attempt.quiz.category.name] ?? "📚"}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-medium">
                              {r.attempt.quiz.title}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {DIFFICULTY_LABEL[r.attempt.quiz.difficulty]} · {date}
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className={
                              pct >= 80
                                ? "bg-emerald-100 text-emerald-700"
                                : pct >= 50
                                ? "bg-amber-100 text-amber-700"
                                : "bg-red-100 text-red-700"
                            }
                          >
                            {pct}%
                          </Badge>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
