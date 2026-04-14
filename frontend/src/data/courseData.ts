export interface Lesson {
  id: string;
  title: string;
  content: string;
  keyPoints: string[];
  videoUrl?: string;
  pdfUrl?: string;
}

export interface Course {
  id: string;
  title: string;
  category: string;
  description: string;
  level: "Débutant" | "Intermédiaire" | "Avancé";
  lessonsCount: number;
  duration: string;
  lessons: Lesson[];
}

export const courses: Course[] = [
  {
    id: "cours-cg-1",
    title: "Histoire de la Côte d'Ivoire",
    category: "culture-generale",
    description: "Cours complet sur l'histoire de la Côte d'Ivoire, de la colonisation à l'indépendance.",
    level: "Intermédiaire",
    lessonsCount: 3,
    duration: "45 min",
    lessons: [
      {
        id: "l1",
        title: "La période précoloniale",
        content: `La Côte d'Ivoire, avant l'arrivée des Européens, était peuplée par divers groupes ethniques organisés en royaumes et sociétés. Les principaux groupes sont les Akan, les Krou, les Mandé et les Voltaïques.\n\nLe royaume Baoulé, fondé par la reine Abla Pokou au XVIIIe siècle, est l'un des plus célèbres. Les Mandé du Nord avaient des liens commerciaux avec l'Empire du Mali et l'Empire Songhaï.\n\nLes premiers contacts européens datent du XVe siècle avec les Portugais, qui nommèrent la côte « Côte des Dents » en raison du commerce de l'ivoire.`,
        keyPoints: [
          "4 grands groupes ethniques : Akan, Krou, Mandé, Voltaïques",
          "Royaume Baoulé fondé par Abla Pokou (XVIIIe siècle)",
          "Premiers contacts européens au XVe siècle (Portugais)",
          "Commerce de l'ivoire à l'origine du nom du pays",
        ],
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      },
      {
        id: "l2",
        title: "La colonisation française",
        content: `La colonisation française de la Côte d'Ivoire débute officiellement en 1893 avec la création de la colonie. Louis-Gustave Binger en fut le premier gouverneur.\n\nLa France imposa le travail forcé, les cultures d'exportation (café, cacao) et une administration centralisée. Le Syndicat Agricole Africain (SAA), fondé en 1944 par Félix Houphouët-Boigny, marqua le début de la résistance politique.\n\nLa loi Houphouët-Boigny de 1946 abolit le travail forcé dans les colonies françaises, un tournant majeur vers l'émancipation.`,
        keyPoints: [
          "Colonie française créée en 1893",
          "Louis-Gustave Binger, premier gouverneur",
          "SAA fondé en 1944 par Houphouët-Boigny",
          "Abolition du travail forcé en 1946",
        ],
      },
      {
        id: "l3",
        title: "L'indépendance et la République",
        content: `La Côte d'Ivoire accède à l'indépendance le 7 août 1960. Félix Houphouët-Boigny devient le premier président et dirige le pays jusqu'à son décès en 1993.\n\nSous sa présidence, le pays connaît le « miracle ivoirien » : une croissance économique rapide basée sur le café et le cacao. Yamoussoukro devient la capitale politique en 1983.\n\nAprès Houphouët-Boigny, le pays traverse des périodes d'instabilité politique avec les présidences de Konan Bédié, Robert Guéï, Laurent Gbagbo, puis Alassane Ouattara.`,
        keyPoints: [
          "Indépendance le 7 août 1960",
          "Houphouët-Boigny : président de 1960 à 1993",
          "Le « miracle ivoirien » : croissance économique rapide",
          "Yamoussoukro, capitale politique depuis 1983",
        ],
      },
    ],
  },
  {
    id: "cours-math-1",
    title: "Dérivation et Primitives",
    category: "mathematiques",
    description: "Maîtrisez les techniques de dérivation et de calcul de primitives pour le BAC.",
    level: "Avancé",
    lessonsCount: 3,
    duration: "60 min",
    lessons: [
      {
        id: "ml1",
        title: "Règles de dérivation",
        content: `La dérivée d'une fonction mesure son taux de variation instantané. Voici les règles fondamentales :\n\n• Constante : (c)' = 0\n• Puissance : (xⁿ)' = nxⁿ⁻¹\n• Somme : (f+g)' = f' + g'\n• Produit : (fg)' = f'g + fg'\n• Quotient : (f/g)' = (f'g - fg') / g²\n• Composée : (f∘g)' = g' × f'(g)\n\nExemple : f(x) = 3x² + 2x - 5\nf'(x) = 6x + 2`,
        keyPoints: [
          "(xⁿ)' = nxⁿ⁻¹",
          "(fg)' = f'g + fg' (règle du produit)",
          "(f/g)' = (f'g - fg') / g² (règle du quotient)",
          "(f∘g)' = g' × f'(g) (dérivée composée)",
        ],
      },
      {
        id: "ml2",
        title: "Applications de la dérivation",
        content: `La dérivée permet d'étudier les variations d'une fonction :\n\n1. Sens de variation :\n   - f'(x) > 0 → f croissante\n   - f'(x) < 0 → f décroissante\n   - f'(x) = 0 → extremum possible\n\n2. Tableau de variation : on étudie le signe de f' pour déterminer les intervalles de croissance/décroissance.\n\n3. Tangente : l'équation de la tangente au point a est :\n   y = f'(a)(x - a) + f(a)`,
        keyPoints: [
          "f'(x) > 0 ⟹ f croissante",
          "f'(x) = 0 aux extremums",
          "Tangente : y = f'(a)(x-a) + f(a)",
          "Tableau de variation basé sur le signe de f'",
        ],
      },
      {
        id: "ml3",
        title: "Calcul de primitives",
        content: `Une primitive F de f est une fonction telle que F' = f.\n\nPrimitives usuelles :\n• ∫ xⁿ dx = xⁿ⁺¹/(n+1) + C (n ≠ -1)\n• ∫ 1/x dx = ln|x| + C\n• ∫ eˣ dx = eˣ + C\n• ∫ cos(x) dx = sin(x) + C\n• ∫ sin(x) dx = -cos(x) + C\n\nL'intégrale définie ∫[a,b] f(x)dx = F(b) - F(a) représente l'aire sous la courbe entre a et b.`,
        keyPoints: [
          "F est primitive de f si F' = f",
          "∫ xⁿ dx = xⁿ⁺¹/(n+1) + C",
          "∫[a,b] f(x)dx = F(b) - F(a)",
          "Toute primitive diffère d'une constante C",
        ],
      },
    ],
  },
  {
    id: "cours-fr-1",
    title: "Grammaire française essentielle",
    category: "francais",
    description: "Révisez les règles fondamentales de la grammaire pour les concours.",
    level: "Débutant",
    lessonsCount: 3,
    duration: "30 min",
    lessons: [
      {
        id: "fl1",
        title: "Les accords du participe passé",
        content: `Les règles d'accord du participe passé sont essentielles pour les concours :\n\n1. Avec « être » : accord avec le sujet\n   Ex : « Elles sont parties » (féminin pluriel)\n\n2. Avec « avoir » : accord avec le COD s'il est placé avant\n   Ex : « Les fleurs que j'ai cueillies » (COD « que » = fleurs, placé avant)\n   Ex : « J'ai cueilli des fleurs » (COD après → pas d'accord)\n\n3. Verbes pronominaux : accord avec le sujet si le pronom est COD\n   Ex : « Elles se sont lavées » (se = COD = elles)`,
        keyPoints: [
          "Avec être : accord avec le sujet",
          "Avec avoir : accord avec le COD placé avant",
          "Pronominaux : analyser la fonction du pronom",
          "Pas d'accord avec le COD placé après « avoir »",
        ],
      },
      {
        id: "fl2",
        title: "Les homophones grammaticaux",
        content: `Les homophones grammaticaux sont des mots qui se prononcent pareil mais s'écrivent différemment :\n\n• a / à : « a » = verbe avoir ; « à » = préposition\n  Test : remplacer par « avait » → si ça marche, c'est « a »\n\n• et / est : « et » = conjonction ; « est » = verbe être\n  Test : remplacer par « et puis » ou « était »\n\n• ce / se : « ce » = déterminant ; « se » = pronom réfléchi\n  Test : « ce » devant un nom ; « se » devant un verbe\n\n• ou / où : « ou » = choix ; « où » = lieu/temps\n  Test : remplacer par « ou bien »`,
        keyPoints: [
          "a/à : remplacer par « avait »",
          "et/est : remplacer par « et puis » ou « était »",
          "ce/se : ce + nom, se + verbe",
          "ou/où : remplacer par « ou bien »",
        ],
      },
      {
        id: "fl3",
        title: "La conjugaison aux temps composés",
        content: `Les temps composés se forment avec un auxiliaire (être ou avoir) + participe passé.\n\nPassé composé : j'ai mangé / je suis parti(e)\nPlus-que-parfait : j'avais mangé / j'étais parti(e)\nFutur antérieur : j'aurai mangé / je serai parti(e)\n\n14 verbes avec « être » (maison d'être) :\nDevenir, Revenir, Monter, Rester, Sortir, Venir, Aller, Naître, Descendre, Entrer, Retourner, Tomber, Arriver, Mourir, Partir\n\nAstuce : DR & MRS VANDERTRAMP`,
        keyPoints: [
          "Auxiliaire + participe passé = temps composé",
          "14 verbes avec être (DR MRS VANDERTRAMP)",
          "Passé composé, plus-que-parfait, futur antérieur",
          "Les verbes pronominaux utilisent toujours « être »",
        ],
      },
    ],
  },
  {
    id: "cours-eco-1",
    title: "Économie de la Côte d'Ivoire",
    category: "economie",
    description: "Comprendre les fondamentaux de l'économie ivoirienne.",
    level: "Intermédiaire",
    lessonsCount: 2,
    duration: "35 min",
    lessons: [
      {
        id: "el1",
        title: "L'agriculture ivoirienne",
        content: `La Côte d'Ivoire est le premier producteur mondial de cacao, avec environ 40% de la production mondiale. L'agriculture représente environ 20% du PIB et emploie près de 50% de la population active.\n\nProduits principaux :\n• Cacao : 1er producteur mondial\n• Café : parmi les top 10 mondiaux\n• Hévéa : 1er producteur africain\n• Palmier à huile : 2e producteur africain\n• Anacarde (noix de cajou) : 1er producteur mondial\n\nLe secteur fait face à des défis : déforestation, fluctuation des prix mondiaux, vieillissement des plantations.`,
        keyPoints: [
          "1er producteur mondial de cacao (40% mondial)",
          "Agriculture = ~20% du PIB",
          "1er producteur mondial d'anacarde",
          "Défis : déforestation, prix instables",
        ],
      },
      {
        id: "el2",
        title: "Croissance et développement",
        content: `Depuis 2012, la Côte d'Ivoire connaît une croissance économique soutenue (7-8% par an en moyenne). Le Plan National de Développement (PND) vise à faire du pays une économie émergente.\n\nSecteurs porteurs :\n• BTP et infrastructures (ponts, autoroutes, métro d'Abidjan)\n• Télécommunications et numérique\n• Industrie de transformation\n• Tourisme\n\nIndicateurs clés :\n• PIB : ~70 milliards USD (2023)\n• Population : ~28 millions d'habitants\n• Monnaie : Franc CFA (XOF)\n• Membre de l'UEMOA et de la CEDEAO`,
        keyPoints: [
          "Croissance de 7-8% par an depuis 2012",
          "PND : objectif pays émergent",
          "PIB ~70 milliards USD",
          "Membre UEMOA et CEDEAO",
        ],
      },
    ],
  },
];
