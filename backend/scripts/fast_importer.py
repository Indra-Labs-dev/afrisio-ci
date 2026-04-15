import os
import json
import glob
import time
import sys

# Ajout du dossier parent au PYTHONPATH pour importer les modèles
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import SessionLocal
from models import Category, Quiz, Question, Option

def import_massive_data():
    db = SessionLocal()
    
    generated_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "generated")
    json_files = glob.glob(os.path.join(generated_dir, "*.json"))
    
    if not json_files:
        print("Aucun fichier JSON trouvé dans data/generated/")
        return
        
    print(f"Début de l'importation de {len(json_files)} fichiers de quiz...")
    start_time = time.time()
    
    # 1. Vérifier que la catégorie racine existe
    db_categories = {c.name.lower(): c for c in db.query(Category).all()}
    
    total_questions = 0
    
    for file_path in json_files:
        with open(file_path, "r", encoding="utf-8") as f:
            try:
                data = json.load(f)
            except json.JSONDecodeError:
                print(f"Erreur de lecture: {file_path}")
                continue
                
        cat_id_str = data.get("category_id", "divers")
        topic = data.get("topic", "Généralité")
        questions = data.get("questions", [])
        
        if not questions:
            continue
            
        # Création ou récupération de la catégorie (Logique basique ici)
        # Dans un vrai scénario, elles sont déjà seedées
        base_cat = list(db_categories.values())[0] if db_categories else None
        if not base_cat:
            base_cat = Category(name="Matière Importée", icon="book")
            db.add(base_cat)
            db.commit()
            db.refresh(base_cat)
            
        # Créer le Quiz
        quiz = Quiz(
            title=f"Quiz : {topic}",
            description=f"Quiz d'entraînement sur le thème {topic} (Généré par IA)",
            category_id=base_cat.id,
            duration_minutes=len(questions) * 2,
            difficulty="medium",
            is_active=True
        )
        db.add(quiz)
        db.commit()
        db.refresh(quiz)
        
        # Bulk Insert des questions et options
        questions_to_insert = []
        for idx, q_data in enumerate(questions):
            q_text = q_data.get("question", "")
            diff = q_data.get("difficulty", "medium")
            exp = q_data.get("explanation", "")
            
            q_obj = Question(
                quiz_id=quiz.id,
                question_text=q_text,
                question_type="multiple_choice",
                explanation=exp,
                difficulty=diff,
                points=1,
                order=idx + 1
            )
            questions_to_insert.append((q_obj, q_data.get("options", []), q_data.get("answer", "")))
            
        # Sauvegarde des questions par lot
        q_models = [item[0] for item in questions_to_insert]
        db.bulk_save_objects(q_models, return_defaults=True)
        # return_defaults permet de récupérer les IDs générés par la BDD (attention, avec SQLite ça peut être tricky, tester si db.add_all est préferable sinon)
        # Surtout que SQLite bulk_save ne renvoie pas les IDs si return_defaults=False.
        # Fallback classique db.add_all() si IDs manquants.
        db.commit()
        
        # Associer les options avec les IDs de questions récupérés
        options_to_insert = []
        for i, (q_model, opts, answer) in enumerate(questions_to_insert):
            # Si return_defaults n'a pas mis à jour l'ID, on refait un add_all !
            if not q_model.id:
                db.add(q_model)
                db.commit()
                
            for o_idx, opt_text in enumerate(opts):
                is_correct = (str(opt_text).strip() == str(answer).strip())
                options_to_insert.append(
                    Option(
                        question_id=q_model.id,
                        option_text=opt_text,
                        is_correct=is_correct,
                        order=o_idx + 1
                    )
                )
                
        db.bulk_save_objects(options_to_insert)
        db.commit()
        
        total_questions += len(questions)
        print(f"✅ Fichier importé : {os.path.basename(file_path)} ({len(questions)} questions ajoutées)")
        
    db.close()
    elapsed = time.time() - start_time
    print(f"\n🎉 Importation massive terminée: {total_questions} questions insérées en {elapsed:.2f} secondes !")

if __name__ == "__main__":
    import_massive_data()
