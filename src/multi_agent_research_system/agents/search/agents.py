from dotenv import load_dotenv
from multi_agent_research_system.agents.search.tool import web_search
from multi_agent_research_system.scehmas.schemas import ResearchPlan, ResearchQuestion

load_dotenv()



# 1st agent
def build_search_agent():
    return web_search


research_plan = ResearchPlan(
    questions=[
        ResearchQuestion(
            question="Impact of AI on developer productivity?",
            objective="Measure productivity impact",
            priority=5
        ),
        ResearchQuestion(
            question="How does AI affect software engineering jobs?",
            objective="Analyze employment impact",
            priority=4
        )
    ]
)
search_agent = build_search_agent()

result = search_agent.invoke({
    "query": research_plan
})

print(result)