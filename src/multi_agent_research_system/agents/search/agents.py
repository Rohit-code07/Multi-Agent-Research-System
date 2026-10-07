from dotenv import load_dotenv
from multi_agent_research_system.agents.search.tool import web_search
from multi_agent_research_system.agents.scehmas.schemas import ResearchPlan, ResearchQuestion

load_dotenv()



# 1st agent
def build_search_agent():
    return web_search
