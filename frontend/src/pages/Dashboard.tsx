import { useQuery } from "@tanstack/react-query";
import { fetchDashboard } from "@/api/client";
import { fetchAttempts } from "@/api/client";
import { useAuth } from "@/contexts/AuthContext";
import { Link, Navigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Target, Trophy, Clock, Star } from "lucide-react";
import { DashboardLoader, ComponentLoader } from "@/components/ui/loaders";
import { CATEGORY_ICON, DIFFICULTY_LABEL } from "@/api/types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from "recharts";

const Dashboard = () => {
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboard,
    enabled: isAuthenticated,
  });

  const { data: attempts = [], isLoading: attemptsLoading } = useQuery({
    queryKey: ["my-attempts"],
    queryFn: () => fetchAttempts(10),
    enabled: isAuthenticated,
  });

  if (authLoading) {
    return (
      <div className="container flex min-h-[60vh] items-center justify-center">
        <DashboardLoader />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/connexion" state={{ from: "/dashboard" }} replace />;

  const isLoading = statsLoading || attemptsLoading;

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold">
            Bonjour, {user?.full_name ?? user?.username} 👋
          </h1>
          <p className="mt-1 text-muted-foreground">
            Voici votre tableau de bord de préparation
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <DashboardLoader />
          </div>
        ) : (
          <>
            {/* Stats cards */}
            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: <Target className="h-5 w-5" />,
                  label: "Quiz complétés",
                  value: stats?.total_quizzes ?? 0,
                  sub: "au total",
                },
                {
                  icon: <Star className="h-5 w-5" />,
                  label: "Score moyen",
                  value: `${stats?.avg_score ?? 0}%`,
                  sub: "de réussite",
                },
                {
                  icon: <Trophy className="h-5 w-5" />,
                  label: "Meilleur score",
                  value: `${stats?.best_score ?? 0}%`,
                  sub: "record personnel",
                },
                {
                  icon: <Clock className="h-5 w-5" />,
                  label: "Classement",
                  value: stats?.rank ? `#${stats.rank}` : "—",
                  sub: "parmi les joueurs",
                },
              ].map((s) => (
                <Card key={s.label}>
                  <CardContent className="p-6">
                    <div className="mb-3 flex items-center gap-2 text-muted-foreground">
                      {s.icon}
                      <span className="text-sm">{s.label}</span>
                    </div>
                    <div className="font-heading text-3xl font-bold text-primary">{s.value}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{s.sub}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Progress by category */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">📊 Progression par matière</CardTitle>
                </CardHeader>
                <CardContent>
                  {stats && stats.category_stats.length > 0 ? (
                    <div className="h-[300px] w-full mt-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={stats.category_stats}
                          margin={{ top: 5, right: 20, left: -20, bottom: 25 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                          <XAxis 
                            dataKey="category_name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.7 }}
                            dy={10}
                            angle={-25}
                            textAnchor="end"
                          />
                          <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            domain={[0, 100]} 
                            tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.7 }} 
                          />
                          <RechartsTooltip 
                            cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                            contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', color: '#000' }}
                            formatter={(value: number) => [`${value}%`, 'Score Moyen']}
                          />
                          <Bar 
                            dataKey="avg_percentage" 
                            radius={[6, 6, 0, 0]}
                            maxBarSize={40}
                          >
                            {
                              stats.category_stats.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.avg_percentage >= 70 ? 'hsl(var(--primary))' : entry.avg_percentage >= 50 ? '#f59e0b' : '#ef4444'} />
                              ))
                            }
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-sm text-muted-foreground">
                      Complétez des quiz pour voir votre progression !
                      <br />
                      <Link
                        to="/quiz"
                        className="mt-3 inline-block rounded-lg bg-primary px-4 py-2 text-primary-foreground"
                      >
                        Commencer
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent history */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">📋 Dernières sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  {attempts.length === 0 ? (
                    <div className="py-8 text-center text-sm text-muted-foreground">
                      Aucune session pour l'instant
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {attempts.map((r) => {
                        const pct = Math.round(r.attempt.percentage);
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
                                {DIFFICULTY_LABEL[r.attempt.quiz.difficulty]} ·{" "}
                                {new Date(r.attempt.completed_at!).toLocaleDateString("fr-CI")}
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
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
