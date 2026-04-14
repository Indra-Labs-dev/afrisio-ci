# 📘 Cahier de Charges — AfriSio CI

## 1. Présentation du projet

**Nom de l’application :** AfriSio CI  
**Type :** Application web (Vite.js / React.js)  
**Cible :** Étudiants et candidats aux concours en Côte d’Ivoire

### 🎯 Objectif principal

Créer une plateforme moderne permettant aux utilisateurs de se préparer efficacement aux concours ivoiriens grâce à :

- Des quiz interactifs
- Des examens simulés
- Des corrections détaillées
- Un suivi des performances

---

## 2. Public cible

- Étudiants (Bac, Bac+2, Bac+3)
- Candidats aux concours administratifs
- Candidats aux grandes écoles

---

## 3. Fonctionnalités principales

### 🧠 3.1 Quiz interactifs

- Questions à choix multiples (QCM)
- Chronomètre par quiz
- Correction automatique
- Affichage des bonnes réponses

### 🧪 3.2 Examens simulés

- Mode concours réel
- Temps limité (45–120 minutes)
- Blocage du retour arrière (optionnel)
- Score final avec classement

### 📊 3.3 Tableau de bord utilisateur

- Historique des scores
- Progression par matière
- Statistiques (taux de réussite, temps moyen)

### 📚 3.4 Catégories de matières

- Culture générale
- Mathématiques
- Physique
- Sciences numériques
- Économie
- Français

### 👤 3.5 Gestion des utilisateurs

- Inscription / Connexion
- Authentification sécurisée (JWT / OAuth)
- Profil utilisateur

### 💾 3.6 Sauvegarde

- Sauvegarde des réponses
- Reprise de quiz

---

## 4. Fonctionnalités avancées (V2)

- 🧠 IA de recommandation (adapter les questions)
- 🏆 Classement national
- 📱 Application mobile (React Native / Flutter)
- 🔔 Notifications (rappels de révision)
- 📥 Téléchargement PDF des corrections

---

## 5. Architecture technique

### 🖥️ Frontend

- Vite.js
- React.js
- TailwindCSS
- Zustand ou Redux (state management)

### ⚙️ Backend (Python)

- Framework : FastAPI (recommandé) ou Django REST Framework
- API REST sécurisée
- Gestion des quiz, utilisateurs, scores

### 🧠 Services Backend

- Moteur de quiz dynamique
- Système de correction automatique
- Génération d’examens aléatoires

### 🗄️ Base de données

- PostgreSQL (recommandé)
- ORM : SQLAlchemy (FastAPI) ou Django ORM

### 🔐 Authentification

- JWT (JSON Web Token)
- OAuth possible (Google, Facebook)

### ☁️ Déploiement

- Frontend : Vercel
- Backend : Railway / Render / VPS (Docker recommandé)

---

## 6. Structure du projet

```
afrosio-ci/
│
├── app/
├── components/
├── lib/
├── hooks/
├── services/
├── styles/
├── public/
└── database/
```

---

## 7. UX / UI Design

### 🎨 Principes

- Interface moderne (dark/light mode)
- Design minimaliste
- Expérience fluide mobile-first

### 🧩 Pages principales

- Accueil
- Catalogue des quiz
- Page quiz
- Résultats
- Dashboard utilisateur
- Profil

---

## 8. Sécurité

- Protection contre XSS / CSRF
- Hash des mots de passe (bcrypt)
- Limitation des requêtes (rate limiting)

---

## 9. Performance

- Lazy loading
- Optimisation des images
- SSR / SSG avec Next.js

---

## 10. Planning prévisionnel

| Phase             | Durée      |
| ----------------- | ---------- |
| Conception        | 1 semaine  |
| Développement MVP | 3 semaines |
| Tests             | 1 semaine  |
| Déploiement       | 1 semaine  |

---

## 11. Indicateurs de succès

- Nombre d’utilisateurs actifs
- Taux de complétion des quiz
- Temps moyen passé
- Taux de réussite

---

## 12. Évolution future

- Marketplace de cours
- Intégration vidéo (cours)
- Mode offline
- Intelligence artificielle avancée

---

## 🚀 Conclusion

AfriSio CI vise à devenir la référence ivoirienne pour la préparation aux concours grâce à une expérience moderne, interactive et intelligente.
