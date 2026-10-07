from dotenv import load_dotenv

from agents.scraper.tool import web_scraper
from schemas.schemas import (
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