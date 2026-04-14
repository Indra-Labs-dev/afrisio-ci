from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from database import engine, Base, get_db
from models import Category, Quiz, Question, Option, QuizAttempt, UserAnswer
from schemas import (
    CategoryResponse, QuizResponse, QuizDetailResponse, QuizResultResponse,
    QuizStartResponse, QuizSubmit, UserAnswerCreate
)
from seed_data import seed_database

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AfriSio CI API",
    description="API for AfriSio CI - Quiz Platform for Côte d'Ivoire",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    seed_database()


# Categories endpoints
@app.get("/api/categories", response_model=List[CategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    categories = db.query(Category).all()
    return categories


@app.get("/api/categories/{category_id}", response_model=CategoryResponse)
def get_category(category_id: int, db: Session = Depends(get_db)):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category


# Quizzes endpoints
@app.get("/api/quizzes", response_model=List[QuizResponse])
def get_quizzes(
    category_id: int = None,
    difficulty: str = None,
    db: Session = Depends(get_db)
):
    query = db.query(Quiz).filter(Quiz.is_active == True)

    if category_id:
        query = query.filter(Quiz.category_id == category_id)
    if difficulty:
        query = query.filter(Quiz.difficulty == difficulty)

    quizzes = query.all()

    # Add question count to each quiz
    result = []
    for quiz in quizzes:
        quiz_dict = {
            "id": quiz.id,
            "title": quiz.title,
            "description": quiz.description,
            "duration_minutes": quiz.duration_minutes,
            "difficulty": quiz.difficulty,
            "is_active": quiz.is_active,
            "category_id": quiz.category_id,
            "created_at": quiz.created_at,
            "category": quiz.category,
            "question_count": len(quiz.questions)
        }
        result.append(quiz_dict)

    return result


@app.get("/api/quizzes/{quiz_id}", response_model=QuizDetailResponse)
def get_quiz(quiz_id: int, db: Session = Depends(get_db)):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id, Quiz.is_active == True).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    # Build response without correct answers
    questions = []
    for q in quiz.questions:
        question_dict = {
            "id": q.id,
            "question_text": q.question_text,
            "question_type": q.question_type,
            "points": q.points,
            "order": q.order,
            "options": [{"id": opt.id, "option_text": opt.option_text, "is_correct": False, "order": opt.order} for opt in q.options]
        }
        questions.append(question_dict)

    return {
        "id": quiz.id,
        "title": quiz.title,
        "description": quiz.description,
        "duration_minutes": quiz.duration_minutes,
        "difficulty": quiz.difficulty,
        "is_active": quiz.is_active,
        "category_id": quiz.category_id,
        "created_at": quiz.created_at,
        "category": quiz.category,
        "question_count": len(quiz.questions),
        "questions": questions
    }


# Quiz attempt endpoints
@app.post("/api/quizzes/{quiz_id}/start", response_model=QuizStartResponse)
def start_quiz(quiz_id: int, db: Session = Depends(get_db)):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id, Quiz.is_active == True).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    # Create a new attempt
    attempt = QuizAttempt(
        quiz_id=quiz_id,
        max_score=sum(q.points for q in quiz.questions)
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)

    # Build response without correct answers
    questions = []
    for q in sorted(quiz.questions, key=lambda x: x.order):
        question_dict = {
            "id": q.id,
            "question_text": q.question_text,
            "question_type": q.question_type,
            "points": q.points,
            "order": q.order,
            "options": [{"id": opt.id, "option_text": opt.option_text, "is_correct": False, "order": opt.order} for opt in q.options]
        }
        questions.append(question_dict)

    quiz_data = {
        "id": quiz.id,
        "title": quiz.title,
        "description": quiz.description,
        "duration_minutes": quiz.duration_minutes,
        "difficulty": quiz.difficulty,
        "is_active": quiz.is_active,
        "category_id": quiz.category_id,
        "created_at": quiz.created_at,
        "category": quiz.category,
        "question_count": len(quiz.questions),
        "questions": questions
    }

    return {"attempt_id": attempt.id, "quiz": quiz_data}


@app.post("/api/quizzes/submit", response_model=QuizResultResponse)
def submit_quiz(submission: QuizSubmit, db: Session = Depends(get_db)):
    attempt = db.query(QuizAttempt).filter(QuizAttempt.id == submission.attempt_id).first()
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")

    if attempt.completed_at:
        raise HTTPException(status_code=400, detail="Quiz already submitted")

    quiz = db.query(Quiz).filter(Quiz.id == attempt.quiz_id).first()

    # Calculate score
    score = 0
    user_answers = []

    for answer_data in submission.answers:
        question = db.query(Question).filter(Question.id == answer_data.question_id).first()
        if not question:
            continue

        # Find the correct option
        correct_option = db.query(Option).filter(
            Option.question_id == question.id,
            Option.is_correct == True
        ).first()

        is_correct = False
        if answer_data.selected_option_id and correct_option:
            is_correct = answer_data.selected_option_id == correct_option.id

        if is_correct:
            score += question.points

        user_answer = UserAnswer(
            attempt_id=attempt.id,
            question_id=answer_data.question_id,
            selected_option_id=answer_data.selected_option_id,
            is_correct=is_correct
        )
        db.add(user_answer)

        user_answers.append({
            "question_id": answer_data.question_id,
            "selected_option_id": answer_data.selected_option_id,
            "is_correct": is_correct,
            "correct_option_id": correct_option.id if correct_option else None
        })

    # Update attempt
    attempt.score = score
    attempt.percentage = (score / attempt.max_score * 100) if attempt.max_score > 0 else 0
    attempt.completed_at = datetime.utcnow()
    attempt.time_spent_seconds = submission.time_spent_seconds

    db.commit()
    db.refresh(attempt)

    return {
        "attempt": {
            "id": attempt.id,
            "quiz_id": attempt.quiz_id,
            "score": attempt.score,
            "max_score": attempt.max_score,
            "percentage": attempt.percentage,
            "started_at": attempt.started_at,
            "completed_at": attempt.completed_at,
            "time_spent_seconds": attempt.time_spent_seconds,
            "quiz": {
                "id": quiz.id,
                "title": quiz.title,
                "description": quiz.description,
                "duration_minutes": quiz.duration_minutes,
                "difficulty": quiz.difficulty,
                "is_active": quiz.is_active,
                "category_id": quiz.category_id,
                "created_at": quiz.created_at,
                "category": quiz.category,
                "question_count": len(quiz.questions)
            }
        },
        "answers": user_answers
    }


@app.get("/api/attempts/{attempt_id}", response_model=QuizResultResponse)
def get_attempt(attempt_id: int, db: Session = Depends(get_db)):
    attempt = db.query(QuizAttempt).filter(QuizAttempt.id == attempt_id).first()
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")

    quiz = db.query(Quiz).filter(Quiz.id == attempt.quiz_id).first()

    user_answers = []
    for answer in attempt.answers:
        correct_option = db.query(Option).filter(
            Option.question_id == answer.question_id,
            Option.is_correct == True
        ).first()

        user_answers.append({
            "question_id": answer.question_id,
            "selected_option_id": answer.selected_option_id,
            "is_correct": answer.is_correct,
            "correct_option_id": correct_option.id if correct_option else None
        })

    return {
        "attempt": {
            "id": attempt.id,
            "quiz_id": attempt.quiz_id,
            "score": attempt.score,
            "max_score": attempt.max_score,
            "percentage": attempt.percentage,
            "started_at": attempt.started_at,
            "completed_at": attempt.completed_at,
            "time_spent_seconds": attempt.time_spent_seconds,
            "quiz": {
                "id": quiz.id,
                "title": quiz.title,
                "description": quiz.description,
                "duration_minutes": quiz.duration_minutes,
                "difficulty": quiz.difficulty,
                "is_active": quiz.is_active,
                "category_id": quiz.category_id,
                "created_at": quiz.created_at,
                "category": quiz.category,
                "question_count": len(quiz.questions)
            }
        },
        "answers": user_answers
    }


@app.get("/api/attempts", response_model=List[QuizResultResponse])
def get_attempts(limit: int = 10, db: Session = Depends(get_db)):
    attempts = db.query(QuizAttempt).filter(
        QuizAttempt.completed_at != None
    ).order_by(QuizAttempt.completed_at.desc()).limit(limit).all()

    result = []
    for attempt in attempts:
        quiz = db.query(Quiz).filter(Quiz.id == attempt.quiz_id).first()

        user_answers = []
        for answer in attempt.answers:
            correct_option = db.query(Option).filter(
                Option.question_id == answer.question_id,
                Option.is_correct == True
            ).first()

            user_answers.append({
                "question_id": answer.question_id,
                "selected_option_id": answer.selected_option_id,
                "is_correct": answer.is_correct,
                "correct_option_id": correct_option.id if correct_option else None
            })

        result.append({
            "attempt": {
                "id": attempt.id,
                "quiz_id": attempt.quiz_id,
                "score": attempt.score,
                "max_score": attempt.max_score,
                "percentage": attempt.percentage,
                "started_at": attempt.started_at,
                "completed_at": attempt.completed_at,
                "time_spent_seconds": attempt.time_spent_seconds,
                "quiz": {
                    "id": quiz.id,
                    "title": quiz.title,
                    "description": quiz.description,
                    "duration_minutes": quiz.duration_minutes,
                    "difficulty": quiz.difficulty,
                    "is_active": quiz.is_active,
                    "category_id": quiz.category_id,
                    "created_at": quiz.created_at,
                    "category": quiz.category,
                    "question_count": len(quiz.questions)
                }
            },
            "answers": user_answers
        })

    return result


@app.get("/")
def root():
    return {"message": "Welcome to AfriSio CI API", "version": "1.0.0"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
