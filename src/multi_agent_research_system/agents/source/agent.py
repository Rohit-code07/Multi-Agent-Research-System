from langchain_ollama import ChatOllama
from dotenv import load_dotenv

from multi_agent_research_system.agents.scehmas.schemas import (
    SearchResponse,
    SourceEvaluation,
    QualityCheckResponse,
    QualityCheckedSource,
    SourceQuality,
)

from .prompt import source_prompt_template

load_dotenv()

source_llm = ChatOllama(
    model="qwen3:8b",
    temperature=0
)

structured_llm = source_llm.with_structured_output(
    SourceEvaluation
)


def build_source_agent(
    query: SearchResponse
) -> QualityCheckResponse:

    checked_sources = []

    for result in query.results:

        prompt = source_prompt_template.invoke({
            "title": result.title,
            "url": result.url,
            "snippet": result.snippet[:500],
        })

        quality_data = structured_llm.invoke(prompt)

        quality = SourceQuality(
            relevance=quality_data.relevance,
            credibility=quality_data.credibility,
            quality_score=quality_data.quality_score,
            reason=quality_data.reason,
        )

        checked_sources.append(
            QualityCheckedSource(
                search_result=result,
                quality=quality,
            )
        )

    return QualityCheckResponse(
        sources=checked_sources
    )