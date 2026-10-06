from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv

from .prompt import reader_prompt_template

from multi_agent_research_system.agents.scehmas.schemas import (
    ScrapeResponse,
    ReaderResponse
)

load_dotenv()

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    temperature=0
)


def build_reader_pipeline(

    query: ScrapeResponse
) -> ReaderResponse:

    structured_llm = llm.with_structured_output(
        ReaderResponse
    )

    passages = []

    for document in query.documents:

        prompt = reader_prompt_template.invoke({
            "url": document.url,
            "content": document.content
        })

        response = structured_llm.invoke(prompt)

        passages.extend(response.passages)

    return ReaderResponse(
        passages=passages
    )