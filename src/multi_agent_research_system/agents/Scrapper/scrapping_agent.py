from langchain.agents import create_agent
from langchain_groq import ChatGroq
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv
from multi_agent_research_system.agents.Scrapper.tool import web_scraper

load_dotenv()
llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    temperature=0
)
#2nd agent
def build_scraper_agent():
    return create_agent(
        model=llm,
        tools=[web_scraper],
    )
