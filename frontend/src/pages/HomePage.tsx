import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, Award, BarChart2, ArrowRight } from 'lucide-react';
import { useQuizStore } from '../store/quizStore';
import { fetchCategories, fetchQuizzes } from '../services/api';

export default function HomePage() {
  const { categories, setCategories, setQuizzes, getTotalQuizzes, getAverageScore } = useQuizStore();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [cats, quizzes] = await Promise.all([
        fetchCategories(),
        fetchQuizzes()
      ]);
      setCategories(cats);
      setQuizzes(quizzes);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const features = [
    { icon: BookOpen, title: 'Quiz Interactifs', desc: 'Des QCM variés pour tester vos connaissances' },
    { icon: Clock, title: 'Mode Chronométré', desc: 'Entraînez-vous dans des conditions réelles' },
    { icon: Award, title: 'Corrections Détaillées', desc: 'Apprenez de vos erreurs avec des explications' },
    { icon: BarChart2, title: 'Suivi de Progression', desc: 'Visualisez votre évolution au fil du temps' },
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-16">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Préparez-vous aux{' '}
          <span className="text-orange-500">concours ivoiriens</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          AfriSio CI est votre plateforme de référence pour vous entraîner efficacement 
          aux examens et concours en Côte d'Ivoire.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            to="/quizzes"
            className="inline-flex items-center gap-2 bg-orange-500 text-white px-8 py-4 rounded-xl font-semibold hover:bg-orange-600 transition-colors"
          >
            Commencer un quiz
            <ArrowRight size={20} />
          </Link>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 bg-white text-gray-700 border-2 border-gray-200 px-8 py-4 rounded-xl font-semibold hover:border-orange-500 hover:text-orange-500 transition-colors"
          >
            Voir mes stats
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
          <div className="text-4xl font-bold text-orange-500 mb-2">{categories.length}</div>
          <div className="text-gray-600">Catégories</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
          <div className="text-4xl font-bold text-orange-500 mb-2">{getTotalQuizzes()}</div>
          <div className="text-gray-600">Quiz Complétés</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
          <div className="text-4xl font-bold text-orange-500 mb-2">{getAverageScore()}%</div>
          <div className="text-gray-600">Score Moyen</div>
        </div>
      </section>

      {/* Features Section */}
      <section>
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Pourquoi choisir AfriSio CI ?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                <feature.icon className="text-orange-500" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories Preview */}
      <section>
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Matières disponibles
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/quizzes?category=${cat.id}`}
              className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center hover:border-orange-500 hover:shadow-md transition-all"
            >
              <div className="text-lg font-medium text-gray-900">{cat.name}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-3xl p-12 text-center text-white">
        <h2 className="text-3xl font-bold mb-4">Prêt à vous lancer ?</h2>
        <p className="text-xl mb-8 opacity-90">
          Commencez dès maintenant et améliorez vos chances de réussite
        </p>
        <Link
          to="/quizzes"
          className="inline-flex items-center gap-2 bg-white text-orange-500 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
        >
          Voir tous les quiz
          <ArrowRight size={20} />
        </Link>
      </section>
    </div>
  );
}
