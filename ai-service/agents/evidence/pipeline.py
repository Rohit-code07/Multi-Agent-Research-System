from dotenv import load_dotenv
from langchain_ollama import ChatOllama

from .prompt import evidence_prompt_template
load_dotenv()
from schemas.schemas import (
    ClaimResponse,
    ReaderResponse,
    EvidenceResponse
)


llm = ChatOllama(
    model="qwen3:8b",
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