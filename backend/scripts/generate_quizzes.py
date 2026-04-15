"""
Script de génération massive de quiz pour AfriSio CI.
Compatible avec : Ollama (local), OpenRouter, OpenAI.

Configuration via backend/.env :
  AI_API_KEY=...
  AI_BASE_URL=...  (vide = OpenAI officiel)
  AI_MODEL=...

Usage:
  python generate_quizzes.py                    # Tout générer
  python generate_quizzes.py --cat mathematiques # Une seule matière
  python generate_quizzes.py --dry-run           # Lister les sujets sans appeler l'IA
"""

import os, sys, json, time, argparse, random
from pathlib import Path
from typing import Optional

# ── Résolution des chemins ────────────────────────────────────────────────────
SCRIPT_DIR  = Path(__file__).parent
BACKEND_DIR = SCRIPT_DIR.parent
ENV_FILE    = BACKEND_DIR / ".env"

# Charger .env manuellement (évite une dépendance externe au moment de l'import)
if ENV_FILE.exists():
    for line in ENV_FILE.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            key, _, val = line.partition("=")
            os.environ.setdefault(key.strip(), val.strip())

# ── Config IA ─────────────────────────────────────────────────────────────────
API_KEY    = os.getenv("AI_API_KEY", "dummy")
BASE_URL   = os.getenv("AI_BASE_URL") or None
MODEL_NAME = os.getenv("AI_MODEL", "arcee-ai/trinity-large-preview:free")

# Modèles de repli (fallback) si le modèle principal échoue (401, quota, etc.)
# Configurez AI_FALLBACK_MODELS dans .env comme liste séparée par virgules,
# ou ajoutez/retirez des entrées directement ci-dessous.
_fb_env = os.getenv("AI_FALLBACK_MODELS", "")
FALLBACK_MODELS: list[str] = (
    [m.strip() for m in _fb_env.split(",") if m.strip()]
    if _fb_env
    else [
        "google/gemma-4-26b-a4b-it:free",
        "meta-llama/llama-3.1-8b-instruct:free",
        "mistralai/mistral-7b-instruct:free",
        "deepseek/deepseek-r1:free",
        "microsoft/phi-3-mini-128k-instruct:free",
        "qwen/qwen3-4b:free",
    ]
)

OUTPUT_DIR = BACKEND_DIR / "data" / "generated"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


# ── Catalogue de sujets par catégorie ────────────────────────────────────────
# Chaque (category_id, category_name, [topics], difficulty)
CATALOG = [
    {
        "category_id": "culture_generale",
        "category_name": "Culture Générale",
        "difficulty": "medium",
        "topics": [
            "Histoire et civilisations africaines",
            "L'Union Africaine et ses institutions",
            "Les grands empires africains précoloniaux",
            "La colonisation de l'Afrique",
            "Les indépendances africaines",
            "Géographie de la Côte d'Ivoire",
            "Institutions politiques de la Côte d'Ivoire",
            "L'économie ivoirienne et la zone UEMOA",
            "Droits de l'Homme et citoyenneté",
            "L'Organisation des Nations Unies (ONU)",
            "Les grandes religieux du monde",
            "Santé publique et prévention des épidémies",
            "Environnement et développement durable",
            "Arts, culture et littérature africaine",
            "Sports et Jeux Olympiques",
            "Les grandes découvertes scientifiques",
            "La Francophonie dans le monde",
            "Géopolitique mondiale contemporaine",
            "Le réchauffement climatique et l'Accord de Paris",
            "L'histoire de l'internet et du numérique",
            "Personnalités politiques africaines emblématiques",
            "Prix Nobel et grands lauréats africains",
        ],
    },
    {
        "category_id": "mathematiques",
        "category_name": "Mathématiques",
        "difficulty": "medium",
        "topics": [
            "Ensembles et relations",
            "Arithmétique et divisibilité dans Z",
            "Fonctions numériques et limites",
            "Dérivation et applications",
            "Intégration et calcul d'aires",
            "Suites numériques (arithmétiques et géométriques)",
            "Équations du second degré",
            "Systèmes d'équations linéaires",
            "Géométrie dans le plan : triangles et cercles",
            "Géométrie dans l'espace",
            "Vecteurs et produit scalaire",
            "Probabilités et dénombrement",
            "Statistiques descriptives",
            "Logarithme et exponentielle",
            "Trigonométrie (formules, équations, identités)",
            "Nombres complexes",
            "Matrices et déterminants",
            "Logique et raisonnement mathématique",
            "Fonctions polynômes et rationnelles",
            "Courbes paramétriques et coniques",
            "Inégalités et optimisation",
        ],
    },
    {
        "category_id": "physique",
        "category_name": "Physique-Chimie",
        "difficulty": "medium",
        "topics": [
            "Mécanique classique : lois de Newton",
            "Cinématique du point matériel",
            "Travail, puissance et énergie mécanique",
            "Oscillations et mouvements périodiques",
            "Électrostatique et loi de Coulomb",
            "Circuits électriques et lois de Kirchhoff",
            "Magnétisme et induction électromagnétique",
            "Optique géométrique (lentilles et miroirs)",
            "Ondes mécaniques et acoustique",
            "Thermodynamique : gaz parfaits",
            "Thermochimie : enthalpie et calorimétrie",
            "Structure de la matière et tableau périodique",
            "Liaisons chimiques et molécules",
            "Solutions aqueuses et pH",
            "Réactions d'oxydo-réduction",
            "Cinétique chimique et catalyse",
            "Transformations nucléaires et radioactivité",
            "Chimie organique : nomenclature et fonctions",
            "Réactions chimiques en solution",
            "Physique quantique : photon et effet photoélectrique",
        ],
    },
    {
        "category_id": "sciences_numeriques",
        "category_name": "Sciences Numériques",
        "difficulty": "medium",
        "topics": [
            "Histoire de l'informatique",
            "Systèmes de numération (binaire, hexadécimal)",
            "Algèbre de Boole et portes logiques",
            "Architecture d'un ordinateur (CPU, RAM, ROM)",
            "Systèmes d'exploitation et gestion de fichiers",
            "Réseaux informatiques et protocoles TCP/IP",
            "Internet, Web et protocole HTTP",
            "Cybersécurité et protection des données",
            "Algorithmique et structures de données",
            "Langage Python : bases et fonctions",
            "Bases de données et SQL",
            "Intelligence artificielle et machine learning",
            "Traitement d'images et données numériques",
            "Cryptographie et sécurité des communications",
            "Développement web : HTML, CSS et JavaScript",
            "Cloud computing et virtualisation",
            "Internet des objets (IoT)",
            "Big Data et analyse de données",
            "Blockchain et cryptomonnaies",
            "Éthique du numérique et RGPD",
        ],
    },
    {
        "category_id": "economie",
        "category_name": "Économie",
        "difficulty": "medium",
        "topics": [
            "Introduction à l'économie et ses grands courants",
            "Offre, demande et équilibre du marché",
            "Élasticité-prix et revenus",
            "Structures de marché (concurrence, monopole, oligopole)",
            "La production et les coûts de l'entreprise",
            "Macroéconomie : PIB, croissance et conjoncture",
            "Chômage et marché du travail",
            "Inflation, déflation et politiques monétaires",
            "Politiques budgétaires et fiscales",
            "Commerce international et théories relatives",
            "La mondialisation économique",
            "Développement économique et inégalités",
            "Système financier et marchés boursiers",
            "Banques et institutions financières (BCEAO, FMI, BM)",
            "Zone franc CFA et intégration économique africaine",
            "Agriculture et économie rurale en Côte d'Ivoire",
            "Secteur des matières premières (cacao, café, pétrole)",
            "Économie sociale et solidaire",
            "Entrepreneuriat et création d'entreprise",
            "Développement durable et économie verte",
        ],
    },
    {
        "category_id": "francais",
        "category_name": "Français",
        "difficulty": "medium",
        "topics": [
            "Grammaire : nature et fonctions des mots",
            "Conjugaison : modes et temps verbaux",
            "Orthographe lexicale et grammaticale",
            "Vocabulaire : synonymes, antonymes, polysémie",
            "Figures de style et procédés rhétoriques",
            "La narration et les types de récit",
            "Le texte argumentatif et ses techniques",
            "La dissertation littéraire",
            "Le commentaire composé",
            "Analyse de poésie",
            "Littérature africaine francophone",
            "Le roman francophone",
            "Le théâtre africain",
            "Littérature française du XVIIe siècle (Classicisme)",
            "Littérature française du XVIIIe siècle (Les Lumières)",
            "Littérature française du XIXe siècle (Romantisme, Réalisme)",
            "Littérature française du XXe siècle",
            "La presse et les types d'articles journalistiques",
            "Communication orale et prise de parole",
            "Rédaction : la correspondance formelle",
        ],
    },
]

PROMPT_TEMPLATE = """\
Tu es un professeur expert et pédagogue de niveau terminale / concours.
Génère exactement {count} questions de QCM (choix multiples) pour la matière "{category}", sur le sous-thème précis "{topic}".
Niveau : {difficulty}. Langue : Français.

Règles strictes :
- Chaque question doit être unique, précise et pédagogique.
- Si le modèle le permet et qu'une recherche internet est activée, vérifie tes faits pour garantir qu'aucune réponse concernant l'actuel, l'histoire ou l'économie, n'est obsolète.
- Les 4 options de réponse (A, B, C, D) doivent être plausibles mais une seule est correcte.
- L'explication doit être claire (2-3 phrases), didactique et sans répéter la question.
- Ne commence PAS par les mots "Quelle est" pour chaque question, varie le style.
- Renvoie UNIQUEMENT du JSON brut, sans balises ```json ni aucun autre texte.

Format JSON attendu:
{{
  "category_id": "{category_id}",
  "topic": "{topic}",
  "questions": [
    {{
      "question": "Texte de la question ?",
      "explanation": "Explication détaillée de la bonne réponse.",
      "difficulty": "{difficulty}",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": "Option B"
    }}
  ]
}}"""


def _call_api(client, model: str, prompt: str) -> str:
    """Appelle l'API et retourne le contenu brut."""
    
    # Active la recherche web pour OpenRouter (ou l'ignore si non-OpenRouter)
    kwargs = {}
    if BASE_URL and "openrouter" in BASE_URL.lower():
        kwargs["extra_body"] = {
            "tools": [{"type": "openrouter:web_search"}]
        }

    response = client.chat.completions.create(
        model=model,
        messages=[
            {
                "role": "system",
                "content": "Tu es un générateur de QCM. Réponds uniquement avec du JSON valide.",
            },
            {"role": "user", "content": prompt},
        ],
        temperature=0.85,
        max_tokens=4096,
        **kwargs
    )
    return response.choices[0].message.content.strip()


def _clean_json(raw: str) -> str:
    """Nettoie les balises Markdown éventuelles autour du JSON."""
    if raw.startswith("```"):
        # Retirer la première ligne (```json ou ```)
        raw = raw.split("\n", 1)[-1] if "\n" in raw else raw[3:]
    if raw.endswith("```"):
        raw = raw[: raw.rfind("```")]
    return raw.strip()


def generate_batch(
    client,
    category_id: str,
    category_name: str,
    topic: str,
    difficulty: str,
    count: int,
    batch_num: int,
    retries_per_model: int = 2,
) -> bool:
    """Génère un batch de `count` questions avec repli automatique sur les modèles de fallback."""
    from openai import AuthenticationError, RateLimitError, NotFoundError

    prompt = PROMPT_TEMPLATE.format(
        count=count,
        category=category_name,
        category_id=category_id,
        topic=topic,
        difficulty=difficulty,
    )
    safe_topic = topic.replace(" ", "_").replace("/", "-")[:50]
    out_file = OUTPUT_DIR / f"{category_id}__{safe_topic}__b{batch_num}.json"

    if out_file.exists():
        print(f"   ⏭️  Déjà existant, ignoré : {out_file.name}")
        return True

    # Ordre de tentatives : modèle principal puis fallbacks
    models_to_try = [MODEL_NAME] + FALLBACK_MODELS

    for model in models_to_try:
        for attempt in range(1, retries_per_model + 1):
            try:
                print(f"   🤖 [{model}] '{topic}' (tentative {attempt}/{retries_per_model})…")
                raw = _call_api(client, model, prompt)
                raw = _clean_json(raw)
                data = json.loads(raw)
                q_count = len(data.get("questions", []))
                if q_count == 0:
                    raise ValueError("Aucune question dans la réponse")
                # Injecter le modèle utilisé pour traçabilité
                data["_generated_by"] = model
                out_file.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
                print(f"   ✅ Sauvegardé ({q_count} questions) → {out_file.name}")
                return True

            except AuthenticationError as e:
                print(f"   🔒 Auth échouée pour [{model}] : passage au modèle suivant")
                break
                
            except NotFoundError as e:
                print(f"   🚫 Modèle introuvable [{model}] : passage au modèle suivant")
                break

            except RateLimitError as e:
                print(f"   ⏳ Rate limit [{model}] (tentative {attempt})")
                wait = 15 if attempt < retries_per_model else 0
                if wait:
                    time.sleep(wait)

            except json.JSONDecodeError as e:
                print(f"   ⚠️ JSON invalide [{model}] (tentative {attempt}): {e}")
                if attempt < retries_per_model:
                    time.sleep(2)

            except Exception as e:
                print(f"   ❌ Erreur [{model}] (tentative {attempt}): {e}")
                if attempt < retries_per_model:
                    time.sleep(5)

    print(f"   🚨 Tous les modèles ont échoué pour '{topic}' lot {batch_num}")
    return False


def main():
    parser = argparse.ArgumentParser(description="Générateur massif de quiz AfriSio CI")
    parser.add_argument("--cat", default=None, help="Limiter à une seule catégorie (category_id)")
    parser.add_argument("--topic", default=None, help="Limiter à un seul sujet (sous-chaîne)")
    parser.add_argument("--count", type=int, default=30, help="Questions par sujet (défaut: 30)")
    parser.add_argument("--batches", type=int, default=1, help="Nombre de lots par sujet (défaut: 1)")
    parser.add_argument("--delay", type=float, default=3.0, help="Délai entre appels API en secondes")
    parser.add_argument("--dry-run", action="store_true", help="Lister les sujets sans appeler l'IA")
    args = parser.parse_args()

    # Trier aléatoirement pour varier les sujets à chaque exécution
    catalog = [c for c in CATALOG if (args.cat is None or c["category_id"] == args.cat)]

    if not catalog:
        print(f"❌ Catégorie inconnue : '{args.cat}'. Disponibles : {[c['category_id'] for c in CATALOG]}")
        sys.exit(1)

    total_topics = sum(len(c["topics"]) for c in catalog)
    total_calls = total_topics * args.batches
    print("=" * 65)
    print(f"🚀 AfriSio — Pipeline de Génération Massive (IA)")
    print(f"   Modèle principal  : {MODEL_NAME}")
    print(f"   Modèles fallback  : {len(FALLBACK_MODELS)} ({', '.join(FALLBACK_MODELS[:2])}{'...' if len(FALLBACK_MODELS) > 2 else ''})")
    print(f"   URL API          : {BASE_URL or 'api.openai.com'}")
    print(f"   Catégories        : {len(catalog)}")
    print(f"   Sujets           : {total_topics}")
    print(f"   Questions        : ~{total_topics * args.batches * args.count} au total")
    print(f"   Appels API       : {total_calls}")
    print(f"   Sortie           : {OUTPUT_DIR}")
    print("=" * 65)

    if args.dry_run:
        for cat in catalog:
            print(f"\n📚 {cat['category_name']} ({cat['category_id']})")
            for topic in cat["topics"]:
                if args.topic and args.topic.lower() not in topic.lower():
                    continue
                print(f"   • {topic}")
        return

    from openai import OpenAI
    client = OpenAI(api_key=API_KEY, base_url=BASE_URL)

    success_count = 0
    fail_count = 0

    for cat in catalog:
        print(f"\n📚 {cat['category_name']} ({len(cat['topics'])} sujets)")
        topics = cat["topics"]
        random.shuffle(topics)  # Varier l'ordre

        for topic in topics:
            if args.topic and args.topic.lower() not in topic.lower():
                continue

            for batch_num in range(1, args.batches + 1):
                ok = generate_batch(
                    client=client,
                    category_id=cat["category_id"],
                    category_name=cat["category_name"],
                    topic=topic,
                    difficulty=cat["difficulty"],
                    count=args.count,
                    batch_num=batch_num,
                )
                if ok:
                    success_count += 1
                else:
                    fail_count += 1

                if args.delay > 0:
                    time.sleep(args.delay)

    print("\n" + "=" * 65)
    print(f"✅ Succès : {success_count} fichiers | ❌ Échecs : {fail_count}")
    print(f"📁 Fichiers générés dans : {OUTPUT_DIR}")
    print("   Lancez ensuite : python fast_importer.py")
    print("=" * 65)


if __name__ == "__main__":
    main()
