from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime, timedelta
import secrets
import random

from database import engine, Base, get_db
from models import Category, Quiz, Question, Option, QuizAttempt, UserAnswer, User, Course, Lesson, Badge, UserBadge
from schemas import (
    CategoryResponse, QuizResponse, QuizDetailResponse, QuizResultResponse,
    QuizStartResponse, QuizSubmit, UserAnswerCreate,
    UserRegister, UserLogin, TokenResponse, UserResponse, DashboardResponse, CategoryStat,
    CourseResponse, CourseDetailResponse, LessonResponse,
    BadgeResponse, UserBadgeResponse,
    ForgotPasswordRequest, ResetPasswordRequest,
    AvatarUpdateRequest, AdminQuizCreate, AdminCourseCreate, QuestionCreate
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


def seed_badges(db: Session):
    """Seed default badges if not present."""
    default_badges = [
        {"name": "Premier Pas", "description": "Compléter son premier quiz", "icon": "🌟", "condition_type": "quizzes_done", "condition_value": 1},
        {"name": "Explorateur", "description": "Compléter 5 quiz", "icon": "🔭", "condition_type": "quizzes_done", "condition_value": 5},
        {"name": "Assidu", "description": "Compléter 10 quiz", "icon": "📚", "condition_type": "quizzes_done", "condition_value": 10},
        {"name": "Champion", "description": "Compléter 25 quiz", "icon": "🏆", "condition_type": "quizzes_done", "condition_value": 25},
        {"name": "Bon Élève", "description": "Obtenir une moyenne de 70%", "icon": "✅", "condition_type": "avg_score", "condition_value": 70},
        {"name": "Excellence", "description": "Obtenir une moyenne de 90%", "icon": "💎", "condition_type": "avg_score", "condition_value": 90},
        {"name": "Débutant XP", "description": "Atteindre 100 XP", "icon": "⚡", "condition_type": "total_xp", "condition_value": 100},
        {"name": "Guerrier XP", "description": "Atteindre 500 XP", "icon": "🔥", "condition_type": "total_xp", "condition_value": 500},
        {"name": "Légende XP", "description": "Atteindre 1000 XP", "icon": "👑", "condition_type": "total_xp", "condition_value": 1000},
    ]
    for b in default_badges:
        if not db.query(Badge).filter(Badge.name == b["name"]).first():
            db.add(Badge(**b))
    db.commit()


def compute_level(xp: int) -> int:
    """XP thresholds: L1=0, L2=100, L3=250, L4=500, L5=1000, +500 per level."""
    thresholds = [0, 100, 250, 500, 1000]
    level = 1
    for i, t in enumerate(thresholds):
        if xp >= t:
            level = i + 1
    if xp >= 1000:
        level = 5 + (xp - 1000) // 500
    return level


def award_badges(user: User, db: Session):
    """Check and award badges based on user stats."""
    attempts = db.query(QuizAttempt).filter(
        QuizAttempt.user_id == user.id, QuizAttempt.completed_at != None
    ).all()
    total_quizzes = len(attempts)
    avg_score = (sum(a.percentage for a in attempts) / total_quizzes) if total_quizzes else 0

    already_awarded = {ub.badge_id for ub in db.query(UserBadge).filter(UserBadge.user_id == user.id).all()}
    all_badges = db.query(Badge).all()
    new_badges = []

    for badge in all_badges:
        if badge.id in already_awarded:
            continue
        earned = False
        if badge.condition_type == "quizzes_done" and total_quizzes >= badge.condition_value:
            earned = True
        elif badge.condition_type == "avg_score" and avg_score >= badge.condition_value:
            earned = True
        elif badge.condition_type == "total_xp" and user.xp >= badge.condition_value:
            earned = True
        if earned:
            db.add(UserBadge(user_id=user.id, badge_id=badge.id))
            new_badges.append(badge.name)

    db.commit()
    return new_badges


@app.on_event("startup")
async def startup_event():
    seed_database()
    db = next(get_db())
    try:
        seed_badges(db)
    finally:
        db.close()


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


@app.post("/api/auth/forgot-password")
def forgot_password(data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        # Don't reveal if email exists
        return {"message": "Si cet email existe, un lien a été envoyé."}
    token = secrets.token_urlsafe(32)
    user.reset_token = token
    user.reset_token_expires = datetime.utcnow() + timedelta(hours=1)
    db.commit()
    # In production: send email. For dev, return token directly.
    return {"message": "Lien de réinitialisation généré.", "dev_token": token}


@app.post("/api/auth/reset-password")
def reset_password(data: ResetPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.reset_token == data.token).first()
    if not user or not user.reset_token_expires or user.reset_token_expires < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Token invalide ou expiré")
    if len(data.new_password) < 6:
        raise HTTPException(status_code=400, detail="Mot de passe trop court (min 6 caractères)")
    user.hashed_password = hash_password(data.new_password)
    user.reset_token = None
    user.reset_token_expires = None
    db.commit()
    return {"message": "Mot de passe réinitialisé avec succès"}


# ──────────────────────────────────────────────────────────────────────────────
# PROFILE / AVATAR
# ──────────────────────────────────────────────────────────────────────────────

@app.put("/api/profile/avatar", response_model=UserResponse)
def update_avatar(
    data: AvatarUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    current_user.avatar_url = data.avatar_url
    db.commit()
    db.refresh(current_user)
    return current_user


@app.get("/api/profile/badges", response_model=List[UserBadgeResponse])
def get_my_badges(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.query(UserBadge).filter(UserBadge.user_id == current_user.id).all()


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
# COURSES
# ──────────────────────────────────────────────────────────────────────────────

@app.get("/api/courses", response_model=List[CourseResponse])
def get_courses(category_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(Course).filter(Course.is_active == True)
    if category_id:
        query = query.filter(Course.category_id == category_id)
    return query.all()

@app.get("/api/courses/{course_id}", response_model=CourseDetailResponse)
def get_course(course_id: int, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id, Course.is_active == True).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    lessons = sorted(course.lessons, key=lambda l: l.order)
    return {
        "id": course.id, "title": course.title, "description": course.description,
        "is_active": course.is_active, "category_id": course.category_id,
        "created_at": course.created_at, "category": course.category,
        "lessons": [{"id": l.id, "title": l.title, "content": l.content, "order": l.order} for l in lessons]
    }

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


@app.get("/api/quizzes/random", response_model=QuizDetailResponse)
def get_random_quiz(count: int = 20, db: Session = Depends(get_db)):
    """Pick random questions from all quizzes and return as a virtual quiz."""
    all_questions = db.query(Question).all()
    if len(all_questions) < count:
        count = len(all_questions)
    selected = random.sample(all_questions, count)

    # Use a random existing quiz as prototype
    base_quiz = db.query(Quiz).filter(Quiz.is_active == True).first()
    if not base_quiz:
        raise HTTPException(status_code=404, detail="No quizzes available")

    questions_data = []
    for i, q in enumerate(selected):
        questions_data.append({
            "id": q.id, "question_text": q.question_text, "question_type": q.question_type,
            "points": q.points, "order": i, "difficulty": q.difficulty,
            "options": [{"id": o.id, "option_text": o.option_text, "is_correct": False, "order": o.order} for o in q.options],
        })

    return {
        "id": 0, "title": f"Examen Blanc — {count} Questions Aléatoires",
        "description": "Questions sélectionnées aléatoirement dans toutes les matières",
        "duration_minutes": max(count * 2, 30), "difficulty": "mixed",
        "is_active": True, "category_id": base_quiz.category_id,
        "created_at": datetime.utcnow(), "category": base_quiz.category,
        "question_count": count, "questions": questions_data,
    }


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

        selected_option = db.query(Option).filter(Option.id == answer_data.selected_option_id).first() if answer_data.selected_option_id else None

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
            "explanation": question.explanation if question else None,
            "question_text": question.question_text if question else None,
            "selected_option_text": selected_option.option_text if selected_option else None,
            "correct_option_text": correct_option.option_text if correct_option else None,
        })

    attempt.score = score
    attempt.percentage = (score / attempt.max_score * 100) if attempt.max_score > 0 else 0
    attempt.completed_at = datetime.utcnow()
    attempt.time_spent_seconds = submission.time_spent_seconds
    db.commit()
    db.refresh(attempt)

    # --- Gamification: award XP and check badges ---
    if attempt.user_id:
        user = db.query(User).filter(User.id == attempt.user_id).first()
        if user:
            xp_earned = score * 10 + (5 if attempt.percentage >= 80 else 0)
            user.xp = (user.xp or 0) + xp_earned
            user.level = compute_level(user.xp)
            db.commit()
            award_badges(user, db)

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
        question = db.query(Question).filter(Question.id == answer.question_id).first()
        correct_option = db.query(Option).filter(
            Option.question_id == answer.question_id, Option.is_correct == True
        ).first()
        selected_option = db.query(Option).filter(Option.id == answer.selected_option_id).first() if answer.selected_option_id else None

        user_answers.append({
            "question_id": answer.question_id,
            "selected_option_id": answer.selected_option_id,
            "is_correct": answer.is_correct,
            "correct_option_id": correct_option.id if correct_option else None,
            "explanation": question.explanation if question else None,
            "question_text": question.question_text if question else None,
            "selected_option_text": selected_option.option_text if selected_option else None,
            "correct_option_text": correct_option.option_text if correct_option else None,
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


# ──────────────────────────────────────────────────────────────────────────────
# ADMIN
# ──────────────────────────────────────────────────────────────────────────────

def require_admin(current_user: User = Depends(get_current_user)):
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Accès réservé aux administrateurs")
    return current_user


@app.post("/api/admin/quizzes", response_model=QuizResponse, status_code=201)
def admin_create_quiz(
    data: AdminQuizCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    quiz = Quiz(
        title=data.title, description=data.description,
        duration_minutes=data.duration_minutes, difficulty=data.difficulty,
        category_id=data.category_id,
    )
    db.add(quiz)
    db.flush()
    for i, q_data in enumerate(data.questions):
        q = Question(
            quiz_id=quiz.id, question_text=q_data.question_text,
            question_type=q_data.question_type, points=q_data.points,
            order=i, explanation=q_data.explanation,
        )
        db.add(q)
        db.flush()
        for j, o_data in enumerate(q_data.options):
            db.add(Option(
                question_id=q.id, option_text=o_data.option_text,
                is_correct=o_data.is_correct, order=j,
            ))
    db.commit()
    db.refresh(quiz)
    return {
        "id": quiz.id, "title": quiz.title, "description": quiz.description,
        "duration_minutes": quiz.duration_minutes, "difficulty": quiz.difficulty,
        "is_active": quiz.is_active, "category_id": quiz.category_id,
        "created_at": quiz.created_at, "category": quiz.category,
        "question_count": len(quiz.questions),
    }


@app.delete("/api/admin/quizzes/{quiz_id}", status_code=204)
def admin_delete_quiz(
    quiz_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    quiz.is_active = False  # soft delete
    db.commit()


@app.post("/api/admin/courses", response_model=CourseResponse, status_code=201)
def admin_create_course(
    data: AdminCourseCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    course = Course(
        title=data.title, description=data.description,
        category_id=data.category_id,
    )
    db.add(course)
    db.flush()
    for i, l_data in enumerate(data.lessons):
        db.add(Lesson(
            course_id=course.id, title=l_data.title,
            content=l_data.content, order=i,
        ))
    db.commit()
    db.refresh(course)
    return course


@app.get("/api/admin/users", response_model=List[UserResponse])
def admin_list_users(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    return db.query(User).all()


@app.get("/")
def root():
    return {"message": "Welcome to AfriSio CI API", "version": "1.0.0"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)




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
# COURSES
# ──────────────────────────────────────────────────────────────────────────────

@app.get("/api/courses", response_model=List[CourseResponse])
def get_courses(category_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(Course).filter(Course.is_active == True)
    if category_id:
        query = query.filter(Course.category_id == category_id)
    return query.all()

@app.get("/api/courses/{course_id}", response_model=CourseDetailResponse)
def get_course(course_id: int, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id, Course.is_active == True).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    lessons = sorted(course.lessons, key=lambda l: l.order)
    return {
        "id": course.id,
        "title": course.title,
        "description": course.description,
        "is_active": course.is_active,
        "category_id": course.category_id,
        "created_at": course.created_at,
        "category": course.category,
        "lessons": [{"id": l.id, "title": l.title, "content": l.content, "order": l.order} for l in lessons]
    }

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

        selected_option = db.query(Option).filter(Option.id == answer_data.selected_option_id).first() if answer_data.selected_option_id else None
        
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
            "explanation": question.explanation if question else None,
            "question_text": question.question_text if question else None,
            "selected_option_text": selected_option.option_text if selected_option else None,
            "correct_option_text": correct_option.option_text if correct_option else None,
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
        question = db.query(Question).filter(Question.id == answer.question_id).first()
        correct_option = db.query(Option).filter(
            Option.question_id == answer.question_id, Option.is_correct == True
        ).first()
        selected_option = db.query(Option).filter(Option.id == answer.selected_option_id).first() if answer.selected_option_id else None
        
        user_answers.append({
            "question_id": answer.question_id,
            "selected_option_id": answer.selected_option_id,
            "is_correct": answer.is_correct,
            "correct_option_id": correct_option.id if correct_option else None,
            "explanation": question.explanation if question else None,
            "question_text": question.question_text if question else None,
            "selected_option_text": selected_option.option_text if selected_option else None,
            "correct_option_text": correct_option.option_text if correct_option else None,
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
