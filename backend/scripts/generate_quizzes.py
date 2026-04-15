import os
import json
import time
from dotenv import load_dotenv
from openai import OpenAI

# Charge les variables telles que OPENAI_API_KEY, AI_BASE_URL (ex: Ollama ou OpenRouter) et AI_MODEL
load_dotenv()

API_KEY = os.getenv("AI_API_KEY", "dummy_key_for_local")
BASE_URL = os.getenv("AI_BASE_URL")  # Exemple: "http://localhost:11434/v1" pour Ollama
MODEL_NAME = os.getenv("AI_MODEL", "arcee-ai/trinity-large-preview:free")

client = OpenAI(
    api_key=API_KEY,
    base_url=BASE_URL,
)

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "generated")
os.makedirs(OUTPUT_DIR, exist_ok=True)

PROMPT_TEMPLATE = """
Tu es un professeur expert de niveau international. Génère exactement {count} questions de QCM pour la catégorie "{category}", sur le sous-thème de "{topic}".
Le niveau de difficulté doit être "{difficulty}".
Assure-toi que les questions ne se répètent pas et soient pédagogiques avec des explications claires.

Format JSON attendu (aucune balise Markdown, renvoie uniquement le JSON brut prêt à être parsé):
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
}}
"""

def generate_questions(category_id: str, category_name: str, topic: str, difficulty: str, count: int = 10, batch_num: int = 1):
    prompt = PROMPT_TEMPLATE.format(
        category_id=category_id,
        category=category_name,
        topic=topic,
        difficulty=difficulty,
        count=count
    )
    
    print(f"Génération du lot #{batch_num} pour {category_name} ({topic}) via {MODEL_NAME}...")
    
    try:
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": "Tu es un générateur de données JSON. Tu ne dois renvoyer que du JSON valide, sans balises ```json."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.8
        )
        
        content = response.choices[0].message.content.strip()
        if content.startswith("```json"):
            content = content.replace("```json", "").replace("```", "").strip()
            
        data = json.loads(content)
        
        # Sauvegarde
        filename = f"{category_id}_{topic.replace(' ', '_')}_batch{batch_num}.json"
        filepath = os.path.join(OUTPUT_DIR, filename)
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
            
        print(f"✅ Lot {batch_num} sauvegardé: {filepath}")
        return True
    except Exception as e:
        print(f"❌ Erreur lors de la génération: {e}")
        return False

if __name__ == "__main__":
    # EXEMPLE D'UTILISATION MASSIVE
    # Pour atteindre 1000 quiz (10 000 questions), vous mettriez cette boucle dans un grand tableau de sujets.
    
    sujets_histoire = [
        "Empire du Mali", 
        "Première Guerre Mondiale", 
        "Révolution Industrielle", 
        "Décolonisation de l'Afrique"
    ]
    
    print("=== Pipeline de Génération Automatisée IA ===")
    print(f"API configurée: {BASE_URL if BASE_URL else 'OpenAI Officiel'}")
    
    for idx, sujet in enumerate(sujets_histoire):
        # Générer 5 questions par sous-thème (vous pouvez augmenter à 20-50 selon votre LLM)
        generate_questions("histoire_geo", "Histoire-Géographie", sujet, "medium", count=5, batch_num=idx+1)
        time.sleep(2) # Eviter le rate-limit
