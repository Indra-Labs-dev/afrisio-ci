import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getToken } from "@/api/client";
import { DashboardLoader, Spinner } from "@/components/ui/loaders";
import { Shield, Plus, Trash2, BookOpen, Users, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AdminUser {
  id: number;
  username: string;
  email: string;
  xp: number;
  level: number;
  is_superuser: boolean;
  created_at: string;
}

interface AdminQuiz {
  id: number;
  title: string;
  difficulty: string;
  question_count: number;
  is_active: boolean;
  category: { name: string; icon: string };
}

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "bg-emerald-100 text-emerald-700",
  medium: "bg-amber-100 text-amber-700",
  hard: "bg-red-100 text-red-700",
};

const AdminPanel = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"quizzes" | "users">("quizzes");
  const [deleting, setDeleting] = useState<number | null>(null);

  const authHeader = () => {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const { data: quizzes = [], isLoading: quizzesLoading, refetch: refetchQuizzes } = useQuery<AdminQuiz[]>({
    queryKey: ["admin-quizzes"],
    queryFn: async () => {
      const res = await fetch("/api/quizzes", { headers: authHeader() });
      return res.json();
    },
    enabled: isAuthenticated && user?.is_superuser,
  });

  const { data: users = [], isLoading: usersLoading } = useQuery<AdminUser[]>({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const res = await fetch("/api/admin/users", { headers: authHeader() });
      return res.json();
    },
    enabled: isAuthenticated && user?.is_superuser,
  });

  const deleteQuiz = async (id: number) => {
    if (!confirm("Supprimer ce quiz ?")) return;
    setDeleting(id);
    try {
      await fetch(`/api/admin/quizzes/${id}`, {
        method: "DELETE",
        headers: authHeader(),
      });
      queryClient.invalidateQueries({ queryKey: ["admin-quizzes"] });
    } finally {
      setDeleting(null);
    }
  };

  if (authLoading) {
    return (
      <div className="container flex min-h-[60vh] items-center justify-center">
        <DashboardLoader />
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/connexion" replace />;
  if (!user?.is_superuser) return <Navigate to="/" replace />;

  const tabs = [
    { id: "quizzes" as const, label: "Quiz", icon: <BookOpen className="h-4 w-4" /> },
    { id: "users" as const, label: "Utilisateurs", icon: <Users className="h-4 w-4" /> },
  ];

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-heading text-3xl font-bold">Panneau d'administration</h1>
            <p className="text-muted-foreground">Gérez les quiz, cours et utilisateurs</p>
          </div>
        </div>

        {/* Stats cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          {[
            { label: "Quiz actifs", value: quizzes.filter((q) => q.is_active).length, icon: "📝" },
            { label: "Utilisateurs", value: users.length, icon: "👤" },
            { label: "Admins", value: users.filter((u) => u.is_superuser).length, icon: "🛡️" },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{stat.icon}</span>
                  <div>
                    <div className="font-heading text-2xl font-bold text-primary">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 border-b-2 px-4 pb-3 text-sm font-medium transition-colors ${
                activeTab === t.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* Quizzes tab */}
        {activeTab === "quizzes" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Liste des quiz</CardTitle>
              <button
                onClick={() => refetchQuizzes()}
                className="flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm transition hover:bg-muted"
              >
                <RefreshCw className="h-4 w-4" /> Actualiser
              </button>
            </CardHeader>
            <CardContent>
              {quizzesLoading ? (
                <div className="py-12"><DashboardLoader /></div>
              ) : (
                <div className="space-y-3">
                  {quizzes.map((quiz) => (
                    <div
                      key={quiz.id}
                      className="flex items-center gap-4 rounded-xl border p-4 transition hover:bg-muted/50"
                    >
                      <span className="shrink-0 text-2xl">{quiz.category?.icon ?? "📝"}</span>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium">{quiz.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {quiz.category?.name} · {quiz.question_count} questions
                        </div>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          DIFFICULTY_COLORS[quiz.difficulty] ?? "bg-muted text-muted-foreground"
                        }`}
                      >
                        {quiz.difficulty}
                      </span>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${
                          quiz.is_active ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {quiz.is_active ? "Actif" : "Inactif"}
                      </span>
                      <button
                        onClick={() => deleteQuiz(quiz.id)}
                        disabled={deleting === quiz.id}
                        className="shrink-0 rounded-lg p-2 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive disabled:opacity-40"
                        title="Désactiver le quiz"
                      >
                        {deleting === quiz.id ? (
                          <Spinner size="sm" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Users tab */}
        {activeTab === "users" && (
          <Card>
            <CardHeader>
              <CardTitle>Utilisateurs inscrits</CardTitle>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="py-12"><DashboardLoader /></div>
              ) : (
                <div className="space-y-2">
                  {users.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center gap-4 rounded-xl border p-3 transition hover:bg-muted/50"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-heading font-bold text-primary">
                        {u.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium">{u.username}</div>
                        <div className="text-xs text-muted-foreground">{u.email}</div>
                      </div>
                      <div className="text-right text-xs text-muted-foreground">
                        <div className="font-medium text-primary">Niv. {u.level}</div>
                        <div>{u.xp} XP</div>
                      </div>
                      {u.is_superuser && (
                        <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          Admin
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
