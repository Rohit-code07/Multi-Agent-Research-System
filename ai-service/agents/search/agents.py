from dotenv import load_dotenv
from agents.search.tool import web_search
from schemas.schemas import ResearchPlan, ResearchQuestion

load_dotenv()



# 1st agent
def build_search_agent():
    return web_search
