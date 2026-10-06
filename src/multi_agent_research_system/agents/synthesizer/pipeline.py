from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv

from .prompt import synthesizer_prompt_template

from multi_agent_research_system.scehmas.schemas import (
    ClaimResponse,
    EvidenceResponse,
    SynthesisResponse,
    Verification
)

load_dotenv()

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    temperature=0
)


def build_synthesizer_pipeline(
    question: str,
    claims: ClaimResponse,
    evidence: EvidenceResponse,
    verifications: list[Verification]
):
    structured_llm = llm.with_structured_output(SynthesisResponse)

    prompt = synthesizer_prompt_template.invoke({
        "question": question,
        "claims": claims.model_dump(),
        "evidence": evidence.model_dump(),
        "verifications": [
            verification.model_dump()
            for verification in verifications
        ]
    })

    return structured_llm.invoke(prompt)