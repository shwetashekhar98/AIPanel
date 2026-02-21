from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class Priority(str, Enum):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


class QuestionCategory(str, Enum):
    TECHNICAL = "technical"
    BUSINESS = "business"
    INNOVATION = "innovation"
    FEASIBILITY = "feasibility"
    PRESENTATION = "presentation"


class JudgeQuestion(BaseModel):
    category: QuestionCategory
    priority: Priority
    question: str
    reasoning: str
    source_evidence: str = Field(description="Which source(s) this question draws from")


class AgentAnalysis(BaseModel):
    summary: str
    key_findings: list[str]
    concerns: list[str]
    strengths: list[str]
    raw_detail: str = Field(default="", description="Full analysis text from the agent")


class Scores(BaseModel):
    technical: float = Field(ge=0, le=10)
    business: float = Field(ge=0, le=10)
    presentation: float = Field(ge=0, le=10)
    demo_quality: float = Field(ge=0, le=10)
    innovation: float = Field(ge=0, le=10)
    overall: float = Field(ge=0, le=10)


class JudgingResult(BaseModel):
    team_name: str
    scores: Scores
    questions: list[JudgeQuestion]
    key_strengths: list[str]
    key_concerns: list[str]
    voice_script: str = Field(description="Ready-to-read script for an AI judge voice")
    github_analysis: Optional[AgentAnalysis] = None
    ppt_analysis: Optional[AgentAnalysis] = None
    voice_analysis: Optional[AgentAnalysis] = None
    video_analysis: Optional[AgentAnalysis] = None


class SubmissionRequest(BaseModel):
    team_name: str
    github_url: str
    transcript: str = Field(description="Voice transcription of the pitch")


class SubmissionResponse(BaseModel):
    team_name: str
    status: str
    message: str
    result_id: Optional[str] = None
