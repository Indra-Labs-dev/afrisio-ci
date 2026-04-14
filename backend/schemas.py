from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


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


class QuestionBase(BaseModel):
    question_text: str
    question_type: str = "multiple_choice"
    points: int = 1
    order: int = 0


class QuestionCreate(QuestionBase):
    options: List[OptionCreate]


class QuestionResponse(QuestionBase):
    id: int
    options: List[OptionResponse]

    class Config:
        from_attributes = True


class QuestionResponseWithoutAnswer(QuestionBase):
    id: int
    options: List[OptionResponse]

    class Config:
        from_attributes = True


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
