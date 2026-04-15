import json
import os
import glob
import re
from database import SessionLocal, engine
from models import Base, Category, Quiz, Question, Option, Course, Lesson

def seed_database():
    print("Dropping existing tables...")
    Base.metadata.drop_all(bind=engine)
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()

    # Load JSON for categories and quizzes
    json_path = os.path.join(os.path.dirname(__file__), "data", "afrisio_questions.json")
    if not os.path.exists(json_path):
        print(f"JSON file not found at {json_path}")
        return

    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    icons = {
        "culture_generale": "book-open",
        "mathematiques": "calculator",
        "physique": "atom",
        "sciences_numeriques": "computer",
        "economie": "trending-up",
        "francais": "pen-tool"
    }

    db_categories = {}

    for cat_data in data.get("categories", []):
        cat_id_str = cat_data.get("id")
        label = cat_data.get("label", "Unknown")
        description = cat_data.get("description", "")
        questions = cat_data.get("questions", [])
        
        # Create Category
        icon = icons.get(cat_id_str, "file-text")
        db_category = Category(name=label, description=description, icon=icon)
        db.add(db_category)
        db.commit()
        db.refresh(db_category)
        
        db_categories[cat_id_str] = db_category
        
        # Create a single Quiz for this Category
        quiz_title = f"{label} Complet"
        db_quiz = Quiz(
            title=quiz_title,
            description=f"Quiz complet sur: {label}",
            category_id=db_category.id,
            duration_minutes=30,
            difficulty="medium",
            is_active=True
        )
        db.add(db_quiz)
        db.commit()
        db.refresh(db_quiz)
        
        # Add questions
        for i, q_data in enumerate(questions):
            q_text = q_data.get("question")
            explanation = q_data.get("explanation")
            difficulty = q_data.get("difficulty", "medium")
            
            db_question = Question(
                quiz_id=db_quiz.id,
                question_text=q_text,
                question_type="multiple_choice",
                explanation=explanation,
                difficulty=difficulty,
                points=1,
                order=i + 1
            )
            db.add(db_question)
            db.commit()
            db.refresh(db_question)
            
            # Add options
            q_options = q_data.get("options", [])
            answer = q_data.get("answer")
            
            db_options = []
            for j, opt_text in enumerate(q_options):
                is_correct = (str(opt_text).strip() == str(answer).strip())
                db_option = Option(
                    question_id=db_question.id,
                    option_text=str(opt_text),
                    is_correct=is_correct,
                    order=j + 1
                )
                db_options.append(db_option)
            
            db.add_all(db_options)
            db.commit()

    # Create Courses from Markdown files
    cours_dir = os.path.join(os.path.dirname(__file__), "data", "cours")
    if os.path.exists(cours_dir):
        for md_file in glob.glob(os.path.join(cours_dir, "*.md")):
            cat_id_str = os.path.basename(md_file).replace(".md", "")
            db_category = db_categories.get(cat_id_str)
            if not db_category:
                continue
                
            with open(md_file, "r", encoding="utf-8") as f:
                content = f.read()
                
            title_match = re.search(r"^#\s+(.+)$", content, re.MULTILINE)
            course_title = title_match.group(1).replace("— AfriSio CI", "").strip() if title_match else db_category.name
            
            db_course = Course(
                category_id=db_category.id,
                title=course_title,
                description=f"Cours complet de {course_title}",
                is_active=True
            )
            db.add(db_course)
            db.commit()
            db.refresh(db_course)
            
            # Split by ## Leçon
            lessons = re.split(r"^##\s+", content, flags=re.MULTILINE)
            for i, lesson_text in enumerate(lessons[1:]):  # skip preamble
                lines = lesson_text.split("\n", 1)
                lesson_title = lines[0].strip()
                lesson_content = lines[1].strip() if len(lines) > 1 else ""
                
                db_lesson = Lesson(
                    course_id=db_course.id,
                    title=lesson_title,
                    content=lesson_content,
                    order=i + 1
                )
                db.add(db_lesson)
            db.commit()

    print("Database seeded successfully with data from JSON and Courses MD!")
    db.close()

if __name__ == "__main__":
    seed_database()
