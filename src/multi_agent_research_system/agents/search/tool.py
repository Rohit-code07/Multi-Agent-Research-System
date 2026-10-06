from langchain.tools import tool
from tavily import TavilyClient
from dotenv import load_dotenv
import os
from rich import print

from multi_agent_research_system.agents.scehmas.schemas import ResearchPlan,SearchResult
load_dotenv()

tavily = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))

@tool
def web_search(query: ResearchPlan) -> list[SearchResult]:
    """Search the web for recent and reliable information on a topic. Returns URL, title, and relevant information."""
    results = []
    for question in query.questions:
        tavily_result = tavily.search(query=question.question, max_results=5)
        for item in tavily_result.get("results", []):
            results.append(
                SearchResult(
                    title=item.get("title", ""),
                    url=item.get("url", ""),
                    snippet=item.get("content", ""),
                )
            )
    return results

