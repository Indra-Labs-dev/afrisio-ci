# ⚗️ Physique — AfriSio CI

---

## Leçon 1 : Mécanique — Cinématique

### 1.1 Le mouvement

Un objet est **en mouvement** par rapport à un référentiel si sa position change au cours du temps.

**Référentiel :** système de référence par rapport auquel on étudie le mouvement.

**Types de mouvements :**

- **Rectiligne uniforme (MRU) :** vitesse constante, pas d'accélération
- **Rectiligne uniformément varié (MRUV) :** accélération constante
- **Circulaire uniforme (MCU) :** vitesse constante, trajectoire circulaire

---

### 1.2 Les grandeurs cinématiques

**Position :** x(t) en mètres (m)

**Vitesse :**

```
v = Δx / Δt   (vitesse moyenne)
v(t) = dx/dt  (vitesse instantanée)
Unité : m/s
```

**Accélération :**

```
a = Δv / Δt   (accélération moyenne)
a(t) = dv/dt  (accélération instantanée)
Unité : m/s²
```

---

### 1.3 Équations du MRUV

```
v(t) = v₀ + a·t
x(t) = x₀ + v₀·t + (1/2)·a·t²
v² = v₀² + 2a·(x - x₀)
```

**Chute libre (a = g = 9,81 m/s²) :**

```
v(t) = g·t
h(t) = (1/2)·g·t²
```

---

## Leçon 2 : Mécanique — Dynamique

### 2.1 Les forces

Une **force** est une action exercée par un objet sur un autre. Elle se caractérise par :

- Un point d'application
- Une direction
- Un sens
- Une intensité (en Newtons, N)

**Forces fondamentales :**

- Poids : P = mg (g ≈ 9,81 m/s² sur Terre)
- Réaction normale : N
- Tension : T
- Frottement : f

---

### 2.2 Les lois de Newton

**1ère loi (Principe d'inertie) :**

> Un objet reste au repos ou en mouvement rectiligne uniforme si la somme des forces appliquées est nulle.

```
ΣF = 0 → a = 0
```

**2ème loi (Principe fondamental de la dynamique) :**

```
ΣF = m × a
```

- ΣF : somme vectorielle des forces (N)
- m : masse (kg)
- a : accélération (m/s²)

**3ème loi (Principe des actions réciproques) :**

> Si A exerce une force F sur B, alors B exerce une force -F sur A (égale, opposée, même droite d'action).

---

### 2.3 La gravitation universelle (Newton)

```
F = G × (m₁ × m₂) / r²
```

- G = 6,674 × 10⁻¹¹ N·m²/kg²
- m₁, m₂ : masses des deux corps (kg)
- r : distance entre les centres de masse (m)

---

## Leçon 3 : Optique

### 3.1 La lumière

- La lumière est une **onde électromagnétique**.
- Vitesse dans le vide : **c = 3 × 10⁸ m/s**
- La lumière visible : longueurs d'onde de 400 nm (violet) à 700 nm (rouge)

**Spectre visible (ROYGBIV) :**

```
Rouge → Orange → Jaune → Vert → Bleu → Indigo → Violet
700 nm                                              400 nm
```

---

### 3.2 Réflexion et Réfraction

**Loi de la réflexion :**

```
i = r   (angle d'incidence = angle de réflexion)
```

**Loi de Snell-Descartes (réfraction) :**

```
n₁ · sin(i₁) = n₂ · sin(i₂)
```

- n₁, n₂ : indices de réfraction des deux milieux
- n (vide) = 1 ; n (eau) ≈ 1,33 ; n (verre) ≈ 1,5

**Réflexion totale interne :** se produit si i > iᶜ (angle critique), aucune réfraction.

---

### 3.3 Les lentilles

**Lentille convergente :** fait converger les rayons parallèles en un point (foyer F').
**Lentille divergente :** fait diverger les rayons.

**Relation de conjugaison (lentille mince) :**

```
1/f' = 1/OA' - 1/OA   →   1/f' = 1/v - 1/u
```

**Vergence :** V = 1/f' (en dioptries, δ)

**Grandissement :**

```
γ = OA'/OA = A'B'/AB
```

---

## Leçon 4 : Électricité

### 4.1 Courant électrique

**Courant électrique :** déplacement ordonné de charges électriques (électrons).

```
I = Q / t
```

- I : intensité (Ampères, A)
- Q : charge électrique (Coulombs, C)
- t : durée (secondes, s)

---

### 4.2 Loi d'Ohm

```
U = R × I
```

- U : tension (Volts, V)
- R : résistance (Ohms, Ω)
- I : intensité (Ampères, A)

**Puissance électrique :**

```
P = U × I = R × I² = U²/R   (en Watts, W)
```

**Énergie électrique :**

```
E = P × t   (en Joules, J ou en kWh)
1 kWh = 3 600 000 J = 3,6 × 10⁶ J
```

---

### 4.3 Associations de résistances

**En série :**

```
Req = R₁ + R₂ + R₃ + ...
(même courant dans chaque résistance)
```

**En parallèle :**

```
1/Req = 1/R₁ + 1/R₂ + 1/R₃ + ...
(même tension aux bornes de chaque résistance)
```

---

### 4.4 Lois de Kirchhoff

**Loi des nœuds :** La somme des courants entrant = somme des courants sortant.

```
ΣI entrants = ΣI sortants
```

**Loi des mailles :** La somme algébrique des tensions dans une maille fermée est nulle.

```
ΣU = 0
```

---

## Leçon 5 : Thermodynamique

### 5.1 Température et chaleur

- **Température** : mesure de l'agitation thermique des particules (en Kelvin K ou °C)
- **Relation :** T(K) = T(°C) + 273,15

**Transferts thermiques :**

- **Conduction** : dans les solides
- **Convection** : dans les fluides
- **Rayonnement** : par ondes électromagnétiques (sans milieu)

---

### 5.2 Les principes de la thermodynamique

**1er principe (conservation de l'énergie) :**

```
ΔU = Q + W
```

- ΔU : variation d'énergie interne
- Q : chaleur reçue
- W : travail reçu

**2ème principe (entropie) :**

> L'entropie d'un système isolé ne peut qu'augmenter. La chaleur passe spontanément du corps chaud vers le corps froid (jamais l'inverse).

---

### 5.3 Capacité thermique

```
Q = m × c × ΔT
```

- Q : chaleur échangée (J)
- m : masse (kg)
- c : capacité thermique massique (J/kg·K)
- ΔT : variation de température (K ou °C)

**Chaleur latente (changement d'état) :**

```
Q = m × L
```

- L : chaleur latente (J/kg)

---

## Leçon 6 : Ondes et Oscillations

### 6.1 Les ondes

**Onde mécanique :** perturbation qui se propage dans un milieu matériel.

- Transversale : vibration perpendiculaire à la propagation (corde)
- Longitudinale : vibration parallèle à la propagation (son)

**Onde électromagnétique :** se propage sans milieu (lumière, radio, X...).

---

### 6.2 Grandeurs caractéristiques

```
v = λ × f = λ / T
```

| Grandeur               | Symbole | Unité      |
| ---------------------- | ------- | ---------- |
| Vitesse de propagation | v       | m/s        |
| Longueur d'onde        | λ       | m          |
| Fréquence              | f       | Hz (Hertz) |
| Période                | T       | s          |

**Relation :** T = 1/f

---

### 6.3 Le son

- Le son est une onde mécanique **longitudinale**.
- Vitesse dans l'air : ≈ 340 m/s (à 20°C)
- Vitesse dans l'eau : ≈ 1 480 m/s
- Vitesse dans les solides : > 5 000 m/s

**Niveau sonore :** en décibels (dB)

- Conversation normale : ~60 dB
- Douleur : > 120 dB

---

## 📝 Constantes physiques fondamentales

| Constante                             | Symbole | Valeur                 |
| ------------------------------------- | ------- | ---------------------- |
| Vitesse de la lumière                 | c       | 3 × 10⁸ m/s            |
| Constante de gravitation              | G       | 6,674 × 10⁻¹¹ N·m²/kg² |
| Accélération gravitationnelle (Terre) | g       | 9,81 m/s²              |
| Charge de l'électron                  | e       | 1,6 × 10⁻¹⁹ C          |
| Constante de Planck                   | h       | 6,626 × 10⁻³⁴ J·s      |
| Nombre d'Avogadro                     | Nₐ      | 6,022 × 10²³ mol⁻¹     |

---

_AfriSio CI — Cours de Physique — Tous droits réservés_
