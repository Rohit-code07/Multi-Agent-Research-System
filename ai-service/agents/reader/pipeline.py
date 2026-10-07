from langchain_ollama import ChatOllama
from dotenv import load_dotenv

from schemas.schemas import (
    ScrapeResponse,
    ReaderResponse,
    Passage,
)

from .prompt import reader_prompt_template

load_dotenv()

llm = ChatOllama(
    model="qwen3:8b",
    temperature=0
)

def build_reader_pipeline(
    question: str,
    scraped_data: ScrapeResponse
) -> ReaderResponse:

    passages = []

    for document in scraped_data.documents:

        prompt = reader_prompt_template.invoke({
            "question": question,
            "source_id": document.source_id,
            "url": document.url,
            "content": document.content[:8000],
        })

        response = llm.invoke(prompt)

        # LLM output ko plain text passage maan rahe hain
        text = response.content.strip()

        if not text:
            continue

        passages.append(
            Passage(
                passage_id=f"p{len(passages) + 1}",
                source_id=document.source_id,
                text=text,
                relevance_score=1.0
            )
        )

    return ReaderResponse(
        passages=passages
    )