import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, ArrowLeft, RotateCcw, Trophy } from 'lucide-react';
import { fetchAttempt, type QuizResult, type Question } from '../services/api';

export default function ResultsPage() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadResult();
  }, [attemptId]);

  const loadResult = async () => {
    if (!attemptId) return;
    
    setLoading(true);
    try {
      const data = await fetchAttempt(parseInt(attemptId));
      setResult(data);
    } catch (err) {
      setError('Erreur lors du chargement des résultats');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-500';
    if (percentage >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreMessage = (percentage: number) => {
    if (percentage >= 80) return 'Excellent travail !';
    if (percentage >= 60) return 'Bon résultat !';
    if (percentage >= 40) return 'Continuez vos efforts !';
    return 'Besoin de plus de pratique';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent mb-4"></div>
          <p className="text-gray-600">Chargement des résultats...</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-gray-900 mb-4">{error || 'Résultats non trouvés'}</p>
          <Link to="/quizzes" className="text-orange-500 hover:underline">
            Retour aux quiz
          </Link>
        </div>
      </div>
    );
  }

  const { attempt, answers } = result;
  const correctAnswers = answers.filter(a => a.is_correct).length;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Score Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 rounded-full mb-6">
          <Trophy size={40} className="text-orange-500" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {getScoreMessage(attempt.percentage)}
        </h1>
        <p className="text-gray-600 mb-6">{attempt.quiz.title}</p>
        
        <div className={`text-6xl font-bold ${getScoreColor(attempt.percentage)} mb-2`}>
          {Math.round(attempt.percentage)}%
        </div>
        <p className="text-gray-500">
          {attempt.score} / {attempt.max_score} points
        </p>

        <div className="flex justify-center gap-8 mt-8 pt-8 border-t border-gray-100">
          <div className="text-center">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <CheckCircle size={18} className="text-green-500" />
              <span>Correctes</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{correctAnswers}</div>
          </div>
          <div className="text-center">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <XCircle size={18} className="text-red-500" />
              <span>Incorrectes</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{answers.length - correctAnswers}</div>
          </div>
          <div className="text-center">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <Clock size={18} className="text-blue-500" />
              <span>Temps</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{formatTime(attempt.time_spent_seconds)}</div>
          </div>
        </div>
      </div>

      {/* Detailed Results */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Détail des réponses</h2>
        
        <div className="space-y-4">
          {answers.map((answer, index) => (
            <div
              key={answer.question_id}
              className={`p-4 rounded-xl border-l-4 ${
                answer.is_correct ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 ${answer.is_correct ? 'text-green-500' : 'text-red-500'}`}>
                  {answer.is_correct ? <CheckCircle size={20} /> : <XCircle size={20} />}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 mb-2">
                    Question {index + 1}
                  </p>
                  {!answer.is_correct && (
                    <p className="text-sm text-gray-600">
                      Bonne réponse: Option #{answer.correct_option_id}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap justify-center gap-4">
        <Link
          to={`/quiz/${attempt.quiz_id}`}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-500 text-white font-medium hover:bg-orange-600 transition-colors"
        >
          <RotateCcw size={20} />
          Recommencer
        </Link>
        <Link
          to="/quizzes"
          className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-medium hover:border-orange-500 hover:text-orange-500 transition-colors"
        >
          <ArrowLeft size={20} />
          Autres quiz
        </Link>
        <Link
          to="/dashboard"
          className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-medium hover:border-orange-500 hover:text-orange-500 transition-colors"
        >
          Voir mon tableau de bord
        </Link>
      </div>
    </div>
  );
}
