import json

from langchain_groq import ChatGroq
from dotenv import load_dotenv

from multi_agent_research_system.agents.scehmas.schemas import (
    SearchResponse,
    SourceQuality,
    QualityCheckedSource,
    QualityCheckResponse,
)

from .prompt import source_prompt_template

load_dotenv()

source_llm = ChatGroq(
    model="openai/gpt-oss-20b",
    temperature=0,
)


def build_source_agent(query: SearchResponse) -> QualityCheckResponse:
    checked_sources: list[QualityCheckedSource] = []

    for result in query.results:
        prompt = source_prompt_template.format(search_results=result)
        response = source_llm.invoke(prompt)
        content = getattr(response, "content", response)

        if isinstance(content, str):
            try:
                parsed_response = json.loads(content)
            except json.JSONDecodeError:
                parsed_response = {"content": content}
        else:
            parsed_response = content

        quality = SourceQuality.model_validate(parsed_response)

        checked_source = QualityCheckedSource(
            search_result=result,
            quality=quality,
        )
        checked_sources.append(checked_source)

    return QualityCheckResponse(sources=checked_sources)