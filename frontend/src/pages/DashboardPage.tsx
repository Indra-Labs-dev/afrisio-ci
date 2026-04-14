import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Clock, BookOpen, TrendingUp, Calendar, ChevronRight } from 'lucide-react';
import { useQuizStore } from '../store/quizStore';
import { fetchAttempts, type QuizResult } from '../services/api';

export default function DashboardPage() {
  const { results, getTotalQuizzes, getAverageScore, getBestScore, getCategoryStats, addResult } = useQuizStore();
  const [recentAttempts, setRecentAttempts] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAttempts();
  }, []);

  const loadAttempts = async () => {
    try {
      const attempts = await fetchAttempts(10);
      setRecentAttempts(attempts);
      // Add to store if not already there
      attempts.forEach(attempt => {
        if (!results.find(r => r.attempt.id === attempt.attempt.id)) {
          addResult(attempt);
        }
      });
    } catch (error) {
      console.error('Error loading attempts:', error);
    } finally {
      setLoading(false);
    }
  };

  const categoryStats = getCategoryStats();
  const totalQuizzes = getTotalQuizzes();
  const averageScore = getAverageScore();
  const bestScore = getBestScore();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Tableau de bord
        </h1>
        <p className="text-gray-600">
          Suivez votre progression et vos performances
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <BookOpen className="text-blue-500" size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{totalQuizzes}</div>
              <div className="text-sm text-gray-500">Quiz complétés</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Trophy className="text-yellow-500" size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{averageScore}%</div>
              <div className="text-sm text-gray-500">Score moyen</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="text-green-500" size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{bestScore}%</div>
              <div className="text-sm text-gray-500">Meilleur score</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Clock className="text-purple-500" size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {recentAttempts.reduce((acc, r) => acc + r.attempt.time_spent_seconds, 0) > 0
                  ? Math.round(recentAttempts.reduce((acc, r) => acc + r.attempt.time_spent_seconds, 0) / 60)
                  : 0}m
              </div>
              <div className="text-sm text-gray-500">Temps total</div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Stats */}
      {Object.keys(categoryStats).length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Progression par matière</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(categoryStats).map(([category, stats]) => (
              <div key={category} className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{category}</span>
                  <span className="text-sm text-gray-500">{stats.played} quiz</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full transition-all"
                    style={{ width: `${stats.avgScore}%` }}
                  />
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  Score moyen: {stats.avgScore}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Attempts */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Quiz récents</h2>
          <Link to="/quizzes" className="text-orange-500 hover:underline text-sm">
            Voir tous
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-orange-500 border-t-transparent"></div>
          </div>
        ) : recentAttempts.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600 mb-4">Vous n'avez pas encore complété de quiz</p>
            <Link
              to="/quizzes"
              className="inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-orange-600 transition-colors"
            >
              Commencer un quiz
              <ChevronRight size={18} />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {recentAttempts.map((result) => (
              <Link
                key={result.attempt.id}
                to={`/results/${result.attempt.id}`}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    result.attempt.percentage >= 60 ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <span className={`font-bold ${
                      result.attempt.percentage >= 60 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {Math.round(result.attempt.percentage)}%
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{result.attempt.quiz.title}</h3>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {formatDate(result.attempt.completed_at || result.attempt.started_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {formatTime(result.attempt.time_spent_seconds)}
                      </span>
                    </div>
                  </div>
                </div>
                <ChevronRight size={20} className="text-gray-400" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
