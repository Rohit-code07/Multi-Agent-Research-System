from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv

from .prompt import verification_prompt_template

from multi_agent_research_system.scehmas.schemas import (
    ClaimResponse,
    EvidenceResponse,
    ClaimEvidenceResponse,
    Verification
)

load_dotenv()

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    temperature=0
)


def verify_claims(
    claims: ClaimResponse,
    evidence: EvidenceResponse,
    mappings: ClaimEvidenceResponse
):

    structured_llm = llm.with_structured_output(
        Verification
    )

    results = []

    evidence_map = {
        item.evidence_id: item
        for item in evidence.evidence
    }

    for mapping in mappings.mappings:

        claim = next(
            c for c in claims.claims
            if c.claim_id == mapping.claim_id
        )

        selected_evidence = [
            evidence_map[evidence_id]
            for evidence_id in mapping.evidence_ids
            if evidence_id in evidence_map
        ]

        prompt = verification_prompt_template.invoke({
            "claim": claim.claim,
            "evidence": selected_evidence
        })

        result = structured_llm.invoke(prompt)

        results.append(result)

    return results