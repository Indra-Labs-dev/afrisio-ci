from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime


# ─── Auth ────────────────────────────────────────────────────────────────────

class UserRegister(BaseModel):
    email: str
    username: str
    password: str
    full_name: Optional[str] = None


class UserLogin(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"


# ─── User ─────────────────────────────────────────────────────────────────────

class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    full_name: Optional[str] = None
    is_active: bool
    is_superuser: bool = False
    created_at: datetime
    avatar_url: Optional[str] = None
    xp: int = 0
    level: int = 1

    class Config:
        from_attributes = True


# ─── Badges ───────────────────────────────────────────────────────────────────

class BadgeResponse(BaseModel):
    id: int
    name: str
    description: str
    icon: str
    condition_type: str
    condition_value: int

    class Config:
        from_attributes = True


class UserBadgeResponse(BaseModel):
    badge: BadgeResponse
    awarded_at: datetime

    class Config:
        from_attributes = True


# ─── Password Reset ───────────────────────────────────────────────────────────

class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


# ─── Avatar ───────────────────────────────────────────────────────────────────

class AvatarUpdateRequest(BaseModel):
    avatar_url: str  # base64 data URL or external URL


# ─── Admin ────────────────────────────────────────────────────────────────────

class AdminQuizCreate(BaseModel):
    title: str
    description: Optional[str] = None
    duration_minutes: int = 30
    difficulty: str = "medium"
    category_id: int
    questions: List["QuestionCreate"]


class AdminCourseCreate(BaseModel):
    title: str
    description: Optional[str] = None
    category_id: int
    lessons: List["LessonBase"]


# ─── Dashboard / Stats ────────────────────────────────────────────────────────

class CategoryStat(BaseModel):
    category_name: str
    icon: Optional[str]
    quizzes_done: int
    avg_percentage: float


class DashboardResponse(BaseModel):
    total_quizzes: int
    avg_score: float
    best_score: float
    total_points: int
    rank: int
    category_stats: List[CategoryStat]


TokenResponse.model_rebuild()


# ─── Option ─────────────────────────────────────────────────────────────────

class OptionBase(BaseModel):
    option_text: str
    is_correct: bool
    order: int = 0


class OptionCreate(OptionBase):
    pass


class OptionResponse(OptionBase):
    id: int

    class Config:
        from_attributes = True


# ─── Question ────────────────────────────────────────────────────────────────

class QuestionBase(BaseModel):
    question_text: str
    question_type: str = "multiple_choice"
    points: int = 1
    order: int = 0
    difficulty: str = "medium"


class QuestionCreate(QuestionBase):
    explanation: Optional[str] = None
    options: List[OptionCreate]


class QuestionResponse(QuestionBase):
    id: int
    explanation: Optional[str] = None
    options: List[OptionResponse]

    class Config:
        from_attributes = True


class QuestionResponseWithoutAnswer(QuestionBase):
    id: int
    options: List[OptionResponse]

    class Config:
        from_attributes = True


# ─── Category ────────────────────────────────────────────────────────────────

class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None


class CategoryCreate(CategoryBase):
    pass


class CategoryResponse(CategoryBase):
    id: int

    class Config:
        from_attributes = True


# ─── Course & Lesson ──────────────────────────────────────────────────────────

class LessonBase(BaseModel):
    title: str
    content: str
    order: int = 0

class LessonResponse(LessonBase):
    id: int

    class Config:
        from_attributes = True

class CourseBase(BaseModel):
    title: str
    description: Optional[str] = None
    is_active: bool = True

class CourseResponse(CourseBase):
    id: int
    category_id: int
    created_at: datetime
    category: CategoryResponse

    class Config:
        from_attributes = True

class CourseDetailResponse(CourseResponse):
    lessons: List[LessonResponse]


# ─── Quiz ─────────────────────────────────────────────────────────────────────

class QuizBase(BaseModel):
    title: str
    description: Optional[str] = None
    duration_minutes: int = 30
    difficulty: str = "medium"
    is_active: bool = True


class QuizCreate(QuizBase):
    category_id: int
    questions: List[QuestionCreate]


class QuizResponse(QuizBase):
    id: int
    category_id: int
    created_at: datetime
    category: CategoryResponse
    question_count: int

    class Config:
        from_attributes = True


class QuizDetailResponse(QuizResponse):
    questions: List[QuestionResponseWithoutAnswer]


class QuizWithAnswersResponse(QuizResponse):
    questions: List[QuestionResponse]


# ─── Attempt ──────────────────────────────────────────────────────────────────

class UserAnswerCreate(BaseModel):
    question_id: int
    selected_option_id: Optional[int] = None


class QuizSubmit(BaseModel):
    attempt_id: int
    answers: List[UserAnswerCreate]
    time_spent_seconds: int


class UserAnswerResponse(BaseModel):
    question_id: int
    selected_option_id: Optional[int]
    is_correct: bool
    correct_option_id: int
    explanation: Optional[str] = None
    question_text: Optional[str] = None
    selected_option_text: Optional[str] = None
    correct_option_text: Optional[str] = None

    class Config:
        from_attributes = True


class QuizAttemptResponse(BaseModel):
    id: int
    quiz_id: int
    score: int
    max_score: int
    percentage: float
    started_at: datetime
    completed_at: Optional[datetime]
    time_spent_seconds: int
    quiz: QuizResponse

    class Config:
        from_attributes = True


class QuizResultResponse(BaseModel):
    attempt: QuizAttemptResponse
    answers: List[UserAnswerResponse]

    class Config:
        from_attributes = True


class QuizStartResponse(BaseModel):
    attempt_id: int
    quiz: QuizDetailResponse

    class Config:
        from_attributes = True


# ─── Flashcards ─────────────────────────────────────────────────────────────

class FlashcardCreate(BaseModel):
    question_id: int


class FlashcardResponse(BaseModel):
    id: int
    user_id: int
    question_id: int
    created_at: datetime
    question: QuestionResponse

    class Config:
        from_attributes = True


# ─── Questions Comments ─────────────────────────────────────────────────────

class QuestionCommentCreate(BaseModel):
    comment_text: str


class QuestionCommentResponse(BaseModel):
    id: int
    user_id: int
    question_id: int
    comment_text: str
    created_at: datetime
    user: UserResponse

    class Config:
        from_attributes = True
