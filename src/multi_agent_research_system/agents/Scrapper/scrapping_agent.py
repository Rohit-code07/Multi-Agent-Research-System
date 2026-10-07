from dotenv import load_dotenv

from multi_agent_research_system.agents.Scrapper.tool import web_scraper
from multi_agent_research_system.agents.scehmas.schemas import (
    QualityCheckResponse,
    ScrapeResponse,
)

load_dotenv()


def build_scraper_agent(
    query: QualityCheckResponse
) -> ScrapeResponse:

    return web_scraper.invoke({
        "query": query
    })