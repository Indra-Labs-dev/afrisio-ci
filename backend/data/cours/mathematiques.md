# 📐 Mathématiques — AfriSio CI

---

## Leçon 1 : Les Ensembles de Nombres

### 1.1 Classification des nombres

```
ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ ⊂ ℂ
```

| Ensemble   | Symbole | Description            | Exemples                  |
| ---------- | ------- | ---------------------- | ------------------------- |
| Naturels   | ℕ       | Entiers positifs + 0   | 0, 1, 2, 3, ...           |
| Entiers    | ℤ       | Naturels + négatifs    | ..., -2, -1, 0, 1, 2, ... |
| Rationnels | ℚ       | Fractions p/q          | 1/2, 3/4, -5/3, 0,25      |
| Réels      | ℝ       | Tous les décimaux      | π, √2, e, 1,5             |
| Complexes  | ℂ       | Avec partie imaginaire | 3+2i, -i                  |

---

### 1.2 Opérations sur les entiers

**Divisibilité :**

- a est divisible par b si le reste de la division euclidienne est 0
- **PGCD** (Plus Grand Commun Diviseur) : le plus grand entier divisant a et b
- **PPCM** (Plus Petit Commun Multiple) : le plus petit entier divisible par a et b

**Algorithme d'Euclide (PGCD) :**

```
PGCD(48, 18) :
48 = 18 × 2 + 12
18 = 12 × 1 + 6
12 = 6 × 2 + 0
→ PGCD(48, 18) = 6
```

**Nombres premiers :** 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, ...

---

## Leçon 2 : Algèbre — Équations et Inéquations

### 2.1 Équations du premier degré

Forme générale : **ax + b = 0** (a ≠ 0)

**Solution :** x = -b/a

**Exemple :**

```
3x + 6 = 0
3x = -6
x = -2
```

---

### 2.2 Équations du second degré

Forme générale : **ax² + bx + c = 0** (a ≠ 0)

**Discriminant :** Δ = b² - 4ac

| Cas                             | Discriminant | Solutions                              |
| ------------------------------- | ------------ | -------------------------------------- |
| Deux racines réelles distinctes | Δ > 0        | x₁ = (-b + √Δ)/2a et x₂ = (-b - √Δ)/2a |
| Une racine double               | Δ = 0        | x = -b/2a                              |
| Pas de racine réelle            | Δ < 0        | Pas de solution dans ℝ                 |

**Exemple :**

```
x² - 5x + 6 = 0
Δ = (-5)² - 4(1)(6) = 25 - 24 = 1
x₁ = (5 + 1)/2 = 3
x₂ = (5 - 1)/2 = 2
```

**Relations de Viète :**

- x₁ + x₂ = -b/a
- x₁ × x₂ = c/a

---

### 2.3 Inéquations du premier degré

**Règle importante :** Multiplier ou diviser par un **nombre négatif** inverse le sens de l'inégalité.

**Exemple :**

```
-2x + 4 > 0
-2x > -4
x < 2   (le signe < change car on divise par -2)
```

---

## Leçon 3 : Fonctions

### 3.1 Définitions

- **Fonction :** à tout x d'un ensemble A associe un unique élément f(x) d'un ensemble B
- **Domaine de définition :** ensemble des x pour lesquels f(x) existe
- **Image :** f(x) est l'image de x par f
- **Antécédent :** x est l'antécédent de f(x)

---

### 3.2 Fonctions de référence

**Fonction linéaire :** f(x) = ax

- Représentation : droite passant par l'origine

**Fonction affine :** f(x) = ax + b

- a = coefficient directeur (pente)
- b = ordonnée à l'origine

**Fonction carrée :** f(x) = x²

- Domaine : ℝ
- Courbe : parabole avec sommet en (0, 0)

**Fonction inverse :** f(x) = 1/x

- Domaine : ℝ \ {0}
- Courbe : hyperbole

**Fonction racine carrée :** f(x) = √x

- Domaine : [0; +∞[

---

### 3.3 Sens de variation

| Signe de a dans f(x) = ax + b | Variation    |
| ----------------------------- | ------------ |
| a > 0                         | Croissante   |
| a < 0                         | Décroissante |
| a = 0                         | Constante    |

**Dérivée et variation :**

- Si f'(x) > 0 sur un intervalle → f est croissante
- Si f'(x) < 0 sur un intervalle → f est décroissante
- Si f'(x) = 0 → extremum possible

---

## Leçon 4 : Dérivation

### 4.1 Définition

La dérivée de f en a est :

```
f'(a) = lim[h→0] (f(a+h) - f(a)) / h
```

### 4.2 Tableau des dérivées usuelles

| Fonction f(x) | Dérivée f'(x) |
| ------------- | ------------- |
| c (constante) | 0             |
| x             | 1             |
| xⁿ            | n·xⁿ⁻¹        |
| √x            | 1/(2√x)       |
| 1/x           | -1/x²         |
| eˣ            | eˣ            |
| ln(x)         | 1/x           |
| sin(x)        | cos(x)        |
| cos(x)        | -sin(x)       |

### 4.3 Règles de dérivation

- **(f + g)' = f' + g'**
- **(λf)' = λf'**
- **(f × g)' = f'g + fg'**
- **(f/g)' = (f'g - fg') / g²**
- **[f(g(x))]' = g'(x) × f'(g(x))** (dérivée composée)

---

## Leçon 5 : Géométrie

### 5.1 Figures planes — Périmètres et Aires

| Forme                           | Périmètre       | Aire            |
| ------------------------------- | --------------- | --------------- |
| Carré (côté a)                  | 4a              | a²              |
| Rectangle (L × l)               | 2(L + l)        | L × l           |
| Triangle (base b, hauteur h)    | somme des côtés | (b × h)/2       |
| Cercle (rayon r)                | 2πr             | πr²             |
| Trapèze (bases a, b, hauteur h) | —               | (a + b) × h / 2 |

---

### 5.2 Volumes des solides

| Solide                       | Volume        |
| ---------------------------- | ------------- |
| Cube (arête a)               | a³            |
| Parallélépipède (L × l × h)  | L × l × h     |
| Sphère (rayon r)             | (4/3)πr³      |
| Cylindre (r, h)              | πr²h          |
| Cône (r, h)                  | (1/3)πr²h     |
| Pyramide (base B, hauteur h) | (1/3) × B × h |

---

### 5.3 Théorème de Pythagore

Dans un triangle rectangle (angle droit en C) :

```
AB² = AC² + BC²
```

**Réciproque :** Si AB² = AC² + BC², alors le triangle est rectangle en C.

**Triplets pythagoriciens courants :** (3, 4, 5) — (5, 12, 13) — (8, 15, 17)

---

### 5.4 Trigonométrie dans le triangle rectangle

Dans un triangle rectangle en A :

```
sin(B) = côté opposé / hypoténuse = AC/BC
cos(B) = côté adjacent / hypoténuse = AB/BC
tan(B) = côté opposé / côté adjacent = AC/AB
```

**Valeurs remarquables :**

| Angle | 0°  | 30°  | 45°  | 60°  | 90° |
| ----- | --- | ---- | ---- | ---- | --- |
| sin   | 0   | 1/2  | √2/2 | √3/2 | 1   |
| cos   | 1   | √3/2 | √2/2 | 1/2  | 0   |
| tan   | 0   | √3/3 | 1    | √3   | —   |

---

## Leçon 6 : Statistiques et Probabilités

### 6.1 Statistiques descriptives

**Moyenne arithmétique :**

```
x̄ = (x₁ + x₂ + ... + xₙ) / n
```

**Médiane :** valeur qui partage la série ordonnée en deux moitiés égales.

**Mode :** valeur la plus fréquente.

**Étendue :** max - min

**Variance :**

```
V = (1/n) Σ(xᵢ - x̄)²
```

**Écart-type :** σ = √V

---

### 6.2 Probabilités

**Définition classique :**

```
P(A) = Nombre de cas favorables / Nombre de cas possibles
```

**Propriétés :**

- 0 ≤ P(A) ≤ 1
- P(Ω) = 1 (événement certain)
- P(∅) = 0 (événement impossible)
- P(Ā) = 1 - P(A) (événement contraire)

**Addition :** P(A ∪ B) = P(A) + P(B) - P(A ∩ B)

**Événements incompatibles :** P(A ∪ B) = P(A) + P(B)

**Événements indépendants :** P(A ∩ B) = P(A) × P(B)

---

## Leçon 7 : Suites numériques

### 7.1 Suite arithmétique

Chaque terme s'obtient en ajoutant une constante **r** (raison) au précédent.

```
uₙ = u₀ + n·r   (terme général)
Sₙ = n × (u₀ + uₙ₋₁) / 2   (somme des n premiers termes)
```

**Exemple :** 2, 5, 8, 11, ... → r = 3, u₀ = 2

---

### 7.2 Suite géométrique

Chaque terme s'obtient en multipliant par une constante **q** (raison).

```
uₙ = u₀ × qⁿ   (terme général)
Sₙ = u₀ × (1 - qⁿ) / (1 - q)   si q ≠ 1
```

**Exemple :** 3, 6, 12, 24, ... → q = 2, u₀ = 3

---

## 📝 Formules essentielles à mémoriser

```
Identités remarquables :
(a + b)² = a² + 2ab + b²
(a - b)² = a² - 2ab + b²
(a + b)(a - b) = a² - b²

Binôme de Newton (n=3) :
(a + b)³ = a³ + 3a²b + 3ab² + b³
```

---

_AfriSio CI — Cours de Mathématiques — Tous droits réservés_
