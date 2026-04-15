import os
import json
import glob
import time
import sys

# ── Fix path so we can import backend modules from the scripts/ subfolder ────
BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BACKEND_DIR)

# Force the SQLite URL to point at backend/afrisio.db regardless of CWD
os.environ.setdefault("DATABASE_URL", f"sqlite:///{os.path.join(BACKEND_DIR, 'afrisio.db')}")

from database import SessionLocal, Base, engine
from models import Category, Quiz, Question, Option

def import_massive_data():
    # Vérifier que les tables existent
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    generated_dir = os.path.join(BACKEND_DIR, "data", "generated")
    json_files = sorted(glob.glob(os.path.join(generated_dir, "*.json")))

    if not json_files:
        print(f"❌ Aucun fichier JSON trouvé dans: {generated_dir}")
        print("   Lancez d'abord `python generate_quizzes.py` pour créer du contenu.")
        return

    print(f"📦 Début de l'importation de {len(json_files)} fichier(s)...")
    start_time = time.time()

    # Construire un index des catégories existantes (par leur id_str stocké dans le JSON)
    all_categories = db.query(Category).all()
    db_categories_by_name = {c.name.lower(): c for c in all_categories}

    # Map category_id string → db Category (insensible à la casse)
    CATEGORY_ID_MAPPING = {
        "culture_generale": "Culture Générale",
        "mathematiques": "Mathématiques",
        "physique": "Physique",
        "sciences_numeriques": "Sciences Numériques",
        "economie": "Économie",
        "francais": "Français",
        "histoire_geo": "Histoire-Géographie",
        "histoire": "Histoire-Géographie",
        "svt": "SVT",
        "anglais": "Anglais",
        "philosophie": "Philosophie",
    }

    def get_or_create_category(cat_id_str: str) -> Category:
        """Retourne la catégorie DB correspondante, ou en crée une si absente."""
        mapped_name = CATEGORY_ID_MAPPING.get(cat_id_str.lower(), cat_id_str.replace("_", " ").title())
        # Chercher par nom exact (insensible à la casse)
        for name_lower, cat in db_categories_by_name.items():
            if name_lower == mapped_name.lower():
                return cat
        # Créer la catégorie si elle n'existe pas
        new_cat = Category(name=mapped_name, description=f"Matière: {mapped_name}", icon="book-open")
        db.add(new_cat)
        db.commit()
        db.refresh(new_cat)
        db_categories_by_name[new_cat.name.lower()] = new_cat
        print(f"   📁 Nouvelle catégorie créée: {mapped_name}")
        return new_cat

    total_questions = 0
    skipped = 0

    for file_path in json_files:
        filename = os.path.basename(file_path)
        with open(file_path, "r", encoding="utf-8") as f:
            try:
                data = json.load(f)
            except json.JSONDecodeError as e:
                print(f"   ⚠️ Fichier JSON invalide ignoré: {filename} ({e})")
                skipped += 1
                continue

        cat_id_str = data.get("category_id", "divers")
        topic = data.get("topic", "Généralité")
        questions = data.get("questions", [])

        if not questions:
            print(f"   ⚠️ Aucune question dans {filename}, ignoré.")
            skipped += 1
            continue

        category = get_or_create_category(cat_id_str)

        # Créer un Quiz lié à cette catégorie
        quiz = Quiz(
            title=f"Quiz : {topic}",
            description=f"Entraînement sur le thème « {topic} » — Généré automatiquement",
            category_id=category.id,
            duration_minutes=max(len(questions) * 2, 20),
            difficulty="medium",
            is_active=True,
        )
        db.add(quiz)
        db.commit()
        db.refresh(quiz)

        # Insérer les questions et options
        for idx, q_data in enumerate(questions):
            q_text = q_data.get("question", "").strip()
            if not q_text:
                continue

            q_obj = Question(
                quiz_id=quiz.id,
                question_text=q_text,
                question_type="multiple_choice",
                explanation=q_data.get("explanation", ""),
                difficulty=q_data.get("difficulty", "medium"),
                points=1,
                order=idx + 1,
            )
            db.add(q_obj)
            db.commit()
            db.refresh(q_obj)

            opts = q_data.get("options", [])
            answer = str(q_data.get("answer", "")).strip()
            options_objs = [
                Option(
                    question_id=q_obj.id,
                    option_text=str(opt),
                    is_correct=(str(opt).strip() == answer),
                    order=o_idx + 1,
                )
                for o_idx, opt in enumerate(opts)
            ]
            db.bulk_save_objects(options_objs)

        db.commit()
        total_questions += len(questions)
        print(f"   ✅ {filename} → {len(questions)} questions importées dans « {category.name} »")

    db.close()
    elapsed = time.time() - start_time
    print(f"\n🎉 Terminé : {total_questions} questions insérées en {elapsed:.1f}s ({skipped} fichier(s) ignoré(s))")

if __name__ == "__main__":
    import_massive_data()
