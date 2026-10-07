from langchain.tools import tool
from tavily import TavilyClient
from dotenv import load_dotenv
import os
from rich import print

from schemas.schemas import ResearchPlan, SearchResponse,SearchResult
load_dotenv()

tavily = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))

@tool
def web_search(query: ResearchPlan) -> SearchResponse:
    """Search the web for recent and reliable information."""

    results = []

    for question in query.questions:
        tavily_result = tavily.search(
            query=question.question,
            max_results=5
        )

        for item in tavily_result.get("results", []):
            results.append(
                SearchResult(
                    title=item.get("title", ""),
                    url=item.get("url", ""),
                    snippet=item.get("content", "")
                )
            )

    return SearchResponse(
        query=query.questions[0].question,
        results=results
    )