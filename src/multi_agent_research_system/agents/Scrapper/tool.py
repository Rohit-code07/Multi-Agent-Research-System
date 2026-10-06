import requests
from bs4 import BeautifulSoup
from langchain.tools import tool

from multi_agent_research_system.agents.scehmas.schemas import QualityCheckResponse, ScrapeResponse, ScrapedDocument


@tool
def web_scraper(query: QualityCheckResponse):
    """Scrape the webpage content from the given URL."""

    documents = []

    for source in query.sources:
        url = source.search_result.url

        content = scrape_webpage(url)

        documents.append(
            ScrapedDocument(
                source_id=source.search_result.source_id,
                url=url,
                title=source.search_result.title,
                content=content
            )
        )

    return ScrapeResponse(documents=documents)



def scrape_webpage(url: str) -> str:
    response = requests.get(
        url,
        timeout=15,
        headers={
            "User-Agent": "Mozilla/5.0"
        }
    )
    response.raise_for_status()

    soup = BeautifulSoup(response.text, "html.parser")

    for tag in soup(["script", "style", "noscript"]):
        tag.decompose()

    return soup.get_text(" ", strip=True)