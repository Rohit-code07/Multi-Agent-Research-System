from dotenv import load_dotenv
from langchain_ollama import ChatOllama

from .prompt import synthesizer_prompt_template

from multi_agent_research_system.agents.scehmas.schemas import (
    ClaimResponse,
    EvidenceResponse,
    SynthesisResponse,
    Verification
)

load_dotenv()

llm = ChatOllama(
    model="qwen3:8b",
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