import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const mockUser = {
  name: "Kouamé Serge",
  email: "serge.kouame@email.com",
  joinDate: "Janvier 2025",
  totalQuizzes: 18,
  avgScore: 76,
  totalPoints: 1420,
  rank: 15,
};

const historyData = [
  { quiz: "Culture Générale - Côte d'Ivoire", score: 80, date: "12 Avr 2026", category: "🌍" },
  { quiz: "Mathématiques - Niveau BAC", score: 60, date: "10 Avr 2026", category: "📐" },
  { quiz: "Français - Grammaire", score: 100, date: "8 Avr 2026", category: "📖" },
  { quiz: "Économie générale", score: 70, date: "5 Avr 2026", category: "📈" },
  { quiz: "Culture Générale - Afrique", score: 85, date: "2 Avr 2026", category: "🌍" },
];

const subjectProgress = [
  { name: "Culture Générale", progress: 82, icon: "🌍" },
  { name: "Mathématiques", progress: 60, icon: "📐" },
  { name: "Français", progress: 90, icon: "📖" },
  { name: "Économie", progress: 45, icon: "📈" },
  { name: "Sciences", progress: 30, icon: "🔬" },
];

const Profile = () => (
  <div className="container py-12">
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-8 font-heading text-4xl font-bold">👤 Mon Profil</h1>

      <div className="grid gap-6 md:grid-cols-3">
        {/* User info */}
        <Card className="md:col-span-1">
          <CardContent className="p-6 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary text-3xl text-primary-foreground">
              {mockUser.name.charAt(0)}
            </div>
            <h2 className="font-heading text-lg font-semibold">{mockUser.name}</h2>
            <p className="text-sm text-muted-foreground">{mockUser.email}</p>
            <p className="mt-1 text-xs text-muted-foreground">Membre depuis {mockUser.joinDate}</p>

            <div className="mt-6 grid grid-cols-2 gap-4">
              {[
                { label: "Quiz", value: mockUser.totalQuizzes },
                { label: "Moy.", value: `${mockUser.avgScore}%` },
                { label: "Points", value: mockUser.totalPoints },
                { label: "Rang", value: `#${mockUser.rank}` },
              ].map((s) => (
                <div key={s.label} className="rounded-lg bg-muted p-3">
                  <div className="font-heading text-lg font-bold text-primary">{s.value}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
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
              {subjectProgress.map((s) => (
                <div key={s.name}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span>
                      {s.icon} {s.name}
                    </span>
                    <span className="font-medium text-primary">{s.progress}%</span>
                  </div>
                  <Progress value={s.progress} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">📋 Historique des quiz</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {historyData.map((h, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-lg border px-4 py-3"
                  >
                    <span className="text-xl">{h.category}</span>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{h.quiz}</div>
                      <div className="text-xs text-muted-foreground">{h.date}</div>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        h.score >= 80
                          ? "bg-accent text-accent-foreground"
                          : h.score >= 60
                          ? "bg-secondary/15 text-secondary"
                          : "bg-destructive/15 text-destructive"
                      }
                    >
                      {h.score}%
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  </div>
);

export default Profile;
