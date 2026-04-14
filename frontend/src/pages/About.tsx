import { Card, CardContent } from "@/components/ui/card";

const About = () => (
  <div className="container py-12">
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 font-heading text-4xl font-bold text-center">
        À propos d'<span className="text-gradient">AfriSio CI</span>
      </h1>

      <div className="space-y-8">
        <Card>
          <CardContent className="p-8">
            <h2 className="mb-4 font-heading text-xl font-semibold">🎯 Notre mission</h2>
            <p className="leading-relaxed text-muted-foreground">
              AfriSio CI a pour mission de démocratiser l'accès à une préparation de qualité pour les concours en Côte d'Ivoire. 
              Nous croyons que chaque étudiant mérite les meilleurs outils pour réussir, peu importe sa localisation ou ses moyens.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-8">
            <h2 className="mb-4 font-heading text-xl font-semibold">🌍 Notre vision</h2>
            <p className="leading-relaxed text-muted-foreground">
              Devenir la plateforme de référence pour la préparation aux concours en Afrique de l'Ouest, 
              en proposant des contenus de qualité, des exercices interactifs et un suivi personnalisé des performances.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-8">
            <h2 className="mb-4 font-heading text-xl font-semibold">💡 Ce que nous offrons</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { icon: "📝", text: "Quiz interactifs avec corrections détaillées" },
                { icon: "📚", text: "Fiches de révision structurées par matière" },
                { icon: "🎬", text: "Vidéos explicatives pour chaque chapitre" },
                { icon: "📊", text: "Suivi de progression et statistiques" },
                { icon: "🏆", text: "Classement et motivation par la compétition" },
                { icon: "🆓", text: "Accès 100% gratuit à tous les contenus" },
              ].map((item) => (
                <div key={item.text} className="flex items-start gap-3">
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-sm text-muted-foreground">{item.text}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-8">
            <h2 className="mb-4 font-heading text-xl font-semibold">👥 L'équipe</h2>
            <p className="leading-relaxed text-muted-foreground">
              AfriSio CI est développé par une équipe passionnée d'éducation et de technologie, 
              basée en Côte d'Ivoire. Nous travaillons avec des enseignants et professionnels 
              pour garantir la qualité et la pertinence de nos contenus.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
);

export default About;
