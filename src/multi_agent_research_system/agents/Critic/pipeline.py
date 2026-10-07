from dotenv import load_dotenv


from langchain_ollama import ChatOllama
from .prompt import critic_prompt_template

from multi_agent_research_system.agents.scehmas.schemas import (
    ClaimResponse,
    EvidenceResponse,
    Verification,
    SynthesisResponse,
    Critique
)

load_dotenv()



llm = ChatOllama(
    model="qwen3:8b",
    temperature=0
)

def build_critic_pipeline(
    question: str,
    synthesis: SynthesisResponse,
    claims: ClaimResponse,
    evidence: EvidenceResponse,
    verifications: list[Verification]
):
    structured_llm = llm.with_structured_output(Critique)

    prompt = critic_prompt_template.invoke({
        "question": question,
        "synthesis": synthesis.model_dump(),
        "claims": claims.model_dump(),
        "evidence": evidence.model_dump(),
        "verifications": [
            verification.model_dump()
            for verification in verifications
        ]
    })

    return structured_llm.invoke(prompt)


