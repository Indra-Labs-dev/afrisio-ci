import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const leaderboardData = [
  { rank: 1, name: "Kouadio Aya", score: 2850, quizzes: 45, avgScore: 92 },
  { rank: 2, name: "Traoré Ibrahim", score: 2720, quizzes: 42, avgScore: 89 },
  { rank: 3, name: "Koné Mariam", score: 2580, quizzes: 38, avgScore: 87 },
  { rank: 4, name: "N'Guessan Jean", score: 2340, quizzes: 35, avgScore: 85 },
  { rank: 5, name: "Bamba Fatou", score: 2210, quizzes: 33, avgScore: 84 },
  { rank: 6, name: "Coulibaly Seydou", score: 2050, quizzes: 30, avgScore: 82 },
  { rank: 7, name: "Dembélé Aminata", score: 1920, quizzes: 28, avgScore: 80 },
  { rank: 8, name: "Yao Christelle", score: 1800, quizzes: 26, avgScore: 78 },
  { rank: 9, name: "Diallo Moussa", score: 1650, quizzes: 24, avgScore: 76 },
  { rank: 10, name: "Touré Adama", score: 1500, quizzes: 22, avgScore: 74 },
];

const medalEmoji = ["🥇", "🥈", "🥉"];

const Leaderboard = () => (
  <div className="container py-12">
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-2 text-center font-heading text-4xl font-bold">🏆 Classement</h1>
      <p className="mb-10 text-center text-muted-foreground">
        Les meilleurs étudiants de la plateforme
      </p>

      {/* Podium */}
      <div className="mb-10 flex items-end justify-center gap-4">
        {[1, 0, 2].map((idx) => {
          const user = leaderboardData[idx];
          const heights = ["h-32", "h-40", "h-24"];
          const heightIdx = idx === 0 ? 1 : idx === 1 ? 0 : 2;
          return (
            <div key={user.rank} className="flex flex-col items-center">
              <span className="mb-2 text-3xl">{medalEmoji[user.rank - 1]}</span>
              <div className="mb-1 font-heading text-sm font-semibold">{user.name}</div>
              <div className="text-xs text-muted-foreground">{user.score} pts</div>
              <div
                className={`mt-2 ${heights[heightIdx]} w-20 rounded-t-xl bg-gradient-to-t from-primary/60 to-primary flex items-center justify-center`}
              >
                <span className="font-heading text-2xl font-bold text-primary-foreground">
                  {user.rank}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Classement complet</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {leaderboardData.map((user) => (
              <div
                key={user.rank}
                className={`flex items-center gap-4 rounded-lg px-4 py-3 transition-colors ${
                  user.rank <= 3 ? "bg-accent/50" : "hover:bg-muted"
                }`}
              >
                <span className="w-8 text-center font-heading font-bold text-muted-foreground">
                  {user.rank <= 3 ? medalEmoji[user.rank - 1] : `#${user.rank}`}
                </span>
                <div className="flex-1">
                  <div className="font-medium">{user.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {user.quizzes} quiz complétés
                  </div>
                </div>
                <Badge variant="outline" className="bg-accent text-accent-foreground">
                  Moy. {user.avgScore}%
                </Badge>
                <span className="font-heading font-bold text-primary">{user.score} pts</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

export default Leaderboard;
