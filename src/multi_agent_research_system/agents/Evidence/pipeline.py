from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv

from .prompt import evidence_prompt_template

from multi_agent_research_system.scehmas.schemas import (
    ClaimResponse,
    ReaderResponse,
    EvidenceResponse
)

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    temperature=0
)


def build_evidence_extractor(
    claims: ClaimResponse,
    reader_response: ReaderResponse
) -> EvidenceResponse:

    structured_llm = llm.with_structured_output(
        EvidenceResponse
    )

    all_evidence = []

    passages = reader_response.passages

    for claim in claims.claims:

        prompt = evidence_prompt_template.invoke({
            "claim": claim.claim,
            "claim_source_id": claim.source_id,
            "passages": passages
        })

        response = structured_llm.invoke(prompt)

        all_evidence.extend(response.evidence)

    return EvidenceResponse(
        evidence=all_evidence
    )