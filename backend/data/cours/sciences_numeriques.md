# 💻 Sciences Numériques — AfriSio CI

---

## Leçon 1 : Systèmes de Numération

### 1.1 Les bases de numération

Un système de numération est défini par sa **base** (nombre de symboles distincts).

| Base | Nom         | Symboles     |
| ---- | ----------- | ------------ |
| 2    | Binaire     | 0, 1         |
| 8    | Octal       | 0 à 7        |
| 10   | Décimal     | 0 à 9        |
| 16   | Hexadécimal | 0 à 9, A à F |

---

### 1.2 Conversions entre bases

**Décimal → Binaire :** Divisions successives par 2

```
Convertir 25 en binaire :
25 ÷ 2 = 12 reste 1
12 ÷ 2 = 6  reste 0
6  ÷ 2 = 3  reste 0
3  ÷ 2 = 1  reste 1
1  ÷ 2 = 0  reste 1

Résultat (lire de bas en haut) : 25₁₀ = 11001₂
```

**Binaire → Décimal :** Somme pondérée des puissances de 2

```
11001₂ = 1×2⁴ + 1×2³ + 0×2² + 0×2¹ + 1×2⁰
        = 16 + 8 + 0 + 0 + 1 = 25₁₀
```

**Décimal → Hexadécimal :** Divisions successives par 16

```
255 ÷ 16 = 15 reste 15 → F
15  ÷ 16 = 0  reste 15 → F

255₁₀ = FF₁₆
```

**Table hexadécimale :**

```
10 = A | 11 = B | 12 = C | 13 = D | 14 = E | 15 = F
```

---

### 1.3 Représentation des données

**Bit :** unité minimale (0 ou 1)
**Octet (Byte) :** 8 bits

| Unité            | Valeur                    |
| ---------------- | ------------------------- |
| 1 Ko (Kilooctet) | 1 024 octets = 2¹⁰ octets |
| 1 Mo (Mégaoctet) | 1 024 Ko = 2²⁰ octets     |
| 1 Go (Gigaoctet) | 1 024 Mo = 2³⁰ octets     |
| 1 To (Téraoctet) | 1 024 Go = 2⁴⁰ octets     |

---

## Leçon 2 : Algèbre de Boole et Portes Logiques

### 2.1 Variables et opérations booléennes

Une variable booléenne ne peut prendre que deux valeurs : **0 (faux)** ou **1 (vrai)**.

**Opérations fondamentales :**

| Opération         | Symbole        | Définition                |
| ----------------- | -------------- | ------------------------- |
| ET (AND)          | A · B ou A ∧ B | Vrai si A ET B sont vrais |
| OU (OR)           | A + B ou A ∨ B | Vrai si A OU B est vrai   |
| NON (NOT)         | Ā ou ¬A        | Inverse la valeur         |
| OU exclusif (XOR) | A ⊕ B          | Vrai si A ≠ B             |

---

### 2.2 Tables de vérité

**AND (ET) :**

| A   | B   | A · B |
| --- | --- | ----- |
| 0   | 0   | 0     |
| 0   | 1   | 0     |
| 1   | 0   | 0     |
| 1   | 1   | 1     |

**OR (OU) :**

| A   | B   | A + B |
| --- | --- | ----- |
| 0   | 0   | 0     |
| 0   | 1   | 1     |
| 1   | 0   | 1     |
| 1   | 1   | 1     |

**NOT (NON) :**

| A   | Ā   |
| --- | --- |
| 0   | 1   |
| 1   | 0   |

---

### 2.3 Lois de De Morgan

```
¬(A · B) = ¬A + ¬B
¬(A + B) = ¬A · ¬B
```

---

## Leçon 3 : Architecture des Ordinateurs

### 3.1 Composants fondamentaux

```
         ┌──────────────────────────────────┐
         │         ORDINATEUR               │
         │                                  │
  Input  │   ┌─────┐    ┌─────┐   Mémoire  │  Output
 ──────► │   │ CPU │◄──►│ RAM │    ┌────┐  │ ──────►
         │   └─────┘    └─────┘    │Disk│  │
         │       │                  └────┘  │
         └───────┼──────────────────────────┘
                 │
             ┌───▼───┐
             │  Bus  │
             └───────┘
```

**CPU (Processeur) :**

- Unité Arithmétique et Logique (UAL/ALU) : calculs
- Unité de Contrôle (UC) : coordination
- Registres : mémoire ultra-rapide interne
- Cache : mémoire intermédiaire rapide

**Mémoires :**

| Type             | Vitesse     | Capacité        | Volatile ? |
| ---------------- | ----------- | --------------- | ---------- |
| Registres        | Très rapide | Quelques octets | Oui        |
| Cache (L1/L2/L3) | Très rapide | Ko à Mo         | Oui        |
| RAM              | Rapide      | Go              | Oui        |
| SSD              | Moyen       | Go à To         | Non        |
| HDD              | Lent        | To              | Non        |

---

### 3.2 Le cycle d'instruction (Fetch-Decode-Execute)

1. **Fetch (Recherche)** : le CPU récupère l'instruction en mémoire
2. **Decode (Décodage)** : le CPU interprète l'instruction
3. **Execute (Exécution)** : le CPU réalise l'opération
4. **Write-back** : le résultat est stocké

---

### 3.3 Systèmes d'exploitation

Le **système d'exploitation (OS)** est l'interface entre le matériel et l'utilisateur.

**Fonctions :**

- Gestion des processus
- Gestion de la mémoire
- Gestion des fichiers
- Gestion des entrées/sorties
- Sécurité et contrôle d'accès

**Exemples d'OS :**

- Windows (Microsoft)
- Linux (open source : Ubuntu, Debian, Fedora…)
- macOS (Apple)
- Android, iOS (mobile)

---

## Leçon 4 : Réseaux Informatiques

### 4.1 Les réseaux

**Réseau informatique :** ensemble d'équipements interconnectés permettant l'échange de données.

**Types de réseaux :**
| Acronyme | Nom | Portée |
|---|---|---|
| PAN | Personal Area Network | Quelques mètres |
| LAN | Local Area Network | Bâtiment / Campus |
| MAN | Metropolitan Area Network | Ville |
| WAN | Wide Area Network | Mondial (Internet) |

---

### 4.2 Modèle OSI (7 couches)

```
7. Application  → HTTP, FTP, SMTP, DNS
6. Présentation → Chiffrement, compression
5. Session      → Gestion des sessions
4. Transport    → TCP, UDP
3. Réseau       → IP, routage
2. Liaison      → Ethernet, Wi-Fi (MAC)
1. Physique     → Câbles, signaux
```

**Modèle TCP/IP (simplifié, 4 couches) :**

```
4. Application
3. Transport (TCP/UDP)
2. Internet (IP)
1. Accès réseau
```

---

### 4.3 Protocoles essentiels

| Protocole      | Rôle                                  |
| -------------- | ------------------------------------- |
| HTTP/HTTPS     | Navigation web                        |
| FTP            | Transfert de fichiers                 |
| SMTP/POP3/IMAP | Email                                 |
| DNS            | Résolution de noms de domaine         |
| DHCP           | Attribution automatique d'adresses IP |
| SSH            | Accès distant sécurisé                |

---

### 4.4 Adressage IP

**IPv4 :** 4 octets, ex. 192.168.1.1 → 2³² adresses (~4,3 milliards)
**IPv6 :** 128 bits, ex. 2001:0db8::1 → quasi-illimité

**Classes d'adresses IPv4 (privées) :**

```
Classe A : 10.0.0.0       à 10.255.255.255
Classe B : 172.16.0.0     à 172.31.255.255
Classe C : 192.168.0.0    à 192.168.255.255
```

---

## Leçon 5 : Algorithmique et Programmation

### 5.1 Notions fondamentales

Un **algorithme** est une suite finie et ordonnée d'instructions permettant de résoudre un problème.

**Propriétés d'un algorithme :**

- Fini (se termine)
- Déterministe (mêmes résultats pour mêmes entrées)
- Général (résout une classe de problèmes)

---

### 5.2 Structures de contrôle

**Séquence :** instructions exécutées dans l'ordre.

**Condition (si/sinon) :**

```python
if condition:
    # instructions
elif autre_condition:
    # instructions
else:
    # instructions
```

**Boucle (while) :**

```python
while condition:
    # instructions
```

**Boucle (for) :**

```python
for i in range(n):
    # instructions
```

---

### 5.3 Complexité algorithmique

| Notation   | Nom            | Exemple                     |
| ---------- | -------------- | --------------------------- |
| O(1)       | Constante      | Accès à un tableau          |
| O(log n)   | Logarithmique  | Recherche binaire           |
| O(n)       | Linéaire       | Parcours d'une liste        |
| O(n log n) | Quasi-linéaire | Tri fusion                  |
| O(n²)      | Quadratique    | Tri bulle                   |
| O(2ⁿ)      | Exponentielle  | Problème des sous-ensembles |

---

### 5.4 Tris classiques

**Tri par sélection (O(n²)) :**

```
Pour chaque position i :
  Trouver le minimum dans [i..n]
  Échanger avec l'élément en position i
```

**Tri bulle (O(n²)) :**

```
Répéter n fois :
  Pour chaque paire adjacente :
    Si inversée → échanger
```

**Tri fusion (O(n log n)) :**

```
Diviser la liste en deux moitiés
Trier récursivement chaque moitié
Fusionner les deux moitiés triées
```

---

## Leçon 6 : Cybersécurité

### 6.1 Menaces informatiques

| Menace                   | Description                                            |
| ------------------------ | ------------------------------------------------------ |
| Virus                    | Programme se répliquant et infectant d'autres fichiers |
| Ver                      | Se propage seul via le réseau                          |
| Cheval de Troie (Trojan) | Paraît légitime mais est malveillant                   |
| Ransomware               | Chiffre les données et demande une rançon              |
| Phishing                 | Usurpation d'identité pour voler des informations      |
| DDoS                     | Saturation d'un serveur par de nombreuses requêtes     |

---

### 6.2 Cryptographie

**Chiffrement symétrique :** même clé pour chiffrer et déchiffrer (AES, DES).  
**Chiffrement asymétrique :** paire clé publique / clé privée (RSA, ECC).  
**Hachage :** fonction à sens unique (SHA-256, MD5 — MD5 obsolète).

**HTTPS :** HTTP + TLS/SSL (certificat numérique assurant l'authenticité).

---

### 6.3 Bonnes pratiques

- Mot de passe fort (12+ caractères, majuscules, chiffres, symboles)
- Authentification à deux facteurs (2FA)
- Mises à jour régulières
- Sauvegardes (règle 3-2-1 : 3 copies, 2 supports, 1 hors site)
- Ne pas cliquer sur les liens suspects

---

## 📝 Récapitulatif des conversions binaires courantes

| Décimal | Binaire   | Hexadécimal |
| ------- | --------- | ----------- |
| 0       | 0000      | 0           |
| 1       | 0001      | 1           |
| 5       | 0101      | 5           |
| 10      | 1010      | A           |
| 15      | 1111      | F           |
| 16      | 0001 0000 | 10          |
| 255     | 1111 1111 | FF          |

---

_AfriSio CI — Cours de Sciences Numériques — Tous droits réservés_
