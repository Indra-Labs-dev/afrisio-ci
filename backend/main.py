from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime

from database import engine, Base, get_db
from models import Category, Quiz, Question, Option, QuizAttempt, UserAnswer, User
from schemas import (
    CategoryResponse, QuizResponse, QuizDetailResponse, QuizResultResponse,
    QuizStartResponse, QuizSubmit, UserAnswerCreate,
    UserRegister, UserLogin, TokenResponse, UserResponse, DashboardResponse, CategoryStat,
)
from auth import (
    hash_password, verify_password, create_access_token,
    get_current_user, get_current_user_optional,
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
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:8080",
        "http://localhost:8081",
        "http://127.0.0.1:8080",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    seed_database()


# ──────────────────────────────────────────────────────────────────────────────
# AUTH
# ──────────────────────────────────────────────────────────────────────────────

@app.post("/api/auth/register", response_model=TokenResponse, status_code=201)
def register(data: UserRegister, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email déjà utilisé")
    if db.query(User).filter(User.username == data.username).first():
        raise HTTPException(status_code=400, detail="Nom d'utilisateur déjà pris")

    user = User(
        email=data.email,
        username=data.username,
        hashed_password=hash_password(data.password),
        full_name=data.full_name,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer", "user": user}


@app.post("/api/auth/login", response_model=TokenResponse)
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Identifiants incorrects")

    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer", "user": user}


@app.get("/api/auth/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)):
    return current_user


# ──────────────────────────────────────────────────────────────────────────────
# DASHBOARD
# ──────────────────────────────────────────────────────────────────────────────

@app.get("/api/dashboard", response_model=DashboardResponse)
def get_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    attempts = (
        db.query(QuizAttempt)
        .filter(QuizAttempt.user_id == current_user.id, QuizAttempt.completed_at != None)
        .all()
    )

    total_quizzes = len(attempts)
    avg_score = (sum(a.percentage for a in attempts) / total_quizzes) if total_quizzes else 0.0
    best_score = max((a.percentage for a in attempts), default=0.0)
    total_points = sum(a.score for a in attempts)

    # Rank: how many users have more total points
    all_user_points = (
        db.query(QuizAttempt.user_id, func.sum(QuizAttempt.score).label("pts"))
        .filter(QuizAttempt.completed_at != None, QuizAttempt.user_id != None)
        .group_by(QuizAttempt.user_id)
        .all()
    )
    rank = sum(1 for _, pts in all_user_points if pts > total_points) + 1

    # Per-category stats
    category_map: dict[int, dict] = {}
    for attempt in attempts:
        quiz = db.query(Quiz).filter(Quiz.id == attempt.quiz_id).first()
        if not quiz:
            continue
        cid = quiz.category_id
        if cid not in category_map:
            category_map[cid] = {"name": quiz.category.name, "icon": quiz.category.icon, "percentages": []}
        category_map[cid]["percentages"].append(attempt.percentage)

    category_stats = [
        CategoryStat(
            category_name=v["name"],
            icon=v["icon"],
            quizzes_done=len(v["percentages"]),
            avg_percentage=round(sum(v["percentages"]) / len(v["percentages"]), 1),
        )
        for v in category_map.values()
    ]

    return DashboardResponse(
        total_quizzes=total_quizzes,
        avg_score=round(avg_score, 1),
        best_score=round(best_score, 1),
        total_points=total_points,
        rank=rank,
        category_stats=category_stats,
    )


# ──────────────────────────────────────────────────────────────────────────────
# CATEGORIES
# ──────────────────────────────────────────────────────────────────────────────

@app.get("/api/categories", response_model=List[CategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    return db.query(Category).all()


@app.get("/api/categories/{category_id}", response_model=CategoryResponse)
def get_category(category_id: int, db: Session = Depends(get_db)):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category


# ──────────────────────────────────────────────────────────────────────────────
# QUIZZES
# ──────────────────────────────────────────────────────────────────────────────

@app.get("/api/quizzes", response_model=List[QuizResponse])
def get_quizzes(
    category_id: Optional[int] = None,
    difficulty: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Quiz).filter(Quiz.is_active == True)
    if category_id:
        query = query.filter(Quiz.category_id == category_id)
    if difficulty:
        query = query.filter(Quiz.difficulty == difficulty)

    quizzes = query.all()
    result = []
    for quiz in quizzes:
        result.append({
            "id": quiz.id, "title": quiz.title, "description": quiz.description,
            "duration_minutes": quiz.duration_minutes, "difficulty": quiz.difficulty,
            "is_active": quiz.is_active, "category_id": quiz.category_id,
            "created_at": quiz.created_at, "category": quiz.category,
            "question_count": len(quiz.questions),
        })
    return result


@app.get("/api/quizzes/{quiz_id}", response_model=QuizDetailResponse)
def get_quiz(quiz_id: int, db: Session = Depends(get_db)):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id, Quiz.is_active == True).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    questions = []
    for q in quiz.questions:
        questions.append({
            "id": q.id, "question_text": q.question_text, "question_type": q.question_type,
            "points": q.points, "order": q.order,
            "options": [{"id": o.id, "option_text": o.option_text, "is_correct": False, "order": o.order} for o in q.options],
        })
    return {
        "id": quiz.id, "title": quiz.title, "description": quiz.description,
        "duration_minutes": quiz.duration_minutes, "difficulty": quiz.difficulty,
        "is_active": quiz.is_active, "category_id": quiz.category_id,
        "created_at": quiz.created_at, "category": quiz.category,
        "question_count": len(quiz.questions), "questions": questions,
    }


# ──────────────────────────────────────────────────────────────────────────────
# QUIZ ATTEMPT FLOW
# ──────────────────────────────────────────────────────────────────────────────

@app.post("/api/quizzes/{quiz_id}/start", response_model=QuizStartResponse)
def start_quiz(
    quiz_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id, Quiz.is_active == True).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    attempt = QuizAttempt(
        quiz_id=quiz_id,
        user_id=current_user.id if current_user else None,
        max_score=sum(q.points for q in quiz.questions),
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)

    questions = []
    for q in sorted(quiz.questions, key=lambda x: x.order):
        questions.append({
            "id": q.id, "question_text": q.question_text, "question_type": q.question_type,
            "points": q.points, "order": q.order,
            "options": [{"id": o.id, "option_text": o.option_text, "is_correct": False, "order": o.order} for o in q.options],
        })

    quiz_data = {
        "id": quiz.id, "title": quiz.title, "description": quiz.description,
        "duration_minutes": quiz.duration_minutes, "difficulty": quiz.difficulty,
        "is_active": quiz.is_active, "category_id": quiz.category_id,
        "created_at": quiz.created_at, "category": quiz.category,
        "question_count": len(quiz.questions), "questions": questions,
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
    score = 0
    user_answers = []

    for answer_data in submission.answers:
        question = db.query(Question).filter(Question.id == answer_data.question_id).first()
        if not question:
            continue

        correct_option = db.query(Option).filter(
            Option.question_id == question.id, Option.is_correct == True
        ).first()

        is_correct = False
        if answer_data.selected_option_id and correct_option:
            is_correct = answer_data.selected_option_id == correct_option.id
        if is_correct:
            score += question.points

        db.add(UserAnswer(
            attempt_id=attempt.id,
            question_id=answer_data.question_id,
            selected_option_id=answer_data.selected_option_id,
            is_correct=is_correct,
        ))
        user_answers.append({
            "question_id": answer_data.question_id,
            "selected_option_id": answer_data.selected_option_id,
            "is_correct": is_correct,
            "correct_option_id": correct_option.id if correct_option else None,
        })

    attempt.score = score
    attempt.percentage = (score / attempt.max_score * 100) if attempt.max_score > 0 else 0
    attempt.completed_at = datetime.utcnow()
    attempt.time_spent_seconds = submission.time_spent_seconds
    db.commit()
    db.refresh(attempt)

    return {
        "attempt": {
            "id": attempt.id, "quiz_id": attempt.quiz_id, "score": attempt.score,
            "max_score": attempt.max_score, "percentage": attempt.percentage,
            "started_at": attempt.started_at, "completed_at": attempt.completed_at,
            "time_spent_seconds": attempt.time_spent_seconds,
            "quiz": {
                "id": quiz.id, "title": quiz.title, "description": quiz.description,
                "duration_minutes": quiz.duration_minutes, "difficulty": quiz.difficulty,
                "is_active": quiz.is_active, "category_id": quiz.category_id,
                "created_at": quiz.created_at, "category": quiz.category,
                "question_count": len(quiz.questions),
            },
        },
        "answers": user_answers,
    }


# ──────────────────────────────────────────────────────────────────────────────
# ATTEMPTS
# ──────────────────────────────────────────────────────────────────────────────

def _build_result(attempt, quiz, db):
    user_answers = []
    for answer in attempt.answers:
        correct_option = db.query(Option).filter(
            Option.question_id == answer.question_id, Option.is_correct == True
        ).first()
        user_answers.append({
            "question_id": answer.question_id,
            "selected_option_id": answer.selected_option_id,
            "is_correct": answer.is_correct,
            "correct_option_id": correct_option.id if correct_option else None,
        })
    return {
        "attempt": {
            "id": attempt.id, "quiz_id": attempt.quiz_id, "score": attempt.score,
            "max_score": attempt.max_score, "percentage": attempt.percentage,
            "started_at": attempt.started_at, "completed_at": attempt.completed_at,
            "time_spent_seconds": attempt.time_spent_seconds,
            "quiz": {
                "id": quiz.id, "title": quiz.title, "description": quiz.description,
                "duration_minutes": quiz.duration_minutes, "difficulty": quiz.difficulty,
                "is_active": quiz.is_active, "category_id": quiz.category_id,
                "created_at": quiz.created_at, "category": quiz.category,
                "question_count": len(quiz.questions),
            },
        },
        "answers": user_answers,
    }


@app.get("/api/attempts/{attempt_id}", response_model=QuizResultResponse)
def get_attempt(attempt_id: int, db: Session = Depends(get_db)):
    attempt = db.query(QuizAttempt).filter(QuizAttempt.id == attempt_id).first()
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")
    quiz = db.query(Quiz).filter(Quiz.id == attempt.quiz_id).first()
    return _build_result(attempt, quiz, db)


@app.get("/api/attempts", response_model=List[QuizResultResponse])
def get_attempts(
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    query = db.query(QuizAttempt).filter(QuizAttempt.completed_at != None)
    if current_user:
        query = query.filter(QuizAttempt.user_id == current_user.id)
    attempts = query.order_by(QuizAttempt.completed_at.desc()).limit(limit).all()

    result = []
    for attempt in attempts:
        quiz = db.query(Quiz).filter(Quiz.id == attempt.quiz_id).first()
        result.append(_build_result(attempt, quiz, db))
    return result


@app.get("/api/leaderboard", response_model=List[QuizResultResponse])
def get_leaderboard(limit: int = 20, db: Session = Depends(get_db)):
    """All completed attempts ordered by percentage desc — global leaderboard."""
    attempts = (
        db.query(QuizAttempt)
        .filter(QuizAttempt.completed_at != None)
        .order_by(QuizAttempt.percentage.desc())
        .limit(limit)
        .all()
    )
    result = []
    for attempt in attempts:
        quiz = db.query(Quiz).filter(Quiz.id == attempt.quiz_id).first()
        result.append(_build_result(attempt, quiz, db))
    return result


@app.get("/")
def root():
    return {"message": "Welcome to AfriSio CI API", "version": "1.0.0"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
