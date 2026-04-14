import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { useQuizStore } from '../store/quizStore';
import { startQuiz, submitQuiz, type Question } from '../services/api';

export default function QuizPage() {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const { activeSession, currentQuestionIndex, startQuiz: startQuizStore, answerQuestion, nextQuestion, prevQuestion, finishQuiz, updateTimeSpent } = useQuizStore();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load quiz
  useEffect(() => {
    loadQuiz();
  }, [quizId]);

  // Timer
  useEffect(() => {
    if (!activeSession || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeSession, timeLeft]);

  // Update time spent in store
  useEffect(() => {
    if (activeSession) {
      const elapsed = activeSession.quiz.duration_minutes * 60 - timeLeft;
      updateTimeSpent(elapsed);
    }
  }, [timeLeft]);

  const loadQuiz = async () => {
    if (!quizId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await startQuiz(parseInt(quizId));
      startQuizStore(response.attempt_id, response.quiz, response.quiz.questions);
      setTimeLeft(response.quiz.duration_minutes * 60);
    } catch (err) {
      setError('Erreur lors du chargement du quiz. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (questionId: number, optionId: number) => {
    answerQuestion(questionId, optionId);
  };

  const handleSubmit = useCallback(async () => {
    if (!activeSession || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const answers = Object.entries(activeSession.answers).map(([questionId, optionId]) => ({
        question_id: parseInt(questionId),
        selected_option_id: optionId,
      }));

      // Add unanswered questions as null
      activeSession.questions.forEach((q) => {
        if (!(q.id in activeSession.answers)) {
          answers.push({
            question_id: q.id,
            selected_option_id: null,
          });
        }
      });

      const result = await submitQuiz({
        attempt_id: activeSession.attemptId,
        answers,
        time_spent_seconds: activeSession.quiz.duration_minutes * 60 - timeLeft,
      });

      finishQuiz(result);
      navigate(`/results/${result.attempt.id}`);
    } catch (err) {
      setError('Erreur lors de la soumission. Veuillez réessayer.');
      setIsSubmitting(false);
    }
  }, [activeSession, isSubmitting, timeLeft, finishQuiz, navigate]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentQuestion = (): Question | null => {
    if (!activeSession) return null;
    return activeSession.questions[currentQuestionIndex] || null;
  };

  const currentQuestion = getCurrentQuestion();
  const progress = activeSession 
    ? ((currentQuestionIndex + 1) / activeSession.questions.length) * 100 
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent mb-4"></div>
          <p className="text-gray-600">Chargement du quiz...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
          <p className="text-gray-900 mb-4">{error}</p>
          <button
            onClick={loadQuiz}
            className="bg-orange-500 text-white px-6 py-2 rounded-xl hover:bg-orange-600 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!activeSession || !currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Quiz non trouvé</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">{activeSession.quiz.title}</h1>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${timeLeft < 60 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
            <Clock size={20} />
            <span className="font-mono font-bold text-lg">{formatTime(timeLeft)}</span>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-orange-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-sm text-gray-500">
          <span>Question {currentQuestionIndex + 1} sur {activeSession.questions.length}</span>
          <span>{Math.round(progress)}% complété</span>
        </div>
      </div>

      {/* Question */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-xl font-medium text-gray-900 mb-6">
          {currentQuestion.question_text}
        </h2>

        <div className="space-y-3">
          {currentQuestion.options.map((option) => (
            <button
              key={option.id}
              onClick={() => handleAnswer(currentQuestion.id, option.id)}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                activeSession.answers[currentQuestion.id] === option.id
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-orange-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  activeSession.answers[currentQuestion.id] === option.id
                    ? 'border-orange-500 bg-orange-500'
                    : 'border-gray-300'
                }`}>
                  {activeSession.answers[currentQuestion.id] === option.id && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
                <span className="text-gray-700">{option.option_text}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevQuestion}
          disabled={currentQuestionIndex === 0}
          className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:border-orange-500 hover:text-orange-500 transition-colors"
        >
          <ChevronLeft size={20} />
          Précédent
        </button>

        {currentQuestionIndex === activeSession.questions.length - 1 ? (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-orange-500 text-white font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Soumission...' : 'Terminer'}
          </button>
        ) : (
          <button
            onClick={nextQuestion}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-500 text-white font-medium hover:bg-orange-600 transition-colors"
          >
            Suivant
            <ChevronRight size={20} />
          </button>
        )}
      </div>
    </div>
  );
}
