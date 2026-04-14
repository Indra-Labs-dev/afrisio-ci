export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  title: string;
  category: string;
  difficulty: "Facile" | "Moyen" | "Difficile";
  questionCount: number;
  duration: number; // minutes
  description: string;
  questions: Question[];
}

export const categories = [
  { id: "culture-generale", name: "Culture Générale", icon: "🌍", color: "bg-secondary" },
  { id: "mathematiques", name: "Mathématiques", icon: "📐", color: "bg-primary" },
  { id: "francais", name: "Français", icon: "📖", color: "bg-secondary" },
  { id: "sciences", name: "Sciences", icon: "🔬", color: "bg-primary" },
  { id: "economie", name: "Économie", icon: "📈", color: "bg-secondary" },
  { id: "informatique", name: "Informatique", icon: "💻", color: "bg-primary" },
];

export const quizzes: Quiz[] = [
  {
    id: "cg-1",
    title: "Culture Générale - Côte d'Ivoire",
    category: "culture-generale",
    difficulty: "Moyen",
    questionCount: 5,
    duration: 10,
    description: "Testez vos connaissances sur la Côte d'Ivoire",
    questions: [
      {
        id: "q1", text: "Quelle est la capitale politique de la Côte d'Ivoire ?",
        options: ["Abidjan", "Yamoussoukro", "Bouaké", "San-Pédro"],
        correctAnswer: 1, explanation: "Yamoussoukro est la capitale politique depuis 1983."
      },
      {
        id: "q2", text: "En quelle année la Côte d'Ivoire a-t-elle obtenu son indépendance ?",
        options: ["1958", "1960", "1962", "1956"],
        correctAnswer: 1, explanation: "La Côte d'Ivoire a obtenu son indépendance le 7 août 1960."
      },
      {
        id: "q3", text: "Quel est le premier président de la Côte d'Ivoire ?",
        options: ["Laurent Gbagbo", "Henri Konan Bédié", "Félix Houphouët-Boigny", "Alassane Ouattara"],
        correctAnswer: 2, explanation: "Félix Houphouët-Boigny fut le premier président de 1960 à 1993."
      },
      {
        id: "q4", text: "Quelle est la monnaie utilisée en Côte d'Ivoire ?",
        options: ["Le Cedi", "Le Franc CFA", "Le Naira", "Le Shilling"],
        correctAnswer: 1, explanation: "Le Franc CFA (XOF) est la monnaie officielle."
      },
      {
        id: "q5", text: "Quel fleuve traverse Abidjan ?",
        options: ["Le Niger", "La Comoé", "Le Bandama", "La lagune Ébrié"],
        correctAnswer: 3, explanation: "La lagune Ébrié traverse Abidjan et sépare la ville en deux parties."
      },
    ],
  },
  {
    id: "math-1",
    title: "Mathématiques - Niveau BAC",
    category: "mathematiques",
    difficulty: "Difficile",
    questionCount: 5,
    duration: 15,
    description: "Exercices de mathématiques niveau Baccalauréat",
    questions: [
      {
        id: "m1", text: "Quelle est la dérivée de f(x) = 3x² + 2x - 5 ?",
        options: ["6x + 2", "3x + 2", "6x² + 2", "6x - 5"],
        correctAnswer: 0, explanation: "f'(x) = 6x + 2 en appliquant les règles de dérivation."
      },
      {
        id: "m2", text: "Résoudre : 2x + 6 = 0",
        options: ["x = 3", "x = -3", "x = 6", "x = -6"],
        correctAnswer: 1, explanation: "2x = -6, donc x = -3."
      },
      {
        id: "m3", text: "Combien vaut log₁₀(1000) ?",
        options: ["2", "3", "4", "10"],
        correctAnswer: 1, explanation: "log₁₀(1000) = log₁₀(10³) = 3."
      },
      {
        id: "m4", text: "Quelle est l'aire d'un cercle de rayon 7 cm ?",
        options: ["49π cm²", "14π cm²", "7π cm²", "21π cm²"],
        correctAnswer: 0, explanation: "A = πr² = π × 7² = 49π cm²."
      },
      {
        id: "m5", text: "Si sin(θ) = 1/2, quelle valeur de θ (en degrés) ?",
        options: ["30°", "45°", "60°", "90°"],
        correctAnswer: 0, explanation: "sin(30°) = 1/2."
      },
    ],
  },
  {
    id: "fr-1",
    title: "Français - Grammaire & Orthographe",
    category: "francais",
    difficulty: "Facile",
    questionCount: 5,
    duration: 10,
    description: "Révisez les règles de grammaire française",
    questions: [
      {
        id: "f1", text: "Quel est le pluriel de « œil » ?",
        options: ["Œils", "Yeux", "Œux", "Oyeux"],
        correctAnswer: 1, explanation: "Le pluriel irrégulier de « œil » est « yeux »."
      },
      {
        id: "f2", text: "Quelle est la bonne orthographe ?",
        options: ["Aparament", "Apparemment", "Apparament", "Aparemment"],
        correctAnswer: 1, explanation: "Apparemment s'écrit avec deux « p » et « emment »."
      },
      {
        id: "f3", text: "« Elles se sont ... la main. » Complétez.",
        options: ["serré", "serrée", "serrés", "serré"],
        correctAnswer: 0, explanation: "Le COD « la main » est placé après, pas d'accord."
      },
      {
        id: "f4", text: "Quel mot est un adverbe ?",
        options: ["Beau", "Rapidement", "Jolie", "Grand"],
        correctAnswer: 1, explanation: "Rapidement est un adverbe formé à partir de l'adjectif « rapide »."
      },
      {
        id: "f5", text: "Complétez : « Je ... à la plage demain. »",
        options: ["vais aller", "va aller", "allé", "irait"],
        correctAnswer: 0, explanation: "Futur proche : je vais + infinitif."
      },
    ],
  },
];
