from pydantic import BaseModel, Field
from typing import Literal
class ResearchQuestion(BaseModel):
    question: str
    objective: str
    priority: int = Field(ge=1, le=5)


class ResearchPlan(BaseModel):
    questions: list[ResearchQuestion]


class SearchResult(BaseModel):
    title: str
    url: str
    snippet: str = ""


class SearchResponse(BaseModel):
    query: str
    results: list[SearchResult]


class SourceQuality(BaseModel):
    relevance: int = Field(ge=1, le=5)
    credibility: int = Field(ge=1, le=5)
    quality_score: int = Field(ge=1, le=5)
    reason: str


class QualityCheckedSource(BaseModel):
    search_result: SearchResult
    quality: SourceQuality


class QualityCheckResponse(BaseModel):
    sources: list[QualityCheckedSource]


class ScrapedDocument(BaseModel):
    source_id: str
    url: str
    title: str
    content: str

class ScrapeResponse(BaseModel):
    documents: list[ScrapedDocument]


class Passage(BaseModel):
    passage_id: str
    source_id: str
    text: str
    relevance_score: float = Field(ge=0, le=1)


class ReaderResponse(BaseModel):
    passages: list[Passage]


class Claim(BaseModel):
    claim_id: str
    claim: str
    source_id: str
    confidence: float


class ClaimResponse(BaseModel):
    claims: list[Claim]

class Evidence(BaseModel):
    evidence_id: str
    source_id: str
    text: str
    relevance_score: float


class EvidenceResponse(BaseModel):
    evidence: list[Evidence]


class ClaimEvidence(BaseModel):
    claim_id: str
    evidence_ids: list[str]

class ClaimEvidenceResponse(BaseModel):
    mappings: list[ClaimEvidence]
    
class Verification(BaseModel):
    claim_id: str

    verdict: Literal[
        "supported",
        "partially_supported",
        "contradicted",
        "insufficient_evidence"
    ]

    confidence: float
    supporting_evidence: list[str]
    contradicting_evidence: list[str]
    reasoning: str

class Synthesis(BaseModel):
    finding: str
    claim_ids: list[str]
    evidence_ids: list[str]
    confidence: float = Field(ge=0, le=1)


class SynthesisResponse(BaseModel):
    findings: list[Synthesis]


class Critique(BaseModel):
    factuality: float
    citation_accuracy: float
    evidence_coverage: float
    source_quality: float
    overall: float
    missing_evidence: list[str]