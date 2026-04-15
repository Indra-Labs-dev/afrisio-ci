import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAttempts, fetchDashboard, getToken } from "@/api/client";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LogOut, Camera, Shield } from "lucide-react";
import { CATEGORY_ICON, DIFFICULTY_LABEL } from "@/api/types";
import { DashboardLoader, ComponentLoader, Spinner } from "@/components/ui/loaders";
import { useState, useRef } from "react";

interface UserBadge {
  badge: { id: number; name: string; description: string; icon: string };
  awarded_at: string;
}

const XPBar = ({ xp, level }: { xp: number; level: number }) => {
  const thresholds = [0, 100, 250, 500, 1000];
  const currentMin = thresholds[Math.min(level - 1, thresholds.length - 1)] ?? 0;
  const nextMin = thresholds[Math.min(level, thresholds.length - 1)] ?? currentMin + 500;
  const progress = nextMin > currentMin ? Math.min(((xp - currentMin) / (nextMin - currentMin)) * 100, 100) : 100;

  return (
    <div className="mt-3">
      <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
        <span>Niveau {level}</span>
        <span>{xp} XP</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-700"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-1 text-right text-xs text-muted-foreground">
        {nextMin > xp ? `${nextMin - xp} XP jusqu'au niveau ${level + 1}` : "Niveau max !"}
      </p>
    </div>
  );
};

const Profile = () => {
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarLoading, setAvatarLoading] = useState(false);

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

  const { data: badges = [] } = useQuery<UserBadge[]>({
    queryKey: ["my-badges"],
    queryFn: async () => {
      const token = getToken();
      const res = await fetch("/api/profile/badges", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: isAuthenticated,
  });

  if (authLoading) {
    return (
      <div className="container flex min-h-[60vh] items-center justify-center">
        <DashboardLoader />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/connexion" state={{ from: "/profil" }} replace />;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500_000) {
      alert("Image trop grande (max 500 Ko)");
      return;
    }
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string;
      setAvatarLoading(true);
      try {
        const token = getToken();
        const res = await fetch("/api/profile/avatar", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ avatar_url: dataUrl }),
        });
        if (res.ok) {
          queryClient.invalidateQueries({ queryKey: ["me"] });
          // Force page refresh to reflect avatar
          window.location.reload();
        }
      } finally {
        setAvatarLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 font-heading text-4xl font-bold">👤 Mon Profil</h1>

        <div className="grid gap-6 md:grid-cols-3">
          {/* User info card */}
          <Card className="md:col-span-1">
            <CardContent className="p-6 text-center">
              {/* Avatar */}
              <div className="relative mx-auto mb-4 h-24 w-24">
                <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-primary/20">
                  {user?.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt="Avatar"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-primary text-4xl font-bold text-primary-foreground">
                      {(user?.full_name ?? user?.username ?? "?").charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={avatarLoading}
                  className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-white shadow-md transition hover:opacity-90 disabled:opacity-50"
                  title="Changer l'avatar"
                >
                  {avatarLoading ? <Spinner size="sm" variant="white" /> : <Camera className="h-4 w-4" />}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
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

              {/* XP Bar */}
              <XPBar xp={user?.xp ?? 0} level={user?.level ?? 1} />

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

              {user?.is_superuser && (
                <Link
                  to="/admin"
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-primary/30 px-4 py-2 text-sm font-medium text-primary transition hover:bg-primary/10"
                >
                  <Shield className="h-4 w-4" />
                  Administration
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium text-destructive transition hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" />
                Se déconnecter
              </button>
            </CardContent>
          </Card>

          {/* Right column */}
          <div className="space-y-6 md:col-span-2">
            {/* Badges */}
            {badges.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">🏅 Mes Badges</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    {badges.map((ub) => (
                      <div
                        key={ub.badge.id}
                        title={ub.badge.description}
                        className="group flex flex-col items-center gap-1 rounded-xl border bg-muted/40 p-3 text-center transition hover:bg-accent hover:border-primary/30"
                      >
                        <span className="text-2xl">{ub.badge.icon}</span>
                        <span className="text-xs font-medium">{ub.badge.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

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
                  <div className="py-6">
                    <ComponentLoader />
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
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                : pct >= 50
                                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
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
