from typing import TypedDict

from schemas.schemas import (
    ResearchPlan,
    SearchResponse,
    QualityCheckResponse,
    ScrapeResponse,
    ReaderResponse,
    ClaimResponse,
    EvidenceResponse,
    ClaimEvidenceResponse,
    Verification,
    SynthesisResponse,
    Critique,
)


class ResearchState(TypedDict, total=False):

    # Input
    question: str

    # Research stages
    plan: ResearchPlan
    search_results: SearchResponse
    quality_results: QualityCheckResponse
    scraped_data: ScrapeResponse
    reader_results: ReaderResponse
    claims: ClaimResponse
    evidence: EvidenceResponse
    mappings: ClaimEvidenceResponse
    verifications: list[Verification]
    synthesis: SynthesisResponse
    critique: Critique

    # Loop control
    iteration: int

    # Final output
    final_report: str