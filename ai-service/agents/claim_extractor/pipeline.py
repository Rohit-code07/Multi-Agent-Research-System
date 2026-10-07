from dotenv import load_dotenv

from .prompt import claim_prompt_template
from schemas.schemas import (
    ReaderResponse,
    ClaimResponse
)

load_dotenv()

from langchain_ollama import ChatOllama

llm = ChatOllama(
    model="qwen3:8b",
    temperature=0
)


def build_claim_extractor(
    question: str,
    reader_response: ReaderResponse
) -> ClaimResponse:

    structured_llm = llm.with_structured_output(
        ClaimResponse
    )

    all_claims = []

    for passage in reader_response.passages:

        prompt = claim_prompt_template.invoke({
            "question": question,
            "source_id": passage.source_id,
            "passages": passage.text
        })

        response = structured_llm.invoke(prompt)

        all_claims.extend(response.claims)

    return ClaimResponse(
        claims=all_claims
    )